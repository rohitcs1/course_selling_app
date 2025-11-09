import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Confetti from 'react-confetti'
import { useWindowSize } from '../hooks/useWindowSize'

const Success = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { width, height } = useWindowSize()
  const [userName, setUserName] = useState('')
  const [isRedirecting, setIsRedirecting] = useState(true)

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('userData')
    if (userData) {
      const parsed = JSON.parse(userData)
      setUserName(parsed.name)
    }

    // Get redirect URL from URL params
    const redirectUrl = searchParams.get('redirect')
    
    if (redirectUrl && redirectUrl.startsWith('https://drive.google.com')) {
      // Show animation for 2 seconds before redirect
      const timer = setTimeout(() => {
        window.location.href = redirectUrl
        setIsRedirecting(false)
      }, 2000)
      return () => clearTimeout(timer)
    } else {
      // If no redirect URL, go to home after 3 seconds
      const timer = setTimeout(() => {
        navigate('/')
        setIsRedirecting(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [navigate, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Confetti Effect */}
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={300}
        gravity={0.3}
        colors={['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b']}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        className="text-center max-w-2xl"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-8"
        >
          <div className="w-28 h-28 md:w-32 md:h-32 mx-auto bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center shadow-soft-xl border-4 border-white">
            <motion.svg
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="w-14 h-14 md:w-16 md:h-16 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
        >
          <span className="gradient-text">Payment Successful! 🎉</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-lg md:text-xl text-gray-700 mb-8"
        >
          Thank you for your purchase, <span className="font-bold text-primary-600">{userName || 'Valued Customer'}</span>!
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-gray-500 mb-8 text-sm md:text-base"
        >
          Redirecting you to your course in a moment...
        </motion.p>

        {/* Loading Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center"
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 md:h-14 md:w-14 border-4 border-primary-200 border-t-primary-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Success

