const express = require('express');
const experimentController = require('../controllers/experimentController');
const router = express.Router();

// Frontend will call this API endpoint from InviteHandlerView
router.post('/join-experiment', experimentController.handleJoinExperiment);

// Endpoint to get stats for a specific participant
// GET /stats/ODAI-XXXXXX (Note: '#' might cause issues in URL paths, handle encoding or remove)
router.get('/stats/:odaiId', experimentController.getStats);

// For fetching the initial token for the first participant
router.get('/initial-token', experimentController.getInitialToken);

router.put('/participants/:odaiId/demographics', experimentController.submitParticipantDemographics);

router.get('/network/:experimentId?', experimentController.getNetworkGraph); // experimentId is optional

// You might want a base endpoint to generate the *first* link if needed
// router.post('/experiments/01/start', experimentController.startExperiment);

router.get('/test', (req, res) => {
    res.send("test data");
});

module.exports = router;