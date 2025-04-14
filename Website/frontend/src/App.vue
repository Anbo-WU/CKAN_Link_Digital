<template>
  <el-config-provider namespace="ep">
    <BaseHeader />
    <div class="flex main-container">
      <div w="full" py="4">
        <HelloWorld msg="Homepage" />
        <div class="visualizations-container">
          <Visualizations />
        </div>
        <div class="footer-text">
          <el-divider></el-divider>
          
          <p>
            Accelerating Everything with Next Generation Knowledge Operations is an 
            <a href="https://comp.anu.edu.au/TechLauncher/" target="_blank">ANU TechLauncher</a> 
            project launched by 
            <a href="https://linkdigital.com.au/" target="_blank">Link Digital</a>.
          </p>
        </div>
      </div>
    </div>
  </el-config-provider>
</template>

<style>
#app {
  text-align: center;
  color: var(--ep-text-color-primary);
}

.main-container {
  height: calc(100vh - var(--ep-menu-item-height) - 3px);
}

.visualizations-container {
  width: 90%; /* 设置宽度为90% */
  margin: 0 auto; /* 居中对齐 */
  padding: 10px; /* 添加内边距 */
  box-sizing: border-box; /* 包括内边距和边框在内计算宽度 */
}

.footer-text {
  margin-left: 2%;
  width: 95%;
  margin-top: 20px;  
  color: #666;
  font-size: 14px; 
  text-align: left; /* 文本靠左显示 */
}

.footer-text a {
  color: #1e90ff; /* 链接颜色 */
  text-decoration: none; /* 去掉下划线 */
}

.footer-text a:hover {
  text-decoration: underline; /* 鼠标悬停时显示下划线 */
}
</style>