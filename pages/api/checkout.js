import { stripe } from '../../lib/stripe'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: 'Not authenticated' })

  const { plan } = req.body
  const priceId = plan === 'team'
    ? process.env.STRIPE_TEAM_PRICE_ID
    : process.env.STRIPE_PRO_PRICE_ID

  try {
    const checkout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXTAUTH_URL}/?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
      customer_email: session.user.email,
      metadata: { userId: session.user.id, plan },
    })

    return res.status(200).json({ url: checkout.url })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Failed to create checkout session' })
  }
}
