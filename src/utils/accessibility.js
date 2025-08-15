// 无障碍功能工具类
export class AccessibilityHelper {
  constructor() {
    this.focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    this.currentFocusIndex = 0
    this.focusableElementsList = []
  }

  // 初始化无障碍功能
  init() {
    this.setupKeyboardNavigation()
    this.setupScreenReaderSupport()
    this.setupHighContrastMode()
    this.setupFontSizeControls()
    this.setupFocusIndicators()
  }

  // 设置键盘导航
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // 确保 e.key 存在
      if (!e.key) return
      
      // Tab 键导航
      if (e.key === 'Tab') {
        this.handleTabNavigation(e)
      }
      
      // 方向键导航
      if (e.key.startsWith('Arrow')) {
        this.handleArrowNavigation(e)
      }
      
      // Enter 和 Space 键激活
      if (e.key === 'Enter' || e.key === ' ') {
        this.handleActivation(e)
      }
      
      // Escape 键关闭模态框
      if (e.key === 'Escape') {
        this.handleEscape(e)
      }
    })
  }

  // 处理 Tab 键导航
  handleTabNavigation(e) {
    const focusableElements = this.getFocusableElements()
    
    if (e.shiftKey) {
      // Shift + Tab: 向前导航
      if (document.activeElement === focusableElements[0]) {
        e.preventDefault()
        focusableElements[focusableElements.length - 1].focus()
      }
    } else {
      // Tab: 向后导航
      if (document.activeElement === focusableElements[focusableElements.length - 1]) {
        e.preventDefault()
        focusableElements[0].focus()
      }
    }
  }

  // 处理方向键导航
  handleArrowNavigation(e) {
    const currentElement = document.activeElement
    const parent = currentElement.closest('[role="listbox"], [role="grid"], [role="menu"]')
    
    if (parent) {
      e.preventDefault()
      this.navigateInContainer(parent, e.key)
    }
  }

  // 在容器内导航
  navigateInContainer(container, direction) {
    const items = container.querySelectorAll('[role="option"], [role="gridcell"], [role="menuitem"]')
    const currentIndex = Array.from(items).findIndex(item => item === document.activeElement)
    
    let nextIndex = currentIndex
    
    switch (direction) {
      case 'ArrowUp':
        nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
        break
      case 'ArrowDown':
        nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
        break
      case 'ArrowLeft':
        nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
        break
      case 'ArrowRight':
        nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
        break
    }
    
    if (items[nextIndex]) {
      items[nextIndex].focus()
    }
  }

  // 处理激活事件
  handleActivation(e) {
    const target = e.target
    
    if (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button') {
      e.preventDefault()
      target.click()
    }
  }

  // 处理 Escape 键
  handleEscape(e) {
    // 关闭所有打开的模态框
    const modals = document.querySelectorAll('.modal.show')
    modals.forEach(modal => {
      const closeButton = modal.querySelector('.btn-close, [data-dismiss="modal"]')
      if (closeButton) {
        closeButton.click()
      }
    })
  }

  // 获取可聚焦元素
  getFocusableElements() {
    return Array.from(document.querySelectorAll(this.focusableElements))
      .filter(el => {
        const style = window.getComputedStyle(el)
        return style.display !== 'none' && style.visibility !== 'hidden' && !el.disabled
      })
  }

  // 设置屏幕阅读器支持
  setupScreenReaderSupport() {
    // 为动态内容添加 ARIA 标签
    this.observeDynamicContent()
    
    // 为表单添加标签关联
    this.setupFormLabels()
    
    // 为图片添加 alt 属性
    this.setupImageAltText()
  }

  // 观察动态内容变化
  observeDynamicContent() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.enhanceAccessibility(node)
          }
        })
      })
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  // 增强无障碍性
  enhanceAccessibility(element) {
    // 为按钮添加 aria-label
    const buttons = element.querySelectorAll('button:not([aria-label])')
    buttons.forEach(button => {
      if (!button.textContent.trim() && button.querySelector('i')) {
        const icon = button.querySelector('i')
        const iconClass = icon.className
        let label = ''
        
        if (iconClass.includes('fa-plus')) label = 'Add'
        else if (iconClass.includes('fa-edit')) label = 'Edit'
        else if (iconClass.includes('fa-trash')) label = 'Delete'
        else if (iconClass.includes('fa-eye')) label = 'View'
        else if (iconClass.includes('fa-search')) label = 'Search'
        else if (iconClass.includes('fa-download')) label = 'Download'
        else if (iconClass.includes('fa-upload')) label = 'Upload'
        
        if (label) {
          button.setAttribute('aria-label', label)
        }
      }
    })
    
    // 为链接添加描述
    const links = element.querySelectorAll('a:not([aria-label])')
    links.forEach(link => {
      if (!link.textContent.trim()) {
        link.setAttribute('aria-label', '链接')
      }
    })
  }

  // 设置表单标签关联
  setupFormLabels() {
    const inputs = document.querySelectorAll('input, select, textarea')
    inputs.forEach(input => {
      if (!input.id && !input.getAttribute('aria-label')) {
        const label = input.previousElementSibling
        if (label && label.tagName === 'LABEL') {
          const id = 'input-' + Math.random().toString(36).substr(2, 9)
          input.id = id
          label.setAttribute('for', id)
        }
      }
    })
  }

  // Setup image alt text
  setupImageAltText() {
    const images = document.querySelectorAll('img:not([alt])')
    images.forEach(img => {
      if (!img.alt) {
        img.alt = 'Image'
        img.setAttribute('aria-label', 'Image')
      }
    })
  }

      // Setup high contrast mode
    setupHighContrastMode() {
      const toggle = document.createElement('button')
      toggle.className = 'btn btn-outline-secondary accessibility-toggle'
      toggle.innerHTML = '<i class="fas fa-adjust"></i> High Contrast'
      toggle.setAttribute('aria-label', 'Toggle high contrast mode')
      toggle.onclick = () => this.toggleHighContrast()
    
    // Add to page
    const header = document.querySelector('.navbar') || document.body
    header.appendChild(toggle)
  }

  // Toggle high contrast mode
  toggleHighContrast() {
    document.body.classList.toggle('high-contrast')
    const isActive = document.body.classList.contains('high-contrast')
    
    // Save user preference
    localStorage.setItem('highContrast', isActive)
    
    // Notify screen reader
    this.announceToScreenReader(isActive ? 'High contrast mode enabled' : 'High contrast mode disabled')
  }

      // Setup font size controls
    setupFontSizeControls() {
      const controls = document.createElement('div')
      controls.className = 'font-size-controls'
      controls.innerHTML = `
        <button class="btn btn-sm btn-outline-secondary" onclick="window.accessibilityHelper.changeFontSize('decrease')" aria-label="Decrease font size">
          <i class="fas fa-minus"></i>
        </button>
        <span class="font-size-display">100%</span>
        <button class="btn btn-sm btn-outline-secondary" onclick="window.accessibilityHelper.changeFontSize('increase')" aria-label="Increase font size">
          <i class="fas fa-plus"></i>
        </button>
      `
    
    // Add to page
    const header = document.querySelector('.navbar') || document.body
    header.appendChild(controls)
  }

  // Change font size
  changeFontSize(action) {
    const currentSize = parseFloat(getComputedStyle(document.body).fontSize)
    let newSize = currentSize
    
    if (action === 'increase') {
      newSize = Math.min(currentSize * 1.2, 24) // Maximum 24px
    } else if (action === 'decrease') {
      newSize = Math.max(currentSize * 0.8, 12) // Minimum 12px
    }
    
    document.body.style.fontSize = newSize + 'px'
    
    // Update display
    const display = document.querySelector('.font-size-display')
    if (display) {
      display.textContent = Math.round((newSize / 16) * 100) + '%'
    }
    
    // Save user preference
    localStorage.setItem('fontSize', newSize)
    
    // Notify screen reader
    this.announceToScreenReader(`Font size adjusted to ${Math.round((newSize / 16) * 100)}%`)
  }

  // Setup focus indicators
  setupFocusIndicators() {
    const style = document.createElement('style')
    style.textContent = `
      *:focus {
        outline: 3px solid #667eea !important;
        outline-offset: 2px !important;
        border-radius: 4px !important;
      }
      
      .high-contrast *:focus {
        outline: 3px solid #ffff00 !important;
        outline-offset: 2px !important;
      }
      
      .high-contrast {
        background: #000 !important;
        color: #fff !important;
      }
      
      .high-contrast .btn {
        background: #fff !important;
        color: #000 !important;
        border: 2px solid #fff !important;
      }
      
      .high-contrast .card {
        background: #000 !important;
        border: 2px solid #fff !important;
      }
    `
    document.head.appendChild(style)
  }

  // Announce message to screen reader
  announceToScreenReader(message) {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message
    
    document.body.appendChild(announcement)
    
    // Delay removal
    setTimeout(() => {
      if (announcement.parentNode) {
        announcement.parentNode.removeChild(announcement)
      }
    }, 1000)
  }

  // Check page accessibility
  checkAccessibility() {
    const issues = []
    
    // Check image alt attributes
    const images = document.querySelectorAll('img')
    images.forEach(img => {
      if (!img.alt) {
        issues.push(`Image missing alt attribute: ${img.src}`)
      }
    })
    
    // Check form labels
    const inputs = document.querySelectorAll('input, select, textarea')
    inputs.forEach(input => {
      if (!input.id && !input.getAttribute('aria-label')) {
        issues.push(`Form control missing label: ${input.type || input.tagName}`)
      }
    })
    
    // Check color contrast
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div')
    textElements.forEach(element => {
      const style = getComputedStyle(element)
      const color = style.color
      const backgroundColor = style.backgroundColor
      
      if (color && backgroundColor && color !== backgroundColor) {
        // Here you can add color contrast checking logic
      }
    })
    
    return issues
  }

  // Generate accessibility report
  generateAccessibilityReport() {
    const issues = this.checkAccessibility()
    const report = {
      timestamp: new Date().toISOString(),
      totalIssues: issues.length,
      issues: issues,
      recommendations: [
        'Ensure all images have appropriate alt attributes',
        'Provide labels for all form controls',
        'Use sufficient color contrast',
        'Provide keyboard navigation support',
        'Add appropriate ARIA labels'
      ]
    }
    
    return report
  }
}

// 创建全局实例
const accessibilityHelper = new AccessibilityHelper()

// 在页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    accessibilityHelper.init()
  })
} else {
  accessibilityHelper.init()
}

// 暴露到全局作用域
window.accessibilityHelper = accessibilityHelper

export default accessibilityHelper 