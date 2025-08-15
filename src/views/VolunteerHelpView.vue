<template>
  <div class="volunteer-help-page">
    <!-- 装饰背景 -->
    <div class="page-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-line line-1"></div>
      <div class="decoration-dots dots-1"></div>
      <div class="decoration-square square-1"></div>
    </div>
    
    <PageHeader 
      title="Volunteer Help"
      image="https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    />
    
    <div class="container py-5">
      <!-- 美化后的表单布局 -->
      <div v-if="canAddVolunteer" class="volunteer-form-section mb-5">
        <div class="form-card">
          <div class="form-header">
            <i class="fas fa-hands-helping"></i>
            <h3>Add New Volunteer</h3>
          </div>
          <form @submit.prevent="addVolunteer">
            <div class="row g-3 mb-3">
              <div class="col-4">
                <label class="form-label"><i class="fas fa-user me-2"></i>Volunteer Name</label>
                <input v-model="newVolunteer.name" type="text" class="form-control" :class="{'is-invalid': errors.name}" placeholder="Enter volunteer name" />
                <div v-if="errors.name" class="invalid-feedback d-block">{{ errors.name }}</div>
              </div>
              <div class="col-4">
                <label class="form-label"><i class="fas fa-cogs me-2"></i>Skill/Service</label>
                <input v-model="newVolunteer.skill" type="text" class="form-control" :class="{'is-invalid': errors.skill}" placeholder="Enter skill or service" />
                <div v-if="errors.skill" class="invalid-feedback d-block">{{ errors.skill }}</div>
              </div>
              <div class="col-4">
                <label class="form-label"><i class="fas fa-phone me-2"></i>Contact</label>
                <input v-model="newVolunteer.contact" type="text" class="form-control" :class="{'is-invalid': errors.contact}" placeholder="Enter contact number" />
                <div v-if="errors.contact" class="invalid-feedback d-block">{{ errors.contact }}</div>
              </div>
            </div>
            <div class="row g-3 mb-3">
              <div class="col-12">
                <label class="form-label"><i class="fas fa-align-left me-2"></i>Description</label>
                <textarea v-model="newVolunteer.description" class="form-control" :class="{'is-invalid': errors.description}" placeholder="Describe the volunteer's skills and experience..." rows="3"></textarea>
                <div v-if="errors.description" class="invalid-feedback d-block">{{ errors.description }}</div>
              </div>
            </div>
            <button type="submit" class="btn btn-primary submit-btn">
              <i class="fas fa-plus me-2"></i>Add Volunteer
            </button>
          </form>
        </div>
      </div>
      
      <!-- 美化后的志愿者卡片 -->
      <div class="volunteers-section">
        <div class="section-header mb-4">
          <h2 class="section-title">
            <i class="fas fa-hands-helping me-2"></i>
            Available Volunteers
          </h2>
          <p class="section-subtitle">Connect with our community volunteers and get the help you need</p>
        </div>
        
        <div class="row">
          <div class="col-4 mb-4" v-for="volunteer in volunteers" :key="volunteer.id">
            <div class="volunteer-card">
              <div class="card-header">
                <div class="volunteer-icon">
                  <i class="fas fa-hands-helping"></i>
                </div>
                <h5 class="volunteer-name">{{ volunteer.name }}</h5>
                <div class="skill-badge">{{ volunteer.skill }}</div>
              </div>
              
              <div class="card-body">
                <div class="contact-info">
                  <div class="contact-item">
                    <i class="fas fa-phone me-2"></i>
                    <span>{{ volunteer.contact || 'Not provided' }}</span>
                  </div>
                </div>
                
                <div class="rating-section">
                  <div class="average-rating">
                    <i class="fas fa-star me-1"></i>
                    <span v-if="volunteerRatings[volunteer.id] && volunteerRatings[volunteer.id].average !== null">
                      {{ volunteerRatings[volunteer.id].average.toFixed(1) }} / 5
                    </span>
                    <span v-else>No ratings yet</span>
                  </div>
                  
                  <div class="rating-buttons">
                    <span class="rating-label">Rate: </span>
                    <button 
                      v-for="n in 5" 
                      :key="n" 
                      class="rating-btn"
                      :class="userRatings[volunteer.id] === n ? 'active' : ''"
                      @click="rateVolunteer(volunteer.id, n)"
                      :disabled="!canRateVolunteer(volunteer)"
                    >
                      {{ n }}
                    </button>
                  </div>
                </div>
                
                <div class="action-buttons">
                  <button class="btn btn-outline-primary action-btn" @click="showDescription(volunteer)">
                    <i class="fas fa-info-circle me-1"></i>Description
                  </button>
                  <button class="btn btn-outline-info action-btn" @click="showComments(volunteer)">
                    <i class="fas fa-comments me-1"></i>Comments
                  </button>
                  <button 
                    v-if="canDeleteVolunteerSync(volunteer)" 
                    class="btn btn-outline-danger action-btn" 
                    @click="deleteVolunteer(volunteer.id)"
                  >
                    <i class="fas fa-trash me-1"></i>Delete
                  </button>
                  
                  <!-- Debug info -->
                  <div class="debug-info" style="font-size: 10px; color: #666; margin-top: 5px;">
                    Creator: {{ volunteer.creator }}<br>
                    Current User: {{ currentUser?.email }}<br>
                    Can Delete: {{ canDeleteVolunteer(volunteer) }}
                  </div>
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
                {{ selectedVolunteerForDescription.name }}
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
      <div v-if="selectedVolunteerForComments" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content custom-modal">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-comments me-2"></i>
                Comments for {{ selectedVolunteerForComments.name }}
              </h5>
              <button type="button" class="btn-close" @click="closeComments"></button>
            </div>
            <div class="modal-body">
              <div v-if="commentsForSelectedVolunteer.length > 0" class="comments-list">
                <div v-for="(comment, index) in commentsForSelectedVolunteer" :key="index" class="comment-item">
                  <div class="comment-content">
                    <div class="comment-header">
                      <i class="fas fa-user-circle user-icon"></i>
                      <span class="comment-author">{{ comment.user }}</span>
                    </div>
                    <div class="comment-text">{{ comment.text }}</div>
                  </div>
                  <button v-if="canDeleteComment(comment)" class="btn btn-outline-danger btn-sm delete-comment-btn" @click="deleteComment(index)">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <div v-else class="no-comments">
                <i class="fas fa-comments"></i>
                <p>No comments yet.</p>
              </div>
              <div v-if="canComment" class="add-comment-section">
                <h6 class="comment-form-title">Add a Comment</h6>
                <textarea v-model="newCommentText" class="form-control" rows="3" placeholder="Write a comment..."></textarea>
                <button class="btn btn-primary submit-comment-btn mt-2" @click="addComment">
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
import firestoreService from '@/services/firestoreService.js'

const volunteers = ref([])
const newVolunteer = reactive({ name: '', skill: '', contact: '', description: '' })
const errors = reactive({ name: '', skill: '', contact: '', description: '' })
const userRatings = reactive({})
const volunteerRatings = ref({})
const currentUser = ref(null)
const userPermissions = ref({ admin: false, doctor: false })

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
  return !!user // 登录用户都可以评论
})

function getCurrentUser() {
  // Get user from auth service instead of localStorage
  const user = window.authService ? window.authService.getCurrentUser() : null
  return user
}

// 所有已登录用户可以添加志愿者信息
const canAddVolunteer = computed(() => {
  const user = currentUser.value
  return !!user
})

// 检查用户权限
async function checkUserPermissions() {
  if (currentUser.value && window.authService) {
    try {
      const isAdmin = await window.authService.hasRole('admin')
      const isDoctor = await window.authService.hasRole('doctor')
      userPermissions.value = { admin: isAdmin, doctor: isDoctor }
      console.log('User permissions - Admin:', isAdmin, 'Doctor:', isDoctor)
    } catch (error) {
      console.error('Error checking permissions:', error)
      userPermissions.value = { admin: false, doctor: false }
    }
  }
}

// 同步版本的删除权限检查
function canDeleteVolunteerSync(volunteer) {
  const user = currentUser.value
  if (!user) return false
  
  // 使用已缓存的权限信息
  if (userPermissions.value.admin) return true
  
  if (userPermissions.value.doctor) {
    // Doctors can only delete their own entries
    const userEmail = user.email
    const userDisplayName = user.displayName
    return volunteer.creator === userEmail || volunteer.creator === userDisplayName
  }
  
  // Regular users can only delete their own entries
  const userEmail = user.email
  const userDisplayName = user.displayName
  return volunteer.creator === userEmail || volunteer.creator === userDisplayName
}

// 只有创建者或管理员可以删除志愿者信息
async function canDeleteVolunteer(volunteer) {
  const user = currentUser.value
  if (!user) return false
  
  try {
    // Check if user is admin
    if (window.authService) {
      const isAdmin = await window.authService.hasRole('admin')
      if (isAdmin) return true
      
      // Check if user is doctor
      const isDoctor = await window.authService.hasRole('doctor')
      if (isDoctor) {
        // Doctors can only delete their own entries
        const userEmail = user.email
        const userDisplayName = user.displayName
        return volunteer.creator === userEmail || volunteer.creator === userDisplayName
      }
    }
    
    // Regular users can only delete their own entries
    const userEmail = user.email
    const userDisplayName = user.displayName
    return volunteer.creator === userEmail || volunteer.creator === userDisplayName
  } catch (error) {
    console.error('Error checking delete permissions:', error)
    return false
  }
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

async function loadVolunteerRatings() {
  try {
    const ratings = await loadRatings()
    for (const volunteer of volunteers.value) {
      if (ratings[volunteer.id] && ratings[volunteer.id].length > 0) {
        const sum = ratings[volunteer.id].reduce((acc, r) => acc + r.score, 0)
        const average = sum / ratings[volunteer.id].length
        volunteerRatings.value[volunteer.id] = { average: average, count: ratings[volunteer.id].length }
      } else {
        volunteerRatings.value[volunteer.id] = { average: null, count: 0 }
      }
    }
  } catch (error) {
    console.error('Failed to load volunteer ratings:', error)
  }
}

async function loadVolunteers() {
  try {
    // Try to get data from Firestore
    const result = await firestoreService.getVolunteers()
    
    if (result.success && result.data.length > 0) {
      // Fix existing data that might be missing creator field
      const fixedVolunteers = result.data.map(volunteer => {
        if (!volunteer.creator) {
          volunteer.creator = 'admin@example.com' // Default creator for existing data
        }
        return volunteer
      })
      volunteers.value = fixedVolunteers
    } else {
      // If Firestore has no data, create initial data
      const initialVolunteers = [
        { name: 'Alice', skill: 'Companionship', contact: '111-222-3333', description: 'Friendly and great listener.', creator: 'admin@example.com' },
        { name: 'Bob', skill: 'Tech Support', contact: '444-555-6666', description: 'Helps with smartphones and computers.', creator: 'admin@example.com' }
      ]
      
      // Save initial data to Firestore
      for (const volunteer of initialVolunteers) {
        await firestoreService.createVolunteer(volunteer)
      }
      
      // Re-fetch data
      const newResult = await firestoreService.getVolunteers()
      if (newResult.success) {
        volunteers.value = newResult.data
      }
    }
  } catch (error) {
    console.error('Failed to load volunteers:', error)
    volunteers.value = []
  }
  
  // Load ratings after loading volunteers
  await loadVolunteerRatings()
}

async function saveVolunteers() {
  try {
    // Data is already managed by Firestore service
    console.log('Volunteers saved to Firestore')
  } catch (error) {
    console.error('Failed to save volunteers:', error)
  }
}

async function loadRatings() {
  try {
    const result = await firestoreService.getVolunteerRatings()
    return result.success ? result.data : {}
  } catch (error) {
    console.error('Failed to load ratings:', error)
    return {}
  }
}

async function saveRatings(ratings) {
  try {
    await firestoreService.saveVolunteerRatings(ratings)
  } catch (error) {
    console.error('Failed to save ratings:', error)
  }
}

async function loadVolunteerComments() {
  try {
    // Load comments for all volunteers
    const allComments = {}
    
    for (const volunteer of volunteers.value) {
      const result = await firestoreService.getVolunteerCommentsFromSubcollection(volunteer.id)
      if (result.success) {
        allComments[volunteer.id] = result.data
      } else {
        allComments[volunteer.id] = []
      }
    }
    
    volunteerComments.value = allComments
  } catch (error) {
    console.error('Failed to load comments:', error)
    volunteerComments.value = {}
  }
}

async function saveVolunteerComments() {
  try {
    await firestoreService.saveVolunteerComments(volunteerComments.value)
  } catch (error) {
    console.error('Failed to save comments:', error)
  }
}

async function addVolunteer() {
  if (!validate()) return
  const user = currentUser.value
  if (!user) return
  
  try {
    // Create volunteer data
    const volunteerData = {
      name: newVolunteer.name,
      skill: newVolunteer.skill,
      contact: newVolunteer.contact,
      description: newVolunteer.description,
      creator: user.displayName || user.email || 'Anonymous'
    }
    
    // Save to Firestore
    const result = await firestoreService.createVolunteer(volunteerData)
    
    if (result.success) {
      // Add to local array with the ID from Firestore (at the end)
      volunteers.value.push({
        id: result.id,
        ...volunteerData
      })
      
      // Clear form
      newVolunteer.name = ''
      newVolunteer.skill = ''
      newVolunteer.contact = ''
      newVolunteer.description = ''
      
      // Show success message
      showSuccess('Volunteer added successfully!')
    } else {
      alert('Failed to add volunteer: ' + result.error)
    }
  } catch (error) {
    console.error('Error adding volunteer:', error)
    alert('An error occurred while adding the volunteer')
  }
}
async function deleteVolunteer(id) {
  const user = currentUser.value
  if (!user) return
  const volunteer = volunteers.value.find(v => v.id === id)
  if (!volunteer) return
  const userEmail = user.email
  const userDisplayName = user.displayName
  if (!window.authService?.hasRole('admin') && volunteer.creator !== userEmail && volunteer.creator !== userDisplayName) return
  
  try {
    // Delete from Firestore
    const result = await firestoreService.deleteVolunteer(id)
    
    if (result.success) {
      // Remove from local array
      volunteers.value = volunteers.value.filter(v => v.id !== id)
      
      // Clean up related ratings and comments with safety checks
      try {
        const ratings = await loadRatings()
        if (ratings && typeof ratings === 'object') {
          delete ratings[id]
          await saveRatings(ratings)
        }
        
        const comments = await loadVolunteerComments()
        if (comments && typeof comments === 'object') {
          delete comments[id]
          await saveVolunteerComments()
        }
      } catch (cleanupError) {
        console.warn('Warning: Failed to clean up related data:', cleanupError)
        // Continue with deletion even if cleanup fails
      }
      
      showSuccess('Volunteer deleted successfully!')
    } else {
      alert('Failed to delete volunteer: ' + result.error)
    }
  } catch (error) {
    console.error('Error deleting volunteer:', error)
    alert('An error occurred while deleting the volunteer')
  }
}
async function rateVolunteer(volunteerId, score) {
  const user = currentUser.value
  if (!user) return alert('Please log in to rate!')
  // 不再限制角色，任何已登录用户都可以评分
  const ratings = await loadRatings()
  if (!ratings[volunteerId]) ratings[volunteerId] = []

  const userKey = user.email || user.displayName || 'Anonymous'
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

  await saveRatings(ratings)
  
  // Update volunteerRatings for this volunteer
  if (ratings[volunteerId] && ratings[volunteerId].length > 0) {
    const sum = ratings[volunteerId].reduce((acc, r) => acc + r.score, 0)
    const average = sum / ratings[volunteerId].length
    volunteerRatings.value[volunteerId] = { average: average, count: ratings[volunteerId].length }
  } else {
    volunteerRatings.value[volunteerId] = { average: null, count: 0 }
  }
}
async function getAverageRating(volunteerId) {
  const ratings = await loadRatings()
  if (!ratings[volunteerId] || ratings[volunteerId].length === 0) return null
  const sum = ratings[volunteerId].reduce((acc, r) => acc + r.score, 0)
  return sum / ratings[volunteerId].length
}
async function loadUserRatings() {
  const user = currentUser.value
  if (!user) return
  const ratings = await loadRatings()
  const userKey = user.email || user.displayName || 'Anonymous'
  for (const volunteerId in ratings) {
    const found = ratings[volunteerId].find(r => r.user === userKey)
    if (found) userRatings[volunteerId] = found.score
  }
}

function canDeleteComment(comment) {
  const user = currentUser.value
  if (!user) return false
  
  const userEmail = user.email
  const userDisplayName = user.displayName
  
  // Admin can delete any comment using cached permissions
  if (userPermissions.value.admin) return true
  
  // Doctor and User can only delete their own comments
  return comment.user === userEmail || comment.user === userDisplayName
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

async function addComment() {
  const user = currentUser.value
  if (!canComment.value || !newCommentText.value.trim()) return

  try {
    const volunteerId = selectedVolunteerForComments.value.id
    const comment = {
      user: user.displayName || user.email || 'Anonymous',
      text: newCommentText.value.trim()
    }
    
    // Save comment to Firestore
    const result = await firestoreService.addVolunteerComment(volunteerId, comment)
    
    if (result.success) {
      // Get updated comments for the current volunteer
      const commentsResult = await firestoreService.getVolunteerCommentsFromSubcollection(volunteerId)
      if (commentsResult.success) {
        // Force reactive update by creating a new object reference
        volunteerComments.value = {
          ...volunteerComments.value,
          [volunteerId]: commentsResult.data
        }
      }
      
      newCommentText.value = ''
      showSuccess('Comment added successfully!')
    } else {
      alert('Failed to add comment: ' + result.error)
    }
  } catch (error) {
    console.error('Error adding comment:', error)
    alert('An error occurred while adding comment')
  }
}

async function deleteComment(commentIndex) {
  try {
    const volunteerId = selectedVolunteerForComments.value.id
    const comment = volunteerComments.value[volunteerId]?.[commentIndex]
    if (!comment) return
    
    // Delete comment from Firestore
    const result = await firestoreService.deleteVolunteerComment(volunteerId, comment.id)
    
    if (result.success) {
      // Get updated comments for the current volunteer
      const commentsResult = await firestoreService.getVolunteerCommentsFromSubcollection(volunteerId)
      if (commentsResult.success) {
        // Force reactive update by creating a new object reference
        volunteerComments.value = {
          ...volunteerComments.value,
          [volunteerId]: commentsResult.data
        }
      }
      
      showSuccess('Comment deleted successfully!')
    } else {
      alert('Failed to delete comment: ' + result.error)
    }
  } catch (error) {
    console.error('Error deleting comment:', error)
    alert('An error occurred while deleting comment')
  }
}

onMounted(async () => {
  currentUser.value = getCurrentUser()
  await checkUserPermissions()
  await loadVolunteers()
  await loadUserRatings()
  await loadVolunteerComments()
  window.addEventListener('auth-change', () => {
    currentUser.value = getCurrentUser()
    checkUserPermissions() // 重新检查权限
  })
})
</script>

<style scoped>
.volunteer-help-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
  overflow: hidden;
}

/* 装饰背景 */
.page-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 10%;
  animation-delay: 2s;
}

.decoration-line {
  position: absolute;
  background: linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.2) 50%, transparent 100%);
  animation: slide 8s linear infinite;
}

.line-1 {
  width: 300px;
  height: 2px;
  top: 30%;
  left: -300px;
  animation-delay: 1s;
}

.decoration-dots {
  position: absolute;
  display: flex;
  gap: 10px;
  animation: fadeInOut 4s ease-in-out infinite;
}

.dots-1 {
  top: 20%;
  right: 15%;
  animation-delay: 3s;
}

.decoration-dots::before,
.decoration-dots::after {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.3);
}

.decoration-square {
  position: absolute;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
  transform: rotate(45deg);
  animation: rotate 10s linear infinite;
}

.square-1 {
  bottom: 20%;
  left: 20%;
  animation-delay: 2s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes slide {
  0% { transform: translateX(0px); }
  100% { transform: translateX(calc(100vw + 300px)); }
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

@keyframes rotate {
  0% { transform: rotate(45deg); }
  100% { transform: rotate(405deg); }
}

/* 表单部分 */
.volunteer-form-section {
  position: relative;
  z-index: 1;
}

.form-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  border: 1px solid #e2e8f0;
}

.form-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  color: #4b2fc9;
}

.form-header i {
  font-size: 2rem;
}

.form-header h3 {
  margin: 0;
  font-weight: 700;
  font-size: 1.5rem;
}

.form-label {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.form-control {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #4b2fc9;
  box-shadow: 0 0 0 3px rgba(75, 47, 201, 0.1);
}

.submit-btn {
  background: linear-gradient(135deg, #4b2fc9 0%, #667eea 100%);
  border: none;
  border-radius: 12px;
  padding: 0.75rem 2rem;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(75, 47, 201, 0.3);
}

/* 志愿者卡片部分 */
.volunteers-section {
  position: relative;
  z-index: 1;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  color: #2d3748;
  font-weight: 700;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.section-subtitle {
  color: #718096;
  font-size: 1.1rem;
  margin: 0;
}

.volunteer-card {
  background: white;
  border-radius: 18px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: all 0.3s ease;
  height: 100%;
}

.volunteer-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.card-header {
  background: linear-gradient(135deg, #4b2fc9 0%, #667eea 100%);
  color: white;
  padding: 1.5rem;
  text-align: center;
  position: relative;
}

.volunteer-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.volunteer-name {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.skill-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.25rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
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
  margin-bottom: 0.5rem;
  color: #4a5568;
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
  margin-bottom: 0.5rem;
  color: #4a5568;
}

.average-rating i {
  color: #f6ad55;
}

.rating-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rating-label {
  color: #4a5568;
  font-weight: 500;
  margin-right: 0.5rem;
}

.rating-btn {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 2px solid #4b2fc9;
  background: white;
  color: #4b2fc9;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rating-btn:hover {
  background: #4b2fc9;
  color: white;
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
  
  .volunteer-card {
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