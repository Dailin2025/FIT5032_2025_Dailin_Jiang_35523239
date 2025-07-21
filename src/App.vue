<template>
  <NavBar />
  <div class="app-background">
    <div class="global-container">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import NavBar from './components/NavBar.vue'
</script>

<style>
body {
  background-color: #f8f9fa;
}
</style>

<style scoped>
.app-background {
  position: relative;
  overflow: hidden;
}

.app-background::before {
  content: '';
  position: absolute;
  top: -20%;
  left: -20%;
  width: 60%;
  height: 60%;
  background: radial-gradient(circle, rgba(75, 108, 243, 0.1), transparent 70%);
  border-radius: 50%;
  z-index: 0;
}

.app-background::after {
  content: '';
  position: absolute;
  bottom: -20%;
  right: -20%;
  width: 60%;
  height: 60%;
  background: radial-gradient(circle, rgba(243, 75, 168, 0.1), transparent 70%);
  border-radius: 50%;
  z-index: 0;
}

.global-container {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 32px auto 0 auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 32px rgba(60,60,60,0.08);
  padding: 32px 24px 40px 24px;
  min-height: 80vh;
}
@media (max-width: 600px) {
  .global-container {
    padding: 12px 2vw 24px 2vw;
    border-radius: 0;
  }
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px 48px 16px 48px;
  background: #f5f6fa;
  border-bottom: 2px solid #d1d5db;
}
.logo {
  font-size: 2rem;
  font-weight: 600;
  color: #222;
}
.guest-btn {
  background: #6c3fc5;
  color: #fff;
  border: none;
  border-radius: 2em;
  padding: 12px 40px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.guest-btn:hover {
  background: #4b278a;
}

.welcome-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
}
.welcome-card {
  background: #fff;
  box-shadow: 0 4px 32px rgba(60,60,60,0.08);
  border-radius: 8px;
  padding: 48px 40px 40px 40px;
  max-width: 600px;
  text-align: center;
}
.welcome-card h1 {
  font-size: 2rem;
  font-weight: 500;
  margin-bottom: 18px;
  color: #222;
}
.welcome-card p {
  font-size: 1.1rem;
  color: #444;
  margin-bottom: 32px;
}
.btn-group {
  display: flex;
  justify-content: center;
  gap: 32px;
}
.sign-btn {
  background: #232c6a;
  color: #fff;
  border: none;
  border-radius: 2em;
  padding: 12px 40px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.sign-btn:hover {
  background: #6c3fc5;
}
</style> 