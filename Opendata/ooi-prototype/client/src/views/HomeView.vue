<template>
  <div class="view-container">
    <div class="content-box">
      <h1>OPENDATA.AI <span class="green-dot"></span></h1>
      <nav class="main-nav">
         <router-link to="/">Home</router-link> |
         <router-link to="/about">About</router-link> |
         <router-link :to="{ name: 'networkView' }">Network Graph</router-link>
      </nav>

      <p>
        This page is an entry point to an observational instrument within
        <strong>OpenData.ai</strong>. Your interaction initiates a recorded event,
        acknowledged but not interpreted.
      </p>

      <div v-if="isLoading" class="loading-message">Loading experiment...</div>
      <div v-if="errorMsg" class="error-message">{{ errorMsg }}</div>

      <!-- Main Content: Only show when token is ready -->
      <div v-if="!isLoading && !errorMsg && initialInviterToken" class="main-action-area">
         <div class="principles-box">
            <p>
              This page logs objective reality. Your presence and interaction are
              noted, but no assumptions are made. This approach ensures transparency
              and neutrality in data collection.
            </p>
            <p>
              <span class="key-principle">Key Principle:</span> Observation does
              not equal judgment. Your data remains non-identifiable in this public
              view and contributes only to statistical presence awareness within the
              network lineage.
            </p>
        </div>

        <!-- Modified Instruction Text -->
        <p class="action-instruction">
          Click the button or scan the QR code below to begin the observation and join the experiment.
        </p>

        <!-- Button (Router Link) -->
        <router-link
            :to="{ name: 'inviteHandler', params: { token: initialInviterToken } }"
            class="action-link start-button"
        >
          Start Observation / Join Experiment
        </router-link>

        <!-- QR Code Display - Simplified -->
        <div class="qr-code-container">
          <qrcode-vue
            v-if="qrCodeInviteUrl"
            :value="qrCodeInviteUrl"
            :size="qrSize"
            level="H"
            render-as="svg"
            :margin="2"
            :foreground="qrColors.foreground"
            :background="qrColors.background"
            class="qr-code-img"
          />
          <div v-else class="loading-message">Generating QR...</div>
        </div>

      </div>
      <!-- Error message if token loading failed -->
      <div v-else-if="!isLoading && !errorMsg && !initialInviterToken">
          <p class="error-message">Could not load initial experiment data.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { fetchInitialToken } from '../services/apiService';
import QrcodeVue from 'qrcode.vue'; // Import QR Code component

// State
const initialInviterToken = ref(null);
const isLoading = ref(true);
const errorMsg = ref('');

// QR Code Configuration
const qrSize = ref(220); // Slightly larger maybe?
const qrColors = ref({ foreground: '#00FF00', background: '#000000' });

// Computed property for the full FRONTEND invite URL used in QR/Link
// --- NEW: Computed property for the QR code URL with source param ---
const qrCodeInviteUrl = computed(() => {
  if (!initialInviterToken.value) return '';
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  // The link points to the frontend route, including the token and source=qr
  return `${origin}/invite/${initialInviterToken.value}?source=qr`;
});


// Fetch initial token on mount
onMounted(async () => {
  isLoading.value = true;
  errorMsg.value = '';
  try {
    const response = await fetchInitialToken();
    initialInviterToken.value = response.data?.initialToken;
    if (!initialInviterToken.value) throw new Error('Initial token missing in response.');
  } catch (error) {
    console.error('Failed to fetch initial token:', error);
    errorMsg.value = `Error loading experiment: ${error.response?.data?.message || error.message || 'Unknown error'}`;
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
/* Keep general layout styles from previous HomeView */
.main-nav {
    margin-bottom: 30px;
    font-size: 1.1em;
}
.main-nav a {
    margin: 0 10px;
    color: #0ff;
}
.main-nav a:hover {
    color: #fff;
}

h1 {
  font-size: 2.5em;
  margin-bottom: 30px;
  display: inline-flex;
  align-items: center;
  color: #ffffff;
}

.principles-box {
  border: 1px solid #00ff00;
  border-radius: 8px;
  padding: 25px 30px;
  margin-top: 30px;
  margin-bottom: 30px; /* Reduced bottom margin */
  max-width: 700px;
  text-align: left;
  background-color: rgba(0, 20, 0, 0.1);
}

.principles-box p {
  color: #dddddd;
  margin-bottom: 15px;
}
.principles-box p:last-child {
  margin-bottom: 0;
}

/* New area for button and QR */
.main-action-area {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
}

.action-instruction {
    color: #ccc;
    margin-bottom: 20px;
}

.start-button {
    margin-bottom: 30px; /* Space between button and QR */
    padding: 15px 30px; /* Make button a bit larger */
    font-size: 1.1em;
}

.qr-code-container {
    border: 5px solid #0f0; /* Match border color */
    padding: 10px; /* Space between border and QR */
    background-color: #000; /* Ensure black bg behind QR */
    display: inline-block; /* Fit content */
    line-height: 0; /* Prevent extra space below svg/canvas */
    margin-bottom: 20px; /* Space below QR code */
}

.qr-code-img {
    display: block; /* Prevent extra space */
}

/* Inherit base styles for loading/error messages */
</style>