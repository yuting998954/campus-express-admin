<template>
  <div class="login-container">
    <a-card class="login-card" :bordered="false">
      <div class="login-header">
        <img src="@/static/logo.png" alt="logo" class="logo" />
        <h1 class="title">校园快递代取管理系统</h1>
      </div>
      <a-form :model="formState" @finish="handleLogin">
        <a-form-item name="username" :rules="[{ required: true, message: '请输入用户名' }]">
          <a-input v-model:value="formState.username" placeholder="请输入用户名">
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>
        <a-form-item name="password" :rules="[{ required: true, message: '请输入密码' }]">
          <a-input-password v-model:value="formState.password" placeholder="请输入密码">
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" block :loading="loading">登录</a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue';
import { login } from '@/service/admin';

const router = useRouter();
const loading = ref(false);

const formState = reactive({
  username: '',
  password: '',
});

const handleLogin = async () => {
  loading.value = true;
  try {
    const loginData = await login({
      phone: formState.username,
      password: formState.password,
    });
    localStorage.setItem('isAdminLoggedIn', 'true');
    localStorage.setItem('adminToken', loginData.token);
    message.success('登录成功');
    router.push('/');
  } catch {

  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
  background-image: url('https://gw.alipayobjects.com/zos/rmsportal/TV2t91t798607147.svg');
  background-repeat: no-repeat;
  background-position: center 110px;
  background-size: 100%;
}

.login-card {
  width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  height: 44px;
  margin-bottom: 16px;
}

.title {
  font-size: 24px;
  color: rgba(0, 0, 0, 0.85);
  font-weight: 600;
}
</style>
