<template>
  <div class="management-container">
    <div class="search-bar">
      <a-select 
        v-model:value="filterStatus" 
        placeholder="异常筛选" 
        style="width: 180px" 
        allow-clear
      >
        <a-select-option value="timeout">超时未取件</a-select-option>
        <a-select-option value="payment_err">支付异常</a-select-option>
        <a-select-option value="slow">长时间未处理</a-select-option>
      </a-select>
      <a-input-search
        v-model:value="searchText"
        placeholder="搜索订单号/手机号"
        style="width: 250px"
        @search="onSearch"
        enter-button
      />
    </div>

    <a-table 
      :columns="columns" 
      :data-source="filteredOrders" 
      :pagination="{ pageSize: 10 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-badge :status="getOrderBadgeStatus(record.status)" :text="record.status" />
        </template>
        <template v-if="column.key === 'exception'">
          <a-tag v-if="record.exceptionType" color="error">{{ record.exceptionType }}</a-tag>
          <span v-else>-</span>
        </template>
        <template v-if="column.key === 'action'">
          <a-button type="link" @click="viewDetail(record)">查看详情</a-button>
        </template>
      </template>
    </a-table>

    <OrderDetailModal
      v-model:open="detailVisible"
      :order="currentOrder"
      @resolve="handleException"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { message } from 'ant-design-vue';
import OrderDetailModal from '../components/modals/OrderDetailModal.vue';
import '../styles/management.css';

interface OrderLog {
  time: string;
  action: string;
}

interface Order {
  id: string;
  orderNo: string;
  userName: string;
  userPhone: string;
  runnerName?: string;
  runnerPhone?: string;
  status: string;
  createTime: string;
  exceptionType?: string;
  exceptionDetail?: string;
  logs: OrderLog[];
}

const searchText = ref('');
const filterStatus = ref<string | null>(null);
const detailVisible = ref(false);
const currentOrder = ref<Order|null>(null);

const orders = ref<Order[]>([
  {
    id: '1',
    orderNo: 'ORD20260109001',
    userName: '张三',
    userPhone: '13800138001',
    runnerName: '李四',
    runnerPhone: '13800138002',
    status: '进行中',
    createTime: '2026-01-09 10:00:00',
    logs: [
      { time: '10:00:00', action: '用户下单' },
      { time: '10:05:00', action: '代取人接单' }
    ]
  },
  {
    id: '2',
    orderNo: 'ORD20260109002',
    userName: '王五',
    userPhone: '13800138003',
    status: '待接单',
    createTime: '2026-01-09 08:00:00',
    exceptionType: '长时间未处理',
    exceptionDetail: '该订单发布已超过2小时无人接单',
    logs: [
      { time: '08:00:00', action: '用户下单' }
    ]
  },
  {
    id: '3',
    orderNo: 'ORD20260109003',
    userName: '赵六',
    userPhone: '13800138004',
    runnerName: '李四',
    runnerPhone: '13800138002',
    status: '已取件',
    createTime: '2026-01-09 09:00:00',
    exceptionType: '超时未取件',
    exceptionDetail: '代取人已取件超过1小时未送达',
    logs: [
      { time: '09:00:00', action: '用户下单' },
      { time: '09:10:00', action: '代取人接单' },
      { time: '09:30:00', action: '代取人取件' }
    ]
  }
]);

const columns = [
  { title: '订单号', dataIndex: 'orderNo', key: 'orderNo' },
  { title: '发布者', dataIndex: 'userName', key: 'userName' },
  { title: '状态', key: 'status' },
  { title: '下单时间', dataIndex: 'createTime', key: 'createTime' },
  { title: '异常情况', key: 'exception' },
  { title: '操作', key: 'action' },
];

const filteredOrders = computed(() => {
  let res = orders.value;
  if (filterStatus.value) {
    const map: Record<string, string> = {
      'timeout': '超时未取件',
      'payment_err': '支付异常',
      'slow': '长时间未处理'
    };
    res = res.filter(o => o.exceptionType === map[filterStatus.value!]);
  }
  if (searchText.value) {
    const lowerSearch = searchText.value.toLowerCase();
    res = res.filter(o => 
      o.orderNo.toLowerCase().includes(lowerSearch) || 
      o.userPhone.includes(lowerSearch)
    );
  }
  return res;
});

const getOrderBadgeStatus = (status: string) => {
  const map: Record<string, string> = {
    '待接单': 'warning',
    '进行中': 'processing',
    '已完成': 'success'
  };
  return map[status] || 'default';
};

const viewDetail = (order: Order) => {
  currentOrder.value = order;
  detailVisible.value = true;
};

const onSearch = () => {};

const handleException = () => {
  message.loading('正在联系相关人员...', 2).then(() => {
    message.success('已通知代取人尽快处理');
    detailVisible.value = false;
  });
};
</script>
