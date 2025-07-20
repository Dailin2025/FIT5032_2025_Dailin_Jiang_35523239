<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light px-4">
    <router-link class="navbar-brand fw-bold" to="/">SeniorWellness</router-link>
    <div class="collapse navbar-collapse">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item" v-for="item in menu" :key="item.text">
          <router-link class="nav-link" :to="item.link" active-class="active">{{ item.text }}</router-link>
        </li>
      </ul>
      <span class="navbar-text ms-auto d-flex align-items-center gap-2">
        <button class="btn btn-primary rounded-pill px-4" disabled>
          Welcome, {{ currentUser ? currentUser.username : 'Guest' }}!
        </button>
        <button v-if="currentUser" class="btn btn-outline-secondary rounded-pill px-4 ms-2" @click="signOut">Sign out</button>
      </span>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
const menu = [
  { text: 'Home', link: '/' },
  { text: 'Social Events', link: '/social-events' },
  { text: 'Book a Doctor', link: '/book-doctor' },
  { text: 'Volunteer Help', link: '/volunteer-help' },
  { text: 'Avoid Scams', link: '/avoid-scams' },
  { text: 'My Account', link: '/my-account' }
]
const currentUser = ref(null)
const router = useRouter()
function loadUser() {
  const user = localStorage.getItem('currentUser')
  currentUser.value = user ? JSON.parse(user) : null
}
function signOut() {
  localStorage.removeItem('currentUser')
  window.__auth = { isAuthenticated: false, user: null }
  window.dispatchEvent(new Event('auth-changed'))
  router.push('/')
}
onMounted(() => {
  loadUser()
  window.addEventListener('auth-changed', loadUser)
})
</script>

<style scoped>
.nav-link.active {
  color: #fff !important;
  background-color: #3a6cf6 !important;
  border-radius: 20px;
}
</style> 