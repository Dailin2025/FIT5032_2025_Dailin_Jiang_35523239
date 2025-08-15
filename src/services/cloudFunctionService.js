import { httpsCallable } from 'firebase/functions'
import { functions } from '@/firebase/config'

export class CloudFunctionService {
  // Call cloud function
  async callFunction(functionName, data = {}) {
    try {
      const functionRef = httpsCallable(functions, functionName)
      const result = await functionRef(data)
      return { success: true, data: result.data }
    } catch (error) {
      console.error(`Failed to call cloud function ${functionName}:`, error)
      return { success: false, error: error.message }
    }
  }

  // Analyze scam data
  async analyzeScamData(scamData) {
    return await this.callFunction('analyzeScamData', {
      title: scamData.title,
      content: scamData.detail,
      timestamp: new Date().toISOString()
    })
  }

  // Generate scam report
  async generateScamReport(scamId) {
    return await this.callFunction('generateScamReport', {
      scamId: scamId,
      timestamp: new Date().toISOString()
    })
  }

  // User behavior analysis
  async analyzeUserBehavior(userId, actions) {
    return await this.callFunction('analyzeUserBehavior', {
      userId: userId,
      actions: actions,
      timestamp: new Date().toISOString()
    })
  }

  // Community safety score calculation
  async calculateCommunitySafetyScore() {
    return await this.callFunction('calculateCommunitySafetyScore', {
      timestamp: new Date().toISOString()
    })
  }

  // Scam pattern detection
  async detectScamPatterns(scamData) {
    return await this.callFunction('detectScamPatterns', {
      scams: scamData,
      timestamp: new Date().toISOString()
    })
  }

  // Send notification
  async sendNotification(userId, message, type) {
    return await this.callFunction('sendNotification', {
      userId: userId,
      message: message,
      type: type,
      timestamp: new Date().toISOString()
    })
  }
}

export default new CloudFunctionService() 