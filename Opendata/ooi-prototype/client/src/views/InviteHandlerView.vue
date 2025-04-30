<template>
    <div class="view-container">
        <div class="content-box">
            <!-- Loading State -->
            <div v-if="isLoading" class="loading-message">Processing invitation...</div>

            <!-- Error State -->
            <div v-if="errorMsg && !isLoading" class="error-message">
                <h2>Error Processing Invitation</h2>
                <p>{{ errorMsg }}</p>
                <router-link to="/" class="action-link back-link">Return to Start</router-link>
            </div>

            <!-- Success State -->
            <div v-if="!isLoading && !errorMsg && participantData">
                <h1>You Have Been Observed</h1>

                <!-- Display message if this was a duplicate join via the *same* link -->
                <p v-if="isDuplicateJoin" class="duplicate-message">
                    You have already joined using this specific invitation link. Showing your existing details.
                </p>

                <p v-if="participantData.invitedByOdaiId">
                    It is observed that you were invited by <strong>{{ participantData.invitedByOdaiId }}</strong>.
                </p>
                <p>
                    Your unique identifier is: <strong>{{ participantData.yourOdaiId }}</strong>
                </p>

                <!-- QR Code Display Component -->
                <QrCodeDisplay :invitation-token="participantData.yourInvitationToken"
                    :odai-id="participantData.yourOdaiId" />

                <!-- Optional Demographics Submission Section -->
                <div class="demographics-section" v-if="!demographicsSubmitted && !submissionError">
                    <hr class="section-divider" />
                    <h2>Optional Contribution</h2>
                    <p>Help enrich the observation by providing anonymous demographic information.</p>
                    <form @submit.prevent="submitDemographicsData">
                        <!-- Gender Select Dropdown -->
                        <div class="form-group">
                            <label for="gender">Gender (Optional):</label>
                            <!-- Use a select element -->
                            <select id="gender" v-model="demographics.gender">
                                <option value="">Prefer not to say / Other</option> <!-- Default/Empty Option -->
                                <option value="Woman">Woman</option>
                                <option value="Man">Man</option>
                                <option value="Non-binary">Non-binary</option>
                                <!-- Add more options as appropriate -->
                                <!-- <option value="Self-describe">Self-describe (use text field?)</option> -->
                                <!-- If 'Self-describe' is chosen, you might show a text input -->
                            </select>
                            <!-- Optional: Text input shown if 'Self-describe' selected -->
                            <!-- <input
                    v-if="demographics.gender === 'Self-describe'"
                    type="text"
                    v-model="demographics.customGender"
                    placeholder="Please specify"
                    class="self-describe-input"
                /> -->
                        </div>
                        <!-- Age Input -->
                        <div class="form-group">
                            <label for="age">Age (Optional):</label>
                            <!-- Input type number inherits base styles -->
                            <input type="number" id="age" v-model.number="demographics.age" min="0"
                                placeholder="e.g., 30" />
                        </div>
                        <!-- Geolocation Group -->
                        <div class="form-group geo-group">
                            <label>Location (Required for demographic submission):</label>
                            <button type="button" @click="getGeolocation" :disabled="locating || !canGeolocate"
                                class="action-link geo-button">
                                {{ locating ? 'Getting Location...' : 
                                (demographics.latitude ? 'Update Location' : 'Get Current Location') }}
                            </button>

                            <!-- Display Coordinates -->
                            <span v-if="demographics.latitude && demographics.longitude" class="geo-coords">
                                Lat: {{ demographics.latitude.toFixed(4) }}, Lon: {{ demographics.longitude.toFixed(4)
                                }}
                            </span>
                            <!-- Geolocation Error Message -->
                            <span v-if="geoLocationError" class="error-message geo-error">{{ geoLocationError }}</span>
                        </div>
                        <!-- Submit Button -->
                        <button type="submit" class="action-link submit-button"
                            :disabled="submitting || !demographics.latitude">
                            {{ submitting ? 'Submitting...' : 'Submit Information' }}
                        </button>
                    </form>
                </div>

                <!-- Submission Success Message -->
                <div v-if="demographicsSubmitted" class="success-message thank-you-box">
                    Thank you for your contribution! Your additional information has been recorded.
                </div>
                <!-- Submission Error Message -->
                <div v-if="submissionError && !demographicsSubmitted" class="error-message">
                    {{ submissionError }}
                </div>

                <!-- Navigation Links Area -->
                <div class="navigation-links">
                    <!-- Link to Stats View -->
                    <router-link :to="{ name: 'stats', params: { odaiId: participantData.yourOdaiId.substring(1) } }"
                        class="action-link stats-link">
                        View Your Stats
                    </router-link>
                    <!-- Link back to Home -->
                    <router-link to="/" class="action-link back-link">
                        Back to Start
                    </router-link>
                </div>

            </div> <!-- End v-if !isLoading && !errorMsg && participantData -->
        </div> <!-- End content-box -->
    </div> <!-- End view-container -->
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { joinExperiment, submitDemographics, fetchStats } from '../services/apiService';
import QrCodeDisplay from '../components/QrCodeDisplay.vue';
import Cookies from 'js-cookie'; // Import js-cookie

// Component Refs and Hooks
const route = useRoute();

// Reactive State Variables
const isLoading = ref(true); // Controls the main loading state for joining
const errorMsg = ref('');    // Stores error messages related to joining
const participantData = ref(null); // Stores data of the newly joined participant
const isDuplicateJoin = ref(false); // Flag for duplicate detection

// Demographics Form State
const demographics = reactive({
    gender: '',
    age: null,
    latitude: null,
    longitude: null,
});
const locating = ref(false);          // Controls loading state for geolocation button
const geoLocationError = ref('');     // Stores errors from geolocation API
const canGeolocate = ref(typeof window !== 'undefined' && 'geolocation' in navigator); // Check if browser supports geolocation
const submitting = ref(false);        // Controls loading state for demographics submission
const demographicsSubmitted = ref(false); // Tracks if demographics were successfully submitted
const submissionError = ref('');      // Stores errors related to demographics submission

// --- Geolocation Function ---
const getGeolocation = () => {
    if (!canGeolocate.value) {
        geoLocationError.value = "Geolocation is not supported by your browser.";
        return;
    }
    locating.value = true;
    geoLocationError.value = ''; // Clear previous errors
    navigator.geolocation.getCurrentPosition(
        (position) => {
            demographics.latitude = position.coords.latitude;
            demographics.longitude = position.coords.longitude;
            console.log('Geolocation obtained:', position.coords);
            locating.value = false;
        },
        (error) => {
            console.error("Geolocation error:", error);
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    geoLocationError.value = "Permission denied.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    geoLocationError.value = "Location unavailable.";
                    break;
                case error.TIMEOUT:
                    geoLocationError.value = "Request timed out.";
                    break;
                default:
                    geoLocationError.value = "Unknown location error.";
            }
            locating.value = false;
        },
        { // Geolocation options
            enableHighAccuracy: true,
            timeout: 15000, // Increased timeout to 15 seconds
            maximumAge: 0
        }
    );
};

// --- Submit Demographics Function ---
const submitDemographicsData = async () => {
    // Validate required fields
    if (!participantData.value?.yourOdaiId) {
        submissionError.value = "Error: Participant ID is missing.";
        return;
    }
    if (!demographics.latitude || !demographics.longitude) {
        submissionError.value = "Error: Location is required for submission. Please click 'Get Current Location'.";
        // Highlight location button?
        return;
    }

    submitting.value = true;
    submissionError.value = ''; // Clear previous errors

    // Prepare data, handle null for optional fields
    const dataToSubmit = {
        gender: demographics.gender || null,
        age: demographics.age || null,
        latitude: demographics.latitude,
        longitude: demographics.longitude,
    };

    try {
        console.log('Submitting demographics:', dataToSubmit);
        const response = await submitDemographics(participantData.value.yourOdaiId, dataToSubmit);
        demographicsSubmitted.value = true; // Show thank you message
        submissionError.value = ''; // Clear any previous error
        console.log("Demographics submission success:", response.data);
    } catch (error) {
        console.error("Demographics submission error:", error);
        submissionError.value = `Failed to submit information: ${error.response?.data?.message || error.message || 'Unknown error'}`;
        demographicsSubmitted.value = false; // Ensure thank you message isn't shown
    } finally {
        submitting.value = false;
    }
};

// --- Main logic on component mount (Processing the Invite) ---
onMounted(async () => {
    const currentInviterToken = route.params.token; // Get token from the URL route parameter
    const sourceQueryParam = route.query.source; // Get 'qr' or undefined from query parameter
    // Determine source for the API call
    const sourceForApi = sourceQueryParam === 'qr' ? 'qr' : 'url'; // Default to 'url' if query param missing

    isLoading.value = true; // Start loading
    errorMsg.value = '';
    participantData.value = null;
    isDuplicateJoin.value = false; // Reset flag

    console.log(`InviteHandlerView: Mounted. Token from route: ${currentInviterToken}`);
    console.log(`InviteHandlerView: Mounted. source: ${sourceQueryParam}`);

    // Basic validation for token presence
    if (!currentInviterToken) {
        errorMsg.value = 'Error: Invitation token is missing in the URL.';
        isLoading.value = false; // Stop loading as we can't proceed
        console.error(errorMsg.value);
        // Optional: Redirect after delay
        // setTimeout(() => router.push('/'), 5000);
        return;
    }

    // Check Cookie
    const existingInviteCookie = Cookies.get('ooi_last_invite');
    let previousInviteData = null;
    if (existingInviteCookie) {
        try {
            previousInviteData = JSON.parse(existingInviteCookie);
            console.log('Found existing invite cookie:', previousInviteData);
        } catch (e) {
            console.error("Error parsing invite cookie:", e);
            Cookies.remove('ooi_last_invite'); // Remove invalid cookie
            previousInviteData = null;
        }
    }

    // --- Logic branching based on cookie and token match ---
    let proceedAsNewJoin = true; // Assume new join unless duplicate is successfully verified

    // Check if user already joined via THIS SPECIFIC inviter token
    if (previousInviteData && previousInviteData.inviterToken === currentInviterToken && previousInviteData.myOdaiId) {
        console.log(`Duplicate invite detected for inviter token: ${currentInviterToken}. Fetching existing data for ${previousInviteData.myOdaiId}`);
        // isDuplicateJoin.value = true;
        try {
            // Fetch existing participant data using their known ODAI ID from cookie
            const response = await fetchStats(previousInviteData.myOdaiId); // Use fetchStats

            if (response && response.data && response.data.yourId === previousInviteData.myOdaiId) {
                // Successfully fetched existing data - this IS a verified duplicate
                console.log('Verified duplicate. Fetch successful. Displaying existing data.');
                isDuplicateJoin.value = true; // Confirm duplicate for UI message
                proceedAsNewJoin = false; // Do NOT proceed as new join

                // Map stats response
                participantData.value = {
                    invitedByOdaiId: response.data.invitedByOdaiId,
                    yourOdaiId: response.data.yourId,
                    yourInvitationToken: previousInviteData.myToken // Use token from cookie
                };
                if (response.data.demographics_submitted_at) {
                    demographicsSubmitted.value = true;
                }
            } else {
                // Fetch was successful but data didn't match or was incomplete - treat as potentially invalid cookie
                console.warn("Fetched data but it didn't match cookie or was incomplete. Cookie might be stale. Proceeding as new join.");
                Cookies.remove('ooi_last_invite'); // Remove potentially stale cookie
                isDuplicateJoin.value = false; // Not a confirmed duplicate anymore
                proceedAsNewJoin = true;
            }

        } catch (fetchError) {
            console.error("Error fetching existing participant data:", fetchError);
            // Check if the error was specifically a 404 Not Found
            if (fetchError.response && fetchError.response.status === 404) {
                console.log(`Participant ${previousInviteData.myOdaiId} not found on server (cookie exists). Proceeding as new join.`);
                // User exists in cookie but not DB -> DB likely cleared. Treat as NEW.
                Cookies.remove('ooi_last_invite'); // Remove the now invalid cookie
                isDuplicateJoin.value = false; // Not a duplicate anymore
                proceedAsNewJoin = true; // Set flag to proceed below
            } else {
                // For other fetch errors (network, server 500), show an error message
                errorMsg.value = "Could not retrieve your previous participation details due to a server or network error.";
                isDuplicateJoin.value = false;
                proceedAsNewJoin = false; // Do not proceed as new join on non-404 errors
                participantData.value = null;
            }
        } finally {
            isLoading.value = false;
        }

    } else {
        // No cookie, or inviter token in cookie doesn't match current link token
        console.log("No matching cookie found, or different inviter token. Definitely a new join flow.");
        proceedAsNewJoin = true;
        isDuplicateJoin.value = false;
        // Optionally remove cookie if inviter token didn't match, to prevent issues if user navigates back/forth
        if (previousInviteData && previousInviteData.inviterToken !== currentInviterToken) {
            console.log("Removing cookie due to mismatched inviter token.");
            Cookies.remove('ooi_last_invite');
        }
    }

    // --- Execute NEW join flow if proceedAsNewJoin is true ---
    if (proceedAsNewJoin && !errorMsg.value) { // Only proceed if flag is set AND no prior critical error occurred
        // --- Proceed with NEW join ---
        console.log(`Proceeding with join API call for token: ${currentInviterToken}, source: ${sourceForApi}`);
        isDuplicateJoin.value = false;
        try {

            // Call API, passing token AND source
            console.log(`Calling joinExperiment with token: ${currentInviterToken}, source: ${sourceForApi}`);
            const response = await joinExperiment(currentInviterToken, sourceForApi); // Pass source

            if (!response || !response.data || !response.data.yourOdaiId || !response.data.yourInvitationToken) {
                console.error('Invalid response structure received from joinExperiment API:', response);
                throw new Error("Received incomplete data after joining. Please try again.");
            }

            participantData.value = response.data;
            console.log('Join successful. New participant data set:', participantData.value);

            // Set Cookie on NEW successful join
            const cookieData = {
                inviterToken: currentInviterToken, // The token that led to this join
                myOdaiId: participantData.value.yourOdaiId, // The ID received
                myToken: participantData.value.yourInvitationToken // The invite token received
            };

            console.log('Setting new invite cookie:', cookieData);
            Cookies.set('ooi_last_invite', JSON.stringify(cookieData), { expires: 365, path: '/', sameSite: 'Lax' }); // Expires in 1 year
            errorMsg.value = ''; // Clear any previous error

        } catch (error) { /* ... existing error handling for joinExperiment ... */
            console.error('Error during joinExperiment API call:', error);
            if (error.response?.data?.message) { errorMsg.value = `Error: ${error.response.data.message}`; }
            else if (error.message) { errorMsg.value = `Error: ${error.message}`; }
            else { errorMsg.value = 'Failed to process invitation.'; }
            participantData.value = null;
        } finally {
            console.log('Setting isLoading to false after new join attempt.');
            isLoading.value = false; // Ensure loading stops
        }
    } // End if (new join)


}); // End onMounted

</script>

<style scoped>
/* Styles inherit from base.css and component-specific styles below */
h1 {
    color: #ff0;
    /* Yellow */
}

h2 {
    color: #eee;
}

/* Demographics Section Styling */
.demographics-section {
    margin-top: 40px;
    padding-top: 30px;
    border-top: 1px dashed #0f0;
}

.section-divider {
    /* If using hr */
    border: none;
    border-top: 1px dashed #0f0;
    margin: 30px 0;
}

form {
    margin-top: 20px;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
    text-align: left;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    color: #ccc;
    font-weight: bold;
}

.form-group input[type="text"],
.form-group input[type="number"] {
    width: 100%;
    /* Inherits styles from base.css */
}


/* --- Styling for the select dropdown --- */
select {
    padding: 10px;
    background-color: #111;
    border: 1px solid #0f0;
    color: #0f0;
    /* Green text for selected option */
    font-family: inherit;
    /* Use monospace font */
    border-radius: 4px;
    margin: 5px 0;
    width: 100%;
    height: 40px;
    /* Explicit height */
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2300FF00%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E');
    background-repeat: no-repeat;
    background-position: right 10px top 50%;
    background-size: 10px auto;
    box-sizing: border-box;
    /* Ensure padding/border included in height */
}

select option {
    background-color: #111;
    color: #eee;
}

select:invalid,
select option[value=""] {
    color: #555;
}

/* --- End Select Styling --- */

/* --- Explicit Styling for Age input[type="number"] --- */
input[type="number"]#age {
    /* Target specifically the age input */
    padding: 10px;
    /* Match select padding */
    background-color: #111;
    /* Match select background */
    border: 1px solid #0f0;
    /* Match select border */
    color: #0f0;
    /* Match select foreground (text color) */
    font-family: inherit;
    /* Match select font */
    border-radius: 4px;
    /* Match select border-radius */
    margin: 5px 0;
    /* Match select margin */
    width: 100%;
    /* Match select width */
    height: 40px;
    /* Explicit height to match select */
    box-sizing: border-box;
    /* Include padding/border in height */
    /* Optionally hide spinners */
    appearance: textfield;
    -moz-appearance: textfield;
}

input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

input[type="number"]#age::placeholder {
    color: #555;
    /* Match select placeholder color */
}

/* --- End Age Input Styling --- */

.geo-group {
    /* display: flex; // Keep as block for easier error message placement */
    /* flex-direction: column; */
    /* align-items: flex-start; */
}

.geo-group label {
    margin-bottom: 10px;
}

.geo-button {
    margin: 0 0 10px 0;
    /* align-self: flex-start; */
    /* Not needed if block */
}

.geo-coords {
    font-size: 0.9em;
    color: #0f0;
    /* Green coordinates */
    margin-left: 10px;
    display: inline-block;
    /* Display next to button or on next line */
}

.geo-error {
    /* Specific style for geo error below button */
    display: block;
    /* Ensure it's on its own line */
    margin-top: 5px;
    font-size: 0.9em;
}

.submit-button {
    width: 100%;
    padding: 12px;
}

.thank-you-box {
    border: 1px solid #0f0;
    padding: 15px;
    margin-top: 20px;
    border-radius: 4px;
    background-color: rgba(0, 50, 0, 0.3);
}

/* Navigation Links Styling */
.navigation-links {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #333;
    display: flex;
    justify-content: center;
    gap: 20px;
    flex-wrap: wrap;
}

/* Links inherit .action-link style */
</style>