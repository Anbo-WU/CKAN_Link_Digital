const pool = require('../config/db');
const { generateOdaiId, generateInvitationToken } = require('../utils/generators');

const findByToken = async (token) => {
    const [rows] = await pool.query('SELECT * FROM participants WHERE invitation_token = ?', [token]);
    return rows[0];
};

const findByOdaiId_ = async (odaiId) => {
    const [rows] = await pool.query('SELECT * FROM participants WHERE odai_id = ?', [odaiId]);
    return rows[0];
};

// Return Lat/Lon separately in getStats, you need to extract them
const findByOdaiId = async (odaiId) => {
    const query = `
        SELECT
            p.*,
            ST_X(p.location) AS longitude, -- Extract Longitude (X coordinate)
            ST_Y(p.location) AS latitude   -- Extract Latitude (Y coordinate)
        FROM participants p
        WHERE p.odai_id = ?;
    `;
    const [rows] = await pool.query(query, [odaiId]);
    // The result row will now have 'latitude' and 'longitude' properties added
    // if p.location is not NULL.
    // Convert BOOLEAN/TINYINT(1) to true/false if necessary driver doesn't do it
    if (rows[0]) {
        rows[0].invited_via_qr = !!rows[0].invited_via_qr; // Ensure boolean
    }
    return rows[0];
};

// Function to find the participant with no inviter (assumed initiator)
const findInitiator = async (experimentId = '01') => {
    // Finds the first participant for the given experiment with no inviter
    const query = `
        SELECT *
        FROM participants
        WHERE invited_by_participant_id IS NULL
        AND experiment_id = ?
        ORDER BY created_at ASC -- Get the oldest one if multiple somehow exist
        LIMIT 1;
    `;
    const [rows] = await pool.query(query, [experimentId]);
    return rows[0]; // Returns the full participant row or undefined
};

const createParticipant = async (inviterId = null, ipAddress = null, language = null, userAgent = {}, isViaQr = false) => {
    let odaiId = generateOdaiId();
    let invitationToken = generateInvitationToken();

    const { raw = null, browser = {}, os = {} } = userAgent; // Destructure parsed UA

    const [result] = await pool.query(
        `INSERT INTO participants (
            odai_id, invitation_token, invited_by_participant_id, ip_address,
            preferred_language, user_agent_raw, browser_name, browser_version,
            os_name, os_version, invited_via_qr
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            odaiId, invitationToken, inviterId, ipAddress,
            language, raw, browser.name, browser.version, // Use parsed UA data
            os.name, os.version,
            isViaQr
        ]
    );
    const insertId = result.insertId;
    const [newUserRows] = await pool.query('SELECT * FROM participants WHERE id = ?', [insertId]);
    return newUserRows[0];
};

const updateDemographics = async (odaiId, { gender, age, latitude, longitude }) => {
    // Construct the POINT geometry using ST_GeomFromText and SRID
    // Format: 'POINT(longitude latitude)' - IMPORTANT: Longitude comes first in WKT!
    const pointWKT = `POINT(${longitude} ${latitude})`;

    const query = `
        UPDATE participants
        SET
            gender = ?,
            age = ?,
            location = ST_GeomFromText(?, 4326), -- Use spatial function to create POINT
            demographics_submitted_at = CURRENT_TIMESTAMP
        WHERE odai_id = ?
        AND demographics_submitted_at IS NULL;
    `;
    // Pass WKT string and SRID to the query
    const [result] = await pool.query(query, [
        gender,
        age,
        pointWKT, // Pass the Well-Known Text representation
        // 4326,   // SRID is now part of ST_GeomFromText
        odaiId
    ]);
    return result.affectedRows;
};

const getDirectInvitesCount = async (participantId) => {
    const [rows] = await pool.query(
        'SELECT COUNT(*) as count FROM participants WHERE invited_by_participant_id = ?',
        [participantId]
    );
    return rows[0].count;
};

// --- Network Calculation Logic ---
// These require recursive queries, which are well-suited for SQL CTEs (MySQL 8+)

const getLineagePath = async (participantId) => {
    // Recursive CTE to trace lineage back to the root (NULL inviter)
    const query = `
        WITH RECURSIVE lineage AS (
            SELECT id, odai_id, invited_by_participant_id, 0 AS depth
            FROM participants
            WHERE id = ?
            UNION ALL
            SELECT p.id, p.odai_id, p.invited_by_participant_id, l.depth + 1
            FROM participants p
            INNER JOIN lineage l ON p.id = l.invited_by_participant_id
        )
        SELECT odai_id FROM lineage ORDER BY depth DESC;
    `;
    const [rows] = await pool.query(query, [participantId]);
    return rows.map(r => r.odai_id); // Returns array of IDs from root to current
};

const getLineageDepth = async (participantId) => {
    // Can be derived from the length of the lineage path - 1
    const path = await getLineagePath(participantId);
    return path.length > 0 ? path.length - 1 : 0;
};

const getTotalNetworkCount = async (participantId) => {
    // Recursive CTE to find all descendants
    const query = `
        WITH RECURSIVE network AS (
            SELECT id, odai_id
            FROM participants
            WHERE id = ? -- Start with the participant themselves
            UNION ALL
            SELECT p.id, p.odai_id
            FROM participants p
            INNER JOIN network n ON p.invited_by_participant_id = n.id
        )
        SELECT COUNT(*) as count FROM network;
        -- Note: This counts the participant themselves + all descendants.
        -- If "Total Network" in the report *excludes* the participant, subtract 1.
        -- Based on report screenshots, it seems Total Network might be just descendants + direct invites??
        -- Let's implement the definition: participant + all downstream nodes. Adjust if needed.
    `;
    const [rows] = await pool.query(query, [participantId]);
    // Subtract 1 if the count should exclude the participant themselves
    // return rows[0].count > 0 ? rows[0].count -1 : 0;
    return rows[0].count; // Including the participant themselves
};

 // Retrieve inviter token based on invitee's ODAI ID ---
 // Needed for setting the cookie correctly after fetching existing participant
 const getParticipantWithInviterToken = async (odaiId) => {
    const query = `
        SELECT
            p_invitee.*,
            p_inviter.invitation_token AS inviter_token,
            p_inviter.odai_id AS inviter_odai_id,
             ST_X(p_invitee.location) AS longitude,
             ST_Y(p_invitee.location) AS latitude
        FROM participants p_invitee
        LEFT JOIN participants p_inviter ON p_invitee.invited_by_participant_id = p_inviter.id
        WHERE p_invitee.odai_id = ?;
    `;
     const [rows] = await pool.query(query, [odaiId]);
     if (rows[0]) {
        rows[0].invited_via_qr = !!rows[0].invited_via_qr;
     }
     return rows[0];
 };

 // Fetch all participants for network graph
const getAllParticipantsForNetwork = async (experimentId = '01') => {
    // Select fields needed for graph nodes and edges
    const query = `
        SELECT
            id,                       -- Unique ID for graph node
            odai_id,                  -- Label for the node
            invited_by_participant_id -- To build edges
            -- created_at             -- Optional: for temporal layout or filtering
        FROM participants
        WHERE experiment_id = ?;
    `;
    const [rows] = await pool.query(query, [experimentId]);
    return rows;
};

module.exports = {
    findByToken,
    findByOdaiId,
    findInitiator,
    createParticipant,
    updateDemographics,
    getDirectInvitesCount,
    getLineagePath,
    getLineageDepth,
    getTotalNetworkCount,
    getParticipantWithInviterToken,
    getAllParticipantsForNetwork 
};