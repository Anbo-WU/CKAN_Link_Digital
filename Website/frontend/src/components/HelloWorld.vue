<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";

defineProps<{ msg: string }>();

</script>

<template>
  <h1 color="$ep-color-primary">Project Introduction</h1>

  <p>
    <a href="http://www.ckan.org/" target="_blank">CKAN</a> is an open-source DMS (data management system) for powering data hubs and data portals.
  </p>
  <p>
    CKAN makes it easy to publish, share and use data. It powers hundreds of data portals worldwide.
  </p>
  <p>
    Our client, <a href="https://linkdigital.com.au/" target="_blank">Link Digital</a>, is a co-steward of CKAN.
  </p>
  <p>
    We will adopt CKAN as the primary tool for data management, performing an analysis </p>
    <p>similar to those conducted by civil society organizations engaged in data analysis research, social research, or policy analysis.
  </p>
  <p>
    Specifically, we will examine and document the determining factors of housing rental prices in the ACT region to provide insights.
  </p>

  <h2 color="$ep-color-primary-2">Explore Our Reports</h2>
  <!-- example components -->
  <div class="mb-4">
    <el-button 
      type="primary"
      tag="a"
      href="/ACT_Rental_Market_Analysis.pdf" 
      size="large">
      Data Analysis Report
    </el-button>
    <el-button 
      type="primary"
      tag="a"
      href="CKANPracticalReport.pdf" 
      size="large">
      CKAN Practical Report
    </el-button>
  </div>
</template>

<style>
.ep-button {
  margin: 4px;
}
.ep-button + .ep-button {
  margin-left: 0;
  margin: 4px;
}
</style>