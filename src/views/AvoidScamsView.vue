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
          
          <div class="articles-grid">
            <div v-for="scam in scams" :key="scam.id" class="article-card">
              <div class="article-header">
                <h3 class="article-title">{{ scam.title }}</h3>
                <p class="article-author">By {{ scam.author }}</p>
              </div>
              <div class="article-content">
                <p class="article-brief">{{ scam.brief }}</p>
                <div class="article-actions">
                  <button class="btn btn-outline-primary" @click="showScamDetail(scam)">
                    <i class="fas fa-eye me-2"></i>View Details
                  </button>
                  <button v-if="canUserDeleteArticle(scam)" class="btn btn-danger" @click="handleDeleteArticle(scam.id)">
                    <i class="fas fa-trash me-1"></i>Delete
                  </button>
                </div>
              </div>
            </div>
            
            <div v-if="!scams.length" class="empty-state">
              <i class="fas fa-shield-alt empty-icon"></i>
              <h4>No articles yet</h4>
              <p>Be the first to contribute and help others stay safe!</p>
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
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { sanitizeInput } from '@/utils/security.js'

const scams = ref([])
const currentUser = ref(null)
const selectedScam = ref(null)
const showCreateModal = ref(false)
const newScam = ref({ title: '', brief: '', detail: '' })
const newCommentText = ref('')

const canCreateArticle = computed(() => !!currentUser.value)
const canComment = computed(() => !!currentUser.value)

function canUserDeleteArticle(article) {
  if (!currentUser.value) return false
  if (currentUser.value.role === 'admin') return true
  if ((currentUser.value.role === 'user' || currentUser.value.role === 'doctor') && article.author === currentUser.value.username) {
    return true
  }
  return false
}

function initializeScams() {
  const initialScams = [
    {
      id: 1,
      title: 'Impersonating Customer Service',
      brief: 'Scammers pretend to be from banks or companies to steal your information.',
      detail: 'Scammers may call claiming to be from your bank or a well-known company, asking for your account details or verification codes. Never share such information over the phone. Always hang up and call the official number of the company to verify.',
      author: 'Community Admin',
      comments: []
    },
    {
      id: 2,
      title: 'Lottery/Prize Scam',
      brief: 'You are told you have won a prize, but must pay a fee to claim it.',
      detail: 'You may receive a call or message saying you have won a lottery or prize, but you need to pay a "processing fee" or provide your bank details. This is a scam. Never transfer money to claim a prize. Legitimate lotteries do not ask for fees upfront.',
      author: 'Community Admin',
      comments: []
    },
    {
      id: 3,
      title: 'Impersonating Family or Friends',
      brief: 'Scammers pretend to be your relatives or friends in need of urgent help.',
      detail: 'You may get a message from someone claiming to be your child or friend, saying they are in trouble and need money urgently. Always verify their identity by calling them directly on their known number, not the one they contacted you from.',
      author: 'Community Admin',
      comments: []
    },
    {
      id: 4,
      title: 'Phishing Links',
      brief: 'Fake websites or links try to steal your passwords or money.',
      detail: 'Scammers may send you links to fake websites that look real, asking you to log in or enter payment info. Always check the website address carefully (e.g., for spelling errors) and do not click on suspicious links from emails or text messages.',
      author: 'Community Admin',
      comments: []
    }
  ]
  localStorage.setItem('scams', JSON.stringify(initialScams))
  scams.value = initialScams
}

function saveScams() {
  localStorage.setItem('scams', JSON.stringify(scams.value))
}

function handleAuthChange() {
  currentUser.value = JSON.parse(localStorage.getItem('currentUser'))
}

onMounted(() => {
  handleAuthChange()
  const storedScams = localStorage.getItem('scams')
  if (storedScams) {
    scams.value = JSON.parse(storedScams)
  } else {
    initializeScams()
  }
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

function handleCreateScam() {
  if (!newScam.value.title || !newScam.value.brief || !newScam.value.detail) {
    alert('Please fill in all fields.')
    return
  }
  
  // Sanitize user inputs
  const newArticle = {
    id: Date.now(),
    title: sanitizeInput(newScam.value.title.trim()),
    brief: sanitizeInput(newScam.value.brief.trim()),
    detail: sanitizeInput(newScam.value.detail.trim()),
    author: currentUser.value.username,
    comments: []
  }
  scams.value.unshift(newArticle)
  saveScams()
  closeCreateModal()
}

// Article Deletion Logic
function handleDeleteArticle(articleId) {
  const index = scams.value.findIndex(s => s.id === articleId);
  if (index !== -1) {
    scams.value.splice(index, 1);
    saveScams();
  }
}

// Article Detail & Comment Logic
function showScamDetail(scam) {
  selectedScam.value = scam
}

function closeScamDetail() {
  selectedScam.value = null
  newCommentText.value = ''
}

function handleAddComment() {
  if (!newCommentText.value.trim()) {
    alert('Comment cannot be empty.')
    return
  }
  
  // Sanitize comment text
  const comment = {
    id: Date.now(),
    author: currentUser.value.username,
    text: sanitizeInput(newCommentText.value.trim())
  }
  const scamIndex = scams.value.findIndex(s => s.id === selectedScam.value.id)
  if (scamIndex !== -1) {
    scams.value[scamIndex].comments.push(comment)
    saveScams()
  }
  newCommentText.value = ''
}

function canDeleteComment(comment) {
  if (!currentUser.value) return false
  if (currentUser.value.role === 'admin') return true
  if (currentUser.value.username === comment.author) return true
  return false
}

function handleDeleteComment(commentId) {
  const scamIndex = scams.value.findIndex(s => s.id === selectedScam.value.id)
  if (scamIndex !== -1) {
    const article = scams.value[scamIndex]
    const commentIndex = article.comments.findIndex(c => c.id === commentId)
    if (commentIndex !== -1) {
      article.comments.splice(commentIndex, 1)
      saveScams()
    }
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
</style> 