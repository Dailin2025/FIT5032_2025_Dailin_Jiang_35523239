<template>
  <div class="register-container">
    <div class="background-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
      <div class="circle circle-4"></div>
    </div>
    
    <div class="d-flex justify-content-center align-items-center min-vh-100">
      <div class="col-md-6 col-lg-5">
        <div class="register-card">
          <div class="card-header text-center mb-4">
            <div class="register-icon">
              <i class="fas fa-user-plus"></i>
            </div>
            <h2 class="register-title">Create Account</h2>
            <p class="register-subtitle">Join our community today</p>
          </div>
          
          <form @submit.prevent="handleRegister" class="register-form">
            <div class="form-group mb-4">
              <label class="form-label">
                <i class="fas fa-user me-2"></i>Username
              </label>
              <div class="input-wrapper">
                <input 
                  v-model="form.username" 
                  type="text" 
                  class="form-control custom-input" 
                  :class="{'is-invalid': errors.username}"
                  placeholder="Choose a username"
                />
                <div class="input-focus-border"></div>
              </div>
              <div class="invalid-feedback" v-if="errors.username">{{ errors.username }}</div>
            </div>
            
            <div class="form-group mb-4">
              <label class="form-label">
                <i class="fas fa-envelope me-2"></i>Email Address
              </label>
              <div class="input-wrapper">
                <input 
                  v-model="form.email" 
                  type="email" 
                  class="form-control custom-input" 
                  :class="{'is-invalid': errors.email}"
                  placeholder="Enter your email"
                />
                <div class="input-focus-border"></div>
              </div>
              <div class="invalid-feedback" v-if="errors.email">{{ errors.email }}</div>
            </div>
            
            <div class="form-group mb-4">
              <label class="form-label">
                <i class="fas fa-lock me-2"></i>Password
              </label>
              <div class="input-wrapper">
                <input 
                  v-model="form.password" 
                  type="password" 
                  class="form-control custom-input" 
                  :class="{'is-invalid': errors.password}"
                  placeholder="Create a strong password"
                />
                <div class="input-focus-border"></div>
              </div>
              <div class="invalid-feedback" v-if="errors.password">{{ errors.password }}</div>
            </div>
            
            <div class="form-group mb-4">
              <label class="form-label">
                <i class="fas fa-shield-alt me-2"></i>Confirm Password
              </label>
              <div class="input-wrapper">
                <input 
                  v-model="form.confirmPassword" 
                  type="password" 
                  class="form-control custom-input" 
                  :class="{'is-invalid': errors.confirmPassword}"
                  placeholder="Confirm your password"
                />
                <div class="input-focus-border"></div>
              </div>
              <div class="invalid-feedback" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</div>
            </div>
            
            <div class="form-group mb-4">
              <label class="form-label">
                <i class="fas fa-user-tag me-2"></i>Role
              </label>
              <div class="input-wrapper">
                <select 
                  v-model="form.role" 
                  class="form-select custom-input" 
                  :class="{'is-invalid': errors.role}"
                >
                  <option value="">Select your role</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="doctor">Doctor</option>
                </select>
                <div class="input-focus-border"></div>
              </div>
              <div class="invalid-feedback" v-if="errors.role">{{ errors.role }}</div>
            </div>
            
            <button type="submit" class="btn btn-primary register-btn w-100 mb-3">
              <i class="fas fa-user-plus me-2"></i>
              Create Account
            </button>
            
            <div class="text-center">
              <p class="login-link">
                Already have an account? 
                <router-link to="/login" class="link-primary">Sign in here</router-link>
              </p>
            </div>
            
            <div class="alert alert-success mt-3" v-if="successMsg" role="alert">
              <i class="fas fa-check-circle me-2"></i>{{ successMsg }}
            </div>
          </form>
        </div>
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
.register-container {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 180px;
  height: 180px;
  top: 15%;
  left: 5%;
  animation-delay: 0s;
}

.circle-2 {
  width: 120px;
  height: 120px;
  top: 70%;
  right: 15%;
  animation-delay: 2s;
}

.circle-3 {
  width: 90px;
  height: 90px;
  bottom: 15%;
  left: 25%;
  animation-delay: 4s;
}

.circle-4 {
  width: 150px;
  height: 150px;
  top: 40%;
  right: 5%;
  animation-delay: 1s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

.register-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.register-icon {
  font-size: 3rem;
  color: #667eea;
  margin-bottom: 1rem;
}

.register-title {
  color: #2d3748;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.register-subtitle {
  color: #718096;
  font-size: 0.95rem;
  margin-bottom: 0;
}

.form-label {
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.input-wrapper {
  position: relative;
}

.custom-input {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
}

.custom-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  outline: none;
}

.custom-input.is-invalid {
  border-color: #e53e3e;
}

.form-select.custom-input {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m1 6 7 7 7-7'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 16px 12px;
  padding-right: 2.5rem;
}

.register-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.register-btn:active {
  transform: translateY(0);
}

.login-link {
  color: #718096;
  font-size: 0.9rem;
  margin-bottom: 0;
}

.login-link a {
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.login-link a:hover {
  color: #667eea;
}

.alert {
  border-radius: 12px;
  border: none;
  font-weight: 500;
}

.alert-success {
  background: rgba(72, 187, 120, 0.1);
  color: #2f855a;
}

@media (max-width: 768px) {
  .register-card {
    margin: 1rem;
    padding: 2rem;
  }
  
  .circle {
    display: none;
  }
}
</style> 