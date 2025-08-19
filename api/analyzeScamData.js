export default function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { title, content, timestamp } = req.body;
    
    console.log('Analyzing scam data:', { title, timestamp });
    
    // 简单的文本分析逻辑
    const analysis = {
      riskLevel: 'medium',
      keywords: [],
      patterns: [],
      recommendations: []
    };
    
    // 检测高风险关键词
    const highRiskWords = ['urgent', 'limited time', 'free money', 'lottery', 'inheritance', 'bank transfer'];
    const foundKeywords = highRiskWords.filter(word => 
      content.toLowerCase().includes(word.toLowerCase()) || 
      title.toLowerCase().includes(word.toLowerCase())
    );
    
    if (foundKeywords.length > 0) {
      analysis.riskLevel = 'high';
      analysis.keywords = foundKeywords;
      analysis.recommendations.push('Contains high-risk keywords - proceed with extreme caution');
    }
    
    // 检测可疑模式
    if (content.includes('$') && content.includes('bank')) {
      analysis.patterns.push('Financial transaction request');
      analysis.recommendations.push('Verify financial requests through official channels');
    }
    
    if (content.includes('@') && content.includes('password')) {
      analysis.patterns.push('Credential request');
      analysis.recommendations.push('Never share passwords or credentials via email');
    }
    
    res.status(200).json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error analyzing scam data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
} 