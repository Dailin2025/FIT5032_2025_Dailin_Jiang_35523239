<template>
  <div class="d-flex justify-content-center align-items-center min-vh-100">
    <div class="col-md-6">
      <div class="card p-4">
        <h2 class="mb-4 text-center">Login</h2>
        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input v-model="form.email" type="email" class="form-control" :class="{'is-invalid': errors.email}" />
            <div class="invalid-feedback" v-if="errors.email">{{ errors.email }}</div>
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
import { validateEmail, sanitizeInput } from '@/utils/security.js'

const router = useRouter()

const form = reactive({
  email: '',
  password: ''
})
const errors = reactive({})
const errorMsg = ref('')
const successMsg = ref('')

function validate() {
  // Sanitize inputs
  const sanitizedEmail = sanitizeInput(form.email.trim())
  
  errors.email = ''
  errors.password = ''
  
  // Email validation
  if (!sanitizedEmail) {
    errors.email = 'Email is required.'
  } else if (!validateEmail(sanitizedEmail)) {
    errors.email = 'Invalid email format.'
  }
  
  // Password validation
  if (!form.password) {
    errors.password = 'Password is required.'
  }
  
  return !errors.email && !errors.password
}

function handleLogin() {
  if (!validate()) return
  
  const sanitizedEmail = sanitizeInput(form.email.trim())
  const users = JSON.parse(localStorage.getItem('users') || '[]')
  const user = users.find(u => u.email === sanitizedEmail && u.password === form.password)
  
  if (!user) {
    errorMsg.value = 'Invalid email or password.'
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