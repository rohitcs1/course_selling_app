/**
 * Seed script to create initial admin user in Firestore.
 * Usage:
 * 1. Fill .env with FIREBASE_SERVICE_ACCOUNT and ADMIN_USERNAME / ADMIN_PASSWORD
 * 2. node seed-admin.js
 */
require('dotenv').config()
const bcrypt = require('bcryptjs')
const { createClient } = require('@supabase/supabase-js')

async function run() {
  const SUPABASE_URL = process.env.SUPABASE_URL
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Supabase env vars missing. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env')
    process.exit(1)
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  const username = process.env.ADMIN_USERNAME || 'admin'
  const password = process.env.ADMIN_PASSWORD || 'admin123'

  try {
    const { data: exists } = await supabase.from('admins').select('*').eq('username', username)
    if (exists && exists.length) {
      console.log('Admin already exists. Exiting.')
      process.exit(0)
    }

    const hashed = await bcrypt.hash(password, 10)
    const { data, error } = await supabase.from('admins').insert([{ username, password: hashed, created_at: new Date().toISOString() }]).select()
    if (error) throw error
    console.log('Admin created with id:', data[0].id)
    process.exit(0)
  } catch (err) {
    console.error('Failed to seed admin:', err)
    process.exit(1)
  }
}

run()
