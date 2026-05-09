import Anthropic from '@anthropic-ai/sdk'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'
import { supabaseAdmin } from '../../lib/supabase'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const FREE_LIMIT = 3

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: 'Please sign in to generate scripts' })

  // Get latest user data
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (userError || !user) return res.status(404).json({ error: 'User not found' })

  // Check free limit
  if (user.plan === 'free' && user.scripts_used >= FREE_LIMIT) {
    return res.status(403).json({
      error: 'free_limit_reached',
      message: 'You have used all 3 free scripts. Upgrade to Pro for unlimited scripts.',
    })
  }

  if (!req.body) return res.status(400).json({ error: 'Missing request body' })
  const { jobType, amount, material, scriptType, tone, notes } = req.body

  const VALID_JOB_TYPES = ['Full roof replacement', 'Storm damage repair', 'Partial repair', 'Insurance claim job', 'Commercial flat roof']
  const VALID_MATERIALS = ['Architectural shingles', 'Metal roofing', '3-tab shingles', 'Tile', 'Flat / TPO']
  const VALID_SCRIPT_TYPES = ['In-person close', 'Phone follow-up', 'Text message', 'Objection handler']
  const VALID_TONES = ['Confident closer', 'Friendly & consultative', 'Urgency-driven', 'Soft sell']

  if (!VALID_JOB_TYPES.includes(jobType)) return res.status(400).json({ error: 'Invalid job type' })
  if (!VALID_MATERIALS.includes(material)) return res.status(400).json({ error: 'Invalid material' })
  if (!VALID_SCRIPT_TYPES.includes(scriptType)) return res.status(400).json({ error: 'Invalid script type' })
  if (!VALID_TONES.includes(tone)) return res.status(400).json({ error: 'Invalid tone' })
  if (notes && notes.length > 500) return res.status(400).json({ error: 'Notes too long (max 500 characters)' })

  const prompt = `You are an expert roofing sales coach with 20 years of experience. Write a realistic, natural-sounding ${scriptType} sales script for a roofer.

Job details:
- Job type: ${jobType}
- Estimate amount: ${amount || 'not specified'}
- Material: ${material}
- Tone: ${tone}
${notes ? `- Situation notes: ${notes}` : ''}

Write ONLY the script itself. No intro, no label, no explanation. Sound like a real human — not corporate or robotic. Use line breaks between speaking parts. Keep it tight and punchy. If text message, keep under 160 characters.`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const textBlock = message.content.find(b => b.type === 'text')
    if (!textBlock) return res.status(500).json({ error: 'Failed to generate script. Try again.' })

    // Increment usage
    const { error: incError } = await supabaseAdmin
      .from('users')
      .update({ scripts_used: user.scripts_used + 1 })
      .eq('id', user.id)

    if (incError) console.error('Failed to increment scripts_used:', incError.message)

    const scriptsRemaining =
      user.plan === 'free' ? FREE_LIMIT - (user.scripts_used + 1) : -1

    return res.status(200).json({
      script: textBlock.text,
      scriptsRemaining,
      plan: user.plan,
    })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Failed to generate script. Try again.' })
  }
}
