<template>
  <div class="my-account-page">
    <!-- 装饰背景 -->
    <div class="page-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-line line-1"></div>
      <div class="decoration-dots dots-1"></div>
      <div class="decoration-square square-1"></div>
    </div>
    
    <div class="page-title-section">
      <div class="container">
        <h1 class="page-title">My Account</h1>
      </div>
    </div>
    
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-8 col-md-10 col-sm-12">
          <!-- 个人信息卡片 -->
          <div class="account-card mb-4">
            <div class="card-header">
              <i class="fas fa-user-circle"></i>
              <h3>Personal Information</h3>
            </div>
            <div class="card-body">
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">
                    <i class="fas fa-user me-2"></i>Username
                  </div>
                  <div class="info-value">{{ currentUser?.username || 'Not available' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">
                    <i class="fas fa-envelope me-2"></i>Email
                  </div>
                  <div class="info-value">{{ currentUser?.email || 'Not available' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">
                    <i class="fas fa-shield-alt me-2"></i>Role
                  </div>
                  <div class="info-value">
                    <span class="role-badge" :class="getRoleClass(currentUser?.role)">
                      {{ currentUser?.role || 'Unknown' }}
                    </span>
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-label">
                    <i class="fas fa-calendar-alt me-2"></i>Member Since
                  </div>
                  <div class="info-value">{{ getMemberSince() }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 密码修改卡片 -->
          <div class="account-card mb-4">
            <div class="card-header">
              <i class="fas fa-lock"></i>
              <h3>Change Password</h3>
            </div>
            <div class="card-body">
              <form @submit.prevent="changePassword">
                <div class="row g-3">
                  <div class="col-12">
                    <label class="form-label">
                      <i class="fas fa-key me-2"></i>Current Password
                    </label>
                    <input 
                      v-model="passwordForm.currentPassword" 
                      type="password" 
                      class="form-control" 
                      :class="{'is-invalid': errors.currentPassword}"
                      placeholder="Enter your current password"
                    />
                    <div v-if="errors.currentPassword" class="invalid-feedback d-block">
                      {{ errors.currentPassword }}
                    </div>
                  </div>
                  <div class="col-lg-6 col-md-6 col-sm-12">
                    <label class="form-label">
                      <i class="fas fa-lock me-2"></i>New Password
                    </label>
                    <input 
                      v-model="passwordForm.newPassword" 
                      type="password" 
                      class="form-control" 
                      :class="{'is-invalid': errors.newPassword}"
                      placeholder="Enter new password"
                    />
                    <div v-if="errors.newPassword" class="invalid-feedback d-block">
                      {{ errors.newPassword }}
                    </div>
                  </div>
                  <div class="col-lg-6 col-md-6 col-sm-12">
                    <label class="form-label">
                      <i class="fas fa-lock me-2"></i>Confirm New Password
                    </label>
                    <input 
                      v-model="passwordForm.confirmPassword" 
                      type="password" 
                      class="form-control" 
                      :class="{'is-invalid': errors.confirmPassword}"
                      placeholder="Confirm new password"
                    />
                    <div v-if="errors.confirmPassword" class="invalid-feedback d-block">
                      {{ errors.confirmPassword }}
                    </div>
                  </div>
                </div>
                <div class="password-requirements mt-3">
                  <h6 class="requirements-title">
                    <i class="fas fa-info-circle me-2"></i>Password Requirements:
                  </h6>
                  <ul class="requirements-list">
                    <li :class="{ 'met': isRequirementMet('length') }">
                      <i :class="isRequirementMet('length') ? 'fas fa-check' : 'fas fa-times'"></i>
                      At least 8 characters long
                    </li>
                    <li :class="{ 'met': isRequirementMet('uppercase') }">
                      <i :class="isRequirementMet('uppercase') ? 'fas fa-check' : 'fas fa-times'"></i>
                      Contains uppercase letter
                    </li>
                    <li :class="{ 'met': isRequirementMet('lowercase') }">
                      <i :class="isRequirementMet('lowercase') ? 'fas fa-check' : 'fas fa-times'"></i>
                      Contains lowercase letter
                    </li>
                    <li :class="{ 'met': isRequirementMet('number') }">
                      <i :class="isRequirementMet('number') ? 'fas fa-check' : 'fas fa-times'"></i>
                      Contains number
                    </li>
                  </ul>
                </div>
                <div class="form-actions mt-4 d-flex justify-content-between align-items-center">
                  <button type="submit" class="btn btn-primary" :disabled="!isPasswordValid">
                    <i class="fas fa-key me-2"></i>Change Password
                  </button>
                  <button type="button" class="btn btn-outline-danger" @click="confirmLogout">
                    <i class="fas fa-sign-out-alt me-2"></i>Logout
                  </button>
                </div>
              </form>
            </div>
          </div>


        </div>
      </div>
    </div>

    <!-- 登出确认模态框 -->
    <div v-if="showLogoutModal" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content custom-modal">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-sign-out-alt me-2"></i>
              Confirm Logout
            </h5>
            <button type="button" class="btn-close" @click="showLogoutModal = false"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to logout from your account?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showLogoutModal = false">
              Cancel
            </button>
            <button type="button" class="btn btn-danger" @click="logout">
              <i class="fas fa-sign-out-alt me-2"></i>Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentUser = ref(null)
const showLogoutModal = ref(false)

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const errors = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 获取当前用户信息
function getCurrentUser() {
  const user = localStorage.getItem('currentUser')
  return user ? JSON.parse(user) : null
}

// 获取角色样式类
function getRoleClass(role) {
  const roleClasses = {
    'admin': 'role-admin',
    'doctor': 'role-doctor',
    'user': 'role-user'
  }
  return roleClasses[role] || 'role-unknown'
}

// 获取会员时间
function getMemberSince() {
  if (!currentUser.value) return 'Unknown'
  // 这里可以根据实际需求从用户数据中获取注册时间
  return 'January 2024'
}

// 密码验证
function isRequirementMet(requirement) {
  const password = passwordForm.newPassword
  switch (requirement) {
    case 'length':
      return password.length >= 8
    case 'uppercase':
      return /[A-Z]/.test(password)
    case 'lowercase':
      return /[a-z]/.test(password)
    case 'number':
      return /\d/.test(password)
    default:
      return false
  }
}

// 密码是否有效
const isPasswordValid = computed(() => {
  return passwordForm.newPassword.length >= 8 &&
         /[A-Z]/.test(passwordForm.newPassword) &&
         /[a-z]/.test(passwordForm.newPassword) &&
         /\d/.test(passwordForm.newPassword) &&
         passwordForm.newPassword === passwordForm.confirmPassword
})

// 修改密码
function changePassword() {
  // 重置错误信息
  Object.keys(errors).forEach(key => errors[key] = '')
  
  // 验证当前密码
  if (!passwordForm.currentPassword) {
    errors.currentPassword = 'Current password is required'
    return
  }
  
  // 验证新密码
  if (!isPasswordValid.value) {
    errors.newPassword = 'Password does not meet requirements'
    return
  }
  
  // 验证确认密码
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    return
  }
  
  // 这里应该调用API来修改密码
  // 模拟成功
  alert('Password changed successfully!')
  
  // 清空表单
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

// 确认登出
function confirmLogout() {
  showLogoutModal.value = true
}

// 登出
function logout() {
  localStorage.removeItem('currentUser')
  window.__auth = { isAuthenticated: false, user: null }
  window.dispatchEvent(new Event('auth-changed'))
  router.push('/')
}

onMounted(() => {
  currentUser.value = getCurrentUser()
  window.addEventListener('auth-changed', () => {
    currentUser.value = getCurrentUser()
  })
})
</script>

<style scoped>
.my-account-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
  overflow: hidden;
}

/* 装饰背景 */
.page-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 10%;
  animation-delay: 2s;
}

.decoration-line {
  position: absolute;
  background: linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.2) 50%, transparent 100%);
  animation: slide 8s linear infinite;
}

.line-1 {
  width: 300px;
  height: 2px;
  top: 30%;
  left: -300px;
  animation-delay: 1s;
}

.decoration-dots {
  position: absolute;
  display: flex;
  gap: 10px;
  animation: fadeInOut 4s ease-in-out infinite;
}

.dots-1 {
  top: 20%;
  right: 15%;
  animation-delay: 3s;
}

.decoration-dots::before,
.decoration-dots::after {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.3);
}

.decoration-square {
  position: absolute;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
  transform: rotate(45deg);
  animation: rotate 10s linear infinite;
}

.square-1 {
  bottom: 20%;
  left: 20%;
  animation-delay: 2s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes slide {
  0% { transform: translateX(0px); }
  100% { transform: translateX(calc(100vw + 300px)); }
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

@keyframes rotate {
  0% { transform: rotate(45deg); }
  100% { transform: rotate(405deg); }
}

/* 页面标题样式 */
.page-title-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 0;
  text-align: center;
  position: relative;
  z-index: 1;
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

/* 账户卡片样式 */
.account-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.card-header i {
  font-size: 2rem;
}

.card-header h3 {
  margin: 0;
  font-weight: 600;
  font-size: 1.5rem;
}

.card-body {
  padding: 2rem;
}

/* 信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.info-item {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.info-label {
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.info-value {
  color: #2d3748;
  font-size: 1.1rem;
  font-weight: 500;
}

/* 角色徽章 */
.role-badge {
  display: inline-block;
  padding: 0.25rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: capitalize;
}

.role-admin {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  color: white;
}

.role-doctor {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  color: white;
}

.role-user {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.role-unknown {
  background: #e2e8f0;
  color: #4a5568;
}

/* 表单样式 */
.form-label {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.form-control {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* 密码要求 */
.password-requirements {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  border-left: 4px solid #667eea;
}

.requirements-title {
  color: #2d3748;
  font-weight: 600;
  margin-bottom: 1rem;
}

.requirements-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.requirements-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #718096;
  font-size: 0.9rem;
}

.requirements-list li.met {
  color: #38a169;
}

.requirements-list li i {
  font-size: 0.8rem;
}

.requirements-list li.met i {
  color: #38a169;
}

.requirements-list li:not(.met) i {
  color: #e53e3e;
}

/* 表单操作 */
.form-actions {
  text-align: center;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  padding: 0.75rem 2rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}



/* 模态框样式 */
.custom-modal {
  border-radius: 20px;
  border: none;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px 20px 0 0;
  border-bottom: none;
}

.modal-title {
  font-weight: 600;
}

.btn-close {
  filter: invert(1);
}

.btn-danger {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
}

.btn-secondary {
  background: #718096;
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .page-title-section {
    padding: 2rem 0;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .card-header {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .card-header h3 {
    font-size: 1.25rem;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 1rem;
  }
  
  .form-actions .btn {
    width: 100%;
  }
  
  /* 在移动端隐藏装饰元素 */
  .decoration-circle,
  .decoration-line,
  .decoration-dots,
  .decoration-square {
    display: none;
  }
}

.container {
  margin-top: 80px;
}
</style> 