import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, password, name } = req.body
  
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'All fields required' })
  }

  // Create supabase client directly in this file to rule out import issues
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log('Supabase URL:', supabaseUrl)
  console.log('Key prefix:', supabaseKey?.substring(0, 20))

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Missing environment variables' })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Check if user exists
    const { data: existing, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    console.log('Fetch result:', { existing, fetchError })

    if (existing) {
      return res.status(400).json({ error: 'Email already in use' })
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10)

    // Insert user
    const { data, error: insertError } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password_hash: hash,
        name,
        plan: 'free',
        scripts_used: 0,
      })
      .select()

    console.log('Insert result:', { data, insertError })

    if (insertError) {
      return res.status(500).json({ error: 'Failed to create account: ' + insertError.message })
    }

    return res.status(200).json({ success: true })
  } catch (e) {
    console.log('Caught error:', e.message)
    return res.status(500).json({ error: 'Server error: ' + e.message })
  }
}
