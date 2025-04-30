mysql -uroot -p
CREATE DATABASE  db8715 DEFAULT CHARACTER SET utf8;
CREATE USER 'anu8715'@'%' IDENTIFIED BY 'ANU8715p';
GRANT ALL PRIVILEGES ON db8715.* TO 'anu8715';
flush privileges;
commit;



USE db8715;

-- Participants Table
CREATE TABLE IF NOT EXISTS participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    odai_id VARCHAR(20) UNIQUE NOT NULL,             -- The unique #ODAI-XXXX identifier
    invitation_token VARCHAR(64) UNIQUE NOT NULL,    -- Token used in their unique invite URL
    invited_by_participant_id INT NULL,              -- ID of the participant who invited them (NULL for initiator)
    experiment_id VARCHAR(10) NOT NULL DEFAULT '01', -- Assuming experiment '01' for now
    ip_address VARCHAR(45) NULL,                     -- Suitable for IPv4 and IPv6
    gender VARCHAR(50) NULL,                         -- Increased length for flexibility
    age INT NULL,                                    -- Age of the participant
    location POINT NULL,                             -- Store as POINT, SRID 4326 is standard Lat/Lon
    preferred_language VARCHAR(255) NULL,       -- Preferred language of the participant
    user_agent_raw TEXT NULL,                     -- Raw user agent string for detailed analysis
    browser_name VARCHAR(100) NULL,                -- Browser name extracted from user agent
    browser_version VARCHAR(50) NULL,             -- Browser version extracted from user agent
    os_name VARCHAR(100) NULL,                    -- Operating system name extracted from user agent
    os_version VARCHAR(50) NULL,                  -- Operating system version extracted from user agent
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    demographics_submitted_at TIMESTAMP NULL,        -- Optional: track submission time

    FOREIGN KEY (invited_by_participant_id) REFERENCES participants(id) ON DELETE SET NULL -- Or CASCADE depending on desired behavior
);

INSERT INTO participants (odai_id, invitation_token, invited_by_participant_id) VALUES ('#ODAI-INIT', REPLACE(UUID(), '-', ''), NULL);

-- Add index for faster lookups
CREATE INDEX idx_invited_by ON participants (invited_by_participant_id);
CREATE INDEX idx_odai_id ON participants (odai_id);
CREATE INDEX idx_invitation_token ON participants (invitation_token);

-- Optional: Seed the first user (Initiator A) if needed for testing,
-- otherwise the first access to a base invite URL could create them.
-- INSERT INTO participants (odai_id, invitation_token, invited_by_participant_id) VALUES ('#ODAI-INIT1', UUID(), NULL);

----------------------------------------------------------------------------------------
USE ooi_prototype;

ALTER TABLE participants
-- Add after location or demographics_submitted_at, adjust 'AFTER' clause as needed
ADD COLUMN preferred_language VARCHAR(255) NULL AFTER location,
ADD COLUMN user_agent_raw TEXT NULL AFTER preferred_language,
ADD COLUMN browser_name VARCHAR(100) NULL AFTER user_agent_raw,
ADD COLUMN browser_version VARCHAR(50) NULL AFTER browser_name,
ADD COLUMN os_name VARCHAR(100) NULL AFTER browser_version,
ADD COLUMN os_version VARCHAR(50) NULL AFTER os_name;