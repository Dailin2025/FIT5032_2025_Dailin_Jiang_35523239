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
    meta: { requiresAuth: true, roles: ['admin'] }
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
    meta: { requiresAuth: true, roles: ['user', 'doctor', 'admin'] }
  },
  {
    path: '/book-doctor',
    name: 'BookDoctor',
    component: BookDoctorView,
    meta: { requiresAuth: true, roles: ['user', 'doctor', 'admin'] }
  },
  {
    path: '/volunteer-help',
    name: 'VolunteerHelp',
    component: VolunteerHelpView,
    meta: { requiresAuth: true, roles: ['user', 'doctor', 'admin'] }
  },
  {
    path: '/avoid-scams',
    name: 'AvoidScams',
    component: AvoidScamsView,
    meta: { requiresAuth: true, roles: ['user', 'doctor', 'admin'] }
  },
  {
    path: '/my-account',
    name: 'MyAccount',
    component: MyAccountView,
    meta: { requiresAuth: true, roles: ['user', 'doctor', 'admin'] }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  // 公开页面，直接允许访问
  if (to.path === '/login' || to.path === '/register' || to.path === '/access-denied') {
    next()
    return
  }
  
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    // 检查认证服务是否可用
    if (window.authService) {
      const user = window.authService.getCurrentUser()
      
      if (user) {
        // 用户已登录，检查特殊权限
        if (to.meta.roles && to.meta.roles.length > 0) {
          try {
            // 检查用户是否有访问权限
            let hasAccess = false
            for (const role of to.meta.roles) {
              const hasRole = await window.authService.hasRole(role)
              if (hasRole) {
                hasAccess = true
                break
              }
            }
            
            if (hasAccess) {
              next()
            } else {
              next('/access-denied')
            }
          } catch (error) {
            console.error('Error checking user roles:', error)
            next('/access-denied')
          }
        } else {
          // 没有角色要求，任何认证用户都可以访问
          next()
        }
      } else {
        // 用户未登录，重定向到登录页
        next('/login')
      }
    } else {
      // 认证服务不可用，重定向到登录页
      next('/login')
    }
    return
  }
  
  // 不需要认证的页面，允许访问
  next()
})

export default router