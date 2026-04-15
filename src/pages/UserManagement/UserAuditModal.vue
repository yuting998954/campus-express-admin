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
  cardType: 0 | 1; // 0: 学生证, 1: 身份证
}

const props = defineProps<{
  open: boolean;
  user: UserItem | null;
}>();

const emit = defineEmits(['update:open', 'ok', 'reject']);

const placeholderImage = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120"><rect width="100%" height="100%" fill="#f5f5f5"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#999" font-family="sans-serif" font-size="14">图片加载失败</text></svg>');
const IMAGE_BASE_URL = 'http://localhost:8081';

const getImageUrl = (path: string | undefined) => {
  if (!path) return placeholderImage;
  // 如果是Base64格式，直接返回
  if (path.startsWith('data:')) return path;
  // 处理微信临时文件路径
  if (path.startsWith('http://tmp/') || path.startsWith('https://tmp/')) {
    const filename = path.split('/').pop();
    return `${IMAGE_BASE_URL}/api/file/${filename}`;
  }
  // 已经是完整的HTTP URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  // 后端返回的路径如 /api/file/xxx.jpg，直接拼接基础URL
  return `${IMAGE_BASE_URL}${path}`;
};

const certificateImages = computed(() => {
  if (!props.user) return [];
  if (props.user.cardType === 1) {
    return [
      { label: '身份证正面', src: getImageUrl(props.user.idCardFront) },
      { label: '身份证反面', src: getImageUrl(props.user.idCardBack) },
    ];
  }
  return [
    { label: '学生证', src: getImageUrl(props.user.studentCard) },
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
