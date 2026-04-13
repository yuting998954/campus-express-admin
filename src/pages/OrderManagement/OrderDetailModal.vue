<template>
  <a-modal :open="open" title="订单全量数据" @cancel="handleCancel" :footer="null" width="600px">
    <div v-if="order">
      <a-descriptions title="基本信息" bordered :column="1" size="small">
        <a-descriptions-item label="订单号">{{ order.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="发布者">{{ order.userName }} ({{ order.userPhone }})</a-descriptions-item>
        <a-descriptions-item label="代取人">{{ order.runnerName || '未接单' }} ({{ order.runnerPhone || '-' }})</a-descriptions-item>
        <a-descriptions-item label="状态">{{ order.status }}</a-descriptions-item>
        <a-descriptions-item label="下单时间">{{ order.createTime }}</a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <h4 class="section-title">状态流转记录</h4>
      <a-timeline>
        <a-timeline-item v-for="(log, index) in order.logs" :key="index">
          {{ log.time }} - {{ log.action }}
        </a-timeline-item>
      </a-timeline>

      <div v-if="order.exceptionType" class="exception-section">
        <a-alert type="warning" :message="'异常详情: ' + order.exceptionDetail" show-icon />
        <div class="action-bar">
          <a-button type="primary" @click="handleException">处理异常</a-button>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">

defineProps<{
  open: boolean;
  order: any;
}>();
const emit = defineEmits(['update:open', 'resolve']);

const handleCancel = () => {
  emit('update:open', false);
};

const handleException = () => {
  emit('resolve');
};
</script>

<style scoped>
.section-title {
  margin-bottom: 16px;
}
.exception-section {
  margin-top: 24px;
}
.action-bar {
  margin-top: 16px;
}
</style>
