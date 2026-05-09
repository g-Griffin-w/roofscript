import { supabaseAdmin } from '../../lib/supabase'
import bcrypt from 'bcryptjs'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, password, name } = req.body
  if (!email || !password || !name) return res.status(400).json({ error: 'All fields required' })

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return res.status(400).json({ error: 'Invalid email address' })
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' })

  const { data: existing, error: lookupError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase())
    .single()

  if (lookupError && lookupError.code !== 'PGRST116') {
    return res.status(500).json({ error: 'Failed to create account' })
  }
  if (existing) return res.status(400).json({ error: 'Email already in use' })

  const hash = await bcrypt.hash(password, 10)

  const { error } = await supabaseAdmin.from('users').insert({
    email: email.toLowerCase(),
    password_hash: hash,
    name,
    plan: 'free',
    scripts_used: 0,
  })

  if (error) return res.status(500).json({ error: 'Failed to create account' })

  return res.status(200).json({ success: true })
}
