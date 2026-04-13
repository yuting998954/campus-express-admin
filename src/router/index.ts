import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layout/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../pages/Login/index.vue'),
      meta: { title: '登录' }
    },
    {
      path: '/',
      component: MainLayout,
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('../pages/index/index.vue'),
          meta: { title: '首页', requiresAuth: true }
        },
        {
          path: 'users',
          name: 'Users',
          component: () => import('../pages/UserManagement/index.vue'),
          meta: { title: '用户管理', requiresAuth: true }
        },
        {
          path: 'orders',
          name: 'Orders',
          component: () => import('../pages/OrderManagement/index.vue'),
          meta: { title: '订单管理', requiresAuth: true }
        },
        {
          path: 'disputes',
          name: 'Disputes',
          component: () => import('../pages/DisputeManagement/index.vue'),
          meta: { title: '纠纷管理', requiresAuth: true }
        }
      ]
    }
  ]
})
// 全局导航守卫，检查用户是否已登录
router.beforeEach((to) => {
  const isLoggedIn = Boolean(localStorage.getItem('adminToken'));
  if (to.path !== '/login' && !isLoggedIn) {
    return '/login';
  }
  if (to.path === '/login' && isLoggedIn) {
    return '/';
  }
});

export default router

