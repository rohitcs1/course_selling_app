require('dotenv').config()
const bcrypt = require('bcryptjs')
const { createClient } = require('@supabase/supabase-js')

// Admin details to add
const adminUser = {
  username: 'testadmin',  // This will be the username to login
  password: 'test123'     // This will be the password to login
}

async function addTestAdmin() {
  // Connect to Supabase
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(adminUser.password, 10)

    // Add to database
    const { data, error } = await supabase
      .from('admins')
      .upsert([
        {
          username: adminUser.username,
          password: hashedPassword
        }
      ])

    if (error) {
      console.error('Error adding admin:', error.message)
      return
    }

    console.log('\n✅ Test admin created successfully!')
    console.log('\nYou can now login with:')
    console.log('Username:', adminUser.username)
    console.log('Password:', adminUser.password)
    
    // Show all admins in database
    const { data: allAdmins, error: listError } = await supabase
      .from('admins')
      .select('username')
    
    if (!listError && allAdmins) {
      console.log('\nAll admins in database:')
      allAdmins.forEach(admin => console.log('-', admin.username))
    }

  } catch (err) {
    console.error('Script failed:', err.message)
  }
}

// Run the script
addTestAdmin()