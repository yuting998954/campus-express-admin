<template>
  <a-modal :open="open" title="纠纷订单仲裁" :width="800" @update:open="emit('update:open', $event)" @ok="handleOk"
    @cancel="emit('update:open', false)" okText="提交仲裁" cancelText="取消">
    <div v-if="dispute" class="dispute-modal-content">
      <a-descriptions title="纠纷信息" bordered :column="2">
        <a-descriptions-item label="纠纷编号">{{ dispute.disputeId }}</a-descriptions-item>
        <a-descriptions-item label="订单号">{{ dispute.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="申请人">
          {{ dispute.applicantName || '-' }}
          <span class="phone-text" v-if="dispute.applicantPhone">{{ dispute.applicantPhone }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="被申请人">
          {{ dispute.respondentName || '-' }}
          <span class="phone-text" v-if="dispute.respondentPhone">{{ dispute.respondentPhone }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="纠纷类型">
          <a-tag color="orange">{{ dispute.disputeTypeLabel || dispute.disputeType }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="dispute.status === 0 ? 'orange' : 'green'">{{ dispute.statusLabel }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="发起时间" :span="2">{{ dispute.createTime }}</a-descriptions-item>
        <a-descriptions-item label="申诉原因" :span="2">{{ dispute.reason }}</a-descriptions-item>
      </a-descriptions>

      <!-- 证据材料 -->
      <div v-if="evidenceImages.length > 0" class="evidence-section">
        <a-divider />
        <p class="section-title"><strong>证据材料：</strong></p>
        <div class="image-container" :class="{ single: evidenceImages.length === 1 }">
          <a-image v-for="(img, index) in evidenceImages" :key="index" :width="160" :src="img.src"
            :fallback="placeholderImage" />
        </div>
      </div>

      <!-- 已仲裁结果 -->
      <div v-if="dispute.status === 1" class="result-section">
        <a-divider />
        <h3 class="result-title">仲裁结果</h3>
        <a-descriptions :column="1" bordered size="small">
          <a-descriptions-item label="责任归属">
            <a-tag :color="getLiabilityColor(dispute.responsibleParty)">{{ dispute.responsiblePartyLabel }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="判定理由">
            {{ dispute.result || '-' }}
          </a-descriptions-item>
        </a-descriptions>
      </div>

      <!-- 仲裁表单 -->
      <div v-if="dispute.status === 0" class="arbitration-form">
        <a-divider />
        <h3 class="form-title">仲裁判定</h3>
        <a-form layout="vertical">
          <a-form-item label="责任归属" required>
            <a-radio-group v-model:value="form.decision">
              <a-radio value="runner">代取人责任</a-radio>
              <a-radio value="user">用户恶意纠纷 (驳回申诉)</a-radio>
              <a-radio value="both">双方责任 (酬劳争议)</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="判定理由" required>
            <a-textarea v-model:value="form.reason" placeholder="请输入仲裁判定理由..." :rows="4" />
          </a-form-item>
          <!-- <a-form-item v-if="form.decision === 'runner'" label="赔偿金额">
            <a-input-number v-model:value="form.amount" :min="0" prefix="￥" style="width: 200px" />
          </a-form-item> -->
        </a-form>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { reactive, watch, computed, ref } from 'vue';
import type { AdminDispute } from '@/service/admin';

interface ArbitrationSubmitPayload {
  decision: string;
  reason: string;
  amount: number;
}

const props = defineProps<{
  open: boolean;
  dispute: AdminDispute | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  submit: [formData: ArbitrationSubmitPayload];
}>();

const form = reactive<ArbitrationSubmitPayload>({
  decision: '',
  reason: '',
  amount: 0
});

const placeholderImage = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120"><rect width="100%" height="100%" fill="#f5f5f5"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#999" font-family="sans-serif" font-size="14">图片加载失败</text></svg>');

const getImageUrl = (path: string | undefined) => {
  if (!path) return placeholderImage;
  if (path.startsWith('data:')) return path;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${'http://localhost:8081'}${path}`;
};

const getLiabilityColor = (val: number | undefined) => {
  if (val === 0) return 'red';
  if (val === 1) return 'orange';
  if (val === 2) return 'purple';
  return 'default';
};

const evidenceImages = computed(() => {
  if (!props.dispute?.evidenceList) return [];
  return props.dispute.evidenceList.map((url) => ({ src: getImageUrl(url) }));
});

watch(() => props.open, (newVal) => {
  if (newVal && props.dispute?.status === 0) {
    form.decision = '';
    form.reason = '';
    form.amount = 0;
  }
});

const handleOk = () => {
  if (props.dispute?.status === 1) {
    emit('update:open', false);
    return;
  }
  if (!form.decision || !form.reason) {
    return;
  }
  emit('submit', { ...form });
};
</script>

<style scoped>
.image-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.image-container.single {
  flex-wrap: nowrap;
}

.evidence-section {
  margin-top: 16px;
}

.section-title {
  margin-bottom: 16px;
}

.arbitration-form {
  margin-top: 16px;
}

.form-title,
.result-title {
  margin-bottom: 16px;
}

.result-section {
  margin-top: 16px;
}

.phone-text {
  color: #999;
  font-size: 12px;
  margin-left: 8px;
}
</style>
