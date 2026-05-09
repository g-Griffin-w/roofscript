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
    return res.status(400).json({ error: 'Webhook signature verification failed' })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const userId = session.metadata?.userId
      const plan = session.metadata?.plan

      if (!userId || !plan) throw new Error('Missing metadata on checkout session')

      const { error } = await supabaseAdmin
        .from('users')
        .update({
          plan,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
        })
        .eq('id', userId)

      if (error) throw error
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object
      const { error } = await supabaseAdmin
        .from('users')
        .update({ plan: 'free' })
        .eq('stripe_subscription_id', sub.id)

      if (error) throw error
    }
  } catch (e) {
    console.error('Webhook DB update failed:', e.message)
    return res.status(500).json({ error: 'Webhook processing failed' })
  }

  return res.status(200).json({ received: true })
}
