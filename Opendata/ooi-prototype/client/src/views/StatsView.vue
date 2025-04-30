<template>
    <div class="view-container">
      <!-- Use content-box for centering, but maybe don't need its padding if stats-box handles it -->
      <div class="content-box stats-container">
        <div v-if="loading" class="loading-message">Loading Stats...</div>
        <div v-if="error" class="error-message">{{ error }}</div>
  
        <div v-if="stats" class="stats-display">
          <h1>Experiment 01 Stats</h1>
  
          <!-- Main Stats Section - Two Column Layout -->
          <div class="stats-grid">
            <div class="stats-label">Your ID</div>
            <div class="stats-value">{{ stats.yourId || 'N/A' }}</div>
  
            <div class="stats-label">Invitation Method</div>
            <div class="stats-value">{{ stats.invited_via_qr ? 'QR Code Scan' : 'Direct Link' }}</div>

            <div class="stats-label">Direct Invites</div>
            <div class="stats-value">{{ stats.directInvites ?? 'N/A' }}</div>
  
            <div class="stats-label">Total Network</div>
            <div class="stats-value">{{ stats.totalNetwork ?? 'N/A' }}</div>
  
            <div class="stats-label">Lineage Depth</div>
            <div class="stats-value">{{ stats.lineageDepth ?? 'N/A' }}</div>
  
            <div class="stats-label">Active Sensors</div>
            <div class="stats-value">{{ stats.activeSensors ?? '0' }}</div> <!-- Default to 0 if null -->
  
            <template v-if="stats.ip_address">
              <div class="stats-label">IP Address</div>
              <div class="stats-value">{{ stats.ip_address }}</div>
            </template>

          <!-- NEW Fields Display -->
          <template v-if="stats.preferred_language">
            <div class="stats-label">Preferred Language</div>
            <div class="stats-value">{{ stats.preferred_language }}</div>
          </template>
          <template v-if="stats.browser_name">
            <div class="stats-label">Browser</div>
            <div class="stats-value">{{ stats.browser_name }}{{ stats.browser_version ? ` ${stats.browser_version}` : '' }}</div>
          </template>
          <template v-if="stats.os_name">
            <div class="stats-label">Operating System</div>
            <div class="stats-value">{{ stats.os_name }}{{ stats.os_version ? ` ${stats.os_version}` : '' }}</div>
          </template>

            <template v-if="stats.gender">
              <div class="stats-label">Gender</div>
              <div class="stats-value">{{ stats.gender }}</div>
            </template>
             <template v-if="stats.age !== null && stats.age !== undefined">
               <div class="stats-label">Age</div>
               <div class="stats-value">{{ stats.age }}</div>
             </template>
             <template v-if="stats.latitude && stats.longitude">
               <div class="stats-label">Location</div>
               <div class="stats-value">Lat: {{ stats.latitude.toFixed(4) }}, Lon: {{ stats.longitude.toFixed(4) }}</div>
             </template>
             <template v-if="stats.demographics_submitted_at">
               <div class="stats-label">Info Submitted</div>
               <div class="stats-value">{{ formatTimestamp(stats.demographics_submitted_at) }}</div>
             </template>
          </div>
  
          <!-- Lineage Path Section -->
          <div v-if="stats.yourLineagePath" class="lineage-section">
            <h2>Your Lineage Path</h2>
            <p class="lineage-path-display">{{ stats.yourLineagePath }}</p>
          </div>
  
          <!-- Navigation Links Area (optional) -->
           <div class="navigation-links">
              <router-link to="/" class="action-link">Back to Start</router-link>
          </div>
  
        </div>
      </div>
    </div>
  </template>
  

  <script setup>
  // Import 'ref' along with 'onMounted'
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { fetchStats } from '../services/apiService';
  
  const props = defineProps({
      odaiId: {
          type: String,
          required: true
      }
  });
  
  const stats = ref(null);
  const loading = ref(true);
  const error = ref('');
  
  // Helper to format timestamp (optional)
  const formatTimestamp = (ts) => {
      if (!ts) return 'N/A';
      try {
          // Use locale-specific formatting
          return new Date(ts).toLocaleString(undefined, {
              dateStyle: 'medium', // e.g., Sep 14, 2023
              timeStyle: 'short'   // e.g., 10:30 AM
          });
      } catch (e) {
          console.warn("Timestamp formatting failed:", e);
          return ts; // Return raw if formatting fails
      }
  };
  
  onMounted(async () => {
      loading.value = true;
      error.value = '';
      console.log(`StatsView: Fetching stats for ODAI ID param: ${props.odaiId}`);
      try {
          // Ensure '#' is handled correctly if needed by API endpoint
          const targetId = props.odaiId.startsWith('#') ? props.odaiId : `#${props.odaiId}`;
          const response = await fetchStats(targetId); // Fetch stats
  
          // Add a check for response data
          if (response && response.data) {
              stats.value = response.data;
              console.log('StatsView: Stats received:', stats.value);
          } else {
               throw new Error("Received empty or invalid data from stats API.");
          }
  
      } catch (err) {
          console.error('StatsView: Error fetching stats:', err); // Log the full error
          if (err.response && err.response.status === 404) {
              error.value = `Error: Participant with ID '${props.odaiId}' not found.`;
          } else if (err.response && err.response.data && err.response.data.message) {
              error.value = `Error fetching stats: ${err.response.data.message}`;
          } else if (err.message) {
               error.value = `Error fetching stats: ${err.message}`;
          }
           else {
              error.value = 'Failed to load stats. Check network connection or server status.';
          }
          stats.value = null; // Clear stats on error
      } finally {
          loading.value = false;
      }
  });
  
  </script>
  
  <style scoped>
  /* Inherit base styles */
  
  .stats-container {
      /* Override content-box padding if needed, or use stats-display padding */
      padding: 10px; /* Minimal padding for container */
      max-width: 900px;
  }
  
  .stats-display {
      /* Optional: Add padding within the display area */
      padding: 20px;
      /* Optional: Add border like InviteHandlerView's main box */
      /* border: 1px solid #0f0; */
      /* background-color: rgba(0, 10, 0, 0.1); */
      /* border-radius: 8px; */
  }
  
  
  h1 {
      color: #ff0; /* Yellow */
      text-align: center; /* Center title */
      margin-bottom: 40px; /* More space below title */
      font-size: 2.5em; /* Match image style */
  }
  
  .stats-grid {
      display: grid;
      /* Two columns: Label (auto width) and Value (takes remaining space) */
      grid-template-columns: max-content 1fr;
      gap: 10px 20px; /* Row gap, Column gap */
      max-width: 600px; /* Limit width for alignment */
      margin: 0 auto 40px auto; /* Center grid, add bottom margin */
      text-align: left; /* Align text left within cells */
      font-size: 1.1em; /* Slightly larger font */
  }
  
  .stats-label {
      color: #ffffff; /* White labels */
      font-weight: normal; /* Normal weight like image */
      padding-right: 20px; /* Ensure space between label and value */
      white-space: nowrap; /* Prevent labels wrapping */
  }
  
  .stats-value {
      color: #ffffff; /* White values */
      font-weight: normal; /* Normal weight */
      word-break: break-all; /* Break long IDs or IPs */
  }
  
  .lineage-section {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #333; /* Separator line */
  }
  
  h2 { /* Style for "Your Lineage Path" header */
      color: #ff0; /* Yellow */
      text-align: left; /* Align header left */
      margin-bottom: 15px;
      font-size: 1.4em;
      border-top: none; /* Remove default border */
      padding-top: 0;
  }
  
  .lineage-path-display {
      font-size: 1.1em;
      word-wrap: break-word;
      background-color: rgba(0, 50, 0, 0.2);
      padding: 15px;
      border-radius: 4px;
      border: 1px solid #050;
      color: #0f0;
      text-align: left; /* Align path left */
      max-width: 100%; /* Allow path to take full width */
  }
  
  .navigation-links {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #333;
      display: flex;
      justify-content: center;
      gap: 20px;
      flex-wrap: wrap;
  }
  
  /* Loading/Error messages inherit from base.css */
  
  </style>