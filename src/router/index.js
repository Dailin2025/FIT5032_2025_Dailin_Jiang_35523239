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
  console.log('Route guard - navigating to:', to.path)
  
  // 公开页面，直接允许访问
  if (to.path === '/login' || to.path === '/register' || to.path === '/access-denied') {
    console.log('Public page, allowing access')
    next()
    return
  }
  
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    console.log('Route requires authentication')
    
    // 等待认证服务初始化
    let attempts = 0
    const maxAttempts = 50 // 增加等待时间
    
    while (attempts < maxAttempts) {
      if (window.authService && window.authService.isInitialized()) {
        const user = window.authService.getCurrentUser()
        console.log('Auth service initialized, current user:', user)
        
        if (user) {
          // 用户已登录，检查特殊权限
          if (to.meta.adminOnly) {
            const hasAdminRole = await window.authService.hasRole('admin')
            if (hasAdminRole) {
              console.log('Admin access granted')
              next()
            } else {
              console.log('Admin access denied, redirecting to access denied')
              next('/access-denied')
            }
          } else {
            console.log('Authenticated user, allowing access')
            next()
          }
        } else {
          // 用户未登录，重定向到登录页
          console.log('User not authenticated, redirecting to login')
          next('/login')
        }
        return
      }
      
      // 等待认证服务初始化
      console.log(`Auth service not ready, attempt ${attempts + 1}/${maxAttempts}`)
      await new Promise(resolve => setTimeout(resolve, 200))
      attempts++
    }
    
    // 如果认证服务长时间未初始化，重定向到登录页
    console.log('Auth service failed to initialize, redirecting to login')
    next('/login')
    return
  }
  
  // 不需要认证的页面，允许访问
  console.log('No auth required, allowing access')
  next()
})

export default router