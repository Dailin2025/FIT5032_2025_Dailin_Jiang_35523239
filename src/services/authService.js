import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase/config'

export class AuthService {
  constructor() {
    this.currentUser = null
    this.authStateListeners = []
    this.isInitialized = false
    
    // 立即检查当前用户状态
    this.checkCurrentUser()
    
    // 监听认证状态变化
    this.unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user)
      this.currentUser = user
      this.isInitialized = true
      this.notifyAuthStateChange(user)
      
      if (user) {
        // 触发自定义事件
        window.dispatchEvent(new CustomEvent('auth-change', { detail: { user } }))
      } else {
        // 触发自定义事件
        window.dispatchEvent(new CustomEvent('auth-change', { detail: { user: null } }))
      }
    })
  }

  // 立即检查当前用户状态
  async checkCurrentUser() {
    try {
      // 检查 auth 对象是否已经初始化
      if (auth.currentUser) {
        this.currentUser = auth.currentUser
        this.isInitialized = true
        console.log('Immediate user check - user found:', auth.currentUser)
      } else {
        console.log('Immediate user check - no current user')
      }
    } catch (error) {
      console.error('Error checking current user:', error)
    }
  }

  // 邮箱密码注册
  async registerWithEmail(email, password, displayName = '', role = 'user') {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // 更新用户资料
      if (displayName) {
        await updateProfile(user, { displayName })
      }

      // 发送邮箱验证
      await sendEmailVerification(user)

      // 创建用户文档
      await this.createUserDocument(user, role)

      return { success: true, user }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: this.getErrorMessage(error.code) }
    }
  }

  // 邮箱密码登录
  async loginWithEmail(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // 更新用户文档
      await this.updateUserLastLogin(user.uid)

      return { success: true, user }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: this.getErrorMessage(error.code) }
    }
  }



  // 登出
  async logout() {
    try {
      await signOut(auth)
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      return { success: false, error: this.getErrorMessage(error.code) }
    }
  }

  // 重置密码
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email)
      return { success: true }
    } catch (error) {
      console.error('Password reset error:', error)
      return { success: false, error: this.getErrorMessage(error.code) }
    }
  }

  // 获取当前用户
  getCurrentUser() {
    return this.currentUser
  }

  // 检查是否正在初始化
  isInitializing() {
    return !this.isInitialized
  }

  // 检查用户是否已登录
  isAuthenticated() {
    return !!this.currentUser
  }

  // 检查用户角色
  async hasRole(role) {
    if (!this.currentUser) {
      console.log('hasRole: No current user')
      return false
    }
    
    console.log('hasRole called for role:', role, 'user email:', this.currentUser.email)
    
    try {
      // 从 Firestore 获取用户角色
      const userRef = doc(db, 'users', this.currentUser.uid)
      const userDoc = await getDoc(userRef)
      
      if (userDoc.exists()) {
        const userData = userDoc.data()
        console.log('User document found:', userData)
        return userData.role === role
      }
      
      console.log('User document not found, checking email patterns')
      
      // 如果用户文档不存在，根据邮箱判断角色
      if (this.currentUser.email) {
        // 医生邮箱通常包含 hospital, clinic, medical 等关键词
        const email = this.currentUser.email.toLowerCase()
        console.log('Checking email patterns for:', email)
        
        if (role === 'doctor' && (
          email.includes('hospital') || 
          email.includes('clinic') || 
          email.includes('medical') || 
          email.includes('doctor') ||
          email.includes('dr.') ||
          email.includes('@hospital') ||
          email.includes('@clinic')
        )) {
          console.log('Email matches doctor pattern, returning true')
          return true
        }
        
        // 管理员邮箱判断
        if (role === 'admin' && email.includes('admin')) {
          console.log('Email matches admin pattern, returning true')
          return true
        }
      }
      
      console.log('No pattern match, returning false for role:', role)
      // 默认角色
      return role === 'user'
    } catch (error) {
      console.error('Error checking user role:', error)
      // 如果出错，根据邮箱进行简单判断
      if (this.currentUser.email) {
        const email = this.currentUser.email.toLowerCase()
        if (role === 'doctor' && (
          email.includes('hospital') || 
          email.includes('clinic') || 
          email.includes('medical') || 
          email.includes('doctor') ||
          email.includes('dr.') ||
          email.includes('@hospital') ||
          email.includes('@clinic')
        )) {
          return true
        }
      }
      return role === 'user'
    }
  }

  // 创建用户文档
  async createUserDocument(user, role = 'user') {
    try {
      const userRef = doc(db, 'users', user.uid)
      const userDoc = await getDoc(userRef)

      if (!userDoc.exists()) {
        // 创建新用户文档
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          emailVerified: user.emailVerified,
          role: role,
          createdAt: new Date(),
          lastLoginAt: new Date(),
          preferences: {
            language: 'en',
            theme: 'light',
            notifications: true
          }
        })
      } else {
        // 更新现有用户文档
        await this.updateUserLastLogin(user.uid)
      }
    } catch (error) {
      console.error('Failed to create/update user document:', error)
    }
  }

  // 更新用户最后登录时间
  async updateUserLastLogin(uid) {
    try {
      const userRef = doc(db, 'users', uid)
      await setDoc(userRef, {
        lastLoginAt: new Date()
      }, { merge: true })
    } catch (error) {
      console.error('Failed to update user last login:', error)
    }
  }

  // 添加认证状态监听器
  addAuthStateListener(listener) {
    this.authStateListeners.push(listener)
  }

  // 移除认证状态监听器
  removeAuthStateListener(listener) {
    const index = this.authStateListeners.indexOf(listener)
    if (index > -1) {
      this.authStateListeners.splice(index, 1)
    }
  }

  // 通知认证状态变化
  notifyAuthStateChange(user) {
    this.authStateListeners.forEach(listener => {
      try {
        listener(user)
      } catch (error) {
        console.error('Auth state listener error:', error)
      }
    })
  }

  // 获取错误消息
  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/user-not-found': 'User not found. Please check your email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/email-already-in-use': 'This email is already registered. Please use a different email or try to login.',
      'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
      'auth/invalid-email': 'Invalid email address. Please enter a valid email.',
      'auth/user-disabled': 'This account has been disabled. Please contact support.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/operation-not-allowed': 'This operation is not allowed. Please contact support.',
      'auth/network-request-failed': 'Network error. Please check your internet connection.',
      'auth/requires-recent-login': 'This operation requires recent authentication. Please login again.',
      'auth/invalid-credential': 'Invalid credentials. Please check your email and password.',
      'auth/operation-not-supported-in-this-environment': 'This operation is not supported in this environment.',
      'auth/timeout': 'Operation timed out. Please try again.'
    }

    return errorMessages[errorCode] || `Authentication error: ${errorCode}`
  }

  // 清理资源
  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe()
    }
    this.authStateListeners = []
  }
}

// 创建单例实例
const authService = new AuthService()

// 使认证服务在全局可用
window.authService = authService

// 页面卸载时清理资源
window.addEventListener('beforeunload', () => {
  authService.cleanup()
})

export default authService 