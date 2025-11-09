require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Razorpay = require('razorpay')
const nodemailer = require('nodemailer')
const { createClient } = require('@supabase/supabase-js')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// Supabase client (use service role key on server)
const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || ''
let supabase = null
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Supabase URL or SERVICE_ROLE_KEY missing; database operations will fail')
} else {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  console.log('✅ Supabase client initialized')
}

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret'

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
})

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// Helper: authenticate middleware
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ success: false, message: 'Missing auth token' })
  const token = authHeader.replace('Bearer ', '')
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }
}

// Health
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Server running' }))

// Debug admin (temporary endpoint - remove in production)
app.get('/api/debug/admin', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ message: 'DB not initialized' })
    const { data, error } = await supabase.from('admins').select('username, created_at')
    if (error) throw error
    res.json({ admins: data })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Admin register (one-time)
app.post('/admin/register', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ success: false, message: 'Database not initialized' })
    const { username, password } = req.body
    if (!username || !password) return res.status(400).json({ success: false, message: 'username and password required' })

    const { data: exists } = await supabase.from('admins').select('*').eq('username', username)
    if (exists && exists.length) return res.status(400).json({ success: false, message: 'Admin already exists' })

    const hashed = await bcrypt.hash(password, 10)
    const { data, error } = await supabase.from('admins').insert([{ username, password: hashed, created_at: new Date().toISOString() }])
    if (error) throw error
    res.json({ success: true, id: data[0].id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// Admin login with Supabase database authentication
app.post('/admin/login', async (req, res) => {
  try {
    // Get username and password
    const { username, password } = req.body
    console.log('Login attempt with username:', username)

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      })
    }

    if (!supabase) {
      console.error('Supabase not initialized')
      return res.status(500).json({
        success: false,
        message: 'Database connection error'
      })
    }

    // Check username in database
    const { data: admin, error: dbError } = await supabase
      .from('admins')
      .select('id, username, password')
      .eq('username', username)
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return res.status(500).json({
        success: false,
        message: 'Error checking credentials'
      })
    }

    if (!admin) {
      console.log('User not found:', username)
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      })
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, admin.password)
    if (!passwordValid) {
      console.log('Invalid password for user:', username)
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      })
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: admin.id, 
        username: admin.username,
        timestamp: new Date().toISOString()
      },
      JWT_SECRET,
      { expiresIn: '12h' }
    )

    // Log success and return response
    console.log('Login successful for user:', username)
    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        username: admin.username
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// Create/Update course (protected)
app.post('/admin/course', authenticate, async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ success: false, message: 'Database not initialized' })
    const course = req.body
    if (!course) return res.status(400).json({ success: false, message: 'Course data required' })

    // Validate required fields
    if (!course.title || !course.description || !course.price) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, description, and price are required' 
      })
    }

    // Clean up the drive link if provided (remove any trailing spaces)
    if (course.driveLink) {
      course.driveLink = course.driveLink.trim()
    }

    // If updating existing course
    if (course.id) {
      const { error } = await supabase
        .from('courses')
        .update({
          title: course.title,
          description: course.description,
          price: course.price,
          original_price: course.originalPrice || null,
          poster: course.poster || null,
          video_url: course.videoUrl || null,
          drive_link: course.driveLink || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', course.id)

      if (error) {
        console.error('Course update error:', error)
        throw error
      }
      return res.json({ success: true, id: course.id })
    }

    // Creating new course
    const { data, error } = await supabase
      .from('courses')
      .insert([{
        title: course.title,
        description: course.description,
        price: course.price,
        original_price: course.originalPrice || null,
        poster: course.poster || null,
        video_url: course.videoUrl || null,
        drive_link: course.driveLink || null,
        created_at: new Date().toISOString()
      }])
      .select()

    if (error) {
      console.error('Course creation error:', error)
      throw error
    }

    console.log('Course created successfully:', {
      id: data[0].id,
      title: data[0].title,
      drive_link: data[0].drive_link || 'Not set'
    })

    res.json({ success: true, id: data[0].id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// Delete course (protected)
app.delete('/admin/course/:id', authenticate, async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ success: false, message: 'Database not initialized' })
    const { id } = req.params
    const { error } = await supabase.from('courses').delete().eq('id', id)
    if (error) throw error
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// Get courses (public)
app.get('/api/courses', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ success: false, message: 'Database not initialized' })
    const { data: courses, error } = await supabase.from('courses').select('*').order('created_at', { ascending: false })
    if (error) throw error
    res.json({ success: true, courses })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// Create Razorpay order and save pre-purchase info
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', customer } = req.body
    if (!amount) return res.status(400).json({ success: false, message: 'amount required (in paise)' })
    // Save pre-purchase to DB (status: pending)
    let purchase = null
    if (supabase) {
      const { data, error } = await supabase.from('purchases').insert([{ customer: customer || {}, amount, currency, status: 'pending', created_at: new Date().toISOString() }]).select()
      if (error) console.warn('Failed to save purchase:', error.message)
      purchase = data && data[0]
    }

    // Razorpay enforces a max length of 40 characters for receipt.
    // Use a short receipt generated from the purchase id (first UUID segment) or timestamp.
    let receipt = ''
    if (purchase && purchase.id) {
      // UUIDs like xxxxxxxx-xxxx-... -> take first segment to keep it short
      const shortId = String(purchase.id).split('-')[0]
      receipt = `purchase_${shortId}`
    } else {
      receipt = `receipt_${Date.now()}`
    }
    // Safety trim to 40 chars just in case
    if (receipt.length > 40) receipt = receipt.slice(0, 40)

    const options = {
      amount: amount,
      currency,
      receipt,
      notes: customer || {}
    }

    console.log('Creating Razorpay order with receipt:', receipt)
    const order = await razorpay.orders.create(options)

    // optionally store order id in purchases
    if (supabase && purchase) {
      await supabase.from('purchases').update({ razorpay_order_id: order.id }).eq('id', purchase.id)
    }

    res.json({ success: true, orderId: order.id, razorpayKey: process.env.RAZORPAY_KEY_ID, purchaseId: purchase ? purchase.id : null })
  } catch (err) {
    console.error('create-order error', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// Verify payment
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, customer, amount, purchaseId, courseId } = req.body
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment parameters' })
    }

    const crypto = require('crypto')
    const text = `${razorpay_order_id}|${razorpay_payment_id}`
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(text)
      .digest('hex')

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' })
    }

    // Resolve drive link: prefer course-specific DB entry, fall back to global env var
    let driveLink = process.env.GOOGLE_DRIVE_LINK || ''
    if (supabase && courseId) {
      try {
        const { data: courseData, error: courseErr } = await supabase
          .from('courses')
          .select('drive_link')
          .eq('id', courseId)
          .single()

        if (courseErr) {
          console.warn('Error fetching course drive_link from DB:', courseErr.message || courseErr)
        } else if (courseData && courseData.drive_link) {
          driveLink = String(courseData.drive_link).trim()
          console.log('Using course-specific drive_link from DB for courseId:', courseId)
        } else {
          console.log('No course-specific drive_link found for courseId:', courseId)
        }
      } catch (dbErr) {
        console.warn('Database error while resolving course drive_link:', dbErr.message || dbErr)
      }
    }

    if (!driveLink) {
      console.error('No GOOGLE_DRIVE_LINK configured and no course-specific drive_link found')
    } else {
      console.log('Resolved drive link to use:', driveLink)
    }

    console.log('Payment verification successful, preparing to save payment record...')
    
    // Save payment record to Supabase
    if (supabase) {
      try {
        console.log('Inserting payment record to Supabase...')
        await supabase.from('payments').insert([{ 
          order_id: razorpay_order_id, 
          payment_id: razorpay_payment_id, 
          customer: customer || {}, 
          amount: amount || null, 
          created_at: new Date().toISOString(), 
          purchase_id: purchaseId || null 
        }])
        console.log('Payment record inserted successfully')

        if (purchaseId) {
          console.log('Updating purchase status...')
          await supabase.from('purchases').update({ 
            status: 'paid', 
            payment_id: razorpay_payment_id 
          }).eq('id', purchaseId)
          console.log('Purchase status updated to paid')
        }
      } catch (dbError) {
        console.error('Database operation failed:', dbError)
      }
    }

    // Send email with course drive link
    console.log('Preparing to send email...', {
      hasTransporter: !!transporter,
      hasEmail: !!customer?.email,
      hasDriveLink: !!driveLink,
      emailConfig: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        hasUser: !!process.env.EMAIL_USER,
        hasPass: !!process.env.EMAIL_PASS
      }
    })

    if (driveLink && transporter && customer?.email) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: customer.email,
        subject: '🎓 Your Course Access Link - Thank You for Your Purchase!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Thank You for Your Purchase! 🎉</h2>
            <p>Your course materials are ready for access.</p>
            <div style="margin: 20px 0; padding: 15px; background-color: #F3F4F6; border-radius: 8px;">
              <p style="margin: 0; font-weight: bold;">Your Course Access Link:</p>
              <a href="${driveLink}" style="color: #4F46E5; text-decoration: none; word-break: break-all;">${driveLink}</a>
            </div>
            <p style="color: #6B7280; font-size: 14px;">
              Note: Please bookmark this link for future reference. If you have any issues accessing the materials, 
              please contact our support team.
            </p>
          </div>
        `
      }
      try {
        await transporter.sendMail(mailOptions)
        console.log('Course access email sent to:', customer.email)
      } catch (emailErr) {
        console.warn('Failed to send email:', emailErr.message)
      }
    }

    // Respond with success and redirect to course materials
    res.json({ 
      success: true, 
      redirect: driveLink || '/', 
      message: driveLink ? 'Payment verified, redirecting to course materials' : 'Payment verified' 
    })
  } catch (err) {
    console.error('verify-payment error', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend listening on http://localhost:${PORT}`)
  console.log(`💳 Razorpay configured: ${process.env.RAZORPAY_KEY_ID ? 'Yes' : 'No'}`)
  console.log(`📧 Email configured: ${process.env.EMAIL_USER ? 'Yes' : 'No'}`)
})
