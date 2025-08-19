/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onCall} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// 设置全局选项，控制成本
setGlobalOptions({maxInstances: 10});

// 分析诈骗数据
exports.analyzeScamData = onCall({maxInstances: 5}, (request) => {
  try {
    const {title, content, timestamp} = request.data;

    logger.info("Analyzing scam data", {title, timestamp});

    // 简单的文本分析逻辑
    const analysis = {
      riskLevel: "medium",
      keywords: [],
      patterns: [],
      recommendations: [],
    };

    // 检测高风险关键词
    const highRiskWords = [
      "urgent", "limited time", "free money", "lottery", "inheritance", "bank transfer",
    ];
    const foundKeywords = highRiskWords.filter((word) =>
      content.toLowerCase().includes(word.toLowerCase()) ||
        title.toLowerCase().includes(word.toLowerCase()),
    );

    if (foundKeywords.length > 0) {
      analysis.riskLevel = "high";
      analysis.keywords = foundKeywords;
      analysis.recommendations.push("Contains high-risk keywords - proceed with extreme caution");
    }

    // 检测可疑模式
    if (content.includes("$") && content.includes("bank")) {
      analysis.patterns.push("Financial transaction request");
      analysis.recommendations.push("Verify financial requests through official channels");
    }

    if (content.includes("@") && content.includes("password")) {
      analysis.patterns.push("Credential request");
      analysis.recommendations.push("Never share passwords or credentials via email");
    }

    return {
      success: true,
      data: analysis,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Error analyzing scam data:", error);
    return {
      success: false,
      error: error.message,
    };
  }
});

// 生成诈骗报告
exports.generateScamReport = onCall({maxInstances: 5}, (request) => {
  try {
    const {scamId, timestamp} = request.data;

    logger.info("Generating scam report", {scamId, timestamp});

    const report = {
      reportId: `REP-${Date.now()}`,
      scamId: scamId,
      generatedAt: new Date().toISOString(),
      status: "generated",
      sections: [
        "Executive Summary",
        "Technical Analysis",
        "Risk Assessment",
        "Recommendations",
        "Prevention Measures",
      ],
    };

    return {
      success: true,
      data: report,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Error generating scam report:", error);
    return {
      success: false,
      error: error.message,
    };
  }
});

// 分析用户行为
exports.analyzeUserBehavior = onCall({maxInstances: 5}, (request) => {
  try {
    const {userId, actions, timestamp} = request.data;

    logger.info("Analyzing user behavior", {userId, actionCount: actions.length});

    const analysis = {
      userId: userId,
      totalActions: actions.length,
      riskScore: 0,
      behaviorPatterns: [],
      recommendations: [],
    };

    // 计算风险评分
    let riskScore = 0;
    actions.forEach((action) => {
      if (action.type === "suspicious_link_click") riskScore += 10;
      if (action.type === "data_share") riskScore += 15;
      if (action.type === "financial_action") riskScore += 20;
    });

    analysis.riskScore = Math.min(riskScore, 100);

    // 生成建议
    if (analysis.riskScore > 50) {
      analysis.recommendations.push("High risk behavior detected - consider security review");
    } else if (analysis.riskScore > 25) {
      analysis.recommendations.push("Moderate risk - stay vigilant");
    } else {
      analysis.recommendations.push("Low risk behavior - continue good practices");
    }

    return {
      success: true,
      data: analysis,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Error analyzing user behavior:", error);
    return {
      success: false,
      error: error.message,
    };
  }
});

// 计算社区安全评分
exports.calculateCommunitySafetyScore = onCall({maxInstances: 5}, (request) => {
  try {
    const {timestamp} = request.data;

    logger.info("Calculating community safety score");

    // 模拟计算逻辑
    const safetyScore = {
      overall: 85,
      categories: {
        scamReports: 90,
        userEducation: 80,
        responseTime: 85,
        prevention: 88,
      },
      trends: "improving",
      lastUpdated: new Date().toISOString(),
    };

    return {
      success: true,
      data: safetyScore,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Error calculating community safety score:", error);
    return {
      success: false,
      error: error.message,
    };
  }
});

// 检测诈骗模式
exports.detectScamPatterns = onCall({maxInstances: 5}, (request) => {
  try {
    const {scams, timestamp} = request.data;

    logger.info("Detecting scam patterns", {scamCount: scams.length});

    const patterns = {
      totalScams: scams.length,
      commonPatterns: [],
      emergingTrends: [],
      riskAreas: [],
    };

    // 分析常见模式
    const patternCounts = {};
    scams.forEach((scam) => {
      if (scam.title) {
        const words = scam.title.toLowerCase().split(" ");
        words.forEach((word) => {
          if (word.length > 3) {
            patternCounts[word] = (patternCounts[word] || 0) + 1;
          }
        });
      }
    });

    // 找出最常见的词汇
    const sortedPatterns = Object.entries(patternCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    patterns.commonPatterns = sortedPatterns.map(([word, count]) => ({
      word,
      frequency: count,
    }));

    return {
      success: true,
      data: patterns,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Error detecting scam patterns:", error);
    return {
      success: false,
      error: error.message,
    };
  }
});

// 发送通知
exports.sendNotification = onCall({maxInstances: 5}, (request) => {
  try {
    const {userId, message, type, timestamp} = request.data;

    logger.info("Sending notification", {userId, type, message});

    const notification = {
      id: `NOTIF-${Date.now()}`,
      userId: userId,
      message: message,
      type: type,
      status: "sent",
      sentAt: new Date().toISOString(),
      priority: type === "urgent" ? "high" : "normal",
    };

    // 这里可以集成实际的推送服务
    // 目前只是记录和返回成功状态

    return {
      success: true,
      data: notification,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Error sending notification:", error);
    return {
      success: false,
      error: error.message,
    };
  }
});

// 健康检查端点
exports.healthCheck = onCall({maxInstances: 1}, (request) => {
  return {
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      functions: [
        "analyzeScamData",
        "generateScamReport",
        "analyzeUserBehavior",
        "calculateCommunitySafetyScore",
        "detectScamPatterns",
        "sendNotification",
      ],
    },
  };
});
