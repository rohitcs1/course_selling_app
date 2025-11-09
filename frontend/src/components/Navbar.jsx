import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleBuyNow = () => {
    const buyNowBtn = document.getElementById('buy-now-hero')
    if (buyNowBtn) {
      buyNowBtn.scrollIntoView({ behavior: 'smooth' })
      setTimeout(() => buyNowBtn.click(), 300)
    } else {
      navigate('/')
    }
  }

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="glass-effect shadow-soft-lg sticky top-0 z-50 border-b border-white/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="text-xl md:text-2xl font-bold gradient-text">
              📚 CourseHub
            </div>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors px-4 py-2 rounded-xl hover:bg-primary-50"
            >
              Home
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBuyNow}
              className="btn-primary"
            >
              Buy Now
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 space-y-3"
          >
            <button
              onClick={() => {
                navigate('/')
                setIsMenuOpen(false)
              }}
              className="block w-full text-left text-gray-700 hover:text-primary-600 transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => {
                handleBuyNow()
                setIsMenuOpen(false)
              }}
              className="btn-primary w-full"
            >
              Buy Now
            </button>
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}

export default Navbar

