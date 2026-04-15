<template>
  <div class="management-container">
    <div class="search-bar">
      <a-select v-model:value="filterStatus" placeholder="全部状态" style="width: 140px" allow-clear>
        <a-select-option :value="0">待接单</a-select-option>
        <a-select-option :value="1">待取件</a-select-option>
        <a-select-option :value="2">配送中</a-select-option>
        <a-select-option :value="3">已送达</a-select-option>
        <a-select-option :value="4">待评价</a-select-option>
        <a-select-option :value="5">已完成</a-select-option>
        <a-select-option :value="6">已取消</a-select-option>
        <a-select-option :value="7">纠纷中</a-select-option>
      </a-select>

      <a-input-search v-model:value="searchText" placeholder="搜索" style="width: 320px" allow-clear @search="onSearch"
        @pressEnter="onSearch" enter-button />

      <a-button @click="resetFilters">重置</a-button>
    </div>

    <a-table :columns="columns" :data-source="orders"
      :pagination="{ pageSize: 10, showSizeChanger: true, showTotal: (total: number) => `共 ${total} 条` }"
      :loading="loading" row-key="orderId" @change="handleTableChange" />

    <OrderDetailModal v-model:open="detailVisible" :order="currentOrder" @resolve="handleException" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h, watch } from 'vue';
import { message } from 'ant-design-vue';
import OrderDetailModal from './OrderDetailModal.vue';
import '../../styles/management.css';
import { getOrders, interveneOrder } from '@/service/admin';

interface OrderLogItem {
  time: string;
  action: string;
}

interface OrderItem {
  orderId: number | string;
  orderNo: string;
  publisherNickname: string;
  publisherPhone: string;
  runnerNickname?: string;
  runnerPhone?: string;
  status: number;
  createTime: string;
  exceptionType?: string;
  exceptionDetail?: string;
  logs: OrderLogItem[];
}

const searchText = ref('');
const filterStatus = ref<number | null>(null);
const detailVisible = ref(false);
const currentOrder = ref<OrderItem | null>(null);
const orders = ref<OrderItem[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);

const columns = [
  { title: '订单号', dataIndex: 'orderNo', key: 'orderNo' },
  { title: '发布者', dataIndex: 'publisherNickname', key: 'publisherNickname' },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    customRender: ({ record }: any) => {
      const statusText: Record<number, string> = {
        0: '待接单',
        1: '待取件',
        2: '配送中',
        3: '已送达',
        4: '待评价',
        5: '已完成',
        6: '已取消',
        7: '纠纷中',
      };
      const statusColor: Record<number, string> = {
        0: 'orange',
        1: 'blue',
        2: 'blue',
        3: 'green',
        4: 'purple',
        5: 'green',
        6: 'gray',
        7: 'red',
      };
      const label = statusText[record.status] || '未知状态';
      return h('a-tag', { color: statusColor[record.status] || 'default' }, label);
    },
  },
  { title: '下单时间', dataIndex: 'createTime', key: 'createTime' },
  {
    title: '异常情况',
    key: 'exception',
    customRender: ({ record }: any) => {
      if (record.exceptionType) {
        return h('a-tag', { color: 'error' }, record.exceptionType);
      }
      return '-';
    },
  },
  {
    title: '操作',
    key: 'action',
    customRender: ({ record }: any) => {
      return h(
        'a-button',
        { type: 'link', onClick: () => viewDetail(record) },
        () => '查看详情'
      );
    },
  },
];



const viewDetail = (order: OrderItem) => {
  currentOrder.value = order;
  detailVisible.value = true;
};

const onSearch = () => {
  currentPage.value = 1;

  loadOrders();
};

const resetFilters = () => {
  searchText.value = '';
  filterStatus.value = null;
  currentPage.value = 1;
  loadOrders();
};

const handleTableChange = (pagination: any) => {
  currentPage.value = pagination.current;
  pageSize.value = pagination.pageSize;
  loadOrders();
};

const handleException = async () => {
  if (!currentOrder.value) return;
  try {
    await interveneOrder(currentOrder.value.orderId, {
      action: 'CONTACT_RUNNER',
      remark: currentOrder.value.exceptionDetail || '系统管理员介入处理',
    });
    message.success('已执行异常干预');
    detailVisible.value = false;
    await loadOrders();
  } catch (e) {
    console.error(e);
  }
};

const loadOrders = async () => {
  loading.value = true;
  try {
    const pageData: any = await getOrders({
      keyword: searchText.value || undefined,
      status: filterStatus.value || undefined,
      pageNum: currentPage.value,
      pageSize: pageSize.value,
    });
    orders.value = pageData.records || [];
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadOrders();
});

watch(filterStatus, () => {
  currentPage.value = 1;
  loadOrders();
});
</script>

<style scoped>
.management-container {
  padding: 20px;
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
</style>