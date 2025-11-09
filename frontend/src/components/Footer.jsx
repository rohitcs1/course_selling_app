import { motion } from 'framer-motion'

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 text-white mt-auto border-t border-gray-700/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">CourseHub</h3>
            <p className="text-gray-400">
              Your gateway to quality online education. Learn, grow, and succeed.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3 text-gray-400">
              {['About Us', 'Contact', 'Privacy Policy', 'Terms & Conditions'].map((item, idx) => (
                <motion.li
                  key={idx}
                  whileHover={{ x: 5 }}
                  className="cursor-pointer"
                >
                  <a href="#" className="hover:text-white transition-colors duration-200">
                    {item}
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Email: support@coursehub.com</li>
              <li>Phone: +91 1234567890</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700/50 mt-8 pt-8 text-center text-gray-400">
          <p className="text-sm">&copy; {new Date().getFullYear()} CourseHub. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  )
}

export default Footer

