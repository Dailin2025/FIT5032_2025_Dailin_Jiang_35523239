export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { userId, actions, timestamp } = req.body;
    
    console.log('Analyzing user behavior:', { userId, actionCount: actions.length });
    
    const analysis = {
      userId: userId,
      totalActions: actions.length,
      riskScore: 0,
      behaviorPatterns: [],
      recommendations: []
    };
    
    // 计算风险评分
    let riskScore = 0;
    actions.forEach(action => {
      if (action.type === 'suspicious_link_click') riskScore += 10;
      if (action.type === 'data_share') riskScore += 15;
      if (action.type === 'financial_action') riskScore += 20;
    });
    
    analysis.riskScore = Math.min(riskScore, 100);
    
    // 生成建议
    if (analysis.riskScore > 50) {
      analysis.recommendations.push('High risk behavior detected - consider security review');
    } else if (analysis.riskScore > 25) {
      analysis.recommendations.push('Moderate risk - stay vigilant');
    } else {
      analysis.recommendations.push('Low risk behavior - continue good practices');
    }
    
    res.status(200).json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error analyzing user behavior:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
} 