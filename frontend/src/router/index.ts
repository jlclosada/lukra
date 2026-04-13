import { useAuthStore } from '@/stores/auth'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/HomePage.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/LoginPage.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/pages/RegisterPage.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/looks',
      name: 'looks',
      component: () => import('@/pages/LooksPage.vue'),
    },
    {
      path: '/articles',
      name: 'articles',
      component: () => import('@/pages/ArticlesPage.vue'),
    },
    {
      path: '/trends',
      name: 'trends',
      component: () => import('@/pages/TrendsPage.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/pages/AboutPage.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/pages/ProfilePage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin',
      component: () => import('@/pages/admin/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresEditor: true },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('@/pages/admin/AdminDashboard.vue'),
        },
        {
          path: 'looks',
          name: 'admin-looks',
          component: () => import('@/pages/admin/AdminLooks.vue'),
        },
        {
          path: 'articles',
          name: 'admin-articles',
          component: () => import('@/pages/admin/AdminArticles.vue'),
        },
        {
          path: 'trends',
          name: 'admin-trends',
          component: () => import('@/pages/admin/AdminTrends.vue'),
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('@/pages/admin/AdminUsers.vue'),
          meta: { requiresAdmin: true },
        },
      ],
    },
  ],
})

router.beforeEach(async (to, _from, next) => {
  const auth = useAuthStore()

  // Try to fetch user on first navigation if token exists
  if (!auth.user && localStorage.getItem('access_token')) {
    await auth.fetchUser()
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (to.meta.requiresEditor && !auth.isEditor) {
    next({ name: 'home' })
  } else if (to.meta.requiresAdmin && !auth.isAdmin) {
    next({ name: 'admin-dashboard' })
  } else if (to.meta.guestOnly && auth.isAuthenticated) {
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
