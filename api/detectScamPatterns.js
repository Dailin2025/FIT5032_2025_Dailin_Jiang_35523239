export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { scams, timestamp } = req.body;
    
    console.log('Detecting scam patterns:', { scamCount: scams.length });
    
    const patterns = {
      totalScams: scams.length,
      commonPatterns: [],
      emergingTrends: [],
      riskAreas: []
    };
    
    // 分析常见模式
    const patternCounts = {};
    scams.forEach(scam => {
      if (scam.title) {
        const words = scam.title.toLowerCase().split(' ');
        words.forEach(word => {
          if (word.length > 3) {
            patternCounts[word] = (patternCounts[word] || 0) + 1;
          }
        });
      }
    });
    
    // 找出最常见的词汇
    const sortedPatterns = Object.entries(patternCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    patterns.commonPatterns = sortedPatterns.map(([word, count]) => ({
      word,
      frequency: count
    }));
    
    res.status(200).json({
      success: true,
      data: patterns,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error detecting scam patterns:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
} 