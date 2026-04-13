<template>
  <a-modal :open="open" title="身份认证审核" :footer="null" @cancel="handleCancel">
    <div v-if="user" class="audit-content">
      <a-descriptions bordered :column="1" size="small">
        <a-descriptions-item label="姓名">{{ user.realName }}</a-descriptions-item>
        <a-descriptions-item label="证件号">{{ user.code || '未填写' }}</a-descriptions-item>
        <a-descriptions-item label="证件类型">{{ user.cardType === 1 ? '身份证' : '学生证' }}</a-descriptions-item>
        <a-descriptions-item label="证件照片">
          <div class="image-container" :class="{ single: certificateImages.length === 1 }">
            <a-image v-for="(image, idx) in certificateImages" :key="idx" :width="200" :src="image.src"
              :fallback="placeholderImage" />
          </div>
        </a-descriptions-item>
      </a-descriptions>

      <div class="audit-actions">
        <Button type="primary" @click="handlePass">通过</Button>
        <Button danger @click="handleReject">驳回</Button>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Button } from 'ant-design-vue';

interface UserItem {
  id: number | string;
  realName: string;
  code?: string;
  idCardFront?: string;// 身份证正面
  idCardBack?: string;// 身份证反面
  studentCard?: string;// 学生证 
  cardType: 0 | 1; // 0: 学生证, 1: 身份证 ,根据类型显示不同的图片，如果是身份证则显示正反面，如果是学生证则只显示学生证图片
}

const props = defineProps<{
  open: boolean;
  user: UserItem | null;
}>();

const emit = defineEmits(['update:open', 'ok', 'reject']);

const placeholderImage = 'https://via.placeholder.com/200x120?text=No+Image';

const certificateImages = computed(() => {
  if (!props.user) return [];
  if (props.user.cardType === 1) {
    return [
      { label: '身份证正面', src: props.user.idCardFront || placeholderImage },
      { label: '身份证反面', src: props.user.idCardBack || placeholderImage },
    ];
  }
  return [
    { label: '学生证', src: props.user.studentCard || placeholderImage },
  ];
});

const handleCancel = () => {
  emit('update:open', false);
};

const handlePass = () => {
  emit('ok');
};

const handleReject = () => {
  emit('reject');
};
</script>

<style scoped>
.audit-content {
  text-align: left;
}

.image-container {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.image-container.single {
  justify-content: center;
}

.audit-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}
</style>
