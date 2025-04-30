const participantModel = require('../models/participantModel');
const requestIp = require('request-ip');
const UAParser = require('ua-parser-js');
const Graph = require('graphology'); // Import graphology
const metrics = require('graphology-metrics'); // Import metrics
const forceAtlas2 = require('graphology-layout-forceatlas2'); // Import layout

const getStats = async (req, res) => {
    const odaiId = req.params.odaiId; // Get ODAI ID from URL path param
    // Add '#' back if needed, or modify findByOdaiId
    const targetOdaiId = odaiId.startsWith('#') ? odaiId : `#${odaiId}`;
    console.log(`Stats request received for: ${targetOdaiId}`);


    try {
        const participant = await participantModel.findByOdaiId(targetOdaiId);
        if (!participant) {
            console.log(`Participant not found: ${targetOdaiId}`);
            return res.status(404).json({ message: 'Participant not found.' });
        }
        console.log(`Participant found: ${participant.id}`);


        // Calculate stats
        const directInvites = await participantModel.getDirectInvitesCount(participant.id);
        const totalNetwork = await participantModel.getTotalNetworkCount(participant.id);
        const lineagePath = await participantModel.getLineagePath(participant.id);
        const lineageDepth = lineagePath.length > 0 ? lineagePath.length - 1 : 0; // Correct depth calculation

        console.log(`Stats for ${targetOdaiId}: Direct=${directInvites}, Total=${totalNetwork}, Depth=${lineageDepth}, Path=${lineagePath.join(' -> ')}`);


        // Construct the response object
        const responseData = {
            yourId: participant.odai_id,
            directInvites: directInvites,
            totalNetwork: totalNetwork,
            lineageDepth: lineageDepth,
            activeSensors: 0,
            yourLineagePath: lineagePath.join(' -> '),
            // Include other fields 
            ip_address: participant.ip_address,
            gender: participant.gender,
            age: participant.age,
            point: participant.point,
            latitude: participant.latitude,   // Already extracted by ST_Y
            longitude: participant.longitude, // Already extracted by ST_X
            demographics_submitted_at: participant.demographics_submitted_at,
            // Add new fields
            preferred_language: participant.preferred_language,
            browser_name: participant.browser_name,
            browser_version: participant.browser_version,
            os_name: participant.os_name,
            os_version: participant.os_version,
            invited_via_qr: participant.invited_via_qr
        };

        res.status(200).json(responseData);

    } catch (error) {
        console.error(`Error getting stats for ${targetOdaiId}:`, error);
        res.status(500).json({ message: 'Server error retrieving statistics.' });
    }
};

// For the initial token API
const getInitialToken = async (req, res) => {
    console.log('Request received for initial token');
    try {
        // Find the initiator participant (invited_by IS NULL) for experiment '01'
        const initiator = await participantModel.findInitiator('01'); // Assuming experiment '01'

        if (!initiator || !initiator.invitation_token) {
            console.error('Initial participant or their token not found in database.');
            // Send a specific error message the frontend can understand
            return res.status(404).json({ message: 'Initial participant token could not be found. Experiment may not be configured correctly.' });
        }

        console.log(`Found initial participant token: ${initiator.invitation_token}`);
        // Respond only with the necessary token
        res.status(200).json({
            initialToken: initiator.invitation_token
        });

    } catch (error) {
        console.error('Error fetching initial token:', error);
        res.status(500).json({ message: 'Server error fetching initial token.' });
    }
};


const handleJoinExperiment = async (req, res) => {
    const { inviterToken, source } = req.body; // Get token from request body (POST)
    // Get client IP address reliably
    const clientIp = requestIp.getClientIp(req);
    // Determine boolean based on source string
    const isViaQr = source === 'qr';

    // 1. Extract Language
    let preferredLanguage = null;
    const acceptLanguageHeader = req.headers['accept-language'];
    if (acceptLanguageHeader) {
        // Simple parse: take the first language tag
        preferredLanguage = acceptLanguageHeader.split(',')[0].split(';')[0].trim();
    }

    // 2. Extract and Parse User-Agent
    const userAgentString = req.headers['user-agent'];
    const parser = new UAParser();
    parser.setUA(userAgentString);
    const userAgentInfo = parser.getResult();
    // Structure for storing: { raw: string, browser: { name, version }, os: { name, version } }
    const userAgentData = {
        raw: userAgentString || null,
        browser: {
            name: userAgentInfo.browser.name || null,
            version: userAgentInfo.browser.version || null
        },
        os: {
            name: userAgentInfo.os.name || null,
            version: userAgentInfo.os.version || null
        }
    };

    console.log(`Join request received. Inviter Token: ${inviterToken}, Source: ${source}, Via QR: ${isViaQr}, IP: ${clientIp}, Lang: ${preferredLanguage}`);
    console.log(`Parsed UA: Browser=${userAgentData.browser.name} ${userAgentData.browser.version}, OS=${userAgentData.os.name} ${userAgentData.os.version}`);

    if (!inviterToken) {
        console.log('No inviter token provided.');
        return res.status(400).json({ message: 'Invitation token is required.' });
    }

    try {
        const inviter = await participantModel.findByToken(inviterToken);
        if (!inviter) {
            console.log(`Inviter not found for token: ${inviterToken}`);
            return res.status(404).json({ message: 'Invalid invitation link or token.' });
        }
        console.log(`Inviter found: ${inviter.odai_id} (ID: ${inviter.id})`);

        // Create the new participant, passing all extracted info
        const newParticipant = await participantModel.createParticipant(
            inviter.id,
            clientIp,
            preferredLanguage,
            userAgentData, // Pass the structured UA data
            isViaQr
        );
        console.log(`New participant created: ${newParticipant.odai_id} (ID: ${newParticipant.id}), invited by ${inviter.odai_id}`);

        // Respond with NEW participant's info (NO REDIRECT)
        res.status(201).json({
            message: 'Observation started successfully.',
            invitedByOdaiId: inviter.odai_id,
            yourOdaiId: newParticipant.odai_id,
            yourInvitationToken: newParticipant.invitation_token // Frontend needs this for QR/Link
        });

    } catch (error) {
        console.error('Error handling join experiment:', error);
        // Provide more specific error messages if possible (e.g., DB constraint violation)
        res.status(500).json({ message: 'Server error processing participation.' });
    }
};

const submitParticipantDemographics = async (req, res) => {
    const odaiId = req.params.odaiId; // ODAI ID from URL path
    // Ensure '#' is prepended if frontend sends it clean
    const targetOdaiId = odaiId.startsWith('#') ? odaiId : `#${odaiId}`;
    const { gender, age, latitude, longitude } = req.body;

    console.log(`Demographics submission for ${targetOdaiId}:`, req.body);

    // Basic Validation (Add more robust validation as needed)
    if (typeof latitude === 'undefined' || typeof longitude === 'undefined') {
        return res.status(400).json({ message: 'Latitude and Longitude are required.' });
    }
    // Add checks for age format, gender options, coordinate ranges etc.

    try {
        // Optional: Verify participant exists first
        const participant = await participantModel.findByOdaiId(targetOdaiId);
        if (!participant) {
            return res.status(404).json({ message: 'Participant not found.' });
        }

        const affectedRows = await participantModel.updateDemographics(targetOdaiId, {
            gender: gender || null, // Allow null if not provided
            age: age || null,       // Allow null if not provided
            latitude,
            longitude
        });

        if (affectedRows > 0) {
            console.log(`Demographics updated successfully for ${targetOdaiId}`);
            res.status(200).json({ message: 'Thank you for your contribution!' });
        } else {
            // Could be not found or already submitted if using that constraint
            console.log(`Demographics not updated for ${targetOdaiId} (maybe already submitted or not found).`);
            res.status(409).json({ message: 'Demographics could not be updated (perhaps already submitted?).' });
        }
    } catch (error) {
        console.error(`Error updating demographics for ${targetOdaiId}:`, error);
        res.status(500).json({ message: 'Server error updating information.' });
    }
};

// Controller for network graph data
const getNetworkGraph = async (req, res) => {
    const experimentId = req.params.experimentId || '01'; // Get experiment ID or default
    console.log(`Network graph request received for experiment: ${experimentId}`);

    try {
        // 1. Fetch raw participant data
        const participants = await participantModel.getAllParticipantsForNetwork(experimentId);

        if (!participants || participants.length === 0) {
            console.log(`No participants found for experiment ${experimentId}`);
            // Send empty arrays if no data
            return res.status(200).json({ nodes: [], edges: [] });
        }

        // 2. Build Graphology Graph
        const graph = new Graph({ allowSelfLoops: false, type: 'directed' }); // Directed graph

        const nodes = [];
        const edges = [];
        const idMap = new Map(); // Map DB id to graph node key (string)

        participants.forEach(p => {
            const nodeKey = p.id.toString(); // Use DB ID as string key for graphology
            idMap.set(p.id, nodeKey); // Store mapping

            // Add node to graphology graph
            if (!graph.hasNode(nodeKey)) {
                const isRootNode = p.invited_by_participant_id === null; // Identify Root Node
                graph.addNode(nodeKey, {
                    label: p.odai_id, // Use ODAI ID as label
                    dbId: p.id,      // Store original DB ID if needed later
                    // Initialize attributes for layout/metrics
                    size: 5, // Default size
                    x: Math.random() * 1000, // Initial random position
                    y: Math.random() * 1000,
                    isRoot: isRootNode,
                });
            }
        });

        participants.forEach(p => {
            if (p.invited_by_participant_id !== null) {
                const sourceKey = idMap.get(p.invited_by_participant_id);
                const targetKey = idMap.get(p.id);

                // Add edge if both source and target exist
                if (sourceKey && targetKey && graph.hasNode(sourceKey) && graph.hasNode(targetKey)) {
                    // Add edge to graphology graph (check for duplicates)
                    if (!graph.hasDirectedEdge(sourceKey, targetKey)) {
                        graph.addDirectedEdge(sourceKey, targetKey);
                    }
                } else {
                    console.warn(`Could not create edge: Source ${sourceKey} or Target ${targetKey} not found for participant ${p.id}`);
                }
            }
        });

        // 3. Calculate Metrics (Out-Degree)
        // console.log('Available metrics:', metrics);
        console.log(`Calculating out-degree for ${graph.order} nodes...`);
        metrics.centrality.outDegree(graph, { attributes: { outDegree: 'outDegree' } });

        // 4. Apply Layout (Optional but recommended for initial positions)
        // Running layout on backend can be slow for large graphs
        // Consider doing only metrics here and letting vis.js handle layout
        // Or run for a limited number of iterations
        console.log(`Applying ForceAtlas2 layout...`);
        if (graph.order > 0) {
            try {
                // Settings can be tuned
                forceAtlas2.assign(graph, {
                    iterations: 50, // Fewer iterations for faster backend response
                    settings: forceAtlas2.inferSettings(graph)
                });
                console.log("Layout applied.");
            } catch (layoutError) {
                console.error("ForceAtlas2 layout failed:", layoutError);
                // Proceed without layout positions if it fails
            }
        }


        // 5. Format for Frontend (vis.js)
        console.log("Formatting data for vis.js...");
        graph.forEachNode((nodeKey, attributes) => {
            // Map outDegree to node size (adjust scaling factor as needed)
            const calculatedSize = 5 + (attributes.outDegree || 0) * 3;
            const isRoot = attributes.isRoot || false; // Get the root flag

            nodes.push({
                id: nodeKey, // vis.js uses 'id'
                label: attributes.label,
                size: Math.min(calculatedSize, 50), // Cap max size
                title: `${attributes.label}${isRoot ? ' (Root)' : ''}<br>Direct Invites: ${attributes.outDegree || 0}`, // Add (Root) to tooltip
                x: attributes.x, // Use layout position
                y: attributes.y,
                isRoot: isRoot // Pass the flag to frontend if needed for other logic
            });
        });

        graph.forEachEdge((edgeKey, attributes, sourceKey, targetKey) => {
            edges.push({
                from: sourceKey,
                to: targetKey,
                arrows: 'to'
            });
        });

        console.log(`Prepared ${nodes.length} nodes and ${edges.length} edges.`);
        res.status(200).json({ nodes, edges });

    } catch (error) {
        console.error(`Error generating network graph for experiment ${experimentId}:`, error);
        res.status(500).json({ message: 'Server error generating network graph.' });
    }
};
// --- End of network graph controller ---

// Exporting functions for use in routes
module.exports = {
    getStats,
    getInitialToken,
    handleJoinExperiment,
    submitParticipantDemographics,
    getNetworkGraph
};