const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const generateOdaiId = () => {
    // Simple generator, make more robust if needed
    const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `#ODAI-${randomPart}`;
};

const generateInvitationToken = () => {
    // Using UUID for simplicity and uniqueness
    return uuidv4().replace(/-/g, ''); // Remove hyphens for cleaner URL
};

module.exports = { generateOdaiId, generateInvitationToken };