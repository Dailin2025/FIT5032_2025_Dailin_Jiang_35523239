<template>
  <div class="avoid-scams-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-image">
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <h1 class="hero-title">Avoid Scams</h1>
          <p class="hero-subtitle">Stay informed and protect yourself from common scams and fraud attempts</p>
        </div>
      </div>
      <div class="hero-dots">
        <div class="dot active"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    </div>

    <div class="container py-5">
      <!-- Create Article Button -->
      <div class="text-end mb-5" v-if="canCreateArticle">
        <button class="btn btn-primary btn-lg create-btn" @click="openCreateModal">
          <i class="fas fa-plus me-2"></i>Create New Article
        </button>
      </div>

      <!-- Available Articles Section -->
      <div class="content-card">
        <div class="card-header">
          <i class="fas fa-shield-alt card-icon"></i>
          <h2 class="card-title">Available Articles</h2>
        </div>
        <div class="card-body">
          <p class="section-description">Browse our community-contributed scam awareness articles and stay protected.</p>
          
          <!-- 交互式表格 -->
          <DataTable 
            :data="scams" 
            :columns="tableColumns"
            :page-size="10"
            @export="handleExport"
            @row-click="showScamDetail"
            @delete="handleDeleteArticle"
            @edit="handleEditArticle"
          >
            <template #actions="{ item }">
              <button 
                v-if="canUserDeleteArticle(item)"
                class="btn btn-outline-danger me-1" 
                @click.stop="handleDeleteArticle(item)"
                title="Delete"
                style="width: 35px; height: 35px; display: flex; align-items: center; justify-content: center;"
              >
                <i class="fas fa-trash"></i>
              </button>
              <button 
                v-if="canUserEditArticle(item)"
                class="btn btn-outline-primary" 
                @click.stop="handleEditArticle(item)"
                title="Edit"
                style="width: 35px; height: 35px; display: flex; align-items: center; justify-content: center;"
              >
                <i class="fas fa-edit"></i>
              </button>
            </template>
          </DataTable>
        </div>
      </div>

      <!-- 地图功能区域 -->
      <div class="content-card mt-4">
        <div class="card-header">
          <i class="fas fa-map-marked-alt card-icon"></i>
          <h2 class="card-title">Community Safety Map</h2>
        </div>
        <div class="card-body">
          <p class="section-description">View community safety information and report locations on the interactive map.</p>
          <MapComponent />
        </div>
      </div>

      <!-- 云函数功能区域 -->
      <div class="content-card mt-4">
        <div class="card-header">
          <i class="fas fa-cloud card-icon"></i>
          <h2 class="card-title">AI-Powered Analysis</h2>
        </div>
        <div class="card-body">
          <p class="section-description">Use cloud functions to analyze scam patterns and generate safety reports.</p>
          
          <div class="row">
                          <div class="col-md-6">
                <div class="feature-card">
                  <h5><i class="fas fa-brain me-2"></i>Scam Pattern Recognition</h5>
                  <p>Use artificial intelligence to analyze scam patterns and identify potential risks</p>
                  <button class="btn btn-primary" @click="analyzeScamPatterns">
                    <i class="fas fa-search me-2"></i>Start Analysis
                  </button>
                </div>
              </div>
              <div class="col-md-6">
                <div class="feature-card">
                  <h5><i class="fas fa-chart-line me-2"></i>Community Safety Score</h5>
                  <p>Calculate overall community safety score and provide safety recommendations</p>
                  <button class="btn btn-success" @click="calculateSafetyScore">
                    <i class="fas fa-calculator me-2"></i>Calculate Score
                  </button>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Article Detail Modal -->
    <div v-if="selectedScam" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content custom-modal">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedScam.title }}</h5>
            <button type="button" class="btn-close" @click="closeScamDetail"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <!-- Article Content -->
              <div class="col-md-7">
                <div class="article-section">
                  <h6 class="section-title">Full Article</h6>
                  <div class="article-content">
                    <p style="white-space: pre-wrap;">{{ selectedScam.detail }}</p>
                  </div>
                </div>
              </div>
              <!-- Comments Section -->
              <div class="col-md-5">
                <div class="comments-section">
                  <h6 class="section-title">Comments ({{ selectedScam.comments.length }})</h6>
                  <div class="comments-list mb-3" style="max-height: 40vh; overflow-y: auto;">
                    <div v-if="!selectedScam.comments.length" class="text-muted small empty-comments">
                      <i class="fas fa-comment-slash me-2"></i>
                      No comments yet. Be the first to share your thoughts.
                    </div>
                    <div v-for="comment in selectedScam.comments" :key="comment.id" class="mb-3">
                      <div class="comment-card">
                        <div class="comment-header">
                          <strong class="comment-author">{{ comment.author }}</strong>
                          <button v-if="canDeleteComment(comment)" class="btn btn-sm btn-outline-danger delete-comment-btn" @click="handleDeleteComment(comment.id)">
                            <i class="fas fa-times"></i>
                          </button>
                        </div>
                        <p class="comment-text">{{ comment.text }}</p>
                      </div>
                    </div>
                  </div>
                  <!-- Add Comment Form -->
                  <div v-if="canComment" class="comment-form">
                    <textarea v-model="newCommentText" class="form-control mb-3" rows="3" placeholder="Add your comment..."></textarea>
                    <button class="btn btn-primary w-100" @click="handleAddComment">
                      <i class="fas fa-paper-plane me-2"></i>Post Comment
                    </button>
                  </div>
                  <div v-else class="login-prompt">
                    <i class="fas fa-lock me-2"></i>
                    You must be logged in to post a comment.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Article Modal -->
    <div v-if="showCreateModal" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content custom-modal">
                <div class="modal-header">
                    <h5 class="modal-title">Create New Scam Article</h5>
                    <button type="button" class="btn-close" @click="closeCreateModal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-4">
                        <label for="newScamTitle" class="form-label">Title</label>
                        <input type="text" id="newScamTitle" class="form-control" v-model="newScam.title" placeholder="Enter article title...">
                    </div>
                    <div class="mb-4">
                        <label for="newScamBrief" class="form-label">Brief Description</label>
                        <textarea id="newScamBrief" class="form-control" rows="3" v-model="newScam.brief" placeholder="Enter a brief description..."></textarea>
                    </div>
                    <div class="mb-4">
                        <label for="newScamDetail" class="form-label">Full Article Content</label>
                        <textarea id="newScamDetail" class="form-control" rows="8" v-model="newScam.detail" placeholder="Enter the full article content..."></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="closeCreateModal">Cancel</button>
                    <button type="button" class="btn btn-primary" @click="handleCreateScam">
                        <i class="fas fa-paper-plane me-2"></i>Publish Article
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Edit Article Modal -->
    <div v-if="showEditModal" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content custom-modal">
                <div class="modal-header">
                    <h5 class="modal-title">Edit Article</h5>
                    <button type="button" class="btn-close" @click="cancelEdit"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-4">
                        <label for="editScamTitle" class="form-label">Title</label>
                        <input type="text" id="editScamTitle" class="form-control" v-model="editForm.title" placeholder="Enter article title...">
                    </div>
                    <div class="mb-4">
                        <label for="editScamBrief" class="form-label">Brief Description</label>
                        <textarea id="editScamBrief" class="form-control" rows="3" v-model="editForm.brief" placeholder="Enter a brief description..."></textarea>
                    </div>
                    <div class="mb-4">
                        <label for="editScamDetail" class="form-label">Full Article Content</label>
                        <textarea id="editScamDetail" class="form-control" rows="8" v-model="editForm.detail" placeholder="Enter the full article content..."></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="cancelEdit">Cancel</button>
                    <button type="button" class="btn btn-primary" @click="saveEdit">
                        <i class="fas fa-save me-2"></i>Save Changes
                    </button>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { sanitizeInput } from '@/utils/security.js'
import DataTable from '@/components/DataTable.vue'
import MapComponent from '@/components/MapComponent.vue'
import cloudFunctionService from '@/services/cloudFunctionService.js'
import emailService from '@/services/emailService.js'
import firestoreService from '@/services/firestoreService.js'
import exportService from '@/services/exportService.js'
import { showSuccess, showError } from '@/services/toastService.js'

const scams = ref([])
const currentUser = ref(null)
const selectedScam = ref(null)
const showCreateModal = ref(null)
const newScam = ref({ title: '', brief: '', detail: '' })
const newCommentText = ref('')
const userPermissions = ref({ admin: false, doctor: false })
const lastCheckedUser = ref(null) // 用于缓存上次检查的用户邮箱

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
      lastCheckedUser.value = userEmail
    } catch (error) {
      console.error('Error checking permissions:', error)
      userPermissions.value = { admin: false, doctor: false }
    }
  }
}

// Set global permission functions for DataTable component
window.canDeleteOverride = canUserDeleteArticle
window.canEditOverride = canUserEditArticle

// Table column definitions
const tableColumns = ref([
  { key: 'id', label: 'ID', type: 'number' },
  { key: 'title', label: 'Title', type: 'text' },
  { key: 'brief', label: 'Brief', type: 'text' },
  { key: 'author', label: 'Author', type: 'text' },
  { key: 'createdAt', label: 'Created At', type: 'date' },
  { key: 'status', label: 'Status', type: 'status' },
  { key: 'actions', label: 'Actions', type: 'actions' }
])

const canCreateArticle = computed(() => !!currentUser.value)
const canComment = computed(() => !!currentUser.value)

function canUserDeleteArticle(article) {
  if (!currentUser.value) {
    return false
  }
  
  // Check if user is admin using cached permissions
  if (userPermissions.value.admin) {
    return true
  }
  
  // Check if user is doctor using cached permissions
  if (userPermissions.value.doctor) {
    // Doctors can only delete their own articles
    const userEmail = currentUser.value?.email
    const userDisplayName = currentUser.value?.displayName
    if (article.author === userEmail || article.author === userDisplayName) {
      return true
    }
    return false
  }
  
  // Regular users can only delete their own articles
  const userEmail = currentUser.value?.email
  const userDisplayName = currentUser.value?.displayName
  if (article.author === userEmail || article.author === userDisplayName) {
    return true
  }
  
  return false
}

function canUserEditArticle(article) {
  if (!currentUser.value) return false
  
  // Check if user is admin using cached permissions
  if (userPermissions.value.admin) return true
  
  // Check if user is doctor using cached permissions
  if (userPermissions.value.doctor) {
    // Doctors can only edit their own articles
    const userEmail = currentUser.value?.email
    const userDisplayName = currentUser.value?.displayName
    if (article.author === userEmail || article.author === userDisplayName) {
      return true
    }
    return false
  }
  
  // Regular users can only edit their own articles
  const userEmail = currentUser.value?.email
  const userDisplayName = currentUser.value?.displayName
  if (article.author === userEmail || article.author === userDisplayName) {
    return true
  }
  
  return false
}

async function initializeScams() {
  try {
    // Try to get data from Firestore
    const result = await firestoreService.getScams()
    
    if (result.success && result.data.length > 0) {
      // If Firestore has data, use it
      scams.value = result.data
    } else {
      // If Firestore has no data, create initial data
      const initialScams = [
        {
          title: 'Impersonating Customer Service',
          brief: 'Scammers pretend to be from banks or companies to steal your information.',
          detail: 'Scammers may call claiming to be from your bank or a well-known company, asking for your account details or verification codes. Never share such information over the phone. Always hang up and call the official number of the company to verify.',
          author: 'Community Admin',
          comments: [],
          status: 'active'
        },
        {
          title: 'Lottery/Prize Scam',
          brief: 'You are told you have won a prize, but must pay a fee to claim it.',
          detail: 'You may receive a call or message saying you have won a lottery or prize, but you need to pay a "processing fee" or provide your bank details. This is a scam. Never transfer money to claim a prize. Legitimate lotteries do not ask for fees upfront.',
          author: 'Community Admin',
          comments: [],
          status: 'active'
        },
        {
          title: 'Impersonating Family or Friends',
          brief: 'Scammers pretend to be your relatives or friends in need of urgent help.',
          detail: 'You may get a message from someone claiming to be your child or friend, saying they are in trouble and need money urgently. Always verify their identity by calling them directly on their known number, not the one they contacted you from.',
          author: 'Community Admin',
          comments: [],
          status: 'active'
        },
        {
          title: 'Phishing Links',
          brief: 'Fake websites or links try to steal your passwords or money.',
          detail: 'Scammers may send you links to fake websites that look real, asking you to log in or enter payment info. Always check the website address carefully (e.g., for spelling errors) and do not click on suspicious links from emails or text messages.',
          author: 'Community Admin',
          comments: [],
          status: 'active'
        }
      ]
      
      // Save initial data to Firestore
      for (const scam of initialScams) {
        await firestoreService.createScam(scam)
      }
      
      // Re-fetch data
      const newResult = await firestoreService.getScams()
      if (newResult.success) {
        scams.value = newResult.data
      }
    }
  } catch (error) {
    console.error('Failed to initialize scam articles:', error)
    // If Firestore fails, show empty state
    scams.value = []
  }
}

async function saveScams() {
  try {
    // Data is already managed by Firestore service, no need for additional saving here
    console.log('Data saved to Firestore')
  } catch (error) {
    console.error('Failed to save data:', error)
  }
}

async function handleAuthChange() {
  // Get current user from auth service instead of localStorage
  const authService = window.authService || null
  if (authService) {
    currentUser.value = authService.getCurrentUser()
    await checkUserPermissions() // 重新检查权限
  }
}

onMounted(async () => {
  handleAuthChange()
  await checkUserPermissions()
  initializeScams()
  window.addEventListener('auth-change', handleAuthChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('auth-change', handleAuthChange)
})

// Article Creation Logic
function openCreateModal() {
  showCreateModal.value = true
}

function closeCreateModal() {
  showCreateModal.value = false
  newScam.value = { title: '', brief: '', detail: '' }
}

async function handleCreateScam() {
  if (!newScam.value.title || !newScam.value.brief || !newScam.value.detail) {
    showError('Please fill in all fields.')
    return
  }
  
  try {
    // Sanitize user inputs
    const newArticle = {
      title: sanitizeInput(newScam.value.title.trim()),
      brief: sanitizeInput(newScam.value.brief.trim()),
      detail: sanitizeInput(newScam.value.detail.trim()),
      author: currentUser.value?.displayName || currentUser.value?.email || 'Anonymous',
      comments: [],
      status: 'active'
    }
    
    // Save to Firestore
    const result = await firestoreService.createScam(newArticle)
    
    if (result.success) {
      // Re-fetch latest data
      const scamsResult = await firestoreService.getScams()
      if (scamsResult.success) {
        scams.value = scamsResult.data
      }
      
      closeCreateModal()
      showSuccess('Article created successfully!')
    } else {
              showError('Creation failed: ' + result.error)
    }
  } catch (error) {
    console.error('Article creation error:', error)
    showError('An error occurred during creation')
  }
}

// Article Deletion Logic
async function handleDeleteArticle(article) {
  // Check permissions again before deletion
  if (!canUserDeleteArticle(article)) {
    showError('You do not have permission to delete this article.')
    return
  }
  
  let confirmMessage
  if (userPermissions.value.admin) {
    confirmMessage = `Are you sure you want to delete the article "${article.title}"? (Admin action)`
  } else if (userPermissions.value.doctor) {
    confirmMessage = `Are you sure you want to delete your article "${article.title}"? (Doctor action)`
  } else {
    confirmMessage = `Are you sure you want to delete your article "${article.title}"?`
  }
    
  if (!confirm(confirmMessage)) {
    return
  }
  
  try {
    const result = await firestoreService.deleteScam(article.id)
    
    if (result.success) {
      // Re-fetch latest data
      const scamsResult = await firestoreService.getScams()
      if (scamsResult.success) {
        scams.value = scamsResult.data
      }
      showSuccess('Article deleted successfully!')
    } else {
              showError('Deletion failed: ' + result.error)
    }
  } catch (error) {
    console.error('Article deletion error:', error)
          showError('An error occurred during deletion')
  }
}

// Article Edit Logic
const showEditModal = ref(false)
const editingArticle = ref(null)
const editForm = ref({ title: '', brief: '', detail: '' })

function handleEditArticle(article) {
  editingArticle.value = article
  editForm.value = {
    title: article.title || '',
    brief: article.brief || '',
    detail: article.detail || ''
  }
  showEditModal.value = true
}

async function saveEdit() {
  if (!editForm.value.title.trim() || !editForm.value.brief.trim() || !editForm.value.detail.trim()) {
    showError('All fields are required!')
    return
  }
  
  try {
    const updatedArticle = {
      ...editingArticle.value,
      title: sanitizeInput(editForm.value.title.trim()),
      brief: sanitizeInput(editForm.value.brief.trim()),
      detail: sanitizeInput(editForm.value.detail.trim()),
      updatedAt: new Date()
    }
    
    const result = await firestoreService.updateScam(editingArticle.value.id, updatedArticle)
    
    if (result.success) {
      // Update local data
      const index = scams.value.findIndex(s => s.id === editingArticle.value.id)
      if (index !== -1) {
        scams.value[index] = { ...scams.value[index], ...updatedArticle }
      }
      
      showEditModal.value = false
      editingArticle.value = null
      showSuccess('Article updated successfully!')
    } else {
              showError('Failed to update article: ' + result.error)
    }
  } catch (error) {
    console.error('Article update error:', error)
    showError('An error occurred while updating article')
  }
}

function cancelEdit() {
  showEditModal.value = false
  editingArticle.value = null
  editForm.value = { title: '', brief: '', detail: '' }
}

// Article Detail & Comment Logic
function showScamDetail(scam) {
  selectedScam.value = scam
}

function closeScamDetail() {
  selectedScam.value = null
  newCommentText.value = ''
}

async function handleAddComment() {
  if (!newCommentText.value.trim()) {
    showError('Comment cannot be empty.')
    return
  }
  
  try {
    // Sanitize comment text
    const comment = {
      author: currentUser.value?.displayName || currentUser.value?.email || 'Anonymous',
      text: sanitizeInput(newCommentText.value.trim())
    }
    
    // Save comment to Firestore
    const result = await firestoreService.addComment(selectedScam.value.id, comment)
    
    if (result.success) {
      // Get updated comments for the current article
      const commentsResult = await firestoreService.getScamComments(selectedScam.value.id)
      if (commentsResult.success) {
        // Update the selected article's comments
        if (!selectedScam.value.comments) {
          selectedScam.value.comments = []
        }
        selectedScam.value.comments = commentsResult.data
        
        // Also update the main scams list
        const scamIndex = scams.value.findIndex(s => s.id === selectedScam.value.id)
        if (scamIndex !== -1) {
          scams.value[scamIndex].comments = commentsResult.data
        }
      }
      
      newCommentText.value = ''
      showSuccess('Comment added successfully!')
    } else {
              showError('Failed to add comment: ' + result.error)
    }
  } catch (error) {
    console.error('Comment addition error:', error)
    showError('An error occurred while adding comment')
  }
}

function canDeleteComment(comment) {
  if (!currentUser.value) return false
  
  // Check if user is admin using cached permissions
  if (userPermissions.value.admin) return true
  
  // Check if user is the comment author
  const userEmail = currentUser.value?.email
  const userDisplayName = currentUser.value?.displayName
  if (comment.author === userEmail || comment.author === userDisplayName) {
    return true
  }
  
  return false
}

async function handleDeleteComment(commentId) {
  try {
    const result = await firestoreService.deleteComment(selectedScam.value.id, commentId)
    
    if (result.success) {
      // Get updated comments for the current article
      const commentsResult = await firestoreService.getScamComments(selectedScam.value.id)
      if (commentsResult.success) {
        // Update the selected article's comments
        if (!selectedScam.value.comments) {
          selectedScam.value.comments = []
        }
        selectedScam.value.comments = commentsResult.data
        
        // Also update the main scams list
        const scamIndex = scams.value.findIndex(s => s.id === selectedScam.value.id)
        if (scamIndex !== -1) {
          scams.value[scamIndex].comments = commentsResult.data
        }
      }
      showSuccess('Comment deleted successfully!')
    } else {
              showError('Failed to delete comment: ' + result.error)
    }
  } catch (error) {
    console.error('Comment deletion error:', error)
    showError('An error occurred while deleting comment')
  }
}

// Export handling
function handleExport(exportData) {
  const { format, data } = exportData
  const filename = `scam-articles-${new Date().toISOString().split('T')[0]}`
  
  if (format === 'csv') {
    exportService.exportToCSV(data, `${filename}.csv`)
  } else if (format === 'pdf') {
    exportService.exportToPDF(data, `${filename}.pdf`, 'Scam Prevention Articles Data')
  }
}

// Cloud function related methods
async function analyzeScamPatterns() {
  try {
    const result = await cloudFunctionService.detectScamPatterns(scams.value)
    if (result.success) {
      showSuccess('Scam pattern analysis completed!')
      console.log('Analysis result:', result.data)
    } else {
      alert('Analysis failed: ' + result.error)
    }
  } catch (error) {
    console.error('Analysis error:', error)
    alert('An error occurred during analysis')
  }
}

async function calculateSafetyScore() {
  try {
    const result = await cloudFunctionService.calculateCommunitySafetyScore()
    if (result.success) {
      showSuccess('Community safety score calculation completed!')
      console.log('Safety score:', result.data)
    } else {
      alert('Calculation failed: ' + result.error)
    }
  } catch (error) {
    console.error('Calculation error:', error)
    alert('An error occurred during calculation')
  }
}

// Email report functionality
async function reportScam(scamData) {
  if (!currentUser.value) {
    showError('Please login first')
    return
  }
  
  try {
    const result = await emailService.sendScamReport(scamData, currentUser.value.email)
    if (result.success) {
      showSuccess('Report email sent successfully!')
    } else {
      alert('Send failed: ' + result.error)
    }
  } catch (error) {
    console.error('Send error:', error)
    alert('An error occurred while sending')
  }
}
</script>

<style scoped>
.avoid-scams-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
}

.avoid-scams-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

/* Hero Section */
.hero-section {
  position: relative;
  margin-bottom: 2rem;
}

.hero-image {
  position: relative;
  height: 300px;
  background: url('https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1') center/cover;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  padding: 0 2rem;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.hero-subtitle {
  font-size: 1.25rem;
  opacity: 0.9;
  line-height: 1.6;
}

.hero-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 1rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.dot.active {
  background: white;
  transform: scale(1.2);
}

/* Content Cards */
.content-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.card-icon {
  font-size: 2rem;
}

.card-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0;
}

.card-body {
  padding: 2rem;
}

.section-description {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  text-align: center;
}

/* Form Controls */
.form-control {
  border-radius: 10px;
  border: 2px solid #e9ecef;
  padding: 0.75rem;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.form-label {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 15px;
  padding: 1rem 2rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

/* Articles Grid */
.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.article-card {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
}

.article-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.article-header {
  margin-bottom: 1rem;
}

.article-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.article-author {
  color: #667eea;
  font-size: 0.9rem;
  margin: 0;
}

.article-brief {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.article-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-outline-primary {
  border: 2px solid #667eea;
  color: #667eea;
  border-radius: 10px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-outline-primary:hover {
  background: #667eea;
  color: white;
  transform: translateY(-1px);
}

.btn-danger {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  border: none;
  border-radius: 10px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  grid-column: 1 / -1;
}

.empty-icon {
  font-size: 4rem;
  color: #667eea;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.empty-state h4 {
  color: #333;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.empty-state p {
  color: #666;
  font-size: 1.1rem;
}

/* Modal Styling */
.custom-modal {
  border-radius: 20px;
  border: none;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.custom-modal .modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px 20px 0 0;
  border: none;
  padding: 1.5rem;
}

.custom-modal .modal-title {
  font-weight: 600;
  color: white;
}

.custom-modal .modal-body {
  padding: 2rem;
}

.custom-modal .btn-close {
  filter: invert(1);
}

/* Article Section */
.article-section {
  padding-right: 2rem;
}

.section-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #667eea;
}

.article-content {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 15px;
  line-height: 1.8;
  color: #555;
}

/* Comments Section */
.comments-section {
  border-left: 3px solid #667eea;
  padding-left: 2rem;
}

.comments-list {
  max-height: 40vh;
  overflow-y: auto;
  padding-right: 10px;
}

.comments-list::-webkit-scrollbar {
  width: 6px;
}

.comments-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.comments-list::-webkit-scrollbar-thumb {
  background: #667eea;
  border-radius: 10px;
}

.empty-comments {
  text-align: center;
  padding: 2rem;
  color: #999;
  font-style: italic;
}

.comment-card {
  background: white;
  border-radius: 15px;
  padding: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #667eea;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.comment-author {
  color: #667eea;
  font-weight: 600;
}

.delete-comment-btn {
  padding: 4px 8px;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.comment-text {
  color: #555;
  margin: 0;
  line-height: 1.5;
}

.comment-form {
  margin-top: 1.5rem;
}

.comment-form textarea {
  border-radius: 15px;
  border: 2px solid #e9ecef;
  padding: 1rem;
  transition: border-color 0.3s ease;
}

.comment-form textarea:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.login-prompt {
  text-align: center;
  padding: 1rem;
  color: #999;
  font-style: italic;
  background: #f8f9fa;
  border-radius: 10px;
  margin-top: 1rem;
}

/* Modal Animation */
.modal.fade.show {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .card-header {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .card-title {
    font-size: 1.5rem;
  }
  
  .articles-grid {
    grid-template-columns: 1fr;
  }
  
  .article-actions {
    flex-direction: column;
  }
  
  .comments-section {
    border-left: none;
    border-top: 3px solid #667eea;
    padding-left: 0;
    padding-top: 1rem;
    margin-top: 1rem;
  }
  
  .article-section {
    padding-right: 0;
  }
}

/* Button Hover Effects */
.btn {
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

/* Feature card styles */
.feature-card {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  height: 100%;
}

.feature-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.feature-card h5 {
  color: #333;
  margin-bottom: 1rem;
  font-weight: 600;
}

.feature-card p {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

/* Accessibility feature styles */
.accessibility-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  border-radius: 25px;
  padding: 0.5rem 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.font-size-controls {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1000;
  background: white;
  border-radius: 10px;
  padding: 0.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.font-size-display {
  min-width: 50px;
  text-align: center;
  font-weight: 600;
  color: #333;
}

/* Screen reader only styles */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style> 