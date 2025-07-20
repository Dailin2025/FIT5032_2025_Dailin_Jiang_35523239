<template>
  <div class="container py-5">
    <h2 class="mb-4 text-center">Book a Doctor</h2>
    <!-- 添加医生信息表单：仅医生和管理员可见 -->
    <form v-if="canAddDoctor" class="row g-3 mb-4" @submit.prevent="addDoctor">
      <div class="col-4">
        <input v-model="newDoctor.name" type="text" class="form-control" placeholder="Doctor Name" required />
      </div>
      <div class="col-4">
        <input v-model="newDoctor.specialty" type="text" class="form-control" placeholder="Specialty" required />
      </div>
      <div class="col-4">
        <button type="submit" class="btn btn-primary w-100">Add Doctor</button>
      </div>
    </form>
    <!-- 医生列表 -->
    <div class="row">
      <div class="col-4 mb-4" v-for="doctor in doctors" :key="doctor.id">
        <div class="card h-100">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">{{ doctor.name }}</h5>
            <p class="card-text">Specialty: {{ doctor.specialty }}</p>
            <div class="mb-2">
              <span>Average Rating: </span>
              <span v-if="getAverageRating(doctor.id) !== null">
                {{ getAverageRating(doctor.id).toFixed(1) }} / 5
              </span>
              <span v-else>No ratings yet</span>
            </div>
            <div class="mb-2">
              <span>Rate: </span>
              <button v-for="n in 5" :key="n" class="btn btn-sm me-1"
                :class="userRatings[doctor.id] === n ? 'btn-primary' : 'btn-outline-primary'"
                @click="rateDoctor(doctor.id, n)"
                :disabled="!canRateDoctor(doctor)">{{ n }}</button>
            </div>
            <!-- 只有创建者医生或管理员可见删除按钮 -->
            <button v-if="canDeleteDoctor(doctor)" class="btn btn-danger btn-sm mt-auto" @click="deleteDoctor(doctor.id)">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'

const doctors = ref([])
const newDoctor = reactive({ name: '', specialty: '' })
const userRatings = reactive({})
const currentUser = ref(null)

function getCurrentUser() {
  const user = localStorage.getItem('currentUser')
  return user ? JSON.parse(user) : null
}

// 只有医生和管理员可以添加医生信息
const canAddDoctor = computed(() => {
  const user = currentUser.value
  return user && (user.role === 'admin' || user.role === 'doctor')
})

// 只有创建者医生或管理员可以删除医生信息
function canDeleteDoctor(doctor) {
  const user = currentUser.value
  if (!user) return false
  return user.role === 'admin' || doctor.creator === user.username
}

// 只有普通用户可以给医生打分，医生不能给自己或其他医生打分
function canRateDoctor(doctor) {
  const user = currentUser.value
  if (!user) return false
  if (user.role === 'user') return true
  return false
}

function loadDoctors() {
  const saved = localStorage.getItem('doctors')
  doctors.value = saved ? JSON.parse(saved) : [
    { id: 1, name: 'Dr. Smith', specialty: 'Cardiology', creator: 'admin' },
    { id: 2, name: 'Dr. Lee', specialty: 'Neurology', creator: 'admin' }
  ]
}
function saveDoctors() {
  localStorage.setItem('doctors', JSON.stringify(doctors.value))
}

function loadRatings() {
  const saved = localStorage.getItem('doctorRatings')
  return saved ? JSON.parse(saved) : {}
}
function saveRatings(ratings) {
  localStorage.setItem('doctorRatings', JSON.stringify(ratings))
}

function addDoctor() {
  if (!newDoctor.name.trim() || !newDoctor.specialty.trim()) return
  const user = currentUser.value
  if (!user) return
  const id = Date.now()
  doctors.value.push({ id, name: newDoctor.name, specialty: newDoctor.specialty, creator: user.username })
  saveDoctors()
  newDoctor.name = ''
  newDoctor.specialty = ''
}
function deleteDoctor(id) {
  const user = currentUser.value
  if (!user) return
  const doctor = doctors.value.find(d => d.id === id)
  if (!doctor) return
  if (user.role !== 'admin' && doctor.creator !== user.username) return
  doctors.value = doctors.value.filter(d => d.id !== id)
  saveDoctors()
  const ratings = loadRatings()
  delete ratings[id]
  saveRatings(ratings)
}
function rateDoctor(doctorId, score) {
  const user = currentUser.value
  if (!user) return alert('Please log in to rate!')
  if (user.role !== 'user') return // 只有普通用户可以评分
  const ratings = loadRatings()
  if (!ratings[doctorId]) ratings[doctorId] = []
  const userKey = user.username + ':' + user.role
  ratings[doctorId] = ratings[doctorId].filter(r => r.user !== userKey)
  ratings[doctorId].push({ user: userKey, score })
  saveRatings(ratings)
  userRatings[doctorId] = score
}
function getAverageRating(doctorId) {
  const ratings = loadRatings()
  if (!ratings[doctorId] || ratings[doctorId].length === 0) return null
  const sum = ratings[doctorId].reduce((acc, r) => acc + r.score, 0)
  return sum / ratings[doctorId].length
}
function loadUserRatings() {
  const user = currentUser.value
  if (!user) return
  const ratings = loadRatings()
  const userKey = user.username + ':' + user.role
  for (const doctorId in ratings) {
    const found = ratings[doctorId].find(r => r.user === userKey)
    if (found) userRatings[doctorId] = found.score
  }
}

onMounted(() => {
  currentUser.value = getCurrentUser()
  loadDoctors()
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