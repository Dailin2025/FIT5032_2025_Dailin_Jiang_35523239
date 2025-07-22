<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-md-8 mx-auto">
        <div class="card">
          <div class="card-header">
            <h2>My Account</h2>
          </div>
          <div class="card-body">
            <!-- User Information -->
            <div v-if="currentUser" class="mb-4">
              <h4>Personal Information</h4>
              <div class="row">
                <div class="col-md-6">
                  <p><strong>Username:</strong> {{ currentUser.username }}</p>
                  <p><strong>Email:</strong> {{ currentUser.email }}</p>
                  <p><strong>Role:</strong> {{ currentUser.role }}</p>
                </div>
              </div>
            </div>

            <!-- Change Password Form -->
            <div class="mt-4">
              <h4>Change Password</h4>
              <form @submit.prevent="changePassword">
                <div class="mb-3">
                  <label class="form-label">Current Password</label>
                  <input v-model="passwordForm.currentPassword" type="password" class="form-control" :class="{'is-invalid': errors.currentPassword}" />
                  <div class="invalid-feedback" v-if="errors.currentPassword">{{ errors.currentPassword }}</div>
                </div>
                <div class="mb-3">
                  <label class="form-label">New Password</label>
                  <input v-model="passwordForm.newPassword" type="password" class="form-control" :class="{'is-invalid': errors.newPassword}" />
                  <div class="invalid-feedback" v-if="errors.newPassword">{{ errors.newPassword }}</div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Confirm New Password</label>
                  <input v-model="passwordForm.confirmPassword" type="password" class="form-control" :class="{'is-invalid': errors.confirmPassword}" />
                  <div class="invalid-feedback" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</div>
                </div>
                <button type="submit" class="btn btn-primary">Change Password</button>
              </form>
              <div class="mt-3 text-success" v-if="successMsg">{{ successMsg }}</div>
              <div class="mt-3 text-danger" v-if="errorMsg">{{ errorMsg }}</div>
            </div>

            <!-- Logout Button -->
            <div class="mt-4">
              <button @click="logout" class="btn btn-danger">Logout</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { validatePassword } from '@/utils/security.js'

const router = useRouter()
const currentUser = ref(null)
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const errors = reactive({})
const successMsg = ref('')
const errorMsg = ref('')

function validatePasswordChange() {
  errors.currentPassword = ''
  errors.newPassword = ''
  errors.confirmPassword = ''
  
  if (!passwordForm.currentPassword) {
    errors.currentPassword = 'Current password is required.'
  } else if (passwordForm.currentPassword !== currentUser.value.password) {
    errors.currentPassword = 'Current password is incorrect.'
  }
  
  if (!passwordForm.newPassword) {
    errors.newPassword = 'New password is required.'
  } else if (!validatePassword(passwordForm.newPassword)) {
    errors.newPassword = 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number.'
  }
  
  if (!passwordForm.confirmPassword) {
    errors.confirmPassword = 'Please confirm your new password.'
  } else if (passwordForm.confirmPassword !== passwordForm.newPassword) {
    errors.confirmPassword = 'Passwords do not match.'
  }
  
  return !errors.currentPassword && !errors.newPassword && !errors.confirmPassword
}

function changePassword() {
  if (!validatePasswordChange()) return
  
  // Update password in localStorage
  const users = JSON.parse(localStorage.getItem('users') || '[]')
  const userIndex = users.findIndex(u => u.username === currentUser.value.username)
  
  if (userIndex !== -1) {
    users[userIndex].password = passwordForm.newPassword
    localStorage.setItem('users', JSON.stringify(users))
    
    // Update current user
    currentUser.value.password = passwordForm.newPassword
    localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
    
    successMsg.value = 'Password changed successfully!'
    errorMsg.value = ''
    
    // Clear form
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  }
}

function logout() {
  localStorage.removeItem('currentUser')
  window.__auth = { isAuthenticated: false, user: null }
  window.dispatchEvent(new Event('auth-changed'))
  router.push('/login')
}

onMounted(() => {
  currentUser.value = JSON.parse(localStorage.getItem('currentUser'))
  if (!currentUser.value) {
    router.push('/login')
  }
})
</script>

<style scoped>
.container {
  margin-top: 80px;
}
</style> 