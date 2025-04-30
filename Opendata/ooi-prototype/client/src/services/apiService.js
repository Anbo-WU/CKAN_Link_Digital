import axios from 'axios';

// Use environment variable for API base URL if deploying
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const joinExperiment = (inviterToken, source = 'url') => { // Default source to 'url'
    console.log(`Calling backend to join. Token: ${inviterToken}, Source: ${source}`);
    // Send both token and source in the request body
    return apiClient.post('/join-experiment', { inviterToken, source });
};

export const submitDemographics = (odaiId, data) => {
     // Remove '#' if present for URL param
    const cleanOdaiId = odaiId.startsWith('#') ? odaiId.substring(1) : odaiId;
    console.log(`Submitting demographics for ${cleanOdaiId}:`, data);
    return apiClient.put(`/participants/${cleanOdaiId}/demographics`, data);
};

export const fetchStats = (odaiId) => {
    // Remove '#' if present for URL param, backend adds it back if needed
    const cleanOdaiId = odaiId.startsWith('#') ? odaiId.substring(1) : odaiId;
    console.log(`Fetching stats for ${cleanOdaiId}`);
    return apiClient.get(`/stats/${cleanOdaiId}`);
};


// Fetch the initial token for the first participant
export const fetchInitialToken = () => {
    console.log('Requesting initial token from backend...');
    return apiClient.get('/initial-token');
};

export const fetchNetworkData = (experimentId = '01') => {
    console.log(`Requesting network data for experiment ${experimentId}...`);
    // Use the correct API endpoint path defined in backend routes
    return apiClient.get(`/network/${experimentId}`);
};

// Example if you had other interactions
// export const requestLoginLink = (email) => {
//     return apiClient.post('/request-login', { email });
// };

export default apiClient; // Export the configured client if needed elsewhere