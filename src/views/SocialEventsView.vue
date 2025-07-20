<template>
  <div class="container py-5">
    <h2 class="mb-4 text-center">Social Events</h2>
    <!-- 只有已登录用户（user/doctor/admin）可添加活动 -->
    <form v-if="canAddEvent" class="row g-3 mb-4" @submit.prevent="addEvent">
      <div class="col-4">
        <input v-model="newEvent.title" type="text" class="form-control" placeholder="Event Title" required />
      </div>
      <div class="col-4">
        <input v-model="newEvent.desc" type="text" class="form-control" placeholder="Event Description" required />
      </div>
      <div class="col-4">
        <button type="submit" class="btn btn-primary w-100">Add Event</button>
      </div>
    </form>
    <!-- 活动列表 -->
    <div class="row">
      <div class="col-4 mb-4" v-for="event in events" :key="event.id">
        <div class="card h-100">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">{{ event.title }}</h5>
            <p class="card-text flex-grow-1">{{ event.desc }}</p>
            <div class="mb-2">
              <span>Average Rating: </span>
              <span v-if="getAverageRating(event.id) !== null">
                {{ getAverageRating(event.id).toFixed(1) }} / 5
              </span>
              <span v-else>No ratings yet</span>
            </div>
            <div class="mb-2">
              <span>Rate: </span>
              <button v-for="n in 5" :key="n" class="btn btn-sm me-1"
                :class="userRatings[event.id] === n ? 'btn-primary' : 'btn-outline-primary'"
                @click="rateEvent(event.id, n)">{{ n }}</button>
            </div>
            <!-- 只有活动创建者（user/doctor）或管理员可见删除按钮 -->
            <button v-if="canDeleteEvent(event)" class="btn btn-danger btn-sm mt-auto" @click="deleteEvent(event.id)">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'

const events = ref([])
const newEvent = reactive({ title: '', desc: '' })
const userRatings = reactive({})
const currentUser = ref(null)

function getCurrentUser() {
  const user = localStorage.getItem('currentUser')
  return user ? JSON.parse(user) : null
}

// 只有已登录用户（user/doctor/admin）可以添加活动
const canAddEvent = computed(() => {
  const user = currentUser.value
  return user && (user.role === 'admin' || user.role === 'user' || user.role === 'doctor')
})

// 只有活动创建者（user/doctor）或管理员可以删除活动
function canDeleteEvent(event) {
  const user = currentUser.value
  if (!user) return false
  return user.role === 'admin' || event.creator === user.username
}

function loadEvents() {
  const saved = localStorage.getItem('events')
  events.value = saved ? JSON.parse(saved) : [
    { id: 1, title: 'Morning Tai Chi', desc: 'Join us for a healthy start to your day with Tai Chi in the park.', creator: 'admin' },
    { id: 2, title: 'Online Book Club', desc: 'Discuss your favorite books with fellow readers online.', creator: 'admin' },
    { id: 3, title: 'Cooking Workshop', desc: 'Learn to cook healthy meals with our volunteer chefs.', creator: 'admin' }
  ]
}
function saveEvents() {
  localStorage.setItem('events', JSON.stringify(events.value))
}

function loadRatings() {
  const saved = localStorage.getItem('eventRatings')
  return saved ? JSON.parse(saved) : {}
}
function saveRatings(ratings) {
  localStorage.setItem('eventRatings', JSON.stringify(ratings))
}

function addEvent() {
  if (!newEvent.title.trim() || !newEvent.desc.trim()) return
  const user = currentUser.value
  if (!user) return
  const id = Date.now()
  events.value.push({ id, title: newEvent.title, desc: newEvent.desc, creator: user.username })
  saveEvents()
  newEvent.title = ''
  newEvent.desc = ''
}
function deleteEvent(id) {
  const user = currentUser.value
  if (!user) return
  const event = events.value.find(e => e.id === id)
  if (!event) return
  if (user.role !== 'admin' && event.creator !== user.username) return
  events.value = events.value.filter(e => e.id !== id)
  saveEvents()
  const ratings = loadRatings()
  delete ratings[id]
  saveRatings(ratings)
}
function rateEvent(eventId, score) {
  const user = currentUser.value
  if (!user) return alert('Please log in to rate!')
  const ratings = loadRatings()
  if (!ratings[eventId]) ratings[eventId] = []
  const userKey = user.username + ':' + user.role
  ratings[eventId] = ratings[eventId].filter(r => r.user !== userKey)
  ratings[eventId].push({ user: userKey, score })
  saveRatings(ratings)
  userRatings[eventId] = score
}
function getAverageRating(eventId) {
  const ratings = loadRatings()
  if (!ratings[eventId] || ratings[eventId].length === 0) return null
  const sum = ratings[eventId].reduce((acc, r) => acc + r.score, 0)
  return sum / ratings[eventId].length
}
function loadUserRatings() {
  const user = currentUser.value
  if (!user) return
  const ratings = loadRatings()
  const userKey = user.username + ':' + user.role
  for (const eventId in ratings) {
    const found = ratings[eventId].find(r => r.user === userKey)
    if (found) userRatings[eventId] = found.score
  }
}

onMounted(() => {
  currentUser.value = getCurrentUser()
  loadEvents()
  loadUserRatings()
  window.addEventListener('auth-changed', () => {
    currentUser.value = getCurrentUser()
  })
})
</script>

<style scoped>
.container {
  margin-top: 80px;
}
</style> 