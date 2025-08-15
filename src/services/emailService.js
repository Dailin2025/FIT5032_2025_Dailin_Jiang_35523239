import emailjs from '@emailjs/browser'

// EmailJS 配置
const EMAILJS_PUBLIC_KEY = 'your_public_key'
const EMAILJS_SERVICE_ID = 'your_service_id'
const EMAILJS_TEMPLATE_ID = 'your_template_id'

export class EmailService {
  constructor() {
    emailjs.init(EMAILJS_PUBLIC_KEY)
  }

  // Send email
  async sendEmail(templateParams) {
    try {
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      )
      return { success: true, messageId: response.text }
    } catch (error) {
      console.error('Failed to send email:', error)
      return { success: false, error: error.message }
    }
  }

  // Send email with attachment
  async sendEmailWithAttachment(templateParams, attachment) {
    try {
      // Convert attachment to base64
      const base64Attachment = await this.fileToBase64(attachment)
      
      const params = {
        ...templateParams,
        attachment: base64Attachment,
        attachment_name: attachment.name
      }
      
      return await this.sendEmail(params)
    } catch (error) {
      console.error('Failed to send email with attachment:', error)
      return { success: false, error: error.message }
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

  // Send scam report email
  async sendScamReport(scamData, userEmail) {
    const templateParams = {
      to_email: 'admin@community.com',
      from_email: userEmail,
      subject: 'Scam Report',
      message: `
        User ${userEmail} reported the following scam information:
        
        Title: ${scamData.title}
        Description: ${scamData.brief}
        Detailed Content: ${scamData.detail}
        
        Please process this report promptly.
      `
    }
    
    return await this.sendEmail(templateParams)
  }
}

export default new EmailService() 