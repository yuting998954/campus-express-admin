<template>
  <a-modal :open="open" title="订单详情" @cancel="handleCancel" :footer="null" width="700px">
    <div v-if="order">
      <a-descriptions title="基本信息" bordered :column="2" size="small">
        <a-descriptions-item label="订单号" :span="2">{{ order.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="发布者">
          <span>{{ order.publisherNickname }}</span>
          <span class="phone-text" v-if="order.publisherPhone">{{ order.publisherPhone }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="代取人">
          <span>{{ order.runnerNickname }}</span>
          <span class="phone-text" v-if="order.runnerPhone">{{ order.runnerPhone }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="statusColor">{{ order.statusLabel || getStatusLabel(order.status) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="报酬金额">{{ order.rewardAmount ? '¥' + order.rewardAmount : '-'
        }}</a-descriptions-item>
        <a-descriptions-item label="取件地址" :span="2">{{ order.pickupAddress }}</a-descriptions-item>
        <a-descriptions-item label="配送地址" :span="2">{{ order.deliveryAddress }}</a-descriptions-item>
        <a-descriptions-item label="取件码">{{ order.pickupCode }}</a-descriptions-item>
        <a-descriptions-item label="包裹数量">{{ order.packageCount }}</a-descriptions-item>
        <a-descriptions-item label="期望送达">{{ order.expectedDeliveryTime }}</a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">{{ order.remark }}</a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <h4 class="section-title">订单进度</h4>
      <div class="progress-container">
        <!-- 步骤条 -->
        <div class="progress-steps">
          <!-- 待接单 -->
          <div class="step-item" :class="{ active: currentStep >= 0, completed: currentStep > 0 }">
            <div class="step-icon">
              <div class="step-dot"
                :class="{ 'step-dot-active': currentStep >= 0, 'step-dot-completed': currentStep > 0 }">
                <CheckOutlined v-if="currentStep > 0" />
                <span v-else>1</span>
              </div>
            </div>
            <div class="step-content">
              <div class="step-title">待接单</div>
              <div class="step-time" v-if="currentStep >= 0">{{ order.createTime || '-' }}</div>
              <div class="step-desc">用户发布订单</div>
            </div>
          </div>

          <!-- 连接线1 -->
          <div class="step-line" :class="{ active: currentStep > 0 }"></div>

          <!-- 已接单 -->
          <div class="step-item" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
            <div class="step-icon">
              <div class="step-dot"
                :class="{ 'step-dot-active': currentStep >= 1, 'step-dot-completed': currentStep > 1 }">
                <CheckOutlined v-if="currentStep > 1" />
                <span v-else>2</span>
              </div>
            </div>
            <div class="step-content">
              <div class="step-title">已接单</div>
              <div class="step-time" v-if="currentStep >= 1">{{ order.acceptTime || '-' }}</div>
              <div class="step-desc" v-if="order.runnerNickname">由 {{ order.runnerNickname }} 接单</div>
            </div>
          </div>

          <!-- 连接线2 -->
          <div class="step-line" :class="{ active: currentStep > 1 }"></div>

          <!-- 取件完成 -->
          <div class="step-item" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
            <div class="step-icon">
              <div class="step-dot"
                :class="{ 'step-dot-active': currentStep >= 2, 'step-dot-completed': currentStep > 2 }">
                <CheckOutlined v-if="currentStep > 2" />
                <span v-else>3</span>
              </div>
            </div>
            <div class="step-content">
              <div class="step-title">取件完成</div>
              <div class="step-time" v-if="currentStep >= 2">{{ order.pickupTime || '-' }}</div>
              <div class="step-desc" v-if="order.pickupVoucher">已上传取件凭证</div>
            </div>
          </div>

          <!-- 连接线3 -->
          <div class="step-line" :class="{ active: currentStep > 2 }"></div>

          <!-- 配送中 -->
          <div class="step-item" :class="{ active: currentStep >= 3, completed: currentStep > 3 }">
            <div class="step-icon">
              <div class="step-dot"
                :class="{ 'step-dot-active': currentStep >= 3, 'step-dot-completed': currentStep > 3 }">
                <CheckOutlined v-if="currentStep > 3" />
                <span v-else>4</span>
              </div>
            </div>
            <div class="step-content">
              <div class="step-title">配送中</div>
              <div class="step-desc">快递配送中</div>
            </div>
          </div>

          <!-- 连接线4 -->
          <div class="step-line" :class="{ active: currentStep > 3 }"></div>

          <!-- 已送达 -->
          <div class="step-item" :class="{ active: currentStep >= 4, completed: currentStep > 4 }">
            <div class="step-icon">
              <div class="step-dot"
                :class="{ 'step-dot-active': currentStep >= 4, 'step-dot-completed': currentStep > 4 }">
                <CheckOutlined v-if="currentStep > 4" />
                <span v-else>5</span>
              </div>
            </div>
            <div class="step-content">
              <div class="step-title">已送达</div>
              <div class="step-time" v-if="currentStep >= 4">{{ order.deliveryTime || '-' }}</div>
              <div class="step-desc" v-if="order.deliveryVoucher">已上传送达凭证</div>
            </div>
          </div>

          <!-- 连接线5 -->
          <div class="step-line" :class="{ active: currentStep > 5 }"></div>

          <!-- 已完成/已取消 -->
          <div class="step-item" :class="{ active: currentStep >= 5, completed: isCancelled }">
            <div class="step-icon">
              <div class="step-dot"
                :class="{ 'step-dot-active': currentStep >= 5, 'step-dot-completed': currentStep > 5 || isCancelled }">
                <CheckOutlined v-if="currentStep > 5" />
                <span v-else-if="isCancelled">×</span>
                <span v-else>6</span>
              </div>
            </div>
            <div class="step-content">
              <div class="step-title">{{ isCancelled ? '已取消' : '已完成' }}</div>
              <div class="step-time" v-if="currentStep >= 5 && !isCancelled">{{ order.confirmTime || '-' }}</div>
              <div class="step-time" v-if="isCancelled">{{ order.updateTime || '-' }}</div>
            </div>
          </div>
        </div>

        <!-- 凭证照片展示 -->
        <div class="voucher-section" v-if="order.pickupVoucher || order.deliveryVoucher">
          <div class="voucher-title">凭证照片</div>
          <div class="voucher-list">
            <div class="voucher-item" v-if="order.pickupVoucher">
              <div class="voucher-label">取件凭证</div>
              <img :src="order.pickupVoucher" alt="取件凭证" class="voucher-img"
                @click="previewImage(order.pickupVoucher)" />
            </div>
            <div class="voucher-item" v-if="order.deliveryVoucher">
              <div class="voucher-label">送达凭证</div>
              <img :src="order.deliveryVoucher" alt="送达凭证" class="voucher-img"
                @click="previewImage(order.deliveryVoucher)" />
            </div>
          </div>
        </div>
      </div>

      <!-- <div v-if="order.exceptionType" class="exception-section">
        <a-divider />
        <a-alert type="warning" :message="'异常类型: ' + order.exceptionType" :description="order.exceptionDetail"
          show-icon />
        <div class="action-bar">
          <a-button type="primary" @click="handleException">处理异常</a-button>
        </div>
      </div> -->
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { CheckOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

interface OrderDetail {
  orderId: number | string;
  orderNo: string;
  publisherNickname?: string;
  publisherPhone?: string;
  runnerId?: number | string;
  runnerNickname?: string;
  runnerPhone?: string;
  status: number;
  statusLabel?: string;
  createTime?: string;
  acceptTime?: string;
  pickupTime?: string;
  deliveryTime?: string;
  confirmTime?: string;
  updateTime?: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  packageCount?: number;
  pickupCode?: string;
  rewardAmount?: number;
  expectedDeliveryTime?: string;
  remark?: string;
  pickupVoucher?: string;
  deliveryVoucher?: string;
  exceptionType?: string;
  exceptionDetail?: string;
}

const props = defineProps<{
  open: boolean;
  order: OrderDetail | null;
}>();

const emit = defineEmits(['update:open', 'resolve']);

// 计算当前进度步骤
const currentStep = computed(() => {
  if (!props.order) return 0;
  const status = props.order.status;
  switch (status) {
    case 0: return 0; // 待接单
    case 1: return 1; // 已接单/待取件
    case 2: return 3; // 配送中
    case 3: return 4; // 已送达
    case 4: return 5; // 待评价
    case 5: return 6; // 已完成
    default: return 0;
  }
});

// 是否已取消
const isCancelled = computed(() => {
  return props.order?.status === 6;
});

const statusColor = computed(() => {
  const status = props.order?.status;
  return getStatusColor(status);
});

const getStatusColor = (status?: number) => {
  const colorMap: Record<number, string> = {
    0: 'orange',
    1: 'blue',
    2: 'blue',
    3: 'green',
    4: 'purple',
    5: 'green',
    6: 'gray',
    7: 'red',
  };
  return colorMap[status as number] || 'default';
};

const getStatusLabel = (status?: number) => {
  const labelMap: Record<number, string> = {
    0: '待接单',
    1: '待取件',
    2: '配送中',
    3: '已送达',
    4: '待评价',
    5: '已完成',
    6: '已取消',
    7: '纠纷中',
  };
  return labelMap[status as number] || '未知';
};

const handleCancel = () => {
  emit('update:open', false);
};

const handleException = () => {
  emit('resolve');
};

const previewImage = (url: string) => {
  if (url) {
    window.open(url, '_blank');
  }
};
</script>

<style scoped>
.section-title {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 500;
}

.phone-text {
  color: #999;
  font-size: 12px;
  margin-left: 8px;
}

.exception-section {
  margin-top: 24px;
}

.action-bar {
  margin-top: 16px;
}

/* 进度展示容器 */
.progress-container {
  padding: 10px 0;
}

/* 步骤条 */
.progress-steps {
  display: flex;
  align-items: flex-start;
  padding: 10px 0;
  overflow-x: auto;
}

/* 单个步骤项 */
.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 70px;
  position: relative;
}

.step-icon {
  margin-bottom: 8px;
}

.step-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  background-color: #f0f0f0;
  color: #bfbfbf;
  border: 2px solid #e8e8e8;
  transition: all 0.3s ease;
}

.step-dot-active {
  background-color: #1890ff;
  color: #fff;
  border-color: #1890ff;
}

.step-dot-completed {
  background-color: #52c41a;
  color: #fff;
  border-color: #52c41a;
}

.step-content {
  text-align: center;
  max-width: 80px;
}

.step-title {
  font-size: 13px;
  font-weight: 500;
  color: #8c8c8c;
  margin-bottom: 4px;
  transition: color 0.3s ease;
}

.step-item.active .step-title,
.step-item.completed .step-title {
  color: #262626;
}

.step-time {
  font-size: 11px;
  color: #8c8c8c;
  margin-bottom: 2px;
}

.step-desc {
  font-size: 11px;
  color: #bfbfbf;
}

/* 连接线 */
.step-line {
  flex: 1;
  height: 2px;
  background-color: #e8e8e8;
  margin: 15px 4px 0;
  min-width: 20px;
  transition: background-color 0.3s ease;
}

.step-line.active {
  background-color: #52c41a;
}

/* 凭证照片区域 */
.voucher-section {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px dashed #e8e8e8;
}

.voucher-title {
  font-size: 14px;
  font-weight: 500;
  color: #595959;
  margin-bottom: 12px;
}

.voucher-list {
  display: flex;
  gap: 16px;
}

.voucher-item {
  text-align: center;
}

.voucher-label {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 8px;
}

.voucher-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.voucher-img:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 取消状态特殊处理 */
.step-item.completed .step-dot {
  background-color: #ff4d4f;
  border-color: #ff4d4f;
}
</style>
