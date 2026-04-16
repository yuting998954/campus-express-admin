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

export interface OrderStatusLogVO {
  logId: number;
  fromStatus: number | null;
  fromStatusLabel: string;
  toStatus: number;
  toStatusLabel: string;
  operatorId: number | null;
  operatorTypeLabel: string;
  operatorName: string;
  remark: string;
  createTime: string;
}

export interface AdminOrder {
  orderId: number | string;
  orderNo: string;
  publisherId?: number | string;
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
  exceptionType?: string;
  exceptionDetail?: string;
  logs: OrderStatusLogVO[];
  pickupAddress?: string;
  deliveryAddress?: string;
  packageCount?: number;
  pickupCode?: string;
  rewardAmount?: number;
  expectedDeliveryTime?: string;
  remark?: string;
}

export interface AdminDisputeResult {
  decision: string;
  reason: string;
  amount?: number;
}

export interface AdminDispute {
  disputeId: number | string;
  orderId: number | string;
  orderNo: string;
  applicantId: number | string;
  applicantName: string;
  applicantPhone: string;
  respondentId: number | string;
  respondentName: string;
  respondentPhone: string;
  disputeType: number | string;
  disputeTypeLabel: string;
  reason: string;
  status: number;
  statusLabel: string;
  result: string;
  responsibleParty: number;
  responsiblePartyLabel: string;
  createTime: string;
  updateTime: string;
  evidenceList?: string[];
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
export function getOrders(params: { keyword?: string; status?: number; pageNum?: number; pageSize?: number }) {
  return request<PageData<AdminOrder>>({
    url: '/admin/order/list',
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
// 获取纠纷列表
export function getDisputes(params: { keyword?: string; status?: string; pageNum?: number; pageSize?: number }) {
  return request<PageData<AdminDispute>>({
    url: '/admin/dispute/list',
    method: 'GET',
    params
  });
}
// 获取纠纷详情
export function disputeDetail(disputeId: string | number) {
  return request<any>({
    url: `/admin/dispute/detail`,
    method: 'GET',
    params: { disputeId }
  });
}
// 处理纠纷
export function resolveDispute(disputeId: string | number, payload: { decision: string; reason: string; amount?: number }) {
  // 将前端decision转换为后端liability: 0-申请人责任, 1-被申请人责任, 2-双方责任
  const decisionMap: Record<string, number> = {
    'runner': 1,    // 代取人责任 -> 被申请人(代取员)责任
    'user': 0,      // 用户恶意 -> 申请人责任
    'both': 2,     // 双方责任
  };
  return request<null>({
    url: `/admin/dispute/arbitrate`,
    method: 'PUT',
    data: {
      disputeId,
      liability: decisionMap[payload.decision] ?? payload.decision,
      result: payload.reason,
    }
  });
}
