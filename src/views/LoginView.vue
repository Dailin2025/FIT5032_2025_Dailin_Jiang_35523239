<template>
  <div class="login-container">
    <div class="background-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>
    
    <div class="d-flex justify-content-center align-items-center min-vh-100">
      <div class="col-md-5 col-lg-4">
        <div class="login-card">
          <div class="card-header text-center mb-4">
            <div class="login-icon">
              <i class="fas fa-user-circle"></i>
            </div>
            <h2 class="login-title">Welcome Back</h2>
            <p class="login-subtitle">Sign in to your account</p>
          </div>
          
          <form @submit.prevent="handleLogin" class="login-form">
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
                  placeholder="Enter your password"
                />
                <div class="input-focus-border"></div>
              </div>
              <div class="invalid-feedback" v-if="errors.password">{{ errors.password }}</div>
            </div>
            
            <button type="submit" class="btn btn-primary login-btn w-100 mb-3">
              <i class="fas fa-sign-in-alt me-2"></i>
              Sign In
            </button>
            
            <div class="text-center">
              <p class="register-link">
                Don't have an account? 
                <router-link to="/register" class="link-primary">Sign up here</router-link>
              </p>
            </div>
            
            <div class="alert alert-danger mt-3" v-if="errorMsg" role="alert">
              <i class="fas fa-exclamation-triangle me-2"></i>{{ errorMsg }}
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
  email: '',
  password: ''
})
const errors = reactive({})
const errorMsg = ref('')
const successMsg = ref('')

function validate() {
  errors.email = form.email ? (/^\S+@\S+\.\S+$/.test(form.email) ? '' : 'Invalid email format.') : 'Email is required.'
  errors.password = form.password ? '' : 'Password is required.'
  return !errors.email && !errors.password
}

async function handleLogin() {
  if (!validate()) return
  
  try {
    if (window.authService) {
      const result = await window.authService.loginWithEmail(form.email, form.password)
      
      if (result.success) {
        successMsg.value = 'Login successful! Redirecting...'
        errorMsg.value = ''
        setTimeout(() => {
          router.push('/')
        }, 1000)
      } else {
        errorMsg.value = result.error
      }
    } else {
      errorMsg.value = 'Authentication service not available.'
    }
  } catch (error) {
    console.error('Login error:', error)
    errorMsg.value = 'An error occurred during login.'
  }
}
</script>

<style scoped>
.login-container {
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

.circle-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.login-card {
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

.login-icon {
  font-size: 3rem;
  color: #667eea;
  margin-bottom: 1rem;
}

.login-title {
  color: #2d3748;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.login-subtitle {
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

.login-btn {
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

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.login-btn:active {
  transform: translateY(0);
}

.register-link {
  color: #718096;
  font-size: 0.9rem;
  margin-bottom: 0;
}

.register-link a {
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.register-link a:hover {
  color: #667eea;
}

.alert {
  border-radius: 12px;
  border: none;
  font-weight: 500;
}

.alert-danger {
  background: rgba(229, 62, 62, 0.1);
  color: #c53030;
}

.alert-success {
  background: rgba(72, 187, 120, 0.1);
  color: #2f855a;
}

@media (max-width: 768px) {
  .login-card {
    margin: 1rem;
    padding: 2rem;
  }
  
  .circle {
    display: none;
  }
}
</style> 