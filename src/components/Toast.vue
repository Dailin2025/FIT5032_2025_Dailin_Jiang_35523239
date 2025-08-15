<template>
  <div v-if="isVisible" class="toast-container">
    <div class="toast" :class="type">
      <div class="toast-header">
        <i :class="iconClass"></i>
        <span class="toast-title">{{ title }}</span>
        <button class="toast-close" @click="hide">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="toast-body">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  title: {
    type: String,
    default: 'Notification'
  },
  duration: {
    type: Number,
    default: 3000
  }
})

const isVisible = ref(false)

const iconClass = computed(() => {
  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  }
  return icons[props.type] || icons.info
})

function show() {
  isVisible.value = true
  if (props.duration > 0) {
    setTimeout(() => {
      hide()
    }, props.duration)
  }
}

function hide() {
  isVisible.value = false
}

// 暴露方法给父组件
defineExpose({
  show,
  hide
})

onMounted(() => {
  show()
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 400px;
}

.toast {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-bottom: 10px;
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

.toast-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.toast-header i {
  margin-right: 8px;
  font-size: 16px;
}

.toast-title {
  flex: 1;
  font-weight: 600;
  font-size: 14px;
}

.toast-close {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.toast-close:hover {
  background: #e9ecef;
  color: #495057;
}

.toast-body {
  padding: 16px;
  color: #212529;
  font-size: 14px;
  line-height: 1.5;
}

/* Toast types */
.toast.success .toast-header {
  background: #d4edda;
  border-bottom-color: #c3e6cb;
}

.toast.success .toast-header i {
  color: #155724;
}

.toast.success .toast-title {
  color: #155724;
}

.toast.error .toast-header {
  background: #f8d7da;
  border-bottom-color: #f5c6cb;
}

.toast.error .toast-header i {
  color: #721c24;
}

.toast.error .toast-title {
  color: #721c24;
}

.toast.warning .toast-header {
  background: #fff3cd;
  border-bottom-color: #ffeaa7;
}

.toast.warning .toast-header i {
  color: #856404;
}

.toast.warning .toast-title {
  color: #856404;
}

.toast.info .toast-header {
  background: #d1ecf1;
  border-bottom-color: #bee5eb;
}

.toast.info .toast-header i {
  color: #0c5460;
}

.toast.info .toast-title {
  color: #0c5460;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

.toast.hiding {
  animation: slideOut 0.3s ease-in forwards;
}
</style> 