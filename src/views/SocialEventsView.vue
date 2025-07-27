<template>
  <div class="social-events-page">
    <!-- 装饰背景 -->
    <div class="page-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-line line-1"></div>
      <div class="decoration-dots dots-1"></div>
    </div>
    
    <PageHeader 
      title="Social Events"
      image="https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    />
    
    <div class="container py-5">
      <!-- 美化后的表单布局 -->
      <div v-if="canAddEvent" class="event-form-section mb-5">
        <div class="form-card">
          <div class="form-header">
            <i class="fas fa-plus-circle"></i>
            <h3>Create New Event</h3>
          </div>
          <form @submit.prevent="addEvent">
            <div class="row g-3 mb-3">
              <div class="col-6">
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-calendar-alt me-2"></i>Event Title
                  </label>
                  <input 
                    v-model="newEvent.title" 
                    type="text" 
                    class="form-control custom-input" 
                    :class="{'is-invalid': errors.title}" 
                    placeholder="Enter event title" 
                  />
                  <div v-if="errors.title" class="invalid-feedback d-block">{{ errors.title }}</div>
                </div>
              </div>
              <div class="col-3">
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-calendar me-2"></i>Date
                  </label>
                  <input 
                    v-model="newEvent.date" 
                    type="date" 
                    class="form-control custom-input" 
                    :class="{'is-invalid': errors.date}" 
                  />
                  <div v-if="errors.date" class="invalid-feedback d-block">{{ errors.date }}</div>
                </div>
              </div>
              <div class="col-3">
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-clock me-2"></i>Time
                  </label>
                  <input 
                    v-model="newEvent.time" 
                    type="time" 
                    class="form-control custom-input" 
                    :class="{'is-invalid': errors.time}" 
                  />
                  <div v-if="errors.time" class="invalid-feedback d-block">{{ errors.time }}</div>
                </div>
              </div>
            </div>
            <div class="row g-3 mb-3">
              <div class="col-12">
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-align-left me-2"></i>Description
                  </label>
                  <textarea 
                    v-model="newEvent.desc" 
                    class="form-control custom-input" 
                    :class="{'is-invalid': errors.desc}" 
                    placeholder="Describe your event..."
                    rows="3"
                  ></textarea>
                  <div v-if="errors.desc" class="invalid-feedback d-block">{{ errors.desc }}</div>
                </div>
              </div>
            </div>
            <button type="submit" class="btn btn-primary submit-btn">
              <i class="fas fa-plus me-2"></i>Create Event
            </button>
          </form>
        </div>
      </div>
      
      <!-- 美化后的事件卡片 -->
      <div class="events-section">
        <div class="section-header mb-4">
          <h2 class="section-title">
            <i class="fas fa-calendar-check me-2"></i>
            Upcoming Events
          </h2>
          <p class="section-subtitle">Join our community activities and stay connected</p>
        </div>
        
        <div class="row">
          <div class="col-4 mb-4" v-for="event in events" :key="event.id">
            <div class="event-card">
              <div class="card-header">
                <div class="event-icon">
                  <i class="fas fa-calendar-day"></i>
                </div>
                <h5 class="event-title">{{ event.title }}</h5>
              </div>
              
              <div class="card-body">
                <div class="event-time">
                  <i class="fas fa-clock me-2"></i>
                  <span>{{ formatDateTime(event.date, event.time) }}</span>
                </div>
                
                <div class="rating-section">
                  <div class="average-rating">
                    <i class="fas fa-star me-1"></i>
                    <span v-if="getAverageRating(event.id) !== null">
                      {{ getAverageRating(event.id).toFixed(1) }} / 5
                    </span>
                    <span v-else>No ratings yet</span>
                  </div>
                  
                  <div class="rating-buttons">
                    <span class="rating-label">Rate: </span>
                    <button 
                      v-for="n in 5" 
                      :key="n" 
                      class="rating-btn"
                      :class="userRatings[event.id] === n ? 'active' : ''"
                      @click="rateEvent(event.id, n)"
                    >
                      {{ n }}
                    </button>
                  </div>
                </div>
                
                <div class="action-buttons">
                  <button class="btn btn-outline-primary action-btn" @click="showDescription(event)">
                    <i class="fas fa-info-circle me-1"></i>Description
                  </button>
                  <button class="btn btn-outline-info action-btn" @click="showComments(event)">
                    <i class="fas fa-comments me-1"></i>Comments
                  </button>
                  <button 
                    v-if="canDeleteEvent(event)" 
                    class="btn btn-outline-danger action-btn" 
                    @click="deleteEvent(event.id)"
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
                <i class="fas fa-info-circle me-2"></i>
                {{ selectedEventForDescription.title }}
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
      <div v-if="selectedEventForComments" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content custom-modal">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-comments me-2"></i>
                Comments for {{ selectedEventForComments.title }}
              </h5>
              <button type="button" class="btn-close" @click="closeComments"></button>
            </div>
            <div class="modal-body">
              <div v-if="commentsForSelectedEvent.length > 0" class="comments-list">
                <div v-for="(comment, index) in commentsForSelectedEvent" :key="index" class="comment-item">
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
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
              
              <div v-if="canComment" class="add-comment-section">
                <h6 class="comment-form-title">
                  <i class="fas fa-edit me-2"></i>Add a Comment
                </h6>
                <textarea 
                  v-model="newCommentText" 
                  class="form-control custom-input" 
                  :class="{'is-invalid': commentError}" 
                  rows="3" 
                  placeholder="Share your thoughts about this event..."
                ></textarea>
                <div v-if="commentError" class="invalid-feedback d-block">{{ commentError }}</div>
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
import socialEventsImage from '@/asserts/pexels-photo-3768131.jpeg'

const events = ref([])
const newEvent = reactive({ title: '', desc: '', date: '', time: '' })
const errors = reactive({ title: '', desc: '', date: '', time: '' })
const userRatings = reactive({})
const currentUser = ref(null)
const selectedDescription = ref(null)
const selectedEventForDescription = ref(null)
const selectedEventForComments = ref(null)
const newCommentText = ref('')
const commentError = ref('')
const eventComments = ref({})

const commentsForSelectedEvent = computed(() => {
  if (!selectedEventForComments.value) return []
  return eventComments.value[selectedEventForComments.value.id] || []
})

const canComment = computed(() => {
  const user = currentUser.value
  return user && (user.role === 'user' || user.role === 'doctor')
})

function canDeleteComment(comment) {
  const user = currentUser.value
  return user && (user.username === comment.user || user.role === 'admin')
}

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
    { id: 1, title: 'Morning Tai Chi', desc: 'Join us for a healthy start to your day with Tai Chi in the park.', date: '2024-10-26', time: '09:00', creator: 'admin' },
    { id: 2, title: 'Online Book Club', desc: 'Discuss your favorite books with fellow readers online.', date: '2024-10-27', time: '18:30', creator: 'admin' },
    { id: 3, title: 'Cooking Workshop', desc: 'Learn to cook healthy meals with our volunteer chefs.', date: '2024-10-28', time: '15:00', creator: 'admin' }
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

function loadEventComments() {
  const saved = localStorage.getItem('eventComments')
  eventComments.value = saved ? JSON.parse(saved) : {}
}

function saveEventComments() {
  localStorage.setItem('eventComments', JSON.stringify(eventComments.value))
}

function formatDateTime(date, time) {
  if (!date || !time) return 'Not specified';
  return `${date} ${time}`;
}

function validate() {
  errors.title = ''
  errors.desc = ''
  errors.date = ''
  errors.time = ''

  const titleWords = newEvent.title.trim().split(/\s+/).filter(Boolean);
  if (!newEvent.title.trim()) {
    errors.title = 'Title cannot be empty.';
  } else if (titleWords.length > 20) {
    errors.title = `Title cannot exceed 20 words. Current: ${titleWords.length} words.`;
  }

  if (!newEvent.date) {
    errors.date = 'Date cannot be empty.';
  }
  
  if (!newEvent.time) {
    errors.time = 'Time cannot be empty.';
  }

  const descWords = newEvent.desc.trim().split(/\s+/).filter(Boolean);
  if (!newEvent.desc.trim()) {
    errors.desc = 'Description cannot be empty.';
  } else if (descWords.length > 1150) {
    errors.desc = `Description cannot exceed 1150 words. Current: ${descWords.length} words.`;
  }
  
  return !errors.title && !errors.desc && !errors.date && !errors.time;
}

function addEvent() {
  if (!validate()) return
  const user = currentUser.value
  if (!user) return
  const id = Date.now()
  events.value.push({ id, title: newEvent.title, desc: newEvent.desc, date: newEvent.date, time: newEvent.time, creator: user.username })
  saveEvents()
  newEvent.title = ''
  newEvent.desc = ''
  newEvent.date = ''
  newEvent.time = ''
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
  const existingRatingIndex = ratings[eventId].findIndex(r => r.user === userKey)

  if (existingRatingIndex !== -1 && ratings[eventId][existingRatingIndex].score === score) {
    // If the same score is clicked again, remove the rating
    ratings[eventId].splice(existingRatingIndex, 1)
    delete userRatings[eventId]
  } else {
    // Otherwise, add or update the rating
    if (existingRatingIndex !== -1) {
      ratings[eventId].splice(existingRatingIndex, 1)
    }
    ratings[eventId].push({ user: userKey, score })
    userRatings[eventId] = score
  }

  saveRatings(ratings)
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

function showDescription(event) {
  selectedEventForDescription.value = event
  selectedDescription.value = event.desc
}

function closeDescription() {
  selectedDescription.value = null
  selectedEventForDescription.value = null
}

function showComments(event) {
  selectedEventForComments.value = event
}

function closeComments() {
  selectedEventForComments.value = null
  newCommentText.value = ''
}

function addComment() {
  commentError.value = ''
  const user = currentUser.value
  const commentWords = newCommentText.value.trim().split(/\s+/).filter(Boolean);

  if (!canComment.value || !newCommentText.value.trim()) {
    commentError.value = 'Comment cannot be empty.';
    return
  }
  
  if (commentWords.length > 50) {
    commentError.value = `Comment cannot exceed 50 words. Current: ${commentWords.length} words.`;
    return
  }

  const eventId = selectedEventForComments.value.id
  if (!eventComments.value[eventId]) {
    eventComments.value[eventId] = []
  }
  
  eventComments.value[eventId].push({
    user: user.username,
    text: newCommentText.value
  })
  
  saveEventComments()
  newCommentText.value = ''
}

function deleteComment(commentIndex) {
  const eventId = selectedEventForComments.value.id
  if (!eventComments.value[eventId]) return

  eventComments.value[eventId].splice(commentIndex, 1)

  saveEventComments()
}

onMounted(() => {
  currentUser.value = getCurrentUser()
  loadEvents()
  loadUserRatings()
  loadEventComments()
  window.addEventListener('auth-changed', () => {
    currentUser.value = getCurrentUser()
  })
})
</script>

<style scoped>
.social-events-page {
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

/* 表单区域 */
.event-form-section {
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

/* 事件区域 */
.events-section {
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

.event-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  height: 100%;
}

.event-card:hover {
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

.event-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.event-title {
  margin: 0;
  font-weight: 600;
  font-size: 1.3rem;
}

.card-body {
  padding: 1.5rem;
}

.event-time {
  display: flex;
  align-items: center;
  color: #718096;
  font-weight: 500;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 8px;
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

.rating-btn:hover {
  border-color: #4b2fc9;
  color: #4b2fc9;
  transform: scale(1.1);
}

.rating-btn.active {
  background: #4b2fc9;
  border-color: #4b2fc9;
  color: white;
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
  
  .event-card {
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
  .decoration-dots {
    display: none;
  }
}

.container {
  margin-top: 80px;
}
</style> 