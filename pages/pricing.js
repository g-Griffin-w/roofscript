import Head from 'next/head'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState } from 'react'

export default function Pricing() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState('')

  async function subscribe(plan) {
    if (!session) { router.push('/auth'); return }
    setLoading(plan)
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    setLoading('')
  }

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      desc: 'Try it out',
      features: ['3 scripts total', 'All script types', 'All tones'],
      cta: 'Get started',
      highlight: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 19,
      desc: 'For individual roofers',
      features: ['Unlimited scripts', 'All script types', 'All tones', 'Priority support'],
      cta: 'Start Pro',
      highlight: true,
    },
    {
      id: 'team',
      name: 'Team',
      price: 49,
      desc: 'For roofing companies',
      features: ['Unlimited scripts', 'Up to 5 seats', 'All script types', 'All tones', 'Priority support'],
      cta: 'Start Team',
      highlight: false,
    },
  ]

  return (
    <>
      <Head><title>RoofScript — Pricing</title></Head>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ cursor: 'pointer', marginBottom: 24 }} onClick={() => router.push('/')}>
            <span style={{ fontSize: 32, fontWeight: 800, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase' }}>
              <span style={{ color: '#f5f2ed' }}>ROOF</span>
              <span style={{ color: '#e85d04' }}>SCRIPT</span>
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', color: '#f5f2ed', marginBottom: 12 }}>Simple pricing</h1>
          <p style={{ fontSize: 16, color: '#6b6b6b' }}>One closed job pays for a year of Pro. Cancel anytime.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {plans.map(plan => (
            <div key={plan.id} style={{
              background: plan.highlight ? '#1f1200' : '#1a1a1a',
              border: plan.highlight ? '2px solid #e85d04' : '1px solid #2e2e2e',
              borderRadius: 6, padding: 28, position: 'relative',
            }}>
              {plan.highlight && (
                <div style={{
                  position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                  background: '#e85d04', color: '#fff', fontSize: 11, fontWeight: 700,
                  padding: '3px 14px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.07em',
                  fontFamily: "'Barlow Condensed', sans-serif",
                }}>Most Popular</div>
              )}
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 24, color: '#f5f2ed', marginBottom: 4 }}>{plan.name}</h2>
                <p style={{ fontSize: 13, color: '#6b6b6b', marginBottom: 16 }}>{plan.desc}</p>
                <div style={{ fontSize: 40, fontWeight: 800, fontFamily: "'Barlow Condensed', sans-serif", color: '#f5f2ed' }}>
                  {plan.price === 0 ? 'Free' : `$${plan.price}`}
                  {plan.price > 0 && <span style={{ fontSize: 16, fontWeight: 400, color: '#6b6b6b' }}>/mo</span>}
                </div>
              </div>

              <ul style={{ listStyle: 'none', marginBottom: 24 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ fontSize: 14, color: '#c0bdb8', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#e85d04', fontWeight: 700 }}>✓</span> {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => plan.id === 'free' ? router.push('/auth') : subscribe(plan.id)}
                disabled={loading === plan.id}
                style={{
                  width: '100%', padding: '11px', fontSize: 15, fontWeight: 700,
                  fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em',
                  background: plan.highlight ? '#e85d04' : 'transparent',
                  color: plan.highlight ? '#fff' : '#f5f2ed',
                  border: plan.highlight ? 'none' : '1px solid #2e2e2e',
                  borderRadius: 4, cursor: 'pointer',
                }}
              >
                {loading === plan.id ? 'Loading...' : plan.cta + ' →'}
              </button>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', marginTop: 32, fontSize: 13, color: '#3a3a3a' }}>
          Cancel anytime. No contracts. Payments secured by Stripe.
        </p>
      </div>
    </>
  )
}
