#!/usr/bin/env node
require('dotenv').config()
const bcrypt = require('bcryptjs')
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Supabase URL or Service Role Key missing in .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function createAdmin(username, password) {
  try {
    if (!username || !password) {
      console.error('Usage: node scripts/createAdmin.js <username> <password>')
      process.exit(1)
    }

    const hashed = await bcrypt.hash(password, 10)

    // Check if admin exists
    const { data: existing, error: selectErr } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .limit(1)

    if (selectErr) throw selectErr

    if (existing && existing.length) {
      // Update password
      const admin = existing[0]
      const { error: updateErr } = await supabase
        .from('admins')
        .update({ password: hashed })
        .eq('id', admin.id)

      if (updateErr) throw updateErr
      console.log('Admin updated:', username)
      return
    }

    // Insert new admin
    const { data, error } = await supabase
      .from('admins')
      .insert([{ username, password: hashed, created_at: new Date().toISOString() }])
      .select()

    if (error) throw error

    console.log('Admin created with id:', data && data[0] && data[0].id)
  } catch (err) {
    console.error('Failed to create admin:', err.message || err)
    process.exit(1)
  }
}

const argv = process.argv.slice(2)
const username = argv[0] || process.env.ADMIN_USERNAME
const password = argv[1] || process.env.ADMIN_PASSWORD

createAdmin(username, password).then(() => process.exit(0))
