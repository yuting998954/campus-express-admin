<template>
  <div class="management-container">
    <div class="search-bar">
      <a-input-search v-model:value="searchText" placeholder="搜索纠纷编号/订单号" style="width: 250px" @search="onSearch"
        enter-button />
    </div>

    <a-table :columns="columns" :data-source="filteredDisputes" :pagination="{ pageSize: 10 }"
      class="dispute-management-table" :loading="loading">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-tag :color="record.status === 0 ? 'orange' : 'green'">
            {{ record.statusLabel }}
          </a-tag>
        </template>
        <template v-if="column.key === 'responsiblePartyLabel'">
          <a-tag v-if="record.status === 1" :color="getLiabilityColor(record.responsibleParty)">
            {{ record.responsiblePartyLabel }}
          </a-tag>
          <span v-else style="color: #bbb">—</span>
        </template>
        <template v-if="column.key === 'evidence'">
          <div class="evidence-thumbnails">
            <a-image
              v-if="record.evidenceList && record.evidenceList.length > 0"
              :width="40"
              :src="getEvidenceThumb(record.evidenceList[0])"
              :fallback="placeholderImage"
              :preview="{ mask: '' }"
            />
            <a-tag v-if="record.evidenceList && record.evidenceList.length > 1" color="blue">
              +{{ record.evidenceList.length - 1 }}
            </a-tag>
            <span v-else-if="!record.evidenceList || record.evidenceList.length === 0" class="no-evidence">无</span>
          </div>
        </template>
        <template v-if="column.key === 'action'">
          <a-button type="link" @click="handleArbitrate(record)">
            {{ record.status === 1 ? '查看结果' : '立即仲裁' }}
          </a-button>
        </template>
      </template>
    </a-table>

    <DisputeArbitrateModal v-model:open="modalVisible" :dispute="currentDispute" @submit="submitArbitration" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import DisputeArbitrateModal from './DisputeArbitrateModal.vue';
import '../../styles/management.css';
import { getDisputes, resolveDispute, AdminDispute } from '@/service/admin';

const searchText = ref('');
const modalVisible = ref(false);
const currentDispute = ref<AdminDispute | null>(null);
const disputes = ref<AdminDispute[]>([]);
const loading = ref(false);

const placeholderImage = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="100%" height="100%" fill="#f5f5f5"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#999" font-family="sans-serif" font-size="10">图片</text></svg>');

const getEvidenceThumb = (url: string | undefined) => {
  if (!url) return placeholderImage;
  if (url.startsWith('data:')) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `http://localhost:8081${url}`;
};

const getLiabilityColor = (val: number | undefined) => {
  if (val === 0) return 'red';
  if (val === 1) return 'orange';
  if (val === 2) return 'purple';
  return 'default';
};

const columns = [
  { title: '纠纷编号', dataIndex: 'disputeId', key: 'disputeId', width: 100 },
  { title: '订单号', dataIndex: 'orderNo', key: 'orderNo', width: 120 },
  { title: '申请人', dataIndex: 'applicantName', key: 'applicantName', width: 100 },
  { title: '被申请人', dataIndex: 'respondentName', key: 'respondentName', width: 100 },
  { title: '类型', dataIndex: 'disputeTypeLabel', key: 'disputeTypeLabel', width: 100 },
  { title: '状态', key: 'status', width: 80 },
  { title: '责任归属', key: 'responsiblePartyLabel', width: 100 },
  { title: '发起时间', dataIndex: 'createTime', key: 'createTime', width: 160 },
  { title: '证据', key: 'evidence', width: 80 },
  { title: '操作', key: 'action', width: 100, fixed: 'right' },
];

const filteredDisputes = computed(() => {
  if (!searchText.value) return disputes.value;
  const lowerSearch = searchText.value.toLowerCase();
  return disputes.value.filter(d =>
    String(d.disputeId).toLowerCase().includes(lowerSearch) ||
    (d.orderNo && d.orderNo.toLowerCase().includes(lowerSearch)) ||
    (d.applicantName && d.applicantName.toLowerCase().includes(lowerSearch)) ||
    (d.respondentName && d.respondentName.toLowerCase().includes(lowerSearch))
  );
});

const handleArbitrate = (dispute: AdminDispute) => {
  currentDispute.value = dispute;
  modalVisible.value = true;
};

const onSearch = () => {
  loadDisputes();
};

const submitArbitration = async (formData: { decision: string; reason: string; amount?: number }) => {
  if (!currentDispute.value) return;
  try {
    await resolveDispute(currentDispute.value.disputeId, {
      decision: formData.decision,
      reason: formData.reason,
      amount: formData.amount,
    });
    message.success('仲裁成功');
    modalVisible.value = false;
    await loadDisputes();
  } catch {
    // 错误提示由拦截器处理
  }
};

const loadDisputes = async () => {
  loading.value = true;
  try {
    const pageData = await getDisputes({
      keyword: searchText.value || undefined,
      pageNum: 1,
      pageSize: 100,
    });
    disputes.value = pageData.records;
  } catch {
    // 错误提示由拦截器处理
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadDisputes();
});
</script>

<style scoped>
.evidence-thumbnails {
  display: flex;
  align-items: center;
  gap: 6px;
}

.no-evidence {
  color: #999;
  font-size: 12px;
}
</style>
