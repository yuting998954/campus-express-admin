import axios, { type AxiosRequestConfig } from 'axios';
import { message } from 'ant-design-vue';

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

const instance = axios.create({
  baseURL: 'http://localhost:8081/api',
  timeout: 10000,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => {
    const payload = response.data as Partial<ApiResponse<unknown>>;
    if (typeof payload?.code === 'number' && payload.code !== 200) {
      const errMsg = payload.message || '请求失败';
      message.error(errMsg);
      return Promise.reject(new Error(errMsg));
    }
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('isAdminLoggedIn');
      message.error('登录已失效，请重新登录');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else {
      message.error(error?.response?.data?.message || error.message || '网络异常');
    }
    return Promise.reject(error);
  }
);

const request = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const response = await instance.request<ApiResponse<T>>(config);
  return response.data.data;
};

export default request;

export type { AxiosRequestConfig };
