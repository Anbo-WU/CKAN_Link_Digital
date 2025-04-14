<template>
  <div>
    <h2>Explore The Data</h2>
    <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
      <el-tab-pane label="Suburb Distribution" name="first">
        <!-- Suburb Distribution -->
        <div>
          <canvas id="suburb-distribution"></canvas>
        </div>
      </el-tab-pane>
      <el-tab-pane label="Price Range" name="second">
        <!-- Price Range Distribution -->
        <div id="price-range-chart" style="width: 600px; height: 400px;"></div>
      </el-tab-pane>
      <el-tab-pane label="Bedrooms-price Correlation" name="third">
        <!-- Bedrooms vs Price Scatter Plot -->
        <div>
          <canvas id="bedrooms-price-correlation"></canvas>
        </div>
      </el-tab-pane>
      <el-tab-pane label="Bathrooms-price Correlation" name="fourth">
        <!-- Bathrooms vs Price Scatter Plot -->
        <div>
          <canvas id="bathrooms-price-correlation"></canvas>
        </div>
      </el-tab-pane>
      <el-tab-pane label="Parking-price Correlation" name="fifth">
        <!-- Parking vs Price Scatter Plot -->
        <div>
          <canvas id="parking-price-correlation"></canvas>
        </div>
      </el-tab-pane>
      <el-tab-pane label="Data Table" name="sixth">
        <!-- Data Table -->
        <el-input v-model="search" placeholder="Search" style="margin-bottom: 10px;"></el-input>
        <el-table :data="paginatedTableData" style="width: 100%" @sort-change="handleSortChange">
          <el-table-column prop="_id" label="ID" sortable></el-table-column>
          <el-table-column prop="address" label="Address" sortable></el-table-column>
          <el-table-column prop="price" label="Price($per week)" sortable></el-table-column>
          <el-table-column prop="bedrooms" label="Bedrooms" sortable></el-table-column>
          <el-table-column prop="bathrooms" label="Bathrooms" sortable></el-table-column>
          <el-table-column prop="parking" label="Parking" sortable></el-table-column>
          <el-table-column prop="Property_Features" label="Property Features" sortable></el-table-column>
          <el-table-column prop="number_of_schools" label="Number of Schools" sortable></el-table-column>
          <el-table-column prop="closest_school" label="Closest School(meters)" sortable></el-table-column>
        </el-table>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 30, 40]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredTableData.length">
        </el-pagination>
      </el-tab-pane>
      For more information, please refer to our <a href="http://ckandemo.site:8888/" target="_blank">CKAN Demo</a>.
    </el-tabs>
  </div>
</template>

<script>
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
import * as echarts from 'echarts';

export default {
  data() {
    return {
      apiUrl: 'http://www.ckandemo.site:8888/api/3/action/datastore_search?resource_id=77fb46af-814a-46fc-a0fa-fa2986228216&limit=32000',
      records: [],
      tableData: [],
      search: '',
      currentPage: 1,
      pageSize: 10,
      sortProp: '',
      sortOrder: '',
    };
  },
  computed: {
    filteredTableData() {
      return this.tableData.filter(item => {
        return Object.keys(item).some(key => String(item[key]).toLowerCase().includes(this.search.toLowerCase()));
      });
    },
    sortedTableData() {
      if (!this.sortProp) return this.filteredTableData;
      return this.filteredTableData.slice().sort((a, b) => {
        const aValue = parseFloat(a[this.sortProp]);
        const bValue = parseFloat(b[this.sortProp]);
        if (isNaN(aValue) || isNaN(bValue)) {
          return 0;
        }
        if (this.sortOrder === 'ascending') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      });
    },
    paginatedTableData() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.sortedTableData.slice(start, end);
    }
  },
  mounted() {
    // 注册所有 Chart.js 必要的组件
    Chart.register(...registerables);
    this.fetchData();
  },
  methods: {
    fetchData() {
      axios.get(this.apiUrl)
        .then(response => {
          this.records = response.data.result.records;
          this.tableData = this.records; // 将数据赋值给 tableData
          this.renderCharts();
        })
        .catch(error => {
          console.error('Error fetching API data:', error);
        });
    },
    renderCharts() {
      // Suburb Distribution (Bar Chart)
      const suburbData = this.getSuburbDistribution();
      new Chart(document.getElementById('suburb-distribution'), {
        type: 'bar',
        data: {
          labels: suburbData.suburbs,
          datasets: [{
            label: 'Number of Listings',
            data: suburbData.listings,
            backgroundColor: 'rgba(75, 192, 192, 0.6)'
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });

      // Price Range (Box Plot)
      const priceData = this.getPriceData();
      let chart = echarts.init(document.getElementById('price-range-chart'));
      chart.setOption({
        title: { text: 'Price Range Distribution' },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: ['Prices'] },
        yAxis: { type: 'value' },
        series: [
          {
            name: 'Price',
            type: 'boxplot',
            data: [priceData], // 使用正确的二维数组格式
          }
        ]
      });

      // Bedrooms vs Price Scatter Plot
      const correlationData = this.getCorrelationData();
      new Chart(document.getElementById('bedrooms-price-correlation'), {
        type: 'scatter',
        data: {
          datasets: [{
            label: 'Bedrooms vs Price',
            data: correlationData.bedroomsVsPrice,
            backgroundColor: 'rgba(255, 99, 132, 0.6)'
          }]
        },
        options: {
          scales: {
            x: {
              type: 'linear',
              position: 'bottom',
              title: {
                display: true,
                text: 'Number of Bedrooms'
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Rental Price'
              }
            }
          }
        }
      });

      // Bathrooms vs Price Scatter Plot
      new Chart(document.getElementById('bathrooms-price-correlation'), {
        type: 'scatter',
        data: {
          datasets: [{
            label: 'Bathrooms vs Price',
            data: correlationData.bathroomsVsPrice,
            backgroundColor: 'rgba(54, 162, 235, 0.6)'
          }]
        },
        options: {
          scales: {
            x: {
              type: 'linear',
              position: 'bottom',
              title: {
                display: true,
                text: 'Number of Bathrooms'
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Rental Price'
              }
            }
          }
        }
      });

      // Parking vs Price Scatter Plot
      new Chart(document.getElementById('parking-price-correlation'), {
        type: 'scatter',
        data: {
          datasets: [{
            label: 'Parking vs Price',
            data: correlationData.parkingVsPrice,
            backgroundColor: 'rgba(75, 192, 192, 0.6)'
          }]
        },
        options: {
          scales: {
            x: {
              type: 'linear',
              position: 'bottom',
              title: {
                display: true,
                text: 'Number of Parking Spaces'
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Rental Price'
              }
            }
          }
        }
      });
    },
    getSuburbDistribution() {
      const suburbMap = {};
      this.records.forEach(record => {
        const suburb = record.address;
        if (suburbMap[suburb]) {
          suburbMap[suburb]++;
        } else {
          suburbMap[suburb] = 1;
        }
      });
      return {
        suburbs: Object.keys(suburbMap),
        listings: Object.values(suburbMap),
      };
    },
    getPriceData() {
      const prices = this.records
        .map(record => parseFloat(record.price))
        .filter(price => !isNaN(price)); // 过滤 NaN 值
      prices.sort((a, b) => a - b);
      const min = prices[0];
      const q1 = prices[Math.floor(prices.length * 0.25)];
      const median = prices[Math.floor(prices.length * 0.5)];
      const q3 = prices[Math.floor(prices.length * 0.75)];
      const max = prices[prices.length - 1];
      return [min, q1, median, q3, max];
    },
    getCorrelationData() {
      const bedroomsVsPrice = [];
      const bathroomsVsPrice = [];
      const parkingVsPrice = [];

      this.records.forEach(record => {
        const price = parseFloat(record.price);
        if (!isNaN(price)) {  // 过滤 NaN 值
          bedroomsVsPrice.push({ x: parseInt(record.bedrooms), y: price });
          bathroomsVsPrice.push({ x: parseInt(record.bathrooms), y: price });
          parkingVsPrice.push({ x: parseInt(record.parking), y: price });
        }
      });

      return { bedroomsVsPrice, bathroomsVsPrice, parkingVsPrice };
    },
    handleSizeChange(val) {
      this.pageSize = val;
    },
    handleCurrentChange(val) {
      this.currentPage = val;
    },
    handleSortChange({ prop, order }) {
      this.sortProp = prop;
      this.sortOrder = order;
    }
  }
}
</script>

<style scoped>
canvas {
  max-width: 100%;
  height: auto;
}
</style>