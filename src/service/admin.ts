import request from './api';

interface PageData<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
}

export interface AdminLoginPayload {
  phone: string;
  password: string;
}

export interface AdminLoginData {
  token: string;
  userInfo?: {
    id: number;
    phone: string;
    role: string;
    nickname?: string;
  };
}

export interface DashboardOverview {
  todayOrders: number;
  pendingVerifyCount: number;
  pendingDisputeCount: number;
  totalUsers: number;
  todayOrdersChange?: number;
  pendingVerifyChange?: number;
  pendingDisputeChange?: number;
  totalUsersChange?: number;
}

export interface TrendItem {
  date: string;
  value: number;
}

export interface StatusDistributionItem {
  status: string;
  count: number;
}

export interface AdminUser {
  id: number | string;
  nickname: string;
  phone: string;
  status: number; // 账号状态：0-禁用，1-正常
  verifyStatus: number; // 认证状态：0-未认证，1-待审核，2-已认证，3-驳回
  creditScore: number;
  idNumber?: string;
  idCardFrontImage?: string;
  idCardBackImage?: string;
  studentCardImage?: string;
}

export interface AdminOrderLog {
  time: string;
  action: string;
}

export interface AdminOrder {
  id: number | string;
  orderNo: string;
  userName: string;
  userPhone: string;
  runnerName?: string;
  runnerPhone?: string;
  status: string;
  createTime: string;
  exceptionType?: string;
  exceptionDetail?: string;
  logs: AdminOrderLog[];
}

export interface AdminDisputeResult {
  decision: string;
  reason: string;
  amount?: number;
}

export interface AdminDispute {
  id: string;
  orderNo: string;
  applicant: string;
  type: string;
  createTime: string;
  hasEvidence: boolean;
  description: string;
  result?: AdminDisputeResult;
}

export function login(payload: AdminLoginPayload) {
  return request<AdminLoginData>({
    url: '/admin/auth/login',
    method: 'POST',
    data: payload
  });
}

export function getDashboardOverview() {
  return request<DashboardOverview>({
    url: '/admin/dashboard/overview',
    method: 'GET'
  });
}

export function getOrderTrend(days = 7) {
  return request<TrendItem[]>({ url: '/admin/dashboard/order-trend', method: 'GET', params: { days } });
}

export function getOrderStatusDistribution() {
  return request<StatusDistributionItem[]>({ url: '/admin/dashboard/order-status-distribution', method: 'GET' });
}
// 用户列表接口
export function getUsers(params: { keyword?: string; status?: number; verifyStatus?: number; pageNo?: number; pageSize?: number }) {
  return request<PageData<AdminUser>>({
    url: '/auth/getUser',
    method: 'GET',
    params
  });
}
// 审核用户认证状态
export function verifyUser(data: { authId: string; auditStatus: number; rejectReason?: string }) {
  return request<null>({
    url: `/admin/auth/audit`,
    method: 'PUT',
    data
  });
}
// 修改用户状态（账号状态/认证状态）
export function updateUserStatus(data: { userId: string; status?: number; verifyStatus?: number }) {
  return request<null>({
    url: `/admin/user/updateUserStatus`,
    method: 'PUT',
    data
  });
}
// 获取用户认证信息
export function getUserVerificationInfo(userId: string) {
  return request<AdminUser>({
    url: `/admin/auth/info`,
    method: 'GET',
    params: { userId }
  });
}
// 订单列表接口
export function getOrders(params: { keyword?: string; exceptionType?: string; pageNo?: number; pageSize?: number }) {
  return request<PageData<AdminOrder>>({
    url: '/admin/orders',
    method: 'GET',
    params
  });
}

export function interveneOrder(orderId: string | number, payload: { action: string; remark?: string }) {
  return request<null>({
    url: `/admin/orders/${orderId}/intervene`,
    method: 'POST',
    data: payload
  });
}

export function getDisputes(params: { keyword?: string; status?: string; pageNo?: number; pageSize?: number }) {
  return request<PageData<AdminDispute>>({
    url: '/admin/disputes',
    method: 'GET',
    params
  });
}

export function arbitrateDispute(disputeId: string | number, payload: { decision: string; reason: string; amount?: number }) {
  return request<null>({
    url: `/admin/disputes/${disputeId}/arbitrate`,
    method: 'POST',
    data: payload
  });
}
