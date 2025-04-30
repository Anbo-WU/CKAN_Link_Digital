<template>
  <div class="view-container">
    <div class="content-box">
      <h1>404 - Page Not Found</h1>
      <p>
        The requested page could not be found. The observation endpoint may have
        moved or is temporarily unavailable.
      </p>
      <router-link to="/" class="action-link">Return to Start</router-link>
    </div>
  </div>
</template>

<script setup>
// No specific script needed
</script>

<style scoped>
/* Keep ONLY NotFoundView specific styles here */
h1 {
    color: #f00; /* Red for error */
}
</style>