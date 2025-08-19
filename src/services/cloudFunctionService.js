export class CloudFunctionService {
  constructor() {
    // Vercel Functions 的基础 URL
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://your-project.vercel.app/api'  // 生产环境 URL
      : 'http://localhost:3000/api';           // 开发环境 URL
  }

  // 通用函数调用方法
  async callFunction(functionName, data = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/${functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Failed to call cloud function ${functionName}:`, error);
      return { success: false, error: error.message };
    }
  }

  // 分析诈骗数据
  async analyzeScamData(scamData) {
    return await this.callFunction('analyzeScamData', {
      title: scamData.title,
      content: scamData.detail,
      timestamp: new Date().toISOString()
    });
  }

  // 生成诈骗报告
  async generateScamReport(scamId) {
    return await this.callFunction('generateScamReport', {
      scamId: scamId,
      timestamp: new Date().toISOString()
    });
  }

  // 用户行为分析
  async analyzeUserBehavior(userId, actions) {
    return await this.callFunction('analyzeUserBehavior', {
      userId: userId,
      actions: actions,
      timestamp: new Date().toISOString()
    });
  }

  // 社区安全评分计算
  async calculateCommunitySafetyScore() {
    return await this.callFunction('calculateCommunitySafetyScore', {
      timestamp: new Date().toISOString()
    });
  }

  // 诈骗模式检测
  async detectScamPatterns(scamData) {
    return await this.callFunction('detectScamPatterns', {
      scams: scamData,
      timestamp: new Date().toISOString()
    });
  }

  // 发送通知
  async sendNotification(userId, message, type) {
    return await this.callFunction('sendNotification', {
      userId: userId,
      message: message,
      type: type,
      timestamp: new Date().toISOString()
    });
  }

  // 健康检查
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/healthCheck`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new CloudFunctionService(); 