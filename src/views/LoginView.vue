<template>
  <div class="d-flex justify-content-center align-items-center min-vh-100">
    <div class="col-md-6">
      <div class="card p-4">
        <h2 class="mb-4 text-center">Login</h2>
        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label class="form-label">Username</label>
            <input v-model="form.username" type="text" class="form-control" :class="{'is-invalid': errors.username}" />
            <div class="invalid-feedback" v-if="errors.username">{{ errors.username }}</div>
          </div>
          <div class="mb-3">
            <label class="form-label">Password</label>
            <input v-model="form.password" type="password" class="form-control" :class="{'is-invalid': errors.password}" />
            <div class="invalid-feedback" v-if="errors.password">{{ errors.password }}</div>
          </div>
          <button type="submit" class="btn btn-primary w-100">Login</button>
          <div class="mt-3 text-danger" v-if="errorMsg">{{ errorMsg }}</div>
          <div class="mt-3 text-success" v-if="successMsg">{{ successMsg }}</div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
  username: '',
  password: ''
})
const errors = reactive({})
const errorMsg = ref('')
const successMsg = ref('')

function validate() {
  errors.username = form.username ? '' : 'Username is required.'
  errors.password = form.password ? (form.password.length >= 6 ? '' : 'Password must be at least 6 characters.') : 'Password is required.'
  return !errors.username && !errors.password
}

function handleLogin() {
  if (!validate()) return
  const users = JSON.parse(localStorage.getItem('users') || '[]')
  const user = users.find(u => u.username === form.username && u.password === form.password)
  if (!user) {
    errorMsg.value = 'Invalid username or password.'
    return
  }
  localStorage.setItem('currentUser', JSON.stringify(user))
  window.__auth = { isAuthenticated: true, user }
  window.dispatchEvent(new Event('auth-changed'))
  successMsg.value = 'Login successful! Redirecting...'
  errorMsg.value = ''
  setTimeout(() => {
    router.push('/')
  }, 1000)
}
</script>

<style scoped>
.container {
  margin-top: 80px;
}
</style> 