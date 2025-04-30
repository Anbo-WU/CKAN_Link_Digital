<!-- src/components/AppFooter.vue -->
<template>
    <footer class="page-footer">
      Observed under USER | Objective reality acknowledged | Non-identifiable observations are non-revocable
      <br />
      <a href="#">Declaration of Self Interest</a> |
      <a href="#">Accountability Framework</a> |
      <a href="#">Constitutional Framework</a>
      <br />
      Governed by OpenData.AI and <a href="#">OpenData.LY</a> under the Objective Observer Initiative (OOI).
      <br />
      <!-- Add the new disclaimer line below -->
      <p class="disclaimer">
        This website is a student project for the Australian National University (ANU) coursework.
        The original concept and copyright belong to OpenData.AI and OpenData.LY.
      </p>
    </footer>
  </template>
  
  <script setup>
  // No script needed for this simple footer
  </script>
  
  <style scoped>
  .page-footer {
    padding: 20px;
    margin-top: auto;
    font-size: 0.85em;
    color: #888888;
    line-height: 1.6;
    text-align: center;
    width: 100%;
    background-color: #000;
    border-top: 1px solid #222;
  }
  
  .page-footer a {
    color: #00ff00; /* Green links */
    text-decoration: none;
  }
  
  .page-footer a:hover {
    text-decoration: underline;
  }
  
  /* Style for the new disclaimer paragraph */
  .disclaimer {
    margin-top: 15px; /* Add some space above the disclaimer */
    font-size: 0.9em; /* Slightly smaller font for the disclaimer */
    color: #d6f013; /* Even dimmer grey */
    /* Ensure paragraph defaults are overridden if needed */
    text-align: center;
    max-width: none; /* Allow disclaimer to take full width */
    margin-bottom: 0; /* Remove default paragraph bottom margin */
  }
  </style>