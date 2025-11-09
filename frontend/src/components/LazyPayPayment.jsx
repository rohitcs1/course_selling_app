import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const LazyPayPayment = ({ isOpen, onClose, coursePrice, courseTitle, customerData }) => {
  const navigate = useNavigate()
  const [paymentMethod, setPaymentMethod] = useState('lazypay') // 'lazypay', 'card', 'upi'
  const [isProcessing, setIsProcessing] = useState(false)
  const [otp, setOtp] = useState('')
  const [showOtp, setShowOtp] = useState(false)

  const handlePayment = async () => {
    setIsProcessing(true)
    toast.loading('Processing payment...')

    // Simulate OTP verification
    setTimeout(() => {
      setShowOtp(true)
      setIsProcessing(false)
      toast.dismiss()
      toast.success('OTP sent to your phone')
    }, 2000)
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }

    setIsProcessing(true)
    toast.loading('Verifying payment...')

    // Simulate payment processing (Random/Demo - No API)
    setTimeout(() => {
      // Random success (90% success rate for demo)
      const isSuccess = Math.random() > 0.1
      
      if (isSuccess) {
        toast.success('Payment successful! ✅')
        
        // Store user data
        localStorage.setItem('userData', JSON.stringify(customerData))
        localStorage.setItem('paymentSuccess', 'true')
        
        // Redirect directly to course dashboard
        setTimeout(() => {
          navigate('/course')
          onClose()
        }, 1500)
      } else {
        toast.error('Payment failed. Please try again.')
        setIsProcessing(false)
        setOtp('')
      }
    }, 2000)
  }

  const handlePayLater = async () => {
    setIsProcessing(true)
    toast.loading('Setting up Lazy Pay...')

    // Simulate Lazy Pay setup (Random/Demo - No API)
    setTimeout(() => {
      // Random success (95% success rate for demo)
      const isSuccess = Math.random() > 0.05
      
      if (isSuccess) {
        // Store user data
        localStorage.setItem('userData', JSON.stringify(customerData))
        localStorage.setItem('paymentSuccess', 'true')
        localStorage.setItem('lazypay', 'true')
        
        toast.success('Lazy Pay activated! 🎉')
        
        // Redirect to course dashboard
        setTimeout(() => {
          navigate('/course')
          onClose()
        }, 1500)
      } else {
        toast.error('Failed to setup Lazy Pay. Please try again.')
        setIsProcessing(false)
      }
    }, 2000)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55]"
          />

          {/* Lazy Pay Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            <motion.div
              className="bg-white rounded-3xl shadow-soft-xl max-w-md w-full overflow-hidden border border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Lazy Pay Header */}
              <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">LazyPay</h3>
                      <p className="text-sm text-white/90">Buy Now, Pay Later</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>

                {/* Amount Display */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <p className="text-sm text-white/80 mb-1">Total Amount</p>
                  <p className="text-3xl font-bold">₹{coursePrice.toLocaleString()}</p>
                </div>
              </div>

              {/* Payment Content */}
              <div className="p-6">
                {!showOtp ? (
                  <>
                    {/* Payment Methods */}
                    <div className="mb-6">
                      <p className="text-sm font-medium text-gray-700 mb-3">Choose Payment Method</p>
                      <div className="space-y-3">
                        {/* Lazy Pay Option */}
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setPaymentMethod('lazypay')}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            paymentMethod === 'lazypay'
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 bg-gray-50 hover:border-purple-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">LP</span>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">Pay with LazyPay</p>
                                <p className="text-xs text-gray-600">Pay later in easy installments</p>
                              </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 ${
                              paymentMethod === 'lazypay'
                                ? 'border-purple-500 bg-purple-500'
                                : 'border-gray-300'
                            }`}>
                              {paymentMethod === 'lazypay' && (
                                <div className="w-full h-full rounded-full bg-white scale-50"></div>
                              )}
                            </div>
                          </div>
                        </motion.div>

                        {/* Card Option */}
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setPaymentMethod('card')}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            paymentMethod === 'card'
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 bg-gray-50 hover:border-primary-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">Debit/Credit Card</p>
                                <p className="text-xs text-gray-600">Visa, Mastercard, Rupay</p>
                              </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 ${
                              paymentMethod === 'card'
                                ? 'border-primary-500 bg-primary-500'
                                : 'border-gray-300'
                            }`}>
                              {paymentMethod === 'card' && (
                                <div className="w-full h-full rounded-full bg-white scale-50"></div>
                              )}
                            </div>
                          </div>
                        </motion.div>

                        {/* UPI Option */}
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setPaymentMethod('upi')}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            paymentMethod === 'upi'
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 bg-gray-50 hover:border-green-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xs">UPI</span>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">UPI</p>
                                <p className="text-xs text-gray-600">Google Pay, PhonePe, Paytm</p>
                              </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 ${
                              paymentMethod === 'upi'
                                ? 'border-green-500 bg-green-500'
                                : 'border-gray-300'
                            }`}>
                              {paymentMethod === 'upi' && (
                                <div className="w-full h-full rounded-full bg-white scale-50"></div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>

                    {/* Pay Now Button */}
                    <motion.button
                      onClick={paymentMethod === 'lazypay' ? handlePayLater : handlePayment}
                      disabled={isProcessing}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full py-4 rounded-2xl font-semibold text-white shadow-soft-lg transition-all ${
                        paymentMethod === 'lazypay'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                          : paymentMethod === 'card'
                          ? 'bg-gradient-to-r from-primary-600 to-primary-700'
                          : 'bg-gradient-to-r from-green-600 to-emerald-600'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isProcessing ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Processing...
                        </span>
                      ) : paymentMethod === 'lazypay' ? (
                        'Activate LazyPay & Continue'
                      ) : (
                        'Pay Now'
                      )}
                    </motion.button>
                  </>
                ) : (
                  <>
                    {/* OTP Input */}
                    <div className="mb-6">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Enter OTP sent to {customerData.phone}
                      </p>
                      <form onSubmit={handleOtpSubmit}>
                        <div className="flex gap-2 mb-4">
                          {[0, 1, 2, 3, 4, 5].map((index) => (
                            <motion.input
                              key={index}
                              type="text"
                              maxLength={1}
                              value={otp[index] || ''}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '')
                                if (value) {
                                  const newOtp = otp.split('')
                                  newOtp[index] = value
                                  setOtp(newOtp.join(''))
                                  // Auto focus next input
                                  if (index < 5 && e.target.nextSibling) {
                                    e.target.nextSibling.focus()
                                  }
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Backspace' && !otp[index] && index > 0) {
                                  e.target.previousSibling.focus()
                                }
                              }}
                              className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                            />
                          ))}
                        </div>
                        <motion.button
                          type="submit"
                          disabled={isProcessing || otp.length !== 6}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full py-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 shadow-soft-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProcessing ? 'Verifying...' : 'Verify & Pay'}
                        </motion.button>
                      </form>
                      <button
                        onClick={() => {
                          setShowOtp(false)
                          setOtp('')
                          toast.info('OTP resend option clicked')
                        }}
                        className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Resend OTP
                      </button>
                    </div>
                  </>
                )}

                {/* Security Notice */}
                <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1">Secure Payment</p>
                      <p className="text-xs text-gray-600">Your payment is secured with 256-bit SSL encryption</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default LazyPayPayment

