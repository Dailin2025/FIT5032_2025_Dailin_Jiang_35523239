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
  errors.username = form.username ? '' : 'Username is required.'
  errors.email = form.email ? (/^\S+@\S+\.\S+$/.test(form.email) ? '' : 'Invalid email format.') : 'Email is required.'
  errors.password = form.password ? (form.password.length >= 6 ? '' : 'Password must be at least 6 characters.') : 'Password is required.'
  errors.confirmPassword = form.confirmPassword ? (form.confirmPassword === form.password ? '' : 'Passwords do not match.') : 'Please confirm your password.'
  errors.role = form.role ? '' : 'Role is required.'
  return !errors.username && !errors.email && !errors.password && !errors.confirmPassword && !errors.role
}

function handleRegister() {
  if (!validate()) return
  const users = JSON.parse(localStorage.getItem('users') || '[]')
  users.push({ ...form })
  localStorage.setItem('users', JSON.stringify(users))
  successMsg.value = 'Registration successful! Redirecting to login...'
  setTimeout(() => {
    router.push('/login')
  }, 1000)
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