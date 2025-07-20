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
router.beforeEach((to, from, next) => {
  let user = null
  try {
    user = JSON.parse(localStorage.getItem('currentUser'))
  } catch {}
  const isAuthenticated = !!user
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.meta.adminOnly && (!user || user.role !== 'admin')) {
    next('/access-denied')
  } else if (to.meta.userOnly && (!user || user.role !== 'user')) {
    next('/access-denied')
  } else {
    next()
  }
})

export default router