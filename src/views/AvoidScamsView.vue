<template>
  <div>
    <PageHeader 
      title="Avoid Scams"
      image="https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    />
    <div class="container py-5">
      <!-- Create Article Button -->
      <div class="text-end mb-4" v-if="canCreateArticle">
        <button class="btn btn-primary" @click="openCreateModal">Create New Article</button>
      </div>

      <!-- Scams Grid -->
      <div class="row mb-4">
        <div class="col-12 col-md-6 col-lg-4 mb-4" v-for="scam in scams" :key="scam.id">
          <div class="card h-100">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">{{ scam.title }}</h5>
              <p class="card-subtitle mb-2 text-muted small">By {{ scam.author }}</p>
              <p class="card-text flex-grow-1">{{ scam.brief }}</p>
              <div class="mt-auto d-flex justify-content-between align-items-center">
                <button class="btn btn-outline-info" @click="showScamDetail(scam)">View Details & Comments</button>
                <button v-if="canUserDeleteArticle(scam)" class="btn btn-sm btn-danger" @click="handleDeleteArticle(scam.id)">Delete</button>
              </div>
            </div>
          </div>
        </div>
        <div v-if="!scams.length" class="col-12 text-center text-muted">
          <p>No scam articles have been posted yet. Be the first to contribute!</p>
        </div>
      </div>
    </div>

    <!-- Article Detail Modal -->
    <div v-if="selectedScam" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedScam.title }}</h5>
            <button type="button" class="btn-close" @click="closeScamDetail"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <!-- Article Content -->
              <div class="col-md-7">
                <h6>Full Article</h6>
                <p style="white-space: pre-wrap;">{{ selectedScam.detail }}</p>
              </div>
              <!-- Comments Section -->
              <div class="col-md-5 border-start">
                <h6>Comments ({{ selectedScam.comments.length }})</h6>
                <div class="comments-list mb-3" style="max-height: 40vh; overflow-y: auto;">
                  <div v-if="!selectedScam.comments.length" class="text-muted small">
                    No comments yet. Be the first to share your thoughts.
                  </div>
                  <div v-for="comment in selectedScam.comments" :key="comment.id" class="mb-2">
                    <div class="card bg-light">
                      <div class="card-body p-2 d-flex justify-content-between align-items-start">
                        <div>
                          <strong>{{ comment.author }}:</strong>
                          <p class="mb-0">{{ comment.text }}</p>
                        </div>
                        <button v-if="canDeleteComment(comment)" class="btn btn-sm btn-outline-danger ms-2 flex-shrink-0" @click="handleDeleteComment(comment.id)">
                          &times;
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- Add Comment Form -->
                <div v-if="canComment">
                  <textarea v-model="newCommentText" class="form-control mb-2" rows="3" placeholder="Add your comment..."></textarea>
                  <button class="btn btn-info w-100" @click="handleAddComment">Post Comment</button>
                </div>
                <div v-else class="text-muted small">
                  You must be logged in to post a comment.
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
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Create New Scam Article</h5>
                    <button type="button" class="btn-close" @click="closeCreateModal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="newScamTitle" class="form-label">Title</label>
                        <input type="text" id="newScamTitle" class="form-control" v-model="newScam.title">
                    </div>
                    <div class="mb-3">
                        <label for="newScamBrief" class="form-label">Brief Description</label>
                        <textarea id="newScamBrief" class="form-control" rows="3" v-model="newScam.brief"></textarea>
                    </div>
                    <div class="mb-3">
                        <label for="newScamDetail" class="form-label">Full Article Content</label>
                        <textarea id="newScamDetail" class="form-control" rows="8" v-model="newScam.detail"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="closeCreateModal">Cancel</button>
                    <button type="button" class="btn btn-primary" @click="handleCreateScam">Publish Article</button>
                </div>
            </div>
        </div>
    </div>

  </div>
</template>

<script setup>
import PageHeader from '@/components/PageHeader.vue'
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'

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
      detail: 'You may receive a call or message saying you have won a lottery or prize, but you need to pay a “processing fee” or provide your bank details. This is a scam. Never transfer money to claim a prize. Legitimate lotteries do not ask for fees upfront.',
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
  const newArticle = {
    id: Date.now(),
    title: newScam.value.title,
    brief: newScam.value.brief,
    detail: newScam.value.detail,
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
  const comment = {
    id: Date.now(),
    author: currentUser.value.username,
    text: newCommentText.value.trim()
  }
  const scamIndex = scams.value.findIndex(s => s.id === selectedScam.value.id)
  if (scamIndex !== -1) {
    // Directly mutate the comments array. Vue's reactivity will handle the update.
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
      // Directly mutate the comments array. Vue's reactivity will handle the update.
      article.comments.splice(commentIndex, 1)
      saveScams()
    }
  }
}
</script>

<style scoped>
.modal.fade.show {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style> 