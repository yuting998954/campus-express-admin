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
      v-model:visible="modalVisible"
      :dispute="currentDispute"
      @submit="submitArbitration"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { message } from 'ant-design-vue';
import DisputeArbitrateModal from '../components/modals/DisputeArbitrateModal.vue';
import '../styles/management.css';

interface ArbitrationResult {
  decision: string;
  reason: string;
  amount?: number;
}

interface Dispute {
  id: string;
  orderNo: string;
  applicant: string;
  type: string;
  createTime: string;
  hasEvidence: boolean;
  description: string;
  result?: ArbitrationResult;
}

const searchText = ref('');
const modalVisible = ref(false);
const currentDispute = ref<Dispute | null>(null);

const disputes = ref<Dispute[]>([
  {
    id: 'D2026010901',
    orderNo: 'ORD20260109003',
    applicant: '赵六',
    type: '物品损坏',
    createTime: '2026-01-09 11:00:00',
    hasEvidence: true,
    description: '快递包裹外壳有明显撕裂，内部物品损坏。'
  },
  {
    id: 'D2026010902',
    orderNo: 'ORD20260109001',
    applicant: '李四',
    type: '酬劳争议',
    createTime: '2026-01-09 12:00:00',
    hasEvidence: false,
    description: '用户要求送到寝室门口，但只支付了校门口派送的费用。'
  }
]);

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

const handleArbitrate = (dispute: Dispute) => {
  currentDispute.value = dispute;
  modalVisible.value = true;
};

const onSearch = () => {};

const submitArbitration = (formData: any) => {
  const idx = disputes.value.findIndex(d => d.id === currentDispute.value?.id);
  if (idx !== -1) {
    disputes.value[idx].result = { ...formData };

    if (formData.decision === 'runner') {
      message.success(`仲裁成功：已从代取人账户扣除 ￥${formData.amount} 并转入用户账户`);
    } else if (formData.decision === 'user') {
      message.success('仲裁成功：已驳回申请，扣减该用户信誉分 5 分');
    } else {
      message.success('仲裁成功：已向双方推送处理结果');
    }
  }

  modalVisible.value = false;
};
</script>
