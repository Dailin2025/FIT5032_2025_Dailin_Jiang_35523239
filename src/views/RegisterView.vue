<template>
  <div class="d-flex justify-content-center align-items-center min-vh-100">
      <div class="col-md-6">
      <div class="card p-4">
        <h2 class="mb-4 text-center">Register</h2>
        <form @submit.prevent="handleRegister">
          <div class="mb-3">
            <label class="form-label">Username</label>
            <input v-model="form.username" type="text" class="form-control" :class="{'is-invalid': errors.username}" />
            <div class="invalid-feedback" v-if="errors.username">{{ errors.username }}</div>
          </div>
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
          <div class="mb-3">
            <label class="form-label">Confirm Password</label>
            <input v-model="form.confirmPassword" type="password" class="form-control" :class="{'is-invalid': errors.confirmPassword}" />
            <div class="invalid-feedback" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</div>
          </div>
          <div class="mb-3">
            <label class="form-label">Role</label>
            <select v-model="form.role" class="form-select" :class="{'is-invalid': errors.role}">
              <option value="">Select Role</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
            </select>
            <div class="invalid-feedback" v-if="errors.role">{{ errors.role }}</div>
          </div>
          <button type="submit" class="btn btn-primary w-100">Register</button>
          <div class="mt-3 text-success" v-if="successMsg">{{ successMsg }}</div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { validateEmail, validatePassword, validateUsername, sanitizeInput } from '@/utils/security.js'

const router = useRouter()

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: ''
})
const errors = reactive({})
const successMsg = ref('')

function validate() {
  // Sanitize inputs
  const sanitizedUsername = sanitizeInput(form.username.trim())
  const sanitizedEmail = sanitizeInput(form.email.trim())
  
  errors.username = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''
  errors.role = ''
  
  // Username validation
  if (!sanitizedUsername) {
    errors.username = 'Username is required.'
  } else if (!validateUsername(sanitizedUsername)) {
    errors.username = 'Username must be 3-20 characters, alphanumeric and underscore only.'
  }
  
  // Email validation
  if (!sanitizedEmail) {
    errors.email = 'Email is required.'
  } else if (!validateEmail(sanitizedEmail)) {
    errors.email = 'Invalid email format.'
  }
  
  // Password validation
  if (!form.password) {
    errors.password = 'Password is required.'
  } else if (!validatePassword(form.password)) {
    errors.password = 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number.'
  }
  
  // Confirm password validation
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.'
  } else if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Passwords do not match.'
  }
  
  // Role validation
  if (!form.role) {
    errors.role = 'Role is required.'
  }
  
  return !errors.username && !errors.email && !errors.password && !errors.confirmPassword && !errors.role
}

function handleRegister() {
  if (!validate()) return
  
  // Sanitize data before saving
  const userData = {
    username: sanitizeInput(form.username.trim()),
    email: sanitizeInput(form.email.trim()),
    password: form.password, // Don't sanitize password
    role: form.role
  }
  
  const users = JSON.parse(localStorage.getItem('users') || '[]')
  
  // Check if username or email already exists
  const existingUser = users.find(u => u.username === userData.username || u.email === userData.email)
  if (existingUser) {
    if (existingUser.username === userData.username) {
      errors.username = 'Username already exists.'
    } else {
      errors.email = 'Email already exists.'
    }
    return
  }
  
  users.push(userData)
  localStorage.setItem('users', JSON.stringify(users))
  successMsg.value = 'Registration successful! Redirecting to login...'
  setTimeout(() => {
    router.push('/login')
  }, 1000)
  
  // Clear form
  form.username = ''
  form.email = ''
  form.password = ''
  form.confirmPassword = ''
  form.role = ''
}
</script>

<style scoped>
.container {
  margin-top: 80px;
}
</style> 