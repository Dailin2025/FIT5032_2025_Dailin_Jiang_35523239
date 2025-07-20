<template>
  <div class="container py-5">
    <h2 class="mb-4 text-center">Volunteer Help</h2>
    <!-- 添加志愿者信息表单：所有已登录用户和管理员可见 -->
    <form v-if="canAddVolunteer" class="row g-3 mb-4" @submit.prevent="addVolunteer">
      <div class="col-4">
        <input v-model="newVolunteer.name" type="text" class="form-control" placeholder="Volunteer Name" required />
      </div>
      <div class="col-4">
        <input v-model="newVolunteer.skill" type="text" class="form-control" placeholder="Skill/Service" required />
      </div>
      <div class="col-4">
        <button type="submit" class="btn btn-primary w-100">Add Volunteer</button>
      </div>
    </form>
    <!-- 志愿者列表 -->
    <div class="row">
      <div class="col-4 mb-4" v-for="volunteer in volunteers" :key="volunteer.id">
        <div class="card h-100">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">{{ volunteer.name }}</h5>
            <p class="card-text">Skill/Service: {{ volunteer.skill }}</p>
            <div class="mb-2">
              <span>Average Rating: </span>
              <span v-if="getAverageRating(volunteer.id) !== null">
                {{ getAverageRating(volunteer.id).toFixed(1) }} / 5
              </span>
              <span v-else>No ratings yet</span>
            </div>
            <div class="mb-2">
              <span>Rate: </span>
              <button v-for="n in 5" :key="n" class="btn btn-sm me-1"
                :class="userRatings[volunteer.id] === n ? 'btn-primary' : 'btn-outline-primary'"
                @click="rateVolunteer(volunteer.id, n)"
                :disabled="!canRateVolunteer(volunteer)">{{ n }}</button>
            </div>
            <!-- 只有创建者或管理员可见删除按钮 -->
            <button v-if="canDeleteVolunteer(volunteer)" class="btn btn-danger btn-sm mt-auto" @click="deleteVolunteer(volunteer.id)">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'

const volunteers = ref([])
const newVolunteer = reactive({ name: '', skill: '' })
const userRatings = reactive({})
const currentUser = ref(null)

function getCurrentUser() {
  const user = localStorage.getItem('currentUser')
  return user ? JSON.parse(user) : null
}

// 所有已登录用户和管理员可以添加志愿者信息
const canAddVolunteer = computed(() => {
  const user = currentUser.value
  return user && (user.role === 'admin' || user.role === 'user' || user.role === 'doctor')
})

// 只有创建者或管理员可以删除志愿者信息
function canDeleteVolunteer(volunteer) {
  const user = currentUser.value
  if (!user) return false
  return user.role === 'admin' || volunteer.creator === user.username
}

// 任何已登录用户都可以给志愿者打分
function canRateVolunteer(volunteer) {
  const user = currentUser.value
  return !!user // 只要已登录就可以打分
}

function loadVolunteers() {
  const saved = localStorage.getItem('volunteers')
  volunteers.value = saved ? JSON.parse(saved) : [
    { id: 1, name: 'Alice', skill: 'Companionship', creator: 'admin' },
    { id: 2, name: 'Bob', skill: 'Tech Support', creator: 'admin' }
  ]
}
function saveVolunteers() {
  localStorage.setItem('volunteers', JSON.stringify(volunteers.value))
}

function loadRatings() {
  const saved = localStorage.getItem('volunteerRatings')
  return saved ? JSON.parse(saved) : {}
}
function saveRatings(ratings) {
  localStorage.setItem('volunteerRatings', JSON.stringify(ratings))
}

function addVolunteer() {
  if (!newVolunteer.name.trim() || !newVolunteer.skill.trim()) return
  const user = currentUser.value
  if (!user) return
  const id = Date.now()
  volunteers.value.push({ id, name: newVolunteer.name, skill: newVolunteer.skill, creator: user.username })
  saveVolunteers()
  newVolunteer.name = ''
  newVolunteer.skill = ''
}
function deleteVolunteer(id) {
  const user = currentUser.value
  if (!user) return
  const volunteer = volunteers.value.find(v => v.id === id)
  if (!volunteer) return
  if (user.role !== 'admin' && volunteer.creator !== user.username) return
  volunteers.value = volunteers.value.filter(v => v.id !== id)
  saveVolunteers()
  const ratings = loadRatings()
  delete ratings[id]
  saveRatings(ratings)
}
function rateVolunteer(volunteerId, score) {
  const user = currentUser.value
  if (!user) return alert('Please log in to rate!')
  // 不再限制角色，任何已登录用户都可以评分
  const ratings = loadRatings()
  if (!ratings[volunteerId]) ratings[volunteerId] = []
  const userKey = user.username + ':' + user.role
  ratings[volunteerId] = ratings[volunteerId].filter(r => r.user !== userKey)
  ratings[volunteerId].push({ user: userKey, score })
  saveRatings(ratings)
  userRatings[volunteerId] = score
}
function getAverageRating(volunteerId) {
  const ratings = loadRatings()
  if (!ratings[volunteerId] || ratings[volunteerId].length === 0) return null
  const sum = ratings[volunteerId].reduce((acc, r) => acc + r.score, 0)
  return sum / ratings[volunteerId].length
}
function loadUserRatings() {
  const user = currentUser.value
  if (!user) return
  const ratings = loadRatings()
  const userKey = user.username + ':' + user.role
  for (const volunteerId in ratings) {
    const found = ratings[volunteerId].find(r => r.user === userKey)
    if (found) userRatings[volunteerId] = found.score
  }
}

onMounted(() => {
  currentUser.value = getCurrentUser()
  loadVolunteers()
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