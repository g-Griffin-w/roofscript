import { supabaseAdmin } from '../../lib/supabase'
import bcrypt from 'bcryptjs'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, password, name } = req.body
  if (!email || !password || !name) return res.status(400).json({ error: 'All fields required' })

  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase())
    .single()

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
