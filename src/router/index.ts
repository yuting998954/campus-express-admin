import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layout/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../pages/Login.vue'),
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
          component: () => import('../pages/Dashboard.vue'),
          meta: { title: '首页', requiresAuth: true }
        },
        {
          path: 'users',
          name: 'Users',
          component: () => import('../pages/UserManagement.vue'),
          meta: { title: '用户管理', requiresAuth: true }
        },
        {
          path: 'orders',
          name: 'Orders',
          component: () => import('../pages/OrderManagement.vue'),
          meta: { title: '订单管理', requiresAuth: true }
        },
        {
          path: 'disputes',
          name: 'Disputes',
          component: () => import('../pages/DisputeManagement.vue'),
          meta: { title: '纠纷管理', requiresAuth: true }
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
  if (to.path !== '/login' && !isLoggedIn) {
    next('/login');
  } else if (to.path === '/login' && isLoggedIn) {
    next('/');
  } else {
    next();
  }
});

export default router

