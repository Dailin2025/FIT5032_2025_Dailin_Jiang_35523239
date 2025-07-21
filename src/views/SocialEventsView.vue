<template>
  <div>
    <PageHeader 
      title="Social Events"
      image="https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    />
    <div class="container py-5">
      <!-- 更新后的表单布局 -->
      <form v-if="canAddEvent" class="mb-4" @submit.prevent="addEvent">
        <div class="row g-3 mb-2">
          <div class="col-md-6">
            <input v-model="newEvent.title" type="text" class="form-control" :class="{'is-invalid': errors.title}" placeholder="Event Title" />
            <div v-if="errors.title" class="invalid-feedback d-block">{{ errors.title }}</div>
          </div>
          <div class="col-md-3">
            <input v-model="newEvent.date" type="date" class="form-control" :class="{'is-invalid': errors.date}" />
            <div v-if="errors.date" class="invalid-feedback d-block">{{ errors.date }}</div>
          </div>
          <div class="col-md-3">
            <input v-model="newEvent.time" type="time" class="form-control" :class="{'is-invalid': errors.time}" />
            <div v-if="errors.time" class="invalid-feedback d-block">{{ errors.time }}</div>
          </div>
        </div>
        <div class="mb-2">
          <textarea v-model="newEvent.desc" class="form-control" :class="{'is-invalid': errors.desc}" placeholder="Event Description"></textarea>
          <div v-if="errors.desc" class="invalid-feedback d-block">{{ errors.desc }}</div>
        </div>
        <button type="submit" class="btn btn-primary w-100">Add Event</button>
      </form>
      
      <!-- 更新后的卡片，显示时间 -->
      <div class="row">
        <div class="col-4 mb-4" v-for="event in events" :key="event.id">
          <div class="card h-100">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">{{ event.title }}</h5>
              <p class="card-text"><strong>Time:</strong> {{ formatDateTime(event.date, event.time) }}</p>
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
              <div class="mt-auto btn-group w-100">
                <button class="btn btn-secondary btn-sm" @click="showDescription(event)">View Description</button>
                <button class="btn btn-info btn-sm" @click="showComments(event)">View Comments</button>
                <button v-if="canDeleteEvent(event)" class="btn btn-danger btn-sm" @click="deleteEvent(event.id)">Delete</button>
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
              <h5 class="modal-title">Description for {{ selectedEventForDescription.title }}</h5>
              <button type="button" class="btn-close" @click="closeDescription"></button>
            </div>
            <div class="modal-body">
              {{ selectedDescription }}
            </div>
          </div>
        </div>
      </div>

      <!-- Comments Modal -->
      <div v-if="selectedEventForComments" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Comments for {{ selectedEventForComments.title }}</h5>
              <button type="button" class="btn-close" @click="closeComments"></button>
            </div>
            <div class="modal-body">
              <div v-if="commentsForSelectedEvent.length > 0">
                <div v-for="(comment, index) in commentsForSelectedEvent" :key="index" class="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                  <div>
                    <strong>{{ comment.user }}:</strong> {{ comment.text }}
                  </div>
                  <button v-if="canDeleteComment(comment)" class="btn btn-outline-danger btn-sm" @click="deleteComment(index)">Delete</button>
                </div>
              </div>
              <p v-else>No comments yet.</p>
              <div v-if="canComment" class="mt-4">
                <textarea v-model="newCommentText" class="form-control" :class="{'is-invalid': commentError}" rows="3" placeholder="Write a comment..."></textarea>
                <div v-if="commentError" class="invalid-feedback d-block">{{ commentError }}</div>
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
.container {
  margin-top: 80px;
}
</style> 