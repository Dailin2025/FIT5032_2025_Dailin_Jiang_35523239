import { createApp, h } from 'vue'
import Toast from '@/components/Toast.vue'

class ToastService {
  constructor() {
    this.toasts = []
    this.container = null
    this.init()
  }

  init() {
    // 创建容器
    this.container = document.createElement('div')
    this.container.id = 'toast-container'
    document.body.appendChild(this.container)
  }

  show(message, options = {}) {
    const {
      type = 'info',
      title = 'Notification',
      duration = 3000
    } = options

    // 创建 Toast 实例
    const toastApp = createApp({
      render() {
        return h(Toast, {
          message,
          type,
          title,
          duration,
          onClose: () => {
            this.removeToast(toastApp)
          }
        })
      }
    })

    // 挂载到容器
    const toastElement = toastApp.mount(this.container)
    
    // 添加到列表
    this.toasts.push({
      app: toastApp,
      element: toastElement
    })

    // 自动移除
    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(toastApp)
      }, duration)
    }

    return toastElement
  }

  success(message, title = 'Success', duration = 3000) {
    return this.show(message, { type: 'success', title, duration })
  }

  error(message, title = 'Error', duration = 4000) {
    return this.show(message, { type: 'error', title, duration })
  }

  warning(message, title = 'Warning', duration = 4000) {
    return this.show(message, { type: 'warning', title, duration })
  }

  info(message, title = 'Info', duration = 3000) {
    return this.show(message, { type: 'info', title, duration })
  }

  removeToast(toastApp) {
    const index = this.toasts.findIndex(t => t.app === toastApp)
    if (index > -1) {
      const toast = this.toasts[index]
      toast.app.unmount()
      this.toasts.splice(index, 1)
    }
  }

  clearAll() {
    this.toasts.forEach(toast => {
      toast.app.unmount()
    })
    this.toasts = []
  }
}

// 创建全局实例
const toastService = new ToastService()

// 导出实例和便捷方法
export default toastService

// 便捷方法
export const showToast = (message, options) => toastService.show(message, options)
export const showSuccess = (message, title, duration) => toastService.success(message, title, duration)
export const showError = (message, title, duration) => toastService.error(message, title, duration)
export const showWarning = (message, title, duration) => toastService.warning(message, title, duration)
export const showInfo = (message, title, duration) => toastService.info(message, title, duration) 