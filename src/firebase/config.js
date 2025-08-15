import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'

// Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyAjHayp0Vcdbn8c4FulahM13OJt8HjzxXI",
  authDomain: "assignment3-34f00.firebaseapp.com",
  projectId: "assignment3-34f00",
  storageBucket: "assignment3-34f00.firebasestorage.app",
  messagingSenderId: "347347899339",
  appId: "1:347347899339:web:a1d6ba34602062ad8d9c4e"
}

// 初始化 Firebase
const app = initializeApp(firebaseConfig)

// 获取服务
export const auth = getAuth(app)
export const db = getFirestore(app)
export const functions = getFunctions(app)

// 配置认证设置
const authInstance = getAuth(app)
authInstance.useDeviceLanguage() // 使用设备语言
authInstance.settings.appVerificationDisabledForTesting = false // 生产环境设为 false

export default app 