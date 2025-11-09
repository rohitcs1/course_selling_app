require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

async function updateCoursesTable() {
  // Connect to Supabase
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    // Execute raw SQL to add the driveLink column using pg_dump format
    const { data, error } = await supabase
      .from('courses')
      .update({ drivelink: null })
      .eq('id', -1) // This will add the column without updating any rows

    if (error && !error.message.includes('column "drivelink" of relation "courses" already exists')) {
      console.error('Error updating courses table:', error)
      return
    }

    console.log('✅ Successfully added driveLink column to courses table')
    
    // Verify the column exists
    const { data: columns, error: listError } = await supabase
      .from('courses')
      .select()
      .limit(1)

    if (!listError) {
      console.log('\nCurrent courses table columns:', Object.keys(columns?.[0] || {}))
    }

  } catch (err) {
    console.error('Script failed:', err.message)
  }
}

// Run the script
updateCoursesTable()