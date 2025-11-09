import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const STORAGE_KEY = 'courses'

const readCourses = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const writeCourses = (courses) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courses))
}

const emptyCourse = {
  id: null,
  title: '',
  description: '',
  price: '',
  originalPrice: '',
  poster: '',
  videoUrl: '',
  driveLink: ''
}

const Admin = () => {
  const [authed, setAuthed] = useState(false)
  const [courses, setCourses] = useState([])
  const [form, setForm] = useState(emptyCourse)
  const [editingId, setEditingId] = useState(null)

  // Offer timer (2 hours window) — show beside Admin Dashboard
  const OFFER_WINDOW_MS = 2 * 60 * 60 * 1000
  const formatMS = (ms) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000))
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
    const seconds = String(totalSeconds % 60).padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  }
  const getOfferRemaining = () => {
    const now = Date.now()
    const elapsed = now % OFFER_WINDOW_MS
    return OFFER_WINDOW_MS - elapsed
  }
  const [offerRemainingMs, setOfferRemainingMs] = useState(getOfferRemaining())
  useEffect(() => {
    const t = setInterval(() => setOfferRemainingMs(getOfferRemaining()), 1000)
    return () => clearInterval(t)
  }, [])

  // NOTE: Do not auto-authenticate on page load. The admin must explicitly
  // sign in via the LoginForm. This prevents "auto login" when visiting
  // /admin. Authentication happens only after LoginForm stores
  // `ADMIN_TOKEN` into localStorage on successful login.

  useEffect(() => {
    // fetch courses from backend when authed or on load
    const fetchCourses = async () => {
      try {
        const res = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/courses')
        const json = await res.json()
        if (json.success && Array.isArray(json.courses)) setCourses(json.courses)
      } catch (err) {
        console.warn('Failed to fetch courses', err)
        setCourses([])
      }
    }
    fetchCourses()
  }, [authed])

  const isValid = useMemo(() => {
    return (
      form.title.trim() &&
      form.description.trim() &&
      String(form.price).trim() && !Number.isNaN(Number(form.price)) &&
      form.poster.trim() && 
      form.videoUrl.trim() &&
      form.driveLink.trim() &&
      form.driveLink.trim().startsWith('https://drive.google.com/')
    )
  }, [form])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setForm(emptyCourse)
    setEditingId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValid) {
      toast.error('Please fill all required fields (title, description, price, poster URL, video URL, and Google Drive link)')
      return
    }

    // send to backend
    const token = localStorage.getItem('ADMIN_TOKEN')
    if (!token) return toast.error('Not authenticated')
    
    // Prepare the payload with proper data types and validation
    const payload = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      poster: form.poster.trim(),
      videoUrl: form.videoUrl.trim(),
      driveLink: form.driveLink.trim()
    }

    // Validate Google Drive link if provided
    if (payload.driveLink && !payload.driveLink.startsWith('https://drive.google.com/')) {
      return toast.error('Please enter a valid Google Drive link')
    }

    try {
      const res = await fetch(import.meta.env.VITE_API_BASE_URL + '/admin/course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      })
      const json = await res.json()
      if (!json.success) return toast.error(json.message || 'Failed')
      toast.success(editingId ? 'Course updated' : 'Course added')
      // refresh
      const r = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/courses')
      const j = await r.json()
      if (j.success) setCourses(j.courses)
      resetForm()
    } catch (err) {
      console.error(err)
      toast.error('Failed to save course')
    }
  }

  const handleEdit = (course) => {
    setEditingId(course.id)
    setForm({
      id: course.id,
      title: course.title || '',
      description: course.description || '',
      price: course.price ?? '',
      originalPrice: course.originalPrice ?? '',
      poster: course.poster || '',
      videoUrl: course.videoUrl || '',
      driveLink: course.driveLink || ''
    })
  }

  const handleDelete = async (id) => {
    const ok = window.confirm('Delete this course?')
    if (!ok) return
    const token = localStorage.getItem('ADMIN_TOKEN')
    if (!token) return toast.error('Not authenticated')
    try {
      const res = await fetch(import.meta.env.VITE_API_BASE_URL + `/admin/course/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      const json = await res.json()
      if (!json.success) return toast.error(json.message || 'Failed')
      toast.success('Course deleted')
      const r = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/courses')
      const j = await r.json()
      if (j.success) setCourses(j.courses)
      if (editingId === id) resetForm()
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete')
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center px-4">
        <div className="card p-6 md:p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
          <LoginForm onSuccess={() => { setAuthed(true); toast.success('Logged in') }} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex items-center justify-between lg:col-span-2">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
            <div className="text-sm text-gray-700 bg-white/80 px-3 py-1 rounded-full border border-gray-100 shadow-sm">
              Offer ends in: <span className="font-mono ml-2">{formatMS(offerRemainingMs)}</span>
            </div>
          </div>
          <button onClick={() => { localStorage.removeItem('ADMIN_TOKEN'); localStorage.removeItem('ADMIN_USER'); setAuthed(false); toast.success('Logged out') }} className="px-4 py-2 rounded-2xl border-2 border-gray-200 text-gray-700">Logout</button>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="card p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit Course' : 'Add New Course'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input name="title" value={form.title} onChange={handleChange} className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-300 bg-gray-50 focus:bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-300 bg-gray-50 focus:bg-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
                <input name="price" type="number" value={form.price} onChange={handleChange} className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-300 bg-gray-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Original Price (₹)</label>
                <input name="originalPrice" type="number" value={form.originalPrice} onChange={handleChange} className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-300 bg-gray-50 focus:bg-white" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Poster URL *</label>
              <input 
                name="poster" 
                value={form.poster} 
                onChange={handleChange} 
                required
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-300 bg-gray-50 focus:bg-white" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preview Video URL *</label>
              <input 
                name="videoUrl" 
                value={form.videoUrl} 
                onChange={handleChange} 
                required
                placeholder="https://example.com/video.mp4 or YouTube URL"
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-300 bg-gray-50 focus:bg-white" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Google Drive Link *</label>
              <div className="relative">
                <input 
                  name="driveLink" 
                  value={form.driveLink} 
                  onChange={handleChange} 
                  placeholder="https://drive.google.com/..."
                  className={`w-full px-4 py-3.5 border-2 rounded-2xl focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white ${
                    form.driveLink && !form.driveLink.trim().startsWith('https://drive.google.com/')
                      ? 'border-red-300 focus:border-red-300'
                      : 'border-gray-200 focus:border-primary-300'
                  }`}
                />
                {form.driveLink && !form.driveLink.trim().startsWith('https://drive.google.com/') && (
                  <p className="mt-1 text-sm text-red-600">Please enter a valid Google Drive link</p>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} type="submit" className="btn-primary">
                {editingId ? 'Save Changes' : 'Add Course'}
              </motion.button>
              {editingId && (
                <button type="button" onClick={resetForm} className="px-4 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-700">Cancel</button>
              )}
            </div>
          </form>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="card p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6">Courses</h2>
          <div className="space-y-4">
            {courses.length === 0 && (
              <div className="text-gray-500">No courses added yet.</div>
            )}
            {courses.map((c) => (
              <div key={c.id} className="p-4 border-2 border-gray-200 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  {c.poster ? (
                    <img src={c.poster} alt={c.title} className="w-20 h-20 object-cover rounded-xl" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>
                  )}
                  <div>
                    <div className="font-semibold text-gray-900">{c.title}</div>
                    <div className="text-sm text-gray-600 line-clamp-2">{c.description}</div>
                    <div className="mt-1 font-bold">₹{Number(c.price).toLocaleString()} {c.originalPrice ? <span className="text-gray-400 font-normal line-through ml-2">₹{Number(c.originalPrice).toLocaleString()}</span> : null}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(c)} className="px-4 py-2 rounded-xl border-2 border-blue-200 text-blue-700 bg-blue-50">Edit</button>
                  <button onClick={() => handleDelete(c.id)} className="px-4 py-2 rounded-xl border-2 border-red-200 text-red-700 bg-red-50">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Admin

  const LoginForm = ({ onSuccess }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const validateForm = () => {
    if (!username.trim()) {
      setError('Username is required')
      return false
    }
    if (!password.trim()) {
      setError('Password is required')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(import.meta.env.VITE_API_BASE_URL + '/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: username.trim(), 
          password: password.trim() 
        })
      })

      const json = await res.json()

      if (json.success && json.token) {
        localStorage.setItem('ADMIN_TOKEN', json.token)
        if (json.admin) {
          localStorage.setItem('ADMIN_USER', JSON.stringify(json.admin))
        }
        onSuccess()
        toast.success('Login successful')
      } else {
        setError(json.message || 'Invalid credentials')
        toast.error(json.message || 'Invalid credentials')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Network error. Please try again.')
      toast.error('Login failed. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
        <input 
          value={username} 
          onChange={(e) => setUsername(e.target.value)}
          className={`w-full px-4 py-3.5 border-2 rounded-2xl focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white ${
            error && !username.trim() ? 'border-red-300 focus:border-red-300' : 'border-gray-200 focus:border-primary-300'
          }`}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          className={`w-full px-4 py-3.5 border-2 rounded-2xl focus:ring-2 focus:ring-primary-500 bg-gray-50 focus:bg-white ${
            error && !password.trim() ? 'border-red-300 focus:border-red-300' : 'border-gray-200 focus:border-primary-300'
          }`}
        />
      </div>
      {error && (
        <div className="text-sm text-red-600 mt-1">{error}</div>
      )}
      <motion.button 
        type="submit" 
        disabled={isLoading} 
        whileHover={{ scale: isLoading ? 1 : 1.02, y: -2 }} 
        whileTap={{ scale: 0.98 }} 
        className={`w-full btn-primary ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </motion.button>
      <p className="text-xs text-gray-500 text-center">Access is protected. Do not share credentials.</p>
    </form>
  )
}


