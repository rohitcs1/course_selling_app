import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'

// Using Razorpay checkout via backend; LazyPay component removed for real payments


const PaymentModal = ({ isOpen, onClose, coursePrice, courseTitle, courseId }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showLazyPay, setShowLazyPay] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter your full name')
      return false
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error('Please enter a valid email address')
      return false
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      toast.error('Please enter a valid phone number')
      return false
    }
    return true
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.querySelector('#razorpay-script')) return resolve(true)
      const script = document.createElement('script')
      script.id = 'razorpay-script'
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)
    toast.loading('Preparing payment...')

    try {
      const amountPaise = Math.round(Number(coursePrice) * 100)
      const res = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountPaise, customer: formData })
      })
      const json = await res.json()
      toast.dismiss()
      if (!json.success) {
        toast.error(json.message || 'Failed to create order')
        setIsLoading(false)
        return
      }

      const ok = await loadRazorpayScript()
      if (!ok) {
        toast.error('Failed to load payment SDK')
        setIsLoading(false)
        return
      }

      const options = {
        key: json.razorpayKey,
        amount: amountPaise,
        currency: 'INR',
        name: courseTitle,
        description: `Purchase: ${courseTitle}`,
        order_id: json.orderId,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        handler: async function (response) {
          // verify payment on backend
          try {
            const verifyRes = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                customer: formData,
                amount: amountPaise,
                purchaseId: json.purchaseId || null,
                courseId: courseId
              })
            })
            const verifyJson = await verifyRes.json()
              if (verifyJson.success) {
                if (verifyJson.redirect && verifyJson.redirect.startsWith('https://drive.google.com')) {
                  toast.success('Payment successful!', { duration: 3000 })
                  // Navigate to success page with redirect URL
                  navigate(`/success?redirect=${encodeURIComponent(verifyJson.redirect)}`)
                } else {
                  // Fallback if no drive link
                  toast.error('Course link not found. Please contact support.', { duration: 5000 })
                  console.error('Missing drive link in response:', verifyJson)
                  navigate('/success')
                }
            } else {
              toast.error(verifyJson.message || 'Payment verification failed')
            }
          } catch (err) {
            console.error(err)
            toast.error('Verification error')
          }
        },
        modal: {
          ondismiss: function () {
            // user closed the checkout
            toast('Payment cancelled')
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
      setIsLoading(false)
      onClose()
    } catch (err) {
      console.error(err)
      toast.dismiss()
      toast.error('Payment failed')
      setIsLoading(false)
    }
  }

  const handleCloseLazyPay = () => {
    setShowLazyPay(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && !showLazyPay && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-white rounded-3xl shadow-soft-xl max-w-md w-full p-6 md:p-8 relative border border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 rounded-full p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>

              {/* Modal Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6"
              >
                <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-2">
                  Complete Your Purchase
                </h2>
                <p className="text-gray-600 text-sm md:text-base">
                  Fill in your details to proceed to payment
                </p>
              </motion.div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-300 transition-all bg-gray-50 focus:bg-white"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-300 transition-all bg-gray-50 focus:bg-white"
                    placeholder="Enter your email"
                  />
                </div>

                {/* Phone Field */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-300 transition-all bg-gray-50 focus:bg-white"
                    placeholder="Enter your phone number"
                  />
                </div>

                {/* Price Display */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-2xl p-5 border-2 border-primary-100"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-semibold text-base">Total Amount:</span>
                    <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                      ₹{coursePrice.toLocaleString()}
                    </span>
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Continue to Payment'
                  )}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>

        </>
      )}
      
      {/* Lazy Pay Payment Component - Outside the form modal */}
            {/* Legacy LazyPay component removed for real Razorpay integration */}
    </AnimatePresence>
  )
}

export default PaymentModal

