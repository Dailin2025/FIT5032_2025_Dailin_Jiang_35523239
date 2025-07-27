<template>
  <div class="book-doctor-page">
    <!-- 装饰背景 -->
    <div class="page-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-line line-1"></div>
      <div class="decoration-dots dots-1"></div>
      <div class="decoration-square square-1"></div>
    </div>
    
    <PageHeader 
      title="Book a Doctor"
      image="https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    />
    
    <div class="container py-5">
      <!-- 美化后的表单布局 -->
      <div v-if="canAddDoctor" class="doctor-form-section mb-5">
        <div class="form-card">
          <div class="form-header">
            <i class="fas fa-user-md"></i>
            <h3>Add New Doctor</h3>
          </div>
          <form @submit.prevent="addDoctor">
            <div class="row g-3 mb-3">
              <div class="col-6">
                <label class="form-label"><i class="fas fa-user me-2"></i>Doctor Name</label>
                <input v-model="newDoctor.name" type="text" class="form-control" :class="{'is-invalid': errors.name}" placeholder="Enter doctor's full name" />
                <div v-if="errors.name" class="invalid-feedback d-block">{{ errors.name }}</div>
              </div>
              <div class="col-6">
                <label class="form-label"><i class="fas fa-stethoscope me-2"></i>Specialty</label>
                <input v-model="newDoctor.specialty" type="text" class="form-control" :class="{'is-invalid': errors.specialty}" placeholder="e.g., Cardiology, Neurology" />
                <div v-if="errors.specialty" class="invalid-feedback d-block">{{ errors.specialty }}</div>
              </div>
            </div>
            <div class="row g-3 mb-3">
              <div class="col-6">
                <label class="form-label"><i class="fas fa-phone me-2"></i>Contact Number</label>
                <input v-model="newDoctor.contact" type="text" class="form-control" :class="{'is-invalid': errors.contact}" placeholder="Enter phone number" />
                <div v-if="errors.contact" class="invalid-feedback d-block">{{ errors.contact }}</div>
              </div>
              <div class="col-6">
                <label class="form-label"><i class="fas fa-envelope me-2"></i>Email Address</label>
                <input v-model="newDoctor.email" type="email" class="form-control" :class="{'is-invalid': errors.email}" placeholder="Enter email address" />
                <div v-if="errors.email" class="invalid-feedback d-block">{{ errors.email }}</div>
              </div>
            </div>
            <div class="row g-3 mb-3">
              <div class="col-12">
                <label class="form-label"><i class="fas fa-align-left me-2"></i>Professional Description</label>
                <textarea v-model="newDoctor.description" class="form-control" :class="{'is-invalid': errors.description}" placeholder="Describe the doctor's expertise and experience..." rows="3"></textarea>
                <div v-if="errors.description" class="invalid-feedback d-block">{{ errors.description }}</div>
              </div>
            </div>
            <button type="submit" class="btn btn-primary submit-btn">
              <i class="fas fa-plus me-2"></i>Add Doctor
            </button>
          </form>
        </div>
      </div>
      
      <!-- 美化后的医生卡片 -->
      <div class="doctors-section">
        <div class="section-header mb-4">
          <h2 class="section-title">
            <i class="fas fa-user-md me-2"></i>
            Available Doctors
          </h2>
          <p class="section-subtitle">Find and book appointments with our qualified medical professionals</p>
        </div>
        
        <div class="row">
          <div class="col-4 mb-4" v-for="doctor in doctors" :key="doctor.id">
            <div class="doctor-card">
              <div class="card-header">
                <div class="doctor-icon">
                  <i class="fas fa-user-md"></i>
                </div>
                <h5 class="doctor-name">{{ doctor.name }}</h5>
                <div class="specialty-badge">{{ doctor.specialty }}</div>
              </div>
              
              <div class="card-body">
                <div class="contact-info">
                  <div class="contact-item">
                    <i class="fas fa-phone me-2"></i>
                    <span>{{ doctor.contact || 'Not provided' }}</span>
                  </div>
                  <div class="contact-item">
                    <i class="fas fa-envelope me-2"></i>
                    <span>{{ doctor.email || 'Not provided' }}</span>
                  </div>
                </div>
                
                <div class="rating-section">
                  <div class="average-rating">
                    <i class="fas fa-star me-1"></i>
                    <span v-if="getAverageRating(doctor.id) !== null">
                      {{ getAverageRating(doctor.id).toFixed(1) }} / 5
                    </span>
                    <span v-else>No ratings yet</span>
                  </div>
                  
                  <div class="rating-buttons">
                    <span class="rating-label">Rate: </span>
                    <button 
                      v-for="n in 5" 
                      :key="n" 
                      class="rating-btn"
                      :class="userRatings[doctor.id] === n ? 'active' : ''"
                      @click="rateDoctor(doctor.id, n)"
                      :disabled="!canRateDoctor(doctor)"
                    >
                      {{ n }}
                    </button>
                  </div>
                </div>
                
                <div class="action-buttons">
                  <button class="btn btn-outline-primary action-btn" @click="showDescription(doctor)">
                    <i class="fas fa-info-circle me-1"></i>Description
                  </button>
                  <button class="btn btn-outline-info action-btn" @click="showComments(doctor)">
                    <i class="fas fa-comments me-1"></i>Comments
                  </button>
                  <button 
                    v-if="canDeleteDoctor(doctor)" 
                    class="btn btn-outline-danger action-btn" 
                    @click="deleteDoctor(doctor.id)"
                  >
                    <i class="fas fa-trash me-1"></i>Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 美化后的Description Modal -->
      <div v-if="selectedDescription" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content custom-modal">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-user-md me-2"></i>
                {{ selectedDoctorForDescription.name }}
              </h5>
              <button type="button" class="btn-close" @click="closeDescription"></button>
            </div>
            <div class="modal-body">
              <div class="description-content">
                <i class="fas fa-quote-left quote-icon"></i>
                {{ selectedDescription }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 美化后的Comments Modal -->
      <div v-if="selectedDoctor" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content custom-modal">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-comments me-2"></i>
                Comments for {{ selectedDoctor.name }}
              </h5>
              <button type="button" class="btn-close" @click="closeComments"></button>
            </div>
            <div class="modal-body">
              <div v-if="commentsForSelectedDoctor.length > 0" class="comments-list">
                <div v-for="(comment, index) in commentsForSelectedDoctor" :key="index" class="comment-item">
                  <div class="comment-content">
                    <div class="comment-header">
                      <i class="fas fa-user-circle user-icon"></i>
                      <strong class="comment-author">{{ comment.user }}</strong>
                    </div>
                    <div class="comment-text">{{ comment.text }}</div>
                  </div>
                  <button 
                    v-if="canDeleteComment(comment)" 
                    class="btn btn-outline-danger btn-sm delete-comment-btn" 
                    @click="deleteComment(index)"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <div v-else class="no-comments">
                <i class="fas fa-comment-slash"></i>
                <p>No comments yet. Be the first to share your experience!</p>
              </div>
              
              <div v-if="canComment" class="add-comment-section">
                <h6 class="comment-form-title">
                  <i class="fas fa-edit me-2"></i>Add a Comment
                </h6>
                <textarea 
                  v-model="newCommentText" 
                  class="form-control custom-input" 
                  rows="3" 
                  placeholder="Share your experience with this doctor..."
                ></textarea>
                <button class="btn btn-primary mt-3 submit-comment-btn" @click="addComment">
                  <i class="fas fa-paper-plane me-2"></i>Submit Comment
                </button>
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
.book-doctor-page {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  overflow-x: hidden;
}

/* 装饰元素 */
.page-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(75, 47, 201, 0.08);
  animation: float 8s ease-in-out infinite;
}

.circle-1 {
  width: 150px;
  height: 150px;
  top: 10%;
  right: 5%;
  animation-delay: 0s;
}

.circle-2 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 10%;
  animation-delay: 4s;
}

.decoration-line {
  position: absolute;
  background: linear-gradient(90deg, transparent, rgba(75, 47, 201, 0.15), transparent);
  height: 2px;
  animation: slide 10s ease-in-out infinite;
}

.line-1 {
  width: 300px;
  top: 30%;
  right: 15%;
  animation-delay: 2s;
}

.decoration-dots {
  position: absolute;
  display: flex;
  gap: 8px;
  animation: fadeInOut 6s ease-in-out infinite;
}

.dots-1 {
  top: 60%;
  right: 20%;
  animation-delay: 1s;
}

.decoration-dots::before,
.decoration-dots::after {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(75, 47, 201, 0.2);
}

.decoration-square {
  position: absolute;
  background: rgba(75, 47, 201, 0.08);
  animation: rotate 12s linear infinite;
}

.square-1 {
  width: 60px;
  height: 60px;
  top: 50%;
  left: 5%;
  animation-delay: 0s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

@keyframes slide {
  0%, 100% { transform: translateX(-100%); opacity: 0; }
  50% { transform: translateX(100%); opacity: 1; }
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 表单区域 */
.doctor-form-section {
  position: relative;
  z-index: 2;
}

.form-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.form-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.form-header i {
  font-size: 2rem;
  color: #4b2fc9;
}

.form-header h3 {
  margin: 0;
  color: #2d3748;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
  display: block;
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
  border-color: #4b2fc9;
  box-shadow: 0 0 0 3px rgba(75, 47, 201, 0.1);
  outline: none;
}

.custom-input.is-invalid {
  border-color: #e53e3e;
}

.submit-btn {
  background: linear-gradient(135deg, #4b2fc9 0%, #667eea 100%);
  border: none;
  border-radius: 12px;
  padding: 0.75rem 2rem;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(75, 47, 201, 0.3);
}

/* 医生区域 */
.doctors-section {
  position: relative;
  z-index: 2;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.section-subtitle {
  color: #718096;
  font-size: 1.1rem;
  margin-bottom: 0;
}

.doctor-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  height: 100%;
}

.doctor-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.card-header {
  background: linear-gradient(135deg, #4b2fc9 0%, #667eea 100%);
  color: white;
  padding: 1.5rem;
  text-align: center;
  position: relative;
}

.doctor-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.doctor-name {
  margin: 0;
  font-weight: 600;
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
}

.specialty-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: 500;
  display: inline-block;
}

.card-body {
  padding: 1.5rem;
}

.contact-info {
  margin-bottom: 1.5rem;
}

.contact-item {
  display: flex;
  align-items: center;
  color: #718096;
  font-weight: 500;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.contact-item i {
  color: #4b2fc9;
  width: 20px;
}

.rating-section {
  margin-bottom: 1.5rem;
}

.average-rating {
  display: flex;
  align-items: center;
  color: #4a5568;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.average-rating i {
  color: #ffd700;
}

.rating-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rating-label {
  color: #718096;
  font-weight: 500;
  margin-right: 0.5rem;
}

.rating-btn {
  width: 35px;
  height: 35px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #718096;
  transition: all 0.3s ease;
  cursor: pointer;
}

.rating-btn:hover:not(:disabled) {
  border-color: #4b2fc9;
  color: #4b2fc9;
  transform: scale(1.1);
}

.rating-btn.active {
  background: #4b2fc9;
  border-color: #4b2fc9;
  color: white;
}

.rating-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-btn {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateX(3px);
}

/* Modal 样式 */
.custom-modal {
  border-radius: 20px;
  border: none;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  background: linear-gradient(135deg, #4b2fc9 0%, #667eea 100%);
  color: white;
  border-radius: 20px 20px 0 0;
  border-bottom: none;
}

.modal-title {
  font-weight: 600;
}

.description-content {
  position: relative;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  font-size: 1.1rem;
  line-height: 1.6;
}

.quote-icon {
  position: absolute;
  top: -10px;
  left: -10px;
  font-size: 2rem;
  color: #4b2fc9;
  opacity: 0.3;
}

.comments-list {
  max-height: 400px;
  overflow-y: auto;
}

.comment-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #4b2fc9;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.user-icon {
  font-size: 1.5rem;
  color: #4b2fc9;
}

.comment-author {
  color: #2d3748;
  font-size: 0.95rem;
}

.comment-text {
  color: #4a5568;
  line-height: 1.5;
}

.delete-comment-btn {
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}

.no-comments {
  text-align: center;
  padding: 2rem;
  color: #718096;
}

.no-comments i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.add-comment-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 2px solid #f0f0f0;
}

.comment-form-title {
  color: #2d3748;
  font-weight: 600;
  margin-bottom: 1rem;
}

.submit-comment-btn {
  background: linear-gradient(135deg, #4b2fc9 0%, #667eea 100%);
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .section-title {
    font-size: 2rem;
  }
  
  .form-card {
    padding: 1.5rem;
  }
  
  .doctor-card {
    margin-bottom: 1rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .rating-buttons {
    flex-wrap: wrap;
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