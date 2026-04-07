<template>
  <div class="dashboard">
    <!-- 数据概览卡片区 -->
    <a-row :gutter="16" class="stat-cards">
      <a-col :span="6" v-for="card in statCards" :key="card.title">
        <a-card class="stat-card" :bordered="false">
          <div class="stat-icon" :style="{ backgroundColor: card.bgColor }">
            <component :is="card.icon" />
          </div>
          <div class="stat-content">
            <div class="stat-title">{{ card.title }}</div>
            <div class="stat-value">{{ card.value }}</div>
            <div class="stat-change" :class="card.changeType">
              <template v-if="card.changeType === 'up'">
                <ArrowUpOutlined /> +{{ card.change }}%
              </template>
              <template v-else>
                <ArrowDownOutlined /> -{{ card.change }}%
              </template>
              <span class="change-label">较昨日</span>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 图表区 -->
    <a-row :gutter="16" class="chart-section">
      <a-col :span="14">
        <a-card title="近7天订单量趋势" :bordered="false" class="chart-card">
          <v-chart class="chart" :option="lineChartOption" autoresize />
        </a-card>
      </a-col>
      <a-col :span="10">
        <a-card title="订单状态分布" :bordered="false" class="chart-card">
          <v-chart class="chart" :option="pieChartOption" autoresize />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import {
  ShoppingCartOutlined,
  SafetyCertificateOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons-vue'

use([
  CanvasRenderer,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const statCards = ref([
  {
    title: '今日订单量',
    value: 128,
    change: 12.5,
    changeType: 'up',
    icon: ShoppingCartOutlined,
    bgColor: '#e6f7ff'
  },
  {
    title: '待审核认证',
    value: 23,
    change: 8.3,
    changeType: 'up',
    icon: SafetyCertificateOutlined,
    bgColor: '#fff7e6'
  },
  {
    title: '待处理纠纷',
    value: 5,
    change: 16.7,
    changeType: 'down',
    icon: ExclamationCircleOutlined,
    bgColor: '#fff1f0'
  },
  {
    title: '系统总用户',
    value: 3256,
    change: 3.2,
    changeType: 'up',
    icon: TeamOutlined,
    bgColor: '#f6ffed'
  }
])

const lineChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: '#eee',
    borderWidth: 1,
    textStyle: { color: '#333' }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    axisLine: { lineStyle: { color: '#ddd' } },
    axisLabel: { color: '#666' }
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: '#f0f0f0' } },
    axisLabel: { color: '#666' }
  },
  series: [
    {
      name: '订单量',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { width: 3, color: '#1890ff' },
      itemStyle: { color: '#1890ff', borderWidth: 2, borderColor: '#fff' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
            { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
          ]
        }
      },
      data: [95, 110, 88, 125, 142, 156, 128]
    }
  ]
}))

const pieChartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: '#eee',
    borderWidth: 1,
    textStyle: { color: '#333' }
  },
  legend: {
    orient: 'vertical',
    right: '5%',
    top: 'center',
    itemGap: 16,
    textStyle: { color: '#666' }
  },
  series: [
    {
      name: '订单状态',
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 6,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: { show: false },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      labelLine: { show: false },
      data: [
        { value: 45, name: '待接单', itemStyle: { color: '#faad14' } },
        { value: 78, name: '进行中', itemStyle: { color: '#1890ff' } },
        { value: 320, name: '已完成', itemStyle: { color: '#52c41a' } },
        { value: 25, name: '已取消', itemStyle: { color: '#ff4d4f' } }
      ]
    }
  ]
}))
</script>

<style scoped>
.dashboard {
  padding: 24px;
  background: #f0f2f5;
  min-height: calc(100vh - 64px);
}

.stat-cards {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.stat-card :deep(.ant-card-body) {
  display: flex;
  align-items: center;
  padding: 20px 24px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 16px;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #8c8c8c;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #262626;
  line-height: 1.2;
  margin-bottom: 4px;
}

.stat-change {
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-change.up {
  color: #ff4d4f;
}

.stat-change.down {
  color: #52c41a;
}

.change-label {
  color: #8c8c8c;
  margin-left: 4px;
}

.chart-section {
  margin-bottom: 24px;
}

.chart-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.chart-card :deep(.ant-card-head) {
  border-bottom: 1px solid #f0f0f0;
}

.chart-card :deep(.ant-card-head-title) {
  font-size: 16px;
  font-weight: 500;
}

.chart {
  height: 320px;
  width: 100%;
}
</style>
