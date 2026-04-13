<template>
  <div class="management-container">
    <div class="search-bar">
      <a-input-search
        v-model:value="searchText"
        placeholder="搜索订单号/申请人"
        style="width: 250px"
        @search="onSearch"
        enter-button
      />
    </div>

    <a-table 
      :columns="columns" 
      :data-source="filteredDisputes" 
      :pagination="{ pageSize: 10 }"
      class="dispute-management-table"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'evidence'">
          <a-tag v-if="record.hasEvidence" color="blue">已上传</a-tag>
          <a-tag v-else color="default">未上传</a-tag>
        </template>
        <template v-if="column.key === 'action'">
          <a-button type="link" @click="handleArbitrate(record)">
            {{ record.result ? '查看结果' : '立即仲裁' }}
          </a-button>
        </template>
      </template>
    </a-table>

    <DisputeArbitrateModal
      v-model:open="modalVisible"
      :dispute="currentDispute"
      @submit="submitArbitration"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import DisputeArbitrateModal from './DisputeArbitrateModal.vue';
import '../../styles/management.css';
import { adminApi } from '@/service/admin';

interface DisputeResultItem {
  decision: string;
  reason: string;
  amount?: number;
}

interface DisputeItem {
  id: string;
  orderNo: string;
  applicant: string;
  type: string;
  createTime: string;
  hasEvidence: boolean;
  description: string;
  result?: DisputeResultItem;
}

const searchText = ref('');
const modalVisible = ref(false);
const currentDispute = ref<DisputeItem | null>(null);
const disputes = ref<DisputeItem[]>([]);

const columns = [
  { title: '纠纷编号', dataIndex: 'id', key: 'id' },
  { title: '相关订单', dataIndex: 'orderNo', key: 'orderNo' },
  { title: '申请人', dataIndex: 'applicant', key: 'applicant' },
  { title: '类型', dataIndex: 'type', key: 'type' },
  { title: '发起时间', dataIndex: 'createTime', key: 'createTime' },
  { title: '证据', key: 'evidence' },
  { title: '操作', key: 'action' },
];

const filteredDisputes = computed(() => {
  if (!searchText.value) return disputes.value;
  const lowerSearch = searchText.value.toLowerCase();
  return disputes.value.filter(d => 
    d.orderNo.toLowerCase().includes(lowerSearch) || 
    d.applicant.toLowerCase().includes(lowerSearch)
  );
});

const handleArbitrate = (dispute: DisputeItem) => {
  currentDispute.value = dispute;
  modalVisible.value = true;
};

const onSearch = () => {
  loadDisputes();
};

const submitArbitration = async (formData: { decision: string; reason: string; amount?: number }) => {
  if (!currentDispute.value) return;
  const decisionMap: Record<string, string> = {
    runner: 'RUNNER_RESPONSIBLE',
    user: 'USER_RESPONSIBLE',
    both: 'BOTH_NEGOTIATION',
  };
  try {
    await adminApi.arbitrateDispute(currentDispute.value.id, {
      decision: decisionMap[formData.decision] || formData.decision,
      reason: formData.reason,
      amount: formData.amount,
    });
    message.success('仲裁成功');
    await loadDisputes();
  } catch {
    // 错误提示由拦截器处理
  }
  modalVisible.value = false;
};

const loadDisputes = async () => {
  try {
    const pageData = await adminApi.getDisputes({
      keyword: searchText.value || undefined,
      pageNo: 1,
      pageSize: 200,
    });
    disputes.value = pageData.records;
  } catch {
    // 错误提示由拦截器处理
  }
};

onMounted(() => {
  loadDisputes();
});
</script>
