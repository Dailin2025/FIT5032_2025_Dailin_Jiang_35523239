import emailjs from '@emailjs/browser'

// EmailJS 配置
const EMAILJS_PUBLIC_KEY = '6te3QSU4diAWz7HPE'
const EMAILJS_SERVICE_ID = 'service_5rw6kwj'
const EMAILJS_TEMPLATE_ID = 'template_scgl36a'

export class EmailService {
  constructor() {
    emailjs.init(EMAILJS_PUBLIC_KEY)
  }

  // Send email
  async sendEmail(templateParams) {
    try {
      console.log('Sending email with params:', templateParams)
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      )
      console.log('Email sent successfully:', response)
      return { success: true, messageId: response.text }
    } catch (error) {
      console.error('Failed to send email:', error)
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        text: error.text,
        stack: error.stack
      })
      return { success: false, error: error.message || 'Unknown error occurred' }
    }
  }

  // Send email with attachment
  async sendEmailWithAttachment(templateParams, attachment) {
    try {
      console.log('Sending email with attachment:', attachment.name)
      
      // Check file size before processing (EmailJS limit is 50KB for variables)
      const maxSize = 30 * 1024 // 30KB to be safe with base64 encoding
      if (attachment.size > maxSize) {
        return { 
          success: false, 
          error: `File too large! Maximum size is 30KB. Your file: ${(attachment.size / 1024).toFixed(1)}KB` 
        }
      }
      
      // Convert attachment to base64
      const base64Attachment = await this.fileToBase64(attachment)
      
      // Check base64 size
      if (base64Attachment.length > 50000) {
        return { 
          success: false, 
          error: `Base64 encoded file too large! Maximum size is 50KB. Your file: ${(base64Attachment.length / 1024).toFixed(1)}KB` 
        }
      }
      
      const params = {
        ...templateParams,
        attachment: base64Attachment,
        attachment_name: attachment.name
      }
      
      console.log('Email params with attachment:', params)
      return await this.sendEmail(params)
    } catch (error) {
      console.error('Failed to send email with attachment:', error)
      return { success: false, error: error.message || 'Failed to process attachment' }
    }
  }

  // Convert file to base64
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })
  }

  // Send scam report email (simplified - only use EmailJS default variables)
  async sendScamReport(scamData, userEmail, toEmail = null) {
    const templateParams = {
      name: userEmail, // 发件人姓名（EmailJS默认变量）
      email: userEmail, // 发件人邮箱（EmailJS默认变量）
      to_email: toEmail || 'djia0020@student.monash.edu', // 收件人邮箱
      title: 'Scam Report', // 邮件主题标题
      message: `
User ${userEmail} reported the following scam information:

Title: ${scamData.title}
Description: ${scamData.brief}
Detailed Content: ${scamData.detail}

Please process this report promptly.`
    }
    
    return await this.sendEmail(templateParams)
  }

  // Send scam report email with attachment (simplified)
  async sendScamReportWithAttachment(scamData, userEmail, attachment, toEmail = null) {
    try {
      const templateParams = {
        name: userEmail, // 发件人姓名（EmailJS默认变量）
        email: userEmail, // 发件人邮箱（EmailJS默认变量）
        to_email: toEmail || 'djia0020@student.monash.edu', // 收件人邮箱
        title: 'Scam Report', // 邮件主题标题
        message: `
User ${userEmail} reported the following scam information:

Title: ${scamData.title}
Description: ${scamData.brief}
Detailed Content: ${scamData.detail}

Please process this report promptly.`
      }
      
      // Now that template supports attachments, use the real attachment function
      return await this.sendEmailWithAttachment(templateParams, attachment)
    } catch (error) {
      console.error('Failed to process attachment:', error)
      return { success: false, error: 'Failed to process attachment: ' + error.message }
    }
  }
}

export default new EmailService() 