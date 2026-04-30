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
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  // Check free limit
  if (user.plan === 'free' && user.scripts_used >= FREE_LIMIT) {
    return res.status(403).json({
      error: 'free_limit_reached',
      message: 'You have used all 3 free scripts. Upgrade to Pro for unlimited scripts.',
    })
  }

  const { jobType, amount, material, scriptType, tone, notes } = req.body

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
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    // Increment usage
    await supabaseAdmin
      .from('users')
      .update({ scripts_used: user.scripts_used + 1 })
      .eq('id', user.id)

    const scriptsRemaining =
      user.plan === 'free' ? FREE_LIMIT - (user.scripts_used + 1) : -1

    return res.status(200).json({
      script: message.content[0].text,
      scriptsRemaining,
      plan: user.plan,
    })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Failed to generate script. Try again.' })
  }
}
