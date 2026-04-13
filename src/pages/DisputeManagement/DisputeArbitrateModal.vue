<template>
  <a-modal
    :open="open"
    title="纠纷订单仲裁"
    :width="800"
    @update:open="emit('update:open', $event)"
    @ok="handleOk"
    @cancel="emit('update:open', false)"
    okText="提交仲裁"
    cancelText="取消"
  >
    <div v-if="dispute" class="dispute-modal-content">
      <a-descriptions title="详情信息" bordered :column="2">
        <a-descriptions-item label="纠纷单号">{{ dispute.id }}</a-descriptions-item>
        <a-descriptions-item label="订单号">{{ dispute.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="申请人">{{ dispute.applicant }}</a-descriptions-item>
        <a-descriptions-item label="纠纷类型">{{ dispute.type }}</a-descriptions-item>
        <a-descriptions-item label="发起时间" :span="2">{{ dispute.createTime }}</a-descriptions-item>
        <a-descriptions-item label="申请描述" :span="2">{{ dispute.description }}</a-descriptions-item>
      </a-descriptions>

      <div v-if="dispute.hasEvidence" class="evidence-section">
        <p class="label"><strong>证据材料：</strong></p>
        <a-image-preview-group>
          <a-image :width="100" src="https://via.placeholder.com/100?text=Evidence1" />
          <a-image :width="100" src="https://via.placeholder.com/100?text=Evidence2" />
        </a-image-preview-group>
      </div>

      <a-divider />

      <div v-if="!dispute.result" class="arbitration-form">
        <h3 class="form-title">仲裁判定</h3>
        <a-form layout="vertical">
          <a-form-item label="责任归属" required>
            <a-radio-group v-model:value="form.decision">
              <a-radio value="runner">代取人责任 (需赔偿)</a-radio>
              <a-radio value="user">用户恶意纠纷 (驳回并扣分)</a-radio>
              <a-radio value="both">双方补付 (酬劳争议)</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="判定理由" required>
            <a-textarea v-model:value="form.reason" placeholder="请输入仲裁判定理由..." :rows="4" />
          </a-form-item>
          <a-form-item v-if="form.decision === 'runner'" label="赔偿金额">
            <a-input-number v-model:value="form.amount" :min="0" prefix="￥" style="width: 200px" />
          </a-form-item>
        </a-form>
      </div>
      <div v-else class="result-section">
        <h3 class="result-title">仲裁结果</h3>
        <a-alert :message="'判定结果：' + getDecisionLabel(dispute.result.decision)"
          :description="'理由：' + dispute.result.reason" type="info" show-icon />
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';

interface ArbitrationSubmitPayload {
  decision: string;
  reason: string;
  amount: number;
}

const props = defineProps<{
  open: boolean;
  dispute: any;
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

watch(() => props.open, (newVal) => {
  if (newVal && !props.dispute?.result) {
    form.decision = '';
    form.reason = '';
    form.amount = 0;
  }
});

const getDecisionLabel = (val: string) => {
  const map: Record<string, string> = {
    'runner': '代取人责任',
    'user': '用户恶意纠纷',
    'both': '双方补付'
  };
  return map[val] || val;
};

const handleOk = () => {
  if (props.dispute?.result) {
    emit('update:open', false);
    return;
  }
  emit('submit', { ...form });
};
</script>

<style scoped>
.evidence-section {
  margin-top: 16px;
}

.arbitration-form {
  margin-top: 16px;
}

.form-title,
.result-title {
  margin-bottom: 16px;
}
</style>
