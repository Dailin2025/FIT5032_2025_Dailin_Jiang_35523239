import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import LoginView from '../views/LoginView.vue'
import AccessDeniedView from '../views/AccessDeniedView.vue'
import SocialEventsView from '../views/SocialEventsView.vue'
import BookDoctorView from '../views/BookDoctorView.vue'
import VolunteerHelpView from '../views/VolunteerHelpView.vue'
import AvoidScamsView from '../views/AvoidScamsView.vue'
import MyAccountView from '../views/MyAccountView.vue'
import RegisterView from '../views/RegisterView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'About',
    component: AboutView,
    meta: { requiresAuth: true, adminOnly: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView
  },
  {
    path: '/access-denied',
    name: 'AccessDenied',
    component: AccessDeniedView
  },
  {
    path: '/social-events',
    name: 'SocialEvents',
    component: SocialEventsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/book-doctor',
    name: 'BookDoctor',
    component: BookDoctorView,
    meta: { requiresAuth: true }
  },
  {
    path: '/volunteer-help',
    name: 'VolunteerHelp',
    component: VolunteerHelpView,
    meta: { requiresAuth: true }
  },
  {
    path: '/avoid-scams',
    name: 'AvoidScams',
    component: AvoidScamsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/my-account',
    name: 'MyAccount',
    component: MyAccountView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  // 添加调试信息
  console.log('Route guard - navigating to:', to.path)
  console.log('Auth service available:', typeof window !== 'undefined' && !!window.authService)
  
  // 如果已经在登录页面，直接允许
  if (to.path === '/login') {
    console.log('Already on login page, allowing access')
    next()
    return
  }
  
  // 检查认证服务是否可用
  if (typeof window !== 'undefined' && window.authService) {
    // 等待 Firebase Auth 初始化完成
    let attempts = 0
    const maxAttempts = 10
    
    while (attempts < maxAttempts) {
      const user = window.authService.getCurrentUser()
      console.log(`Attempt ${attempts + 1}: Current user:`, user)
      
      if (user !== null) {
        // 用户已加载，检查权限
        const isAuthenticated = !!user
        console.log('User loaded, is authenticated:', isAuthenticated)
        
        if (to.meta.requiresAuth && !isAuthenticated) {
          console.log('Redirecting to login - requires auth but not authenticated')
          next('/login')
          return
        } else if (to.meta.adminOnly && (!user || !window.authService.hasRole('admin'))) {
          console.log('Redirecting to access denied - requires admin role')
          next('/access-denied')
          return
        } else if (to.meta.userOnly && (!user || !window.authService.hasRole('user'))) {
          console.log('Redirecting to access denied - requires user role')
          next('/access-denied')
          return
        } else {
          console.log('Proceeding to route')
          next()
          return
        }
      }
      
      // 等待一下再试
      console.log('User not loaded yet, waiting...')
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }
    
    // 如果多次尝试后仍然没有用户，允许访问（开发环境）
    console.log('Max attempts reached, allowing access')
    next()
  } else {
    // 如果认证服务不可用，允许访问（开发环境）
    console.log('Auth service not available, allowing access')
    next()
  }
})

export default router