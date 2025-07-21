<template>
  <div>
    <PageHeader 
      title="Volunteer Help"
      image="https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    />
    <div class="container py-5">
      <!-- 更新后的表单布局 -->
      <form v-if="canAddVolunteer" class="mb-4" @submit.prevent="addVolunteer">
        <div class="row g-3 mb-2">
          <div class="col-md-4">
            <input v-model="newVolunteer.name" type="text" class="form-control" :class="{'is-invalid': errors.name}" placeholder="Volunteer Name" />
            <div v-if="errors.name" class="invalid-feedback d-block">{{ errors.name }}</div>
          </div>
          <div class="col-md-4">
            <input v-model="newVolunteer.skill" type="text" class="form-control" :class="{'is-invalid': errors.skill}" placeholder="Skill/Service" />
            <div v-if="errors.skill" class="invalid-feedback d-block">{{ errors.skill }}</div>
          </div>
          <div class="col-md-4">
            <input v-model="newVolunteer.contact" type="text" class="form-control" :class="{'is-invalid': errors.contact}" placeholder="Contact" />
            <div v-if="errors.contact" class="invalid-feedback d-block">{{ errors.contact }}</div>
          </div>
        </div>
        <div class="mb-2">
          <textarea v-model="newVolunteer.description" class="form-control" :class="{'is-invalid': errors.description}" placeholder="Description"></textarea>
          <div v-if="errors.description" class="invalid-feedback d-block">{{ errors.description }}</div>
        </div>
        <button type="submit" class="btn btn-primary w-100">Add Volunteer</button>
      </form>
      
      <!-- 更新后的志愿者卡片 -->
      <div class="row">
        <div class="col-4 mb-4" v-for="volunteer in volunteers" :key="volunteer.id">
          <div class="card h-100">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">{{ volunteer.name }}</h5>
              <p class="card-text"><strong>Skill/Service:</strong> {{ volunteer.skill }}</p>
              <p class="card-text"><strong>Contact:</strong> {{ volunteer.contact }}</p>
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
              
              <div class="mt-auto btn-group w-100">
                <button class="btn btn-secondary btn-sm" @click="showDescription(volunteer)">View Description</button>
                <button class="btn btn-info btn-sm" @click="showComments(volunteer)">View Comments</button>
                <button v-if="canDeleteVolunteer(volunteer)" class="btn btn-danger btn-sm" @click="deleteVolunteer(volunteer.id)">Delete</button>
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
              <h5 class="modal-title">Description for {{ selectedVolunteerForDescription.name }}</h5>
              <button type="button" class="btn-close" @click="closeDescription"></button>
            </div>
            <div class="modal-body">
              {{ selectedDescription }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Comments Modal -->
      <div v-if="selectedVolunteerForComments" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Comments for {{ selectedVolunteerForComments.name }}</h5>
              <button type="button" class="btn-close" @click="closeComments"></button>
            </div>
            <div class="modal-body">
              <div v-if="commentsForSelectedVolunteer.length > 0">
                <div v-for="(comment, index) in commentsForSelectedVolunteer" :key="index" class="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
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

const volunteers = ref([])
const newVolunteer = reactive({ name: '', skill: '', contact: '', description: '' })
const errors = reactive({ name: '', skill: '', contact: '', description: '' })
const userRatings = reactive({})
const currentUser = ref(null)

const selectedDescription = ref(null)
const selectedVolunteerForDescription = ref(null)
const selectedVolunteerForComments = ref(null)
const newCommentText = ref('')
const volunteerComments = ref({})

const commentsForSelectedVolunteer = computed(() => {
  if (!selectedVolunteerForComments.value) return []
  return volunteerComments.value[selectedVolunteerForComments.value.id] || []
})

const canComment = computed(() => {
  const user = currentUser.value
  return user && (user.role === 'user' || user.role === 'doctor')
})

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

function validate() {
  errors.name = newVolunteer.name.trim() ? '' : 'Volunteer name cannot be empty.';
  errors.skill = newVolunteer.skill.trim() ? '' : 'Skill/Service cannot be empty.';

  const phoneRegex = /^\+?[\d\s-]{7,15}$/;
  if (!newVolunteer.contact.trim()) {
    errors.contact = 'Contact cannot be empty.';
  } else if (!phoneRegex.test(newVolunteer.contact.trim())) {
    errors.contact = 'Please enter a valid contact number.';
  } else {
    errors.contact = '';
  }
  
  const descWords = newVolunteer.description.trim().split(/\s+/).filter(Boolean);
  if (!newVolunteer.description.trim()) {
    errors.description = 'Description cannot be empty.';
  } else if (descWords.length > 50) {
    errors.description = `Description cannot exceed 50 words. Current: ${descWords.length} words.`;
  } else {
    errors.description = '';
  }

  return !errors.name && !errors.skill && !errors.contact && !errors.description;
}

function loadVolunteers() {
  const saved = localStorage.getItem('volunteers')
  volunteers.value = saved ? JSON.parse(saved) : [
    { id: 1, name: 'Alice', skill: 'Companionship', contact: '111-222-3333', description: 'Friendly and great listener.', creator: 'admin' },
    { id: 2, name: 'Bob', skill: 'Tech Support', contact: '444-555-6666', description: 'Helps with smartphones and computers.', creator: 'admin' }
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

function loadVolunteerComments() {
  const saved = localStorage.getItem('volunteerComments')
  volunteerComments.value = saved ? JSON.parse(saved) : {}
}

function saveVolunteerComments() {
  localStorage.setItem('volunteerComments', JSON.stringify(volunteerComments.value))
}

function addVolunteer() {
  if (!validate()) return
  const user = currentUser.value
  if (!user) return
  const id = Date.now()
  volunteers.value.push({ 
    id, 
    name: newVolunteer.name, 
    skill: newVolunteer.skill,
    contact: newVolunteer.contact,
    description: newVolunteer.description,
    creator: user.username 
  })
  saveVolunteers()
  newVolunteer.name = ''
  newVolunteer.skill = ''
  newVolunteer.contact = ''
  newVolunteer.description = ''
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
  const comments = loadVolunteerComments()
  delete comments[id]
  saveVolunteerComments()
}
function rateVolunteer(volunteerId, score) {
  const user = currentUser.value
  if (!user) return alert('Please log in to rate!')
  // 不再限制角色，任何已登录用户都可以评分
  const ratings = loadRatings()
  if (!ratings[volunteerId]) ratings[volunteerId] = []

  const userKey = user.username + ':' + user.role
  const existingRatingIndex = ratings[volunteerId].findIndex(r => r.user === userKey)

  if (existingRatingIndex !== -1 && ratings[volunteerId][existingRatingIndex].score === score) {
    // If the same score is clicked again, remove the rating
    ratings[volunteerId].splice(existingRatingIndex, 1)
    delete userRatings[volunteerId]
  } else {
    // Otherwise, add or update the rating
    if (existingRatingIndex !== -1) {
      ratings[volunteerId].splice(existingRatingIndex, 1)
    }
    ratings[volunteerId].push({ user: userKey, score })
    userRatings[volunteerId] = score
  }

  saveRatings(ratings)
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

function canDeleteComment(comment) {
  const user = currentUser.value
  return user && (user.username === comment.user || user.role === 'admin')
}

function showDescription(volunteer) {
  selectedVolunteerForDescription.value = volunteer
  selectedDescription.value = volunteer.description
}

function closeDescription() {
  selectedDescription.value = null
  selectedVolunteerForDescription.value = null
}

function showComments(volunteer) {
  selectedVolunteerForComments.value = volunteer
}

function closeComments() {
  selectedVolunteerForComments.value = null
  newCommentText.value = ''
}

function addComment() {
  const user = currentUser.value
  if (!canComment.value || !newCommentText.value.trim()) return

  const volunteerId = selectedVolunteerForComments.value.id
  if (!volunteerComments.value[volunteerId]) {
    volunteerComments.value[volunteerId] = []
  }
  
  volunteerComments.value[volunteerId].push({
    user: user.username,
    text: newCommentText.value
  })
  
  saveVolunteerComments()
  newCommentText.value = ''
}

function deleteComment(commentIndex) {
  const volunteerId = selectedVolunteerForComments.value.id
  if (!volunteerComments.value[volunteerId]) return

  volunteerComments.value[volunteerId].splice(commentIndex, 1)

  saveVolunteerComments()
}

onMounted(() => {
  currentUser.value = getCurrentUser()
  loadVolunteers()
  loadUserRatings()
  loadVolunteerComments()
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