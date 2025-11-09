import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import PaymentModal from '../components/PaymentModal'

const Home = () => {
  const location = useLocation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const videoRef = useRef(null)
  const [isMuted, setIsMuted] = useState(true)
  const [iframeKey, setIframeKey] = useState(0)

  useEffect(() => {
    // fetch latest courses from backend
    const fetchCourses = async () => {
      try {
        const res = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/courses')
        const json = await res.json()
        if (json.success && Array.isArray(json.courses)) {
          // Sort courses by created_at to show newest first
          const sortedCourses = json.courses.sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
          )
          setCourses(sortedCourses)
        } else {
          setCourses([])
        }
      } catch (err) {
        console.warn('Failed to fetch courses', err)
        setCourses([])
      }
    }
    fetchCourses()

    // Fetch courses every 30 seconds to keep content fresh
    const interval = setInterval(fetchCourses, 30000)
    return () => clearInterval(interval)
  }, [])

  // Refresh courses when route changes back to Home
  useEffect(() => {
    // Refresh when route changes
    const fetchCourses = async () => {
      try {
        const res = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/courses')
        const json = await res.json()
        if (json.success && Array.isArray(json.courses)) setCourses(json.courses)
      } catch (err) { console.warn(err) }
    }
    fetchCourses()
  }, [location.pathname])

  // Refresh on window focus (e.g., after admin edits)
  useEffect(() => {
    const onFocus = () => {
      const fetchCourses = async () => {
        try {
          const res = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/courses')
          const json = await res.json()
          if (json.success && Array.isArray(json.courses)) setCourses(json.courses)
        } catch (err) { console.warn(err) }
      }
      fetchCourses()
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  const fallbackCourse = {
    title: "Master Full-Stack Development",
    description: "Learn modern web development with React, Node.js, and MongoDB. Build real-world projects and advance your career.",
    price: 2999,
    original_price: 5999,
    poster: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  }
  const heroCourse = courses[0] || fallbackCourse

  // Offer window: 2 hours in milliseconds
  const OFFER_WINDOW_MS = 2 * 60 * 60 * 1000

  const formatMS = (ms) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000))
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
    const seconds = String(totalSeconds % 60).padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  }

  const getOfferRemaining = () => {
    const epoch = 0 // use unix epoch so windows align consistently across clients
    const now = Date.now()
    const elapsed = (now - epoch) % OFFER_WINDOW_MS
    return OFFER_WINDOW_MS - elapsed
  }

  const [offerRemainingMs, setOfferRemainingMs] = useState(getOfferRemaining())

  useEffect(() => {
    const t = setInterval(() => {
      setOfferRemainingMs(getOfferRemaining())
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const isYouTubeUrl = (url) => /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(url || '')
  const toYouTubeEmbed = (url) => {
    if (!url) return ''
    try {
      const u = new URL(url)
      if (u.hostname.includes('youtu.be')) {
        const id = u.pathname.replace('/', '')
        return `https://www.youtube.com/embed/${id}`
      }
      if (u.hostname.includes('youtube.com')) {
        const id = u.searchParams.get('v')
        if (id) return `https://www.youtube.com/embed/${id}`
        // handle already embed links
        if (u.pathname.startsWith('/embed/')) return url
      }
    } catch {}
    return ''
  }

  // Build embed URL with autoplay/mute params (adds correctly whether or not query exists)
  const buildEmbedUrl = (url, mute = true) => {
    const base = toYouTubeEmbed(url)
    if (!base) return ''
    const params = new URLSearchParams({ autoplay: '1', rel: '0', playsinline: '1' })
    // Use mute param (YouTube accepts mute=1 to start muted)
    if (mute) params.set('mute', '1')
    const sep = base.includes('?') ? '&' : '?'
    return `${base}${sep}${params.toString()}`
  }

  const handleBuyNow = (course) => {
    setSelectedCourse(course || heroCourse)
    setIsModalOpen(true)
  }

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Soft Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-pink-100/50"></div>
        
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ 
              x: [0, 100, 0],
              y: [0, 50, 0],
              rotate: [0, 90, 0]
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              x: [0, -100, 0],
              y: [0, -50, 0],
              rotate: [0, -90, 0]
            }}
            transition={{ 
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"
          />
        </div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center relative z-10">
          {/* Left Side - Course Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="space-y-6 md:space-y-8"
          >
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                whileHover={{ scale: 1.05 }}
                className="inline-block bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold shadow-soft"
              >
                🎉 Limited Time Offer
              </motion.div>
              <div className="text-sm text-gray-700 bg-white/80 px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                Ends in: <span className="font-mono ml-2">{formatMS(offerRemainingMs)}</span>
              </div>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight"
            >
              <span className="gradient-text">{heroCourse.title}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
              className="text-base md:text-lg text-gray-600 leading-relaxed"
            >
              {heroCourse.description}
            </motion.p>

            {/* Price */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
              className="flex flex-wrap items-center gap-3 md:gap-4"
            >
              <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                ₹{Number(heroCourse.price).toLocaleString()}
              </span>
              {heroCourse.original_price ? (
                <span className="text-xl md:text-2xl text-gray-400 line-through">
                  ₹{Number(heroCourse.original_price).toLocaleString()}
                </span>
              ) : null}
              <motion.span
                whileHover={{ scale: 1.1 }}
                className="bg-gradient-to-r from-red-100 to-pink-100 text-red-700 px-4 py-1.5 rounded-full text-sm font-semibold shadow-soft"
              >
                {(() => {
                  const op = Number(heroCourse.original_price)
                  const p = Number(heroCourse.price)
                  if (op && op > 0 && p >= 0 && op > p) {
                    const perc = Math.round(((op - p) / op) * 100)
                    return `${perc}% OFF`
                  }
                  return 'Save'
                })()}
              </motion.span>
            </motion.div>

            {/* Buy Now Button */}
            <motion.button
              id="buy-now-hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleBuyNow(heroCourse)}
              className="btn-primary text-base md:text-lg px-8 md:px-10 py-4 md:py-5"
            >
              🛒 Buy Now
            </motion.button>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, type: "spring", stiffness: 100 }}
              className="grid grid-cols-2 gap-3 md:gap-4 pt-4"
            >
              {[
                { icon: '✅', text: 'Lifetime Access' },
                { icon: '📱', text: 'Mobile Friendly' },
                { icon: '🎓', text: 'Certificate' },
                { icon: '💬', text: '24/7 Support' }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + idx * 0.1 }}
                  whileHover={{ scale: 1.05, x: 5 }}
                  className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-soft hover:shadow-soft-lg transition-all"
                >
                  <span className="text-xl md:text-2xl">{feature.icon}</span>
                  <span className="text-sm md:text-base text-gray-700 font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Side - Course Poster & Video */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative"
          >
            {/* Course Video/Poster Section */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-3xl overflow-hidden shadow-soft-xl"
            >
              {/* For Desktop: Show poster with video overlay */}
              <div className="hidden md:block">
                <img
                  src={heroCourse.poster}
                  alt="Course Poster"
                  className="w-full h-auto object-cover transition-transform duration-500 hover:scale-110"
                  onError={(e) => { e.currentTarget.src = fallbackCourse.poster }}
                />
                {/* Video Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="glass-effect rounded-2xl p-5 shadow-soft-xl"
                  >
                    <h3 className="font-semibold text-gray-900 mb-3 text-base">Preview Video</h3>
                    {isYouTubeUrl(heroCourse.video_url) ? (
                      <div className="aspect-video w-full rounded-xl overflow-hidden shadow-soft relative">
                        <iframe
                          key={`yt-${iframeKey}-${heroCourse.id || 'hero'}`}
                          src={buildEmbedUrl(heroCourse.video_url, isMuted)}
                          title="YouTube video player"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                          className="w-full h-full"
                        />
                        {/* Unmute Button Overlay */}
                        {isMuted && (
                          <button
                            onClick={() => {
                              // For iframe, change key to force reload with mute off
                              setIsMuted(false)
                              setIframeKey((k) => k + 1)
                            }}
                            className="absolute bottom-4 right-4 bg-white/90 text-gray-800 px-3 py-2 rounded-full shadow-md text-sm font-semibold"
                          >
                            Unmute
                          </button>
                        )}
                      </div>
                    ) : heroCourse.video_url ? (
                      <div className="relative">
                        <video
                          ref={videoRef}
                          src={heroCourse.video_url}
                          muted={isMuted}
                          autoPlay
                          loop
                          playsInline
                          className="w-full rounded-xl shadow-soft"
                          controls
                        />
                        {isMuted && (
                          <button
                            onClick={() => {
                              // unmute html5 video and ensure it plays
                              try {
                                if (videoRef.current) {
                                  videoRef.current.muted = false
                                  videoRef.current.play().catch(() => {})
                                }
                              } catch (e) { console.warn(e) }
                              setIsMuted(false)
                            }}
                          className="absolute bottom-4 right-4 bg-white/90 text-gray-800 px-3 py-2 rounded-full shadow-md text-sm font-semibold"
                        >
                          Unmute
                        </button>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-video w-full rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                        No Preview Video
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>

              {/* For Mobile: Show only video */}
              <div className="md:hidden">
                <div className="w-full rounded-xl overflow-hidden">
                  {isYouTubeUrl(heroCourse.video_url) ? (
                    <div className="aspect-video w-full relative">
                      <iframe
                        key={`yt-mobile-${iframeKey}-${heroCourse.id || 'hero'}`}
                        src={buildEmbedUrl(heroCourse.video_url, isMuted)}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                        className="w-full h-full"
                      />
                      {isMuted && (
                        <button
                          onClick={() => {
                            setIsMuted(false)
                            setIframeKey((k) => k + 1)
                          }}
                          className="absolute bottom-3 right-3 bg-white/90 text-gray-800 px-3 py-2 rounded-full shadow-md text-sm font-semibold"
                        >
                          Unmute
                        </button>
                      )}
                    </div>
                  ) : heroCourse.video_url ? (
                    <div className="relative">
                      <video
                        ref={videoRef}
                        src={heroCourse.video_url}
                        muted={isMuted}
                        autoPlay
                        loop
                        playsInline
                        className="w-full"
                        controls
                      />
                      {isMuted && (
                        <button
                          onClick={() => {
                            try {
                              if (videoRef.current) {
                                videoRef.current.muted = false
                                videoRef.current.play().catch(() => {})
                              }
                            } catch (e) { console.warn(e) }
                            setIsMuted(false)
                          }}
                          className="absolute bottom-3 right-3 bg-white/90 text-gray-800 px-3 py-2 rounded-full shadow-md text-sm font-semibold"
                        >
                          Unmute
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-video w-full bg-gray-100 flex items-center justify-center text-gray-400">
                      No Preview Video
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Course Gallery Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              <span className="gradient-text">Our Courses</span>
            </h2>
            <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
              Choose from our wide range of professional courses designed to boost your career
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {(courses.length ? courses : []).map((course, index) => (
              <motion.div
                key={course.id || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="card card-hover"
              >
                <div className="relative overflow-hidden rounded-t-3xl group">
                  {course.poster ? (
                    <>
                      <img
                        src={course.poster}
                        alt={course.title}
                        className="w-full h-52 md:h-64 object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => { e.currentTarget.src = fallbackCourse.poster }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleBuyNow(course)}
                          className="bg-white/90 backdrop-blur-sm text-primary-600 px-6 py-3 rounded-full font-semibold shadow-lg transform hover:shadow-xl transition-all duration-300"
                        >
                          View Details
                        </motion.button>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-52 md:h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-4xl">📚</span>
                    </div>
                  )}
                </div>
                <div className="p-6 md:p-8">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">{course.title}</h3>
                  <p className="text-gray-600 mb-6 text-sm md:text-base">{course.description}</p>
                    <div className="space-y-4">
                    {/* Course Features */}
                    <div className="flex flex-wrap gap-2">
                      {course.video_url && (
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                          🎥 Video Included
                        </span>
                      )}
                      {course.drive_link && (
                        <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                          📚 Study Materials
                        </span>
                      )}
                    </div>

                    {/* Price and Buy Button */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                          ₹{Number(course.price).toLocaleString()}
                        </span>
                        {course.original_price && (
                          <>
                            <span className="ml-2 text-lg md:text-xl text-gray-400 line-through">
                              ₹{Number(course.original_price).toLocaleString()}
                            </span>
                            <span className="ml-3 inline-block bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                              {(() => {
                                const op = Number(course.original_price)
                                const p = Number(course.price)
                                if (op && op > 0 && p >= 0 && op > p) {
                                  const perc = Math.round(((op - p) / op) * 100)
                                  return `${perc}% OFF`
                                }
                                return 'Save'
                              })()}
                            </span>
                          </>
                        )}
                      </div>
                      <motion.button
                        onClick={() => handleBuyNow(course)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-primary w-full sm:w-auto text-sm md:text-base"
                      >
                        Buy Course
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        coursePrice={(selectedCourse || heroCourse).price}
        courseTitle={(selectedCourse || heroCourse).title}
        courseId={(selectedCourse || heroCourse).id}
      />
    </div>
  )
}

export default Home

