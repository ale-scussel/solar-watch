import { createRouter, createWebHistory } from 'vue-router'
import { useMainStore } from '../stores/main'

import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import HistoryView from '../views/HistoryView.vue'
import ReportsView from '../views/ReportsView.vue'
import AdminView from '../views/AdminView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/history',
      name: 'history',
      component: HistoryView,
      meta: { requiresAuth: true, roles: ['responsabile'] }
    },
    {
      path: '/reports',
      name: 'reports',
      component: ReportsView,
      meta: { requiresAuth: true, roles: ['responsabile'] }
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      meta: { requiresAuth: true, roles: ['responsabile'] }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const store = useMainStore()
  if (to.meta.requiresAuth && !store.activeUser) {
    next('/')
  } else if (to.meta.roles && !to.meta.roles.includes(store.activeUser?.role)) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
