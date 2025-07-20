<script setup>
import { ref, onMounted } from 'vue'

const isAuthenticated = ref(false)
const currentUser = ref(null)

const checkAuth = () => {
  const user = localStorage.getItem('currentUser')
  isAuthenticated.value = !!user
  currentUser.value = user ? JSON.parse(user) : null
}

onMounted(() => {
  checkAuth()
  window.addEventListener('auth-changed', checkAuth)
})

const cards = [
  {
    title: 'Social Events',
    desc: 'Find and join offline or online activities to stay active and connected.',
    link: '/social-events'
  },
  {
    title: 'Book a Doctor',
    desc: 'Easily book appointments with trusted doctors and keep track of your health.',
    link: '/book-doctor'
  },
  {
    title: 'Volunteer Help',
    desc: 'Connect with volunteers for companionship or technical assistance.',
    link: '/volunteer-help'
  },
  {
    title: 'Avoid Scams',
    desc: 'Learn about common scams, get safety alerts, and find emergency contacts.',
    link: '/avoid-scams'
  }
]
</script>

<template>
  <div v-if="!isAuthenticated" class="home-bg">
    <div class="welcome-modal">
      <h2 class="welcome-title">Welcome to SeniorWellness - Your Partner in Healthy Aging</h2>
      <p class="welcome-desc">Discover resources, connections, and care to live your best life in your golden years.</p>
      <div class="welcome-btns">
        <router-link to="/login" class="btn btn-primary btn-lg rounded-pill me-3">Sign in</router-link>
        <router-link to="/register" class="btn btn-primary btn-lg rounded-pill">Sign up</router-link>
      </div>
    </div>
    <div class="bg-decor bg-gray"></div>
    <div class="bg-decor bg-blue"></div>
  </div>
  <div v-else class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-3 mb-4" v-for="card in cards" :key="card.title">
        <div class="card h-100">
          <div class="card-body d-flex flex-column">
            <div class="mb-3" style="height:120px;background:#e9ecef;"></div>
            <h5 class="card-title">{{ card.title }}</h5>
            <p class="card-text flex-grow-1">{{ card.desc }}</p>
            <router-link :to="card.link" class="btn btn-outline-primary mt-auto">Your More &rarr;</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-bg {
  position: relative;
  min-height: 100vh;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.welcome-modal {
  position: relative;
  z-index: 2;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.10);
  padding: 48px 40px 40px 40px;
  max-width: 480px;
  width: 100%;
  text-align: center;
}
.welcome-title {
  font-size: 1.6rem;
  font-weight: bold;
  margin-bottom: 18px;
}
.welcome-desc {
  color: #444;
  font-size: 1.1rem;
  margin-bottom: 32px;
}
.welcome-btns .btn {
  min-width: 120px;
  font-size: 1.1rem;
  font-weight: 500;
  background: #4b2fc9;
  border: none;
}
.welcome-btns .btn:hover {
  background: #3a238f;
}
.bg-decor {
  position: absolute;
  z-index: 1;
  border-radius: 32px;
}
.bg-gray {
  left: 0;
  top: 30%;
  width: 70vw;
  height: 40vh;
  background: #e5e5e5;
}
.bg-blue {
  left: -8vw;
  bottom: 0;
  width: 40vw;
  height: 18vh;
  background: linear-gradient(90deg, #4b2fc9 60%, #fff0 100%);
  transform: skewY(-8deg);
}
@media (max-width: 600px) {
  .welcome-modal {
    padding: 28px 8px 24px 8px;
    max-width: 98vw;
  }
  .bg-gray {
    width: 90vw;
    height: 30vh;
  }
  .bg-blue {
    width: 60vw;
    height: 10vh;
  }
}
.card {
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border-radius: 12px;
}
.card-title {
  font-weight: bold;
}
.btn-outline-primary {
  border-radius: 20px;
}
</style>
