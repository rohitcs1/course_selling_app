require('dotenv').config()
const bcrypt = require('bcryptjs')
const { createClient } = require('@supabase/supabase-js')

// List of admin users to create
const ADMIN_USERS = [
  { username: 'admin1', password: 'pass123' },
  { username: 'admin2', password: 'pass456' },
  { username: 'admin3', password: 'pass789' }
]

async function createMultipleAdmins() {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    console.log('Creating multiple admin users...\n')

    for (const admin of ADMIN_USERS) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(admin.password, 10)

      // Insert or update admin
      const { data, error } = await supabase
        .from('admins')
        .upsert([
          {
            username: admin.username,
            password: hashedPassword
          }
        ])

      if (error) {
        console.error(`Failed to create admin ${admin.username}:`, error.message)
      } else {
        console.log(`✅ Created/Updated admin:`)
        console.log(`   Username: ${admin.username}`)
        console.log(`   Password: ${admin.password}`)
        console.log()
      }
    }

    // List all admins
    const { data: admins, error: listError } = await supabase
      .from('admins')
      .select('username, created_at')
      .order('created_at', { ascending: true })

    if (listError) {
      console.error('Failed to list admins:', listError.message)
    } else {
      console.log('\nAll admins in database:')
      admins.forEach(admin => {
        console.log(`- ${admin.username}`)
      })
    }

  } catch (err) {
    console.error('Script failed:', err.message)
  }
}

createMultipleAdmins()