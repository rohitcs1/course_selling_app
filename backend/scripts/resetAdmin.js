require('dotenv').config()
const bcrypt = require('bcryptjs')
const { createClient } = require('@supabase/supabase-js')

const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'admin123'

async function resetAdmin() {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    // First delete existing admin
    await supabase
      .from('admins')
      .delete()
      .eq('username', ADMIN_USERNAME)

    // Create new admin
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10)
    const { data, error } = await supabase
      .from('admins')
      .insert([
        {
          username: ADMIN_USERNAME,
          password: hashedPassword
        }
      ])

    if (error) throw error
    console.log('Admin reset successful!')
    console.log('Username:', ADMIN_USERNAME)
    console.log('Password:', ADMIN_PASSWORD)
  } catch (err) {
    console.error('Failed to reset admin:', err.message)
  }
}

resetAdmin()