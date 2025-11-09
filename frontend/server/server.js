const express = require('express')
const cors = require('cors')
const Razorpay = require('razorpay')
const nodemailer = require('nodemailer')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET'
})

// Initialize Email Transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// Create Order API
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, customer } = req.body

    const options = {
      amount: amount, // Amount in paise
      currency: currency,
      receipt: receipt,
      notes: {
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone
      }
    }

    const order = await razorpay.orders.create(options)

    res.json({
      success: true,
      orderId: order.id,
      razorpayKey: process.env.RAZORPAY_KEY_ID
    })
  } catch (error) {
    console.error('Error creating order:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create order'
    })
  }
})

// Verify Payment API
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, customer } = req.body

    // Verify payment signature
    const crypto = require('crypto')
    const text = `${razorpay_order_id}|${razorpay_payment_id}`
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex')

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      })
    }

    // Send email with Google Drive link
    const googleDriveLink = process.env.GOOGLE_DRIVE_LINK || 'https://drive.google.com/drive/folders/YOUR_FOLDER_ID'

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: customer.email,
      subject: '🎓 Course Access - Thank You for Your Purchase!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Payment Successful!</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${customer.name}</strong>,</p>
              <p>Thank you for purchasing our course! We're excited to have you on board.</p>
              <p>Your payment of ₹${(req.body.amount / 100).toLocaleString()} has been successfully processed.</p>
              <p><strong>Your course materials are ready for download:</strong></p>
              <div style="text-align: center;">
                <a href="${googleDriveLink}" class="button">📚 Download Course Materials</a>
              </div>
              <p style="margin-top: 30px;">If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${googleDriveLink}</p>
              <p>Happy Learning! 🚀</p>
              <p>Best Regards,<br>CourseHub Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }

    // Send email
    await transporter.sendMail(mailOptions)

    res.json({
      success: true,
      message: 'Payment verified and email sent successfully',
      paymentId: razorpay_payment_id
    })
  } catch (error) {
    console.error('Error verifying payment:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Payment verification failed'
    })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📧 Email configured: ${process.env.EMAIL_USER ? 'Yes' : 'No'}`)
  console.log(`💳 Razorpay configured: ${process.env.RAZORPAY_KEY_ID ? 'Yes' : 'No'}`)
})

