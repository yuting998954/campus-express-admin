<template>
  <div class="management-container">
    <div class="search-bar">
      <a-select v-model:value="filterStatus" placeholder="异常筛选" style="width: 180px" allow-clear>
        <a-select-option value="timeout">超时未取件</a-select-option>
        <a-select-option value="payment_err">支付异常</a-select-option>
        <a-select-option value="slow">长时间未处理</a-select-option>
      </a-select>
      <a-input-search v-model:value="searchText" placeholder="搜索订单号/手机号" style="width: 250px" @search="onSearch"
        enter-button />
    </div>

    <a-table :columns="columns" :data-source="filteredOrders" :pagination="{ pageSize: 10 }">
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

    <OrderDetailModal v-model:open="detailVisible" :order="currentOrder" @resolve="handleException" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import OrderDetailModal from './OrderDetailModal.vue';
import '../../styles/management.css';
import { getOrders, interveneOrder } from '@/service/admin';

interface OrderLogItem {
  time: string;
  action: string;
}

interface OrderItem {
  id: number | string;
  orderNo: string;
  userName: string;
  userPhone: string;
  runnerName?: string;
  runnerPhone?: string;
  status: string;
  createTime: string;
  exceptionType?: string;
  exceptionDetail?: string;
  logs: OrderLogItem[];
}

const searchText = ref('');
const filterStatus = ref<string | null>(null);
const detailVisible = ref(false);
const currentOrder = ref<OrderItem | null>(null);
const orders = ref<OrderItem[]>([]);

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

const viewDetail = (order: OrderItem) => {
  currentOrder.value = order;
  detailVisible.value = true;
};

const onSearch = () => {
  loadOrders();
};

const handleException = async () => {
  if (!currentOrder.value) return;
  try {
    await interveneOrder(currentOrder.value.id, {
      action: 'CONTACT_RUNNER',
      remark: currentOrder.value.exceptionDetail || '系统管理员介入处理'
    });
    message.success('已执行异常干预');
    detailVisible.value = false;
    await loadOrders();
  } catch {
    // 错误提示由拦截器处理
  }
};

const loadOrders = async () => {
  try {
    const map: Record<string, string> = {
      timeout: '超时未取件',
      payment_err: '支付异常',
      slow: '长时间未处理'
    };
    const pageData = await getOrders({
      keyword: searchText.value || undefined,
      exceptionType: filterStatus.value ? map[filterStatus.value] : undefined,
      pageNo: 1,
      pageSize: 200
    });
    orders.value = pageData.records;
  } catch {
    // 错误提示由拦截器处理
  }
};

onMounted(() => {
  loadOrders();
});
</script>
