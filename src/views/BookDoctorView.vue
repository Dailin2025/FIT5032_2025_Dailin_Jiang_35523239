<template>
  <div>
    <PageHeader 
      title="Book a Doctor"
      image="https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    />
    <div class="container py-5">
      <!-- 更新后的表单布局 -->
      <form v-if="canAddDoctor" class="mb-4" @submit.prevent="addDoctor">
        <div class="row g-3 mb-2">
          <div class="col-md-6">
            <input v-model="newDoctor.name" type="text" class="form-control" :class="{'is-invalid': errors.name}" placeholder="Doctor Name" />
            <div v-if="errors.name" class="invalid-feedback d-block">{{ errors.name }}</div>
          </div>
          <div class="col-md-6">
            <input v-model="newDoctor.specialty" type="text" class="form-control" :class="{'is-invalid': errors.specialty}" placeholder="Specialty" />
            <div v-if="errors.specialty" class="invalid-feedback d-block">{{ errors.specialty }}</div>
          </div>
        </div>
        <div class="row g-3 mb-2">
          <div class="col-md-6">
            <input v-model="newDoctor.contact" type="text" class="form-control" :class="{'is-invalid': errors.contact}" placeholder="Contact (Phone Number)" />
            <div v-if="errors.contact" class="invalid-feedback d-block">{{ errors.contact }}</div>
          </div>
          <div class="col-md-6">
            <input v-model="newDoctor.email" type="email" class="form-control" :class="{'is-invalid': errors.email}" placeholder="Email" />
            <div v-if="errors.email" class="invalid-feedback d-block">{{ errors.email }}</div>
          </div>
        </div>
        <div class="mb-2">
          <textarea v-model="newDoctor.description" class="form-control" :class="{'is-invalid': errors.description}" placeholder="Description"></textarea>
          <div v-if="errors.description" class="invalid-feedback d-block">{{ errors.description }}</div>
        </div>
        <button type="submit" class="btn btn-primary w-100">Add Doctor</button>
      </form>
      
      <!-- 更新后的医生卡片 -->
      <div class="row">
        <div class="col-4 mb-4" v-for="doctor in doctors" :key="doctor.id">
          <div class="card h-100">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">{{ doctor.name }}</h5>
              <p class="card-text"><strong>Specialty:</strong> {{ doctor.specialty }}</p>
              <p class="card-text"><strong>Contact:</strong> {{ doctor.contact }}</p>
              <p class="card-text"><strong>Email:</strong> {{ doctor.email }}</p>
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
              
              <div class="mt-auto btn-group w-100">
                <button class="btn btn-secondary btn-sm" @click="showDescription(doctor)">View Description</button>
                <button class="btn btn-info btn-sm" @click="showComments(doctor)">View Comments</button>
                <button v-if="canDeleteDoctor(doctor)" class="btn btn-danger btn-sm" @click="deleteDoctor(doctor.id)">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Description Modal -->
      <div v-if="selectedDescription" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Description for {{ selectedDoctorForDescription.name }}</h5>
              <button type="button" class="btn-close" @click="closeDescription"></button>
            </div>
            <div class="modal-body">
              {{ selectedDescription }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Comments Modal -->
      <div v-if="selectedDoctor" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Comments for {{ selectedDoctor.name }}</h5>
              <button type="button" class="btn-close" @click="closeComments"></button>
            </div>
            <div class="modal-body">
              <div v-if="commentsForSelectedDoctor.length > 0">
                <div v-for="(comment, index) in commentsForSelectedDoctor" :key="index" class="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                  <div>
                    <strong>{{ comment.user }}:</strong> {{ comment.text }}
                  </div>
                  <button v-if="canDeleteComment(comment)" class="btn btn-outline-danger btn-sm" @click="deleteComment(index)">Delete</button>
                </div>
              </div>
              <p v-else>No comments yet.</p>
              <div v-if="canComment" class="mt-4">
                <textarea v-model="newCommentText" class="form-control" rows="3" placeholder="Write a comment..."></textarea>
                <button class="btn btn-primary mt-2" @click="addComment">Submit Comment</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import PageHeader from '@/components/PageHeader.vue'

const doctors = ref([])
const newDoctor = reactive({ name: '', specialty: '', description: '', contact: '', email: '' })
const errors = reactive({ name: '', specialty: '', description: '', contact: '', email: '' })
const userRatings = reactive({})
const currentUser = ref(null)
const selectedDoctor = ref(null)
const newCommentText = ref('')
const doctorComments = ref({})
const selectedDescription = ref(null)
const selectedDoctorForDescription = ref(null)

const commentsForSelectedDoctor = computed(() => {
  if (!selectedDoctor.value) return []
  return doctorComments.value[selectedDoctor.value.id] || []
})

const canComment = computed(() => {
  const user = currentUser.value
  return user && user.role === 'user' // 只有普通用户可以评论
})

function getCurrentUser() {
  const user = localStorage.getItem('currentUser')
  return user ? JSON.parse(user) : null
}

const canAddDoctor = computed(() => {
  const user = currentUser.value
  return user && (user.role === 'admin' || user.role === 'doctor')
})

function canDeleteDoctor(doctor) {
  const user = currentUser.value
  if (!user) return false
  return user.role === 'admin' || doctor.creator === user.username
}

function canRateDoctor(doctor) {
  const user = currentUser.value
  if (!user) return false
  if (user.role === 'user') return true
  return false
}

function validate() {
  errors.name = newDoctor.name.trim() ? '' : 'Doctor name cannot be empty.';
  errors.specialty = newDoctor.specialty.trim() ? '' : 'Specialty cannot be empty.';
  
  const phoneRegex = /^\+?[\d\s-]{7,15}$/;
  if (!newDoctor.contact.trim()) {
    errors.contact = 'Contact cannot be empty.';
  } else if (!phoneRegex.test(newDoctor.contact.trim())) {
    errors.contact = 'Please enter a valid contact number.';
  } else {
    errors.contact = '';
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!newDoctor.email.trim()) {
    errors.email = 'Email cannot be empty.';
  } else if (!emailRegex.test(newDoctor.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  } else {
    errors.email = '';
  }

  const descWords = newDoctor.description.trim().split(/\s+/).filter(Boolean);
  if (!newDoctor.description.trim()) {
    errors.description = 'Description cannot be empty.';
  } else if (descWords.length > 50) {
    errors.description = `Description cannot exceed 50 words. Current: ${descWords.length} words.`;
  } else {
    errors.description = '';
  }

  return !errors.name && !errors.specialty && !errors.description && !errors.contact && !errors.email;
}

function loadDoctors() {
  const saved = localStorage.getItem('doctors')
  doctors.value = saved ? JSON.parse(saved) : [
    { id: 1, name: 'Dr. Smith', specialty: 'Cardiology', description: 'Expert in heart-related issues.', contact: '123-456-7890', email: 'dr.smith@example.com', creator: 'admin' },
    { id: 2, name: 'Dr. Lee', specialty: 'Neurology', description: 'Specializes in brain and nervous system disorders.', contact: '098-765-4321', email: 'dr.lee@example.com', creator: 'admin' }
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

function loadDoctorComments() {
  const saved = localStorage.getItem('doctorComments')
  doctorComments.value = saved ? JSON.parse(saved) : {}
}

function saveDoctorComments() {
  localStorage.setItem('doctorComments', JSON.stringify(doctorComments.value))
}

function showComments(doctor) {
  selectedDoctor.value = doctor
}

function closeComments() {
  selectedDoctor.value = null
  newCommentText.value = ''
}

function addComment() {
  const user = currentUser.value
  if (!canComment.value || !newCommentText.value.trim()) return

  const doctorId = selectedDoctor.value.id
  if (!doctorComments.value[doctorId]) {
    doctorComments.value[doctorId] = []
  }
  
  doctorComments.value[doctorId].push({
    user: user.username,
    text: newCommentText.value
  })
  
  saveDoctorComments()
  newCommentText.value = ''
}

function deleteComment(commentIndex) {
  const doctorId = selectedDoctor.value.id
  if (!doctorComments.value[doctorId]) return

  doctorComments.value[doctorId].splice(commentIndex, 1)

  saveDoctorComments()
}

function addDoctor() {
  if (!validate()) return
  const user = currentUser.value
  if (!user) return
  const id = Date.now()
  doctors.value.push({ 
    id, 
    name: newDoctor.name, 
    specialty: newDoctor.specialty, 
    description: newDoctor.description,
    contact: newDoctor.contact,
    email: newDoctor.email,
    creator: user.username 
  })
  saveDoctors()
  newDoctor.name = ''
  newDoctor.specialty = ''
  newDoctor.description = ''
  newDoctor.contact = ''
  newDoctor.email = ''
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
  if (user.role !== 'user') return

  const ratings = loadRatings()
  if (!ratings[doctorId]) ratings[doctorId] = []

  const userKey = user.username + ':' + user.role
  const existingRatingIndex = ratings[doctorId].findIndex(r => r.user === userKey)

  if (existingRatingIndex !== -1 && ratings[doctorId][existingRatingIndex].score === score) {
    // If the same score is clicked again, remove the rating
    ratings[doctorId].splice(existingRatingIndex, 1)
    delete userRatings[doctorId]
  } else {
    // Otherwise, add or update the rating
    if (existingRatingIndex !== -1) {
      ratings[doctorId].splice(existingRatingIndex, 1)
    }
    ratings[doctorId].push({ user: userKey, score })
    userRatings[doctorId] = score
  }

  saveRatings(ratings)
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

function showDescription(doctor) {
  selectedDoctorForDescription.value = doctor
  selectedDescription.value = doctor.description
}

function closeDescription() {
  selectedDescription.value = null
  selectedDoctorForDescription.value = null
}

function canDeleteComment(comment) {
  const user = currentUser.value
  return user && (user.username === comment.user || user.role === 'admin')
}

onMounted(() => {
  currentUser.value = getCurrentUser()
  loadDoctors()
  loadUserRatings()
  loadDoctorComments()
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