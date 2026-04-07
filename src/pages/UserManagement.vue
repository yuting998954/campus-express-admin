<template>
  <div class="management-container">
    <div class="search-bar">
      <a-space>
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索用户名/手机号"
            style="width: 200px"
            @search="onSearch"
            enter-button
          />
          <a-select
            v-model:value="statusFilter"
            placeholder="筛选状态"
            style="width: 120px"
            allow-clear
          >
            <a-select-option value="pending">待审核</a-select-option>
            <a-select-option value="active">正常</a-select-option>
            <a-select-option value="disabled">已禁用</a-select-option>
          </a-select>
          <Button type="primary" @click="clearSearch()">清空</Button>
      </a-space>
    </div>

      <a-table :columns="columns" :data-source="filteredUsers" :pagination="{ pageSize: 10 }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-if="column.key === 'idCard'">
            <a-button type="link" @click="viewIdCard(record)">查看证件</a-button>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <Button v-if="record.status === 'pending'" type="primary" size="small" @click="handleAudit(record)">审核</Button>
              <Button v-if="record.status === 'active' && record.creditScore < 80" type="primary" danger size="small" @click="toggleStatus(record, 'disabled')">禁用</Button>
              <Button v-if="record.status === 'disabled' && record.creditScore >= 80" type="primary" size="small" @click="toggleStatus(record, 'active')">解封</Button>
            </a-space>
          </template>
        </template>
      </a-table>

    <!-- 审核弹窗 -->
    <UserAuditModal 
    v-model:open="auditVisible"
     :user="currentUser" 
     @ok="confirmAudit"
     />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { message,Button } from 'ant-design-vue';
import UserAuditModal from '../components/modals/UserAuditModal.vue';
import '../styles/management.css';
interface User {
  id: string;
  name: string;
  phone: string;
  status: 'pending' | 'active' | 'disabled';
  creditScore: number;
  idNumber: string;
}

const searchText = ref('');
const statusFilter = ref<string | undefined>(undefined);
const auditVisible = ref(false);
const currentUser = ref<User | null>(null);

const users = ref<User[]>([
  { id: '1', name: '张三', phone: '13800138001', status: 'pending', creditScore: 100, idNumber: '20230001' },
  { id: '2', name: '李四', phone: '13800138002', status: 'active', creditScore: 75, idNumber: '20230002' },
  { id: '3', name: '王五', phone: '13800138003', status: 'disabled', creditScore: 85, idNumber: '20230003' },
  { id: '4', name: '赵六', phone: '13800138004', status: 'active', creditScore: 95, idNumber: '20230004' },
]);

const columns = [
  { title: '姓名', dataIndex: 'name', key: 'name' },
  { title: '手机号', dataIndex: 'phone', key: 'phone' },
  { title: '信誉分', dataIndex: 'creditScore', key: 'creditScore' },
  { title: '身份信息', key: 'idCard' },
  { title: '状态', key: 'status', dataIndex: 'status' },
  { title: '操作', key: 'action' },
];

const filteredUsers = computed(() => {
  return users.value.filter(u => {
    const matchesSearch = !searchText.value || u.name.includes(searchText.value) || u.phone.includes(searchText.value);
    const matchesStatus = !statusFilter.value || u.status === statusFilter.value;
    return matchesSearch && matchesStatus;
  });
});

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'orange';
    case 'active': return 'green';
    case 'disabled': return 'red';
    default: return 'default';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending': return '待审核';
    case 'active': return '正常';
    case 'disabled': return '已禁用';
    default: return '未知';
  }
};

const onSearch = () => {
  // Computed property handles this
};

const clearSearch = () => {
  searchText.value = '';
  statusFilter.value = undefined;
};

const viewIdCard = (user: User) => {
  currentUser.value = user;
  auditVisible.value = true;
};

const handleAudit = (user: User) => {
  currentUser.value = user;
  auditVisible.value = true;
};

const confirmAudit = () => {
  if (currentUser.value) {
    const idx = users.value.findIndex(u => u.id === currentUser.value?.id);
    if (idx !== -1) {
      users.value[idx].status = 'active';
      message.success('审核通过');
    }
  }
  auditVisible.value = false;
};

const toggleStatus = (user: User, newStatus: 'active' | 'disabled') => {
  const idx = users.value.findIndex(u => u.id === user.id);
  if (idx !== -1) {
    users.value[idx].status = newStatus;
    message.success(newStatus === 'active' ? '账号已解封' : '账号已禁用');
  }
};
</script>
