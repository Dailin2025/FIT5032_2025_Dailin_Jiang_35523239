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
          <div>
            <h2 class="section-title">
              <i class="fas fa-user-md me-2"></i>
              Available Doctors
            </h2>
            <p class="section-subtitle">Find and book appointments with our qualified medical professionals</p>
          </div>
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
                    <span v-if="doctorRatings[doctor.id] && doctorRatings[doctor.id].average !== null">
                      {{ doctorRatings[doctor.id].average.toFixed(1) }} / 5
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
                    v-if="canDeleteDoctorSync(doctor)" 
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
      
      <!-- 添加医生模态框 -->
      <div v-if="showAddDoctorModal" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content custom-modal">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-user-plus me-2"></i>Add New Doctor
              </h5>
              <button type="button" class="btn-close" @click="closeAddDoctorModal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="addDoctor">
                <div class="mb-3">
                  <label class="form-label">Doctor Name *</label>
                  <input 
                    v-model="newDoctor.name" 
                    type="text" 
                    class="form-control" 
                    :class="{ 'is-invalid': errors.name }"
                    placeholder="e.g., Dr. Johnson"
                    required
                  />
                  <div v-if="errors.name" class="invalid-feedback">{{ errors.name }}</div>
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Specialty *</label>
                  <input 
                    v-model="newDoctor.specialty" 
                    type="text" 
                    class="form-control" 
                    :class="{ 'is-invalid': errors.specialty }"
                    placeholder="e.g., Cardiology"
                    required
                  />
                  <div v-if="errors.specialty" class="invalid-feedback">{{ errors.specialty }}</div>
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Description</label>
                  <textarea 
                    v-model="newDoctor.description" 
                    class="form-control" 
                    rows="3"
                    placeholder="Brief description of the doctor's expertise..."
                  ></textarea>
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Contact Number *</label>
                  <input 
                    v-model="newDoctor.contact" 
                    type="tel" 
                    class="form-control" 
                    :class="{ 'is-invalid': errors.contact }"
                    placeholder="e.g., 123-456-7890"
                    required
                  />
                  <div v-if="errors.contact" class="invalid-feedback">{{ errors.contact }}</div>
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Email *</label>
                  <input 
                    v-model="newDoctor.email" 
                    type="email" 
                    class="form-control" 
                    :class="{ 'is-invalid': errors.email }"
                    placeholder="e.g., doctor@hospital.com"
                    required
                  />
                  <div v-if="errors.email" class="invalid-feedback">{{ errors.email }}</div>
                </div>
                
                <div class="modal-footer border-0 px-0 pb-0">
                  <button type="button" class="btn btn-secondary" @click="closeAddDoctorModal">
                    Cancel
                  </button>
                  <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save me-2"></i>Add Doctor
                  </button>
                </div>
              </form>
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
import firestoreService from '@/services/firestoreService.js'

const doctors = ref([])
const newDoctor = reactive({ name: '', specialty: '', description: '', contact: '', email: '' })
const errors = reactive({ name: '', specialty: '', description: '', contact: '', email: '' })
const userRatings = reactive({})
const doctorRatings = ref({})
const currentUser = ref(null)
const selectedDoctor = ref(null)
const newCommentText = ref('')
const doctorComments = ref({})
const selectedDescription = ref(null)
const selectedDoctorForDescription = ref(null)
const showAddDoctorModal = ref(false)

const commentsForSelectedDoctor = computed(() => {
  if (!selectedDoctor.value) return []
  return doctorComments.value[selectedDoctor.value.id] || []
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

const canAddDoctor = ref(false)
const userPermissions = ref({ admin: false, doctor: false })
const lastCheckedUser = ref(null) // 用于避免重复检查相同用户的权限

// 检查用户权限
async function checkUserPermissions() {
  if (currentUser.value && window.authService) {
    try {
      // 避免重复检查相同用户的权限
      const userEmail = currentUser.value.email
      if (userEmail === lastCheckedUser.value) {
        return
      }
      
      const isAdmin = await window.authService.hasRole('admin')
      const isDoctor = await window.authService.hasRole('doctor')
      userPermissions.value = { admin: isAdmin, doctor: isDoctor }
      
      // 设置canAddDoctor权限 - Admin和Doctor都可以添加医生
      canAddDoctor.value = isAdmin || isDoctor
      
      lastCheckedUser.value = userEmail
    } catch (error) {
      console.error('Error checking permissions:', error)
      userPermissions.value = { admin: false, doctor: false }
      canAddDoctor.value = false
    }
  }
}

// 同步版本的删除权限检查
function canDeleteDoctorSync(doctor) {
  const user = currentUser.value
  if (!user) return false
  
  // 使用已缓存的权限信息
  if (userPermissions.value.admin) return true
  
  if (userPermissions.value.doctor) {
    // Doctors can only delete their own entries
    const userEmail = user.email
    const userDisplayName = user.displayName
    return doctor.creator === userEmail || doctor.creator === userDisplayName
  }
  
  return false
}

async function canDeleteDoctor(doctor) {
  const user = currentUser.value
  if (!user) return false
  
  try {
    if (window.authService) {
      // Check if user is admin
      const isAdmin = await window.authService.hasRole('admin')
      if (isAdmin) return true
      
      // Check if user is doctor
      const isDoctor = await window.authService.hasRole('doctor')
      if (isDoctor) {
        // Doctors can only delete their own entries
        const userEmail = user.email
        const userDisplayName = user.displayName
        return doctor.creator === userEmail || doctor.creator === userDisplayName
      }
    }
    
    // Regular users cannot delete doctors
    return false
  } catch (error) {
    console.error('Error checking delete permissions:', error)
    return false
  }
}

function canRateDoctor(doctor) {
  const user = currentUser.value
  if (!user) return false
  return true // 登录用户都可以评分
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

async function loadDoctors() {
  try {
    // Try to get data from Firestore
    const result = await firestoreService.getDoctors()
    
    if (result.success && result.data.length > 0) {
      doctors.value = result.data
      
      // Load ratings for all doctors
      await loadDoctorRatings()
    } else {
      // If Firestore has no data, create initial data
      const initialDoctors = [
        { name: 'Dr. Smith', specialty: 'Cardiology', description: 'Expert in heart-related issues.', contact: '123-456-7890', email: 'dr.smith@example.com', creator: 'admin' },
        { name: 'Dr. Lee', specialty: 'Neurology', description: 'Specializes in brain and nervous system disorders.', contact: '098-765-4321', email: 'dr.lee@example.com', creator: 'admin' }
      ]
      
      // Save initial data to Firestore
      for (const doctor of initialDoctors) {
        await firestoreService.createDoctor(doctor)
      }
      
      // Re-fetch data
      const newResult = await firestoreService.getDoctors()
      if (newResult.success) {
        doctors.value = newResult.data
      }
    }
  } catch (error) {
    console.error('Failed to load doctors:', error)
    doctors.value = []
  }
}

async function saveDoctors() {
  try {
    // Data is already managed by Firestore service
    console.log('Doctors saved to Firestore')
  } catch (error) {
    console.error('Failed to save doctors:', error)
  }
}

async function loadRatings() {
  try {
    const result = await firestoreService.getDoctorRatings()
    return result.success ? result.data : {}
  } catch (error) {
    console.error('Failed to load ratings:', error)
    return {}
  }
}

async function loadDoctorRatings() {
  try {
    const ratings = await loadRatings()
    
    // Calculate average ratings for each doctor
    for (const doctor of doctors.value) {
      if (ratings[doctor.id] && ratings[doctor.id].length > 0) {
        const sum = ratings[doctor.id].reduce((acc, r) => acc + r.score, 0)
        const average = sum / ratings[doctor.id].length
        
        doctorRatings.value[doctor.id] = {
          average: average,
          count: ratings[doctor.id].length
        }
      } else {
        doctorRatings.value[doctor.id] = {
          average: null,
          count: 0
        }
      }
    }
  } catch (error) {
    console.error('Failed to load doctor ratings:', error)
  }
}

async function saveRatings(ratings) {
  try {
    await firestoreService.saveDoctorRatings(ratings)
  } catch (error) {
    console.error('Failed to save ratings:', error)
  }
}

async function loadDoctorComments() {
  try {
    // Load comments for all doctors
    const allComments = {}
    
    for (const doctor of doctors.value) {
      const result = await firestoreService.getDoctorCommentsFromSubcollection(doctor.id)
      if (result.success) {
        allComments[doctor.id] = result.data
      } else {
        allComments[doctor.id] = []
      }
    }
    
    doctorComments.value = allComments
  } catch (error) {
    console.error('Failed to load comments:', error)
    doctorComments.value = {}
  }
}

async function saveDoctorComments() {
  try {
    await firestoreService.saveDoctorComments(doctorComments.value)
  } catch (error) {
    console.error('Failed to save comments:', error)
  }
}

function showComments(doctor) {
  selectedDoctor.value = doctor
}

function closeComments() {
  selectedDoctor.value = null
  newCommentText.value = ''
}

function closeAddDoctorModal() {
  showAddDoctorModal.value = false
  // 重置表单
  Object.keys(newDoctor).forEach(key => {
    newDoctor[key] = ''
  })
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
}

async function addComment() {
  const user = currentUser.value
  if (!canComment.value || !newCommentText.value.trim()) return

  try {
    const doctorId = selectedDoctor.value.id
    const comment = {
      user: user.displayName || user.email || 'Anonymous',
      text: newCommentText.value.trim()
    }
    
    // Save comment to Firestore
    const result = await firestoreService.addDoctorComment(doctorId, comment)
    
    if (result.success) {
      // Get updated comments for the current doctor
      const commentsResult = await firestoreService.getDoctorCommentsFromSubcollection(doctorId)
      if (commentsResult.success) {
        // Force reactive update by creating a new object reference
        doctorComments.value = {
          ...doctorComments.value,
          [doctorId]: commentsResult.data
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
    const doctorId = selectedDoctor.value.id
    const comment = doctorComments.value[doctorId]?.[commentIndex]
    if (!comment) return
    
    // Delete comment from Firestore
    const result = await firestoreService.deleteDoctorComment(doctorId, comment.id)
    
    if (result.success) {
      // Get updated comments for the current doctor
      const commentsResult = await firestoreService.getDoctorCommentsFromSubcollection(doctorId)
      if (commentsResult.success) {
        // Force reactive update by creating a new object reference
        doctorComments.value = {
          ...doctorComments.value,
          [doctorId]: commentsResult.data
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

async function addDoctor() {
  if (!validate()) return
  const user = currentUser.value
  if (!user) return
  
  try {
    // Create doctor data
    const doctorData = {
      name: newDoctor.name,
      specialty: newDoctor.specialty,
      description: newDoctor.description,
      contact: newDoctor.contact,
      email: newDoctor.email,
      creator: user.displayName || user.email || 'Anonymous'
    }
    
    // Save to Firestore
    const result = await firestoreService.createDoctor(doctorData)
    
    if (result.success) {
      // Add to local array with the ID from Firestore (at the end)
      doctors.value.push({
        id: result.id,
        ...doctorData
      })
      
      // Clear form
      newDoctor.name = ''
      newDoctor.specialty = ''
      newDoctor.description = ''
      newDoctor.contact = ''
      newDoctor.email = ''
      
      // Show success message
      showSuccess('Doctor added successfully!')
    } else {
      alert('Failed to add doctor: ' + result.error)
    }
  } catch (error) {
    console.error('Error adding doctor:', error)
    alert('An error occurred while adding the doctor')
  }
}
async function deleteDoctor(id) {
  const user = currentUser.value
  if (!user) return
  const doctor = doctors.value.find(d => d.id === id)
  if (!doctor) return
  const userEmail = user.email
  const userDisplayName = user.displayName
  if (!window.authService?.hasRole('admin') && doctor.creator !== userEmail && doctor.creator !== userDisplayName) return
  
  try {
    // Delete from Firestore
    const result = await firestoreService.deleteDoctor(id)
    
    if (result.success) {
      // Remove from local array
      doctors.value = doctors.value.filter(d => d.id !== id)
      
      // Clean up related ratings with safety checks
      try {
        const ratings = await loadRatings()
        if (ratings && typeof ratings === 'object') {
          delete ratings[id]
          await saveRatings(ratings)
        }
      } catch (cleanupError) {
        console.warn('Warning: Failed to clean up related ratings:', cleanupError)
        // Continue with deletion even if cleanup fails
      }
      
      showSuccess('Doctor deleted successfully!')
    } else {
      alert('Failed to delete doctor: ' + result.error)
    }
  } catch (error) {
    console.error('Error deleting doctor:', error)
    alert('An error occurred while deleting the doctor')
  }
}
async function rateDoctor(doctorId, score) {
  const user = currentUser.value
  if (!user) return alert('Please log in to rate!')

  const ratings = await loadRatings()
  if (!ratings[doctorId]) ratings[doctorId] = []

  const userKey = user.email || user.displayName || 'Anonymous'
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

  await saveRatings(ratings)
  
  // Update doctorRatings for the specific doctor
  if (ratings[doctorId] && ratings[doctorId].length > 0) {
    const sum = ratings[doctorId].reduce((acc, r) => acc + r.score, 0)
    const average = sum / ratings[doctorId].length
    
    doctorRatings.value[doctorId] = {
      average: average,
      count: ratings[doctorId].length
    }
  } else {
    doctorRatings.value[doctorId] = {
      average: null,
      count: 0
    }
  }
}
async function getAverageRating(doctorId) {
  const ratings = await loadRatings()
  if (!ratings[doctorId] || ratings[doctorId].length === 0) return null
  const sum = ratings[doctorId].reduce((acc, r) => acc + r.score, 0)
  return sum / ratings[doctorId].length
}
async function loadUserRatings() {
  const user = currentUser.value
  if (!user) return
  const ratings = await loadRatings()
  const userKey = user.email || user.displayName || 'Anonymous'
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
  if (!user) return false
  
  const userEmail = user.email
  const userDisplayName = user.displayName
  
  // Admin can delete any comment using cached permissions
  if (userPermissions.value.admin) return true
  
  // Doctor and User can only delete their own comments
  return comment.user === userEmail || comment.user === userDisplayName
}

onMounted(async () => {
  currentUser.value = getCurrentUser()
  await checkUserPermissions()
  await loadDoctors()
  await loadUserRatings()
  await loadDoctorComments()
  window.addEventListener('auth-change', () => {
    currentUser.value = getCurrentUser()
    checkUserPermissions() // 重新检查权限
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