<template>
  <div class="view-container">
    <div class="content-box">
      <h1>About the Objective Observer Initiative</h1>
      <p>
        The Objective Observer Initiative (OOI) is an experimental framework
        designed to document and analyze social dynamics and network formation
        in a neutral, objective manner.
      </p>
       <p>
          Using simple mechanisms like shared links, OOI aims to map connections
          and observe emergent patterns without imposing predefined structures
          or interpretations. The core principle is that observation does not
          equal judgment.
       </p>
      <h2>Core Platforms</h2>
      <p>
        The initiative relies on platforms like <strong>OpenData.ai</strong> for
        data management and analysis, and <strong>OpenData.LY</strong> for
        community discussion and idea sharing regarding publicly valuable data.
        Technical infrastructure is maintained openly via GitHub.
      </p>
      <p>
        This prototype demonstrates the basic lineage tracking functionality.
      </p>
       <router-link to="/" class="action-link">Return to Start</router-link>
    </div>
  </div>
</template>

<script setup>
// No specific script needed
</script>

<style scoped>
/* Keep ONLY AboutView specific styles here */
h2 {
    margin-top: 2rem;
    border-top: none; /* Remove top border for this H2 */
    padding-top: 0;
    color: #00ff00; /* Green sub-headers */
}
p {
    text-align: left; /* Left align paragraphs for readability */
}
</style>