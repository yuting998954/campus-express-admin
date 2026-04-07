<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider v-model:collapsed="collapsed" collapsible>
      <div class="logo">
        <h1 style="color: white; margin: 16px; font-size: 18px;">管理后台</h1>
      </div>
      <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
        <a-menu-item key="/dashboard" @click="$router.push('/dashboard')">
          <dashboard-outlined />
          <span>首页</span>
        </a-menu-item>
        <a-menu-item key="/users" @click="$router.push('/users')">
          <user-outlined />
          <span>用户管理</span>
        </a-menu-item>
        <a-menu-item key="/orders" @click="$router.push('/orders')">
          <reconciliation-outlined />
          <span>订单管理</span>
        </a-menu-item>
        <a-menu-item key="/disputes" @click="$router.push('/disputes')">
          <exception-outlined />
          <span>纠纷管理</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header style="background: #fff; padding: 0 24px; display: flex; align-items: center; justify-content: space-between;">
        <h2 style="margin: 0">{{ currentTitle }}</h2>
        <div class="user-info">
          <a-dropdown>
            <span class="ant-dropdown-link" style="cursor: pointer; display: flex; align-items: center">
              <a-avatar size="small">
                <template #icon><UserOutlined /></template>
              </a-avatar>
              <span style="margin-left: 8px">系统管理员</span>
              <down-outlined style="margin-left: 4px; font-size: 12px" />
            </span>
            <template #overlay>
              <a-menu>
                <a-menu-item key="logout" @click="handleLogout">
                  <logout-outlined />
                  <span>退出登录</span>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>
      <a-layout-content :style="contentStyle">
        <router-view />
      </a-layout-content>
      <a-layout-footer style="text-align: center">
        校园快递代取预约管理系统 ©2026 Created by wuyuting
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import {
  UserOutlined,
  ReconciliationOutlined,
  ExceptionOutlined,
  LogoutOutlined,
  DownOutlined,
  DashboardOutlined,
} from '@ant-design/icons-vue';

const collapsed = ref<boolean>(false); //控制侧边栏的折叠状态
const route = useRoute();
const router = useRouter();
const selectedKeys = ref<string[]>([route.path]);

const currentTitle = computed(() => {
  return route.meta.title || '首页';
});

const contentStyle = computed(() => {
  const isDashboard = route.path === '/dashboard';
  return {
    margin: isDashboard ? '0' : '24px 16px',
    padding: isDashboard ? '0' : '24px',
    background: isDashboard ? '#f0f2f5' : '#fff',
    minHeight: '280px'
  };
});

const handleLogout = () => {
  Modal.confirm({
    title: '确认退出',
    content: '您确定要退出登录吗？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      localStorage.removeItem('isAdminLoggedIn');
      message.success('已退出登录');
      router.push('/login');
    },
  });
};

watch(() => route.path, (newPath: string) => {
  selectedKeys.value = [newPath];
});
</script>

<style scoped>
.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

