<script setup>
import { ref, onMounted } from 'vue'

import socialEventsImage from '@/asserts/pexels-photo-3768131.jpeg'
import bookDoctorImage from '@/asserts/pexels-photo-5215024.jpeg'
import volunteerHelpImage from '@/asserts/pexels-photo-6646917.jpeg'
import avoidScamsImage from '@/asserts/pexels-photo-590022.jpeg'

const isAuthenticated = ref(false)
const currentUser = ref(null)

const checkAuth = () => {
  // Get user from auth service instead of localStorage
  const user = window.authService ? window.authService.getCurrentUser() : null
  isAuthenticated.value = !!user
  currentUser.value = user
}

onMounted(() => {
  checkAuth()
  window.addEventListener('auth-change', checkAuth)
})

const cards = [
  {
    title: 'Social Events',
    desc: 'Find and join offline or online activities to stay active and connected.',
    link: '/social-events',
    image: socialEventsImage,
    icon: 'fas fa-calendar-alt'
  },
  {
    title: 'Book a Doctor',
    desc: 'Easily book appointments with trusted doctors and keep track of your health.',
    link: '/book-doctor',
    image: bookDoctorImage,
    icon: 'fas fa-user-md'
  },
  {
    title: 'Volunteer Help',
    desc: 'Connect with volunteers for companionship or technical assistance.',
    link: '/volunteer-help',
    image: volunteerHelpImage,
    icon: 'fas fa-hands-helping'
  },
  {
    title: 'Avoid Scams',
    desc: 'Learn about common scams, get safety alerts, and find emergency contacts.',
    link: '/avoid-scams',
    image: avoidScamsImage,
    icon: 'fas fa-shield-alt'
  }
]
</script>

<template>
  <div v-if="!isAuthenticated" class="home-bg">
    <!-- 装饰背景 -->
    <div class="page-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-line line-1"></div>
      <div class="decoration-dots dots-1"></div>
      <div class="decoration-square square-1"></div>
    </div>
    
    <div class="welcome-modal">
      <div class="welcome-icon">
        <i class="fas fa-heartbeat"></i>
      </div>
      <h2 class="welcome-title">Welcome to SeniorWellness - Your Partner in Healthy Aging</h2>
      <p class="welcome-desc">Discover resources, connections, and care to live your best life in your golden years.</p>
      <div class="welcome-btns">
        <router-link to="/login" class="btn btn-primary btn-lg rounded-pill me-3">
          <i class="fas fa-sign-in-alt me-2"></i>Sign in
        </router-link>
        <router-link to="/register" class="btn btn-primary btn-lg rounded-pill">
          <i class="fas fa-user-plus me-2"></i>Sign up
        </router-link>
      </div>
    </div>
    
    <!-- 联系信息 -->
    <div class="contact-info">
      <div class="contact-item">
        <i class="fas fa-phone"></i>
        <span>1-800-SENIOR-WELL</span>
      </div>
      <div class="contact-item">
        <i class="fas fa-envelope"></i>
        <span>support@seniorwellness.com</span>
      </div>
    </div>
  </div>
  <div v-else class="home-page">
    <!-- 装饰背景 -->
    <div class="page-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-line line-1"></div>
      <div class="decoration-dots dots-1"></div>
      <div class="decoration-square square-1"></div>
    </div>
    
    <div class="container py-5">
      <div class="welcome-header mb-5">
        <div class="welcome-card">
          <div class="welcome-icon">
            <i class="fas fa-home"></i>
          </div>
          <h1 class="welcome-back">Welcome back, {{ currentUser?.displayName || currentUser?.email || 'User' }}!</h1>
          <p class="welcome-subtitle">Explore our services below</p>
        </div>
      </div>
      
      <div class="services-section">
        <div class="section-header mb-4">
          <h2 class="section-title">
            <i class="fas fa-star me-2"></i>
            Our Services
          </h2>
          <p class="section-subtitle">Everything you need for a healthy and connected lifestyle</p>
        </div>
        
        <div class="row justify-content-center">
          <div class="col-3 mb-4" v-for="card in cards" :key="card.title">
            <div class="service-card h-100">
              <div class="card-header">
                <div class="card-icon">
                  <i :class="card.icon"></i>
                </div>
                <img :src="card.image" class="card-img" alt="...">
              </div>
              <div class="card-body d-flex flex-column">
                <h5 class="card-title">{{ card.title }}</h5>
                <p class="card-text flex-grow-1">{{ card.desc }}</p>
                <router-link :to="card.link" class="btn btn-outline-primary mt-auto">
                  Learn More <i class="fas fa-arrow-right ms-1"></i>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 联系信息 -->
      <div class="contact-section mt-5">
        <div class="row justify-content-center">
          <div class="col-xl-8 col-lg-10 col-md-12">
            <div class="contact-card">
              <div class="card-header">
                <i class="fas fa-headset"></i>
                <h3>Need Help? Contact Us</h3>
              </div>
              <div class="card-body">
                <div class="row justify-content-center">
                  <div class="col-lg-6 col-md-6 col-sm-12 mb-3">
                    <div class="contact-item-dashboard">
                      <i class="fas fa-phone"></i>
                      <div>
                        <strong>Phone</strong>
                        <span>1-800-SENIOR-WELL</span>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-6 col-md-6 col-sm-12 mb-3">
                    <div class="contact-item-dashboard">
                      <i class="fas fa-envelope"></i>
                      <div>
                        <strong>Email</strong>
                        <span>support@seniorwellness.com</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 未登录用户样式 */
.home-bg {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* 已登录用户样式 */
.home-page {
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

/* 欢迎模态框样式 */
.welcome-modal {
  position: relative;
  z-index: 2;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  padding: 3rem 2rem;
  max-width: 500px;
  width: 100%;
  text-align: center;
}

.welcome-icon {
  font-size: 3rem;
  color: #667eea;
  margin-bottom: 1.5rem;
  animation: gentle-pulse 3s ease-in-out infinite;
}

@keyframes gentle-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.welcome-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #2d3748;
}

.welcome-desc {
  color: #718096;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.welcome-btns .btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 25px;
  padding: 0.75rem 2rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.welcome-btns .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

/* 联系信息样式 */
.contact-info {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 2rem;
  z-index: 3;
  background: rgba(255, 255, 255, 0.95);
  padding: 1rem 2rem;
  border-radius: 25px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #667eea;
  font-weight: 600;
  font-size: 0.9rem;
}

.contact-item i {
  font-size: 1rem;
}

/* 已登录用户样式 */
.welcome-header {
  position: relative;
  z-index: 1;
}

.welcome-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  text-align: center;
  border: 1px solid #e2e8f0;
}

.welcome-card .welcome-icon {
  font-size: 2.5rem;
  color: #667eea;
  margin-bottom: 1rem;
}

.welcome-back {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.welcome-subtitle {
  color: #718096;
  font-size: 1.2rem;
  margin-bottom: 0;
}

/* 服务部分 */
.services-section {
  position: relative;
  z-index: 1;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  color: #2d3748;
  font-weight: 700;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.section-subtitle {
  color: #718096;
  font-size: 1.1rem;
  margin: 0;
}

/* 服务卡片 */
.service-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.service-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.card-header {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.service-card:hover .card-img {
  transform: scale(1.05);
}

.card-icon {
  position: absolute;
  top: 15px;
  right: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  z-index: 2;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.card-body {
  padding: 1.5rem;
  height: calc(100% - 200px);
}

.card-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.75rem;
}

.card-text {
  color: #718096;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.btn-outline-primary {
  border: 2px solid #667eea;
  color: #667eea;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-outline-primary:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

/* 联系信息卡片 */
.contact-section {
  position: relative;
  z-index: 1;
}

.contact-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.contact-card .card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  height: auto;
}

.contact-card .card-header i {
  font-size: 2rem;
}

.contact-card .card-header h3 {
  margin: 0;
  font-weight: 600;
  font-size: 1.5rem;
}

.contact-card .card-body {
  padding: 2rem;
  height: auto;
}

.contact-item-dashboard {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 15px;
  border-left: 4px solid #667eea;
  transition: all 0.3s ease;
  height: 100%;
}

.contact-item-dashboard:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.contact-item-dashboard i {
  font-size: 1.8rem;
  color: #667eea;
}

.contact-item-dashboard div {
  text-align: left;
}

.contact-item-dashboard strong {
  display: block;
  color: #2d3748;
  font-size: 1rem;
  margin-bottom: 0.25rem;
  font-weight: 600;
}

.contact-item-dashboard span {
  color: #718096;
  font-size: 1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .welcome-back {
    font-size: 2rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .welcome-card {
    padding: 1.5rem;
  }
  
  .contact-info {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
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
