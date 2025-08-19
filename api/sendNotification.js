export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { userId, message, type, timestamp } = req.body;
    
    console.log('Sending notification:', { userId, type, message });
    
    const notification = {
      id: `NOTIF-${Date.now()}`,
      userId: userId,
      message: message,
      type: type,
      status: 'sent',
      sentAt: new Date().toISOString(),
      priority: type === 'urgent' ? 'high' : 'normal'
    };
    
    // 这里可以集成实际的推送服务
    // 目前只是记录和返回成功状态
    
    res.status(200).json({
      success: true,
      data: notification,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
} 