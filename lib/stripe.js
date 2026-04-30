import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
})

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    scripts: 3,
  },
  pro: {
    name: 'Pro',
    price: 19,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    scripts: -1, // unlimited
  },
  team: {
    name: 'Team',
    price: 49,
    priceId: process.env.STRIPE_TEAM_PRICE_ID,
    scripts: -1,
    seats: 5,
  },
}
