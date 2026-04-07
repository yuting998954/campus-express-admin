<template>
  <a-modal :open="open" title="身份认证审核" @ok="handleOk" @cancel="handleCancel">
    <div v-if="user" class="audit-content">
      <a-descriptions bordered :column="1" size="small">
        <a-descriptions-item label="姓名">{{ user.name }}</a-descriptions-item>
        <a-descriptions-item label="学号/身份证">{{ user.idNumber }}</a-descriptions-item>
      </a-descriptions>
      <div class="image-section">
        <p>证件照片：</p>
        <div class="image-container">
          <a-image :width="200" src="https://via.placeholder.com/200x120?text=ID+Front" />
          <a-image :width="200" src="https://via.placeholder.com/200x120?text=ID+Back" />
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">

const props = defineProps<{
  open: boolean;
  user: any;
}>();

const emit = defineEmits(['update:open', 'ok']);

const handleOk = () => {
  emit('ok');
};

const handleCancel = () => {
  emit('update:open', false);
};
</script>

<style scoped>
.audit-content {
  text-align: center;
}
.image-section {
  margin-top: 16px;
}
.image-container {
  display: flex;
  justify-content: space-around;
}
</style>
