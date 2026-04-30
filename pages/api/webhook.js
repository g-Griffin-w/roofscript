import { stripe } from '../../lib/stripe'
import { supabaseAdmin } from '../../lib/supabase'

export const config = { api: { bodyParser: false } }

async function buffer(readable) {
  const chunks = []
  for await (const chunk of readable) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  return Buffer.concat(chunks)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const buf = await buffer(req)
  const sig = req.headers['stripe-signature']

  let event
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (e) {
    return res.status(400).json({ error: `Webhook error: ${e.message}` })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { userId, plan } = session.metadata

    await supabaseAdmin
      .from('users')
      .update({
        plan,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
      })
      .eq('id', userId)
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object
    await supabaseAdmin
      .from('users')
      .update({ plan: 'free', scripts_used: 0 })
      .eq('stripe_subscription_id', sub.id)
  }

  return res.status(200).json({ received: true })
}
