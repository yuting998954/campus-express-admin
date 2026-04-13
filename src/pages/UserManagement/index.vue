<template>
  <div class="management-container">
    <div class="search-bar">
      <a-space>
        <a-input-search v-model:value="searchText" placeholder="搜索用户名/手机号" style="width: 200px" @search="loadUsers"
          enter-button />
        <a-select v-model:value="verifyStatusFilter" placeholder="认证状态" style="width: 120px" allow-clear>
          <a-select-option :value="0">未认证</a-select-option>
          <a-select-option :value="1">待审核</a-select-option>
          <a-select-option :value="2">已认证</a-select-option>
          <a-select-option :value="3">驳回</a-select-option>
        </a-select>
        <a-select v-model:value="statusFilter" placeholder="账号状态" style="width: 120px" allow-clear>
          <a-select-option :value="0">已禁用</a-select-option>
          <a-select-option :value="1">正常</a-select-option>
        </a-select>
        <Button type="primary" @click="loadUsers">查询</Button>
        <Button @click="clearSearch">重置</Button>
      </a-space>
    </div>

    <a-table :columns="columns" :data-source="users" :loading="loading" :pagination="paginationConfig"
      @change="handleTableChange">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-tag :color="getAccountStatusColor(record.status)">
            {{ getAccountStatusText(record.status) }}
          </a-tag>
        </template>
        <template v-if="column.key === 'verifyStatus'">
          <a-tag :color="getVerifyStatusColor(record.verifyStatus)">
            {{ getVerifyStatusText(record.verifyStatus) }}
          </a-tag>
        </template>
        <template v-if="column.key === 'idCard'">
          <a-button type="link" @click="viewIdCard(record)">查看证件</a-button>
        </template>
        <template v-if="column.key === 'action'">
          <a-space>
            <Button v-if="record.verifyStatus === 1" type="primary" size="small"
              @click="handleAudit(record)">审核</Button>
            <Button v-if="record.status === 0 && record.creditScore >= 80" type="primary" size="small"
              @click="handleStatusChange(record)">
              启用
            </Button>
            <Button v-if="record.status === 1 && record.creditScore < 80" type="primary" danger size="small"
              @click="handleStatusChange(record)">
              禁用
            </Button>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 查看证件弹窗 -->
    <a-modal :open="idCardVisible" title="身份信息" :footer="null" @cancel="idCardVisible = false" width="700px">
      <a-descriptions bordered :column="1" size="small">
        <a-descriptions-item label="姓名">{{ currentUser?.realName }}</a-descriptions-item>
        <a-descriptions-item label="证件号">{{ currentUser?.code || '未填写' }}</a-descriptions-item>
        <a-descriptions-item label="证件类型">{{ currentUser?.cardType === 1 ? '身份证' : '学生证' }}</a-descriptions-item>
        <a-descriptions-item label="证件照片">
          <div class="image-container" :class="{ single: viewCertificateImages.length === 1 }">
            <a-image v-for="(image, idx) in viewCertificateImages" :key="idx" :width="200" :src="image.src"
              :fallback="placeholderImage" />
          </div>
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>

    <!-- 审核弹窗 -->
    <UserAuditModal v-model:open="auditVisible" :user="currentUser" @ok="handleAuditPass" @reject="handleAuditReject" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue';
import { message, Button, Modal } from 'ant-design-vue';
import UserAuditModal from './UserAuditModal.vue';
import '../../styles/management.css';
import { getUsers, verifyUser, updateUserStatus, getUserVerificationInfo } from '@/service/admin';

interface UserItem {
  id: string;
  nickname: string;
  phone: string;
  status: number;
  verifyStatus: number;
  creditScore: number;
  idNumber?: string;
  idCardFrontImage?: string;
  idCardBackImage?: string;
  studentCardImage?: string;
}

const searchText = ref('');
const statusFilter = ref<number>();
const verifyStatusFilter = ref<number>();
const auditVisible = ref(false);
const idCardVisible = ref(false);
const currentUser = ref<any>(null);
const users = ref<any[]>([]);
const loading = ref(false);
const paginationConfig = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条`
});

const columns = [
  { title: '姓名', dataIndex: 'nickname', key: 'nickname' },
  { title: '手机号', dataIndex: 'phone', key: 'phone' },
  { title: '信誉分', dataIndex: 'creditScore', key: 'creditScore' },
  { title: '身份信息', key: 'idCard' },
  { title: '账号状态', key: 'status' },
  { title: '认证状态', key: 'verifyStatus' },
  { title: '操作', key: 'action', width: 150 },
];

const placeholderImage = 'https://via.placeholder.com/200x120?text=No+Image';

const viewCertificateImages = computed(() => {
  if (!currentUser.value) return [];
  if (currentUser.value.cardType === 1) {
    return [
      { label: '身份证正面', src: currentUser.value.idCardFront || placeholderImage },
      { label: '身份证反面', src: currentUser.value.idCardBack || placeholderImage },
    ];
  }
  return [
    { label: '学生证', src: currentUser.value.studentCard || placeholderImage },
  ];
});

const getAccountStatusColor = (status: number) => {
  return status === 0 ? 'red' : status === 1 ? 'green' : 'default';
};

const getAccountStatusText = (status: number) => {
  return status === 0 ? '已禁用' : status === 1 ? '正常' : '未知';
};

const getVerifyStatusColor = (status: number) => {
  switch (status) {
    case 0: return 'default';
    case 1: return 'orange';
    case 2: return 'green';
    case 3: return 'red';
    default: return 'default';
  }
};

const getVerifyStatusText = (status: number) => {
  switch (status) {
    case 0: return '未认证';
    case 1: return '待审核';
    case 2: return '已认证';
    case 3: return '驳回';
    default: return '未知';
  }
};

const clearSearch = () => {
  searchText.value = '';
  statusFilter.value = undefined;
  verifyStatusFilter.value = undefined;
  paginationConfig.value.current = 1;
  loadUsers();
};

const handleTableChange = (pag: any) => {
  paginationConfig.value.current = pag.current;
  paginationConfig.value.pageSize = pag.pageSize;
  loadUsers();
};

const viewIdCard = (user: UserItem) => {
  currentUser.value = user;
  idCardVisible.value = true;
};

const handleAudit = async (user: UserItem) => {
  if (user.verifyStatus !== 1) {
    message.warning('当前状态不允许审核');
    return;
  }
  const res: any = await getUserVerificationInfo(user.id);
  currentUser.value = res;
  auditVisible.value = true;
};
// 审核认证
const handleAuditPass = async () => {
  if (!currentUser.value) return;
  try {
    await verifyUser({ authId: currentUser.value!.authId, auditStatus: 1 });
    message.success('审核通过');
    auditVisible.value = false;
    loadUsers();
  } catch {
    // 错误提示由拦截器处理
  }
};

const handleAuditReject = () => {
  if (!currentUser.value) return;
  const reason = ref('');
  Modal.confirm({
    title: '驳回认证',
    okText: '提交',
    cancelText: '取消',
    content: () => h('div', [
      h('p', '请输入驳回原因：'),
      h('textarea', {
        class: 'reject-textarea',
        placeholder: '请输入驳回原因',
        rows: 3,
        value: reason.value,
        onInput: (e: Event) => { reason.value = (e.target as HTMLTextAreaElement).value; }
      })
    ]),
    onOk: async () => {
      if (!reason.value.trim()) {
        message.warning('请输入驳回原因');
        return Promise.reject();
      }
      try {
        await verifyUser({ authId: currentUser.value!.authId, auditStatus: 2, rejectReason: reason.value });
        message.success('已驳回');
        auditVisible.value = false;
        loadUsers();
      } catch {
        return Promise.reject();
      }
    }
  });
};

const handleStatusChange = (user: UserItem) => {
  if (user.status === 1 && user.creditScore >= 80) {
    message.warning('信誉分高于80分，无法禁用');
    return;
  }
  const action = user.status === 0 ? '启用' : '禁用';
  Modal.confirm({
    title: `确认${action}`,
    content: `确定要${action}用户 ${user.nickname} 吗？`,
    onOk: async () => {
      try {
        await updateUserStatus({ userId: user.id, status: user.status ? 0 : 1 });
        message.success(`用户已${action}`);
        loadUsers();
      } catch {
        // 错误提示由拦截器处理
      }
    }
  });
};

const loadUsers = async () => {
  loading.value = true;
  try {
    const pageData = await getUsers({
      keyword: searchText.value || undefined,
      status: statusFilter.value,
      verifyStatus: verifyStatusFilter.value,
      pageNo: paginationConfig.value.current,
      pageSize: paginationConfig.value.pageSize,
    });
    users.value = pageData.records;
    paginationConfig.value.total = pageData.total;
  } catch {
    // 错误提示由拦截器处理
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.image-container {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.image-container.single {
  justify-content: center;
}

.reject-textarea {
  width: 100%;
  margin-top: 8px;
  padding: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  resize: vertical;
  font-size: 14px;
}
</style>
