import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit() {
    setError('')
    setLoading(true)

    if (mode === 'register') {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); setLoading(false); return }
    }

    const result = await signIn('credentials', {
      email, password, redirect: false,
    })

    if (result?.error) {
      setError('Invalid email or password')
      setLoading(false)
      return
    }

    router.push('/')
  }

  const inp = {
    width: '100%', padding: '12px 14px', fontSize: 15,
    background: '#1a1a1a', color: '#f5f2ed',
    border: '1px solid #2e2e2e', borderRadius: 4, outline: 'none',
  }

  return (
    <>
      <Head><title>RoofScript — {mode === 'login' ? 'Sign In' : 'Create Account'}</title></Head>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <span style={{ fontSize: 36, fontWeight: 800, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase' }}>
              <span style={{ color: '#f5f2ed' }}>ROOF</span>
              <span style={{ color: '#e85d04' }}>SCRIPT</span>
            </span>
          </div>

          <div style={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 6, padding: 28 }}>
            <h2 style={{ fontSize: 22, marginBottom: 24, color: '#f5f2ed' }}>
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </h2>

            {mode === 'register' && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Name</label>
                <input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Email</label>
              <input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Password</label>
              <input style={inp} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </div>

            {error && (
              <div style={{ marginBottom: 16, padding: '10px 14px', background: '#2a0a0a', border: '1px solid #6b1a1a', borderRadius: 4, fontSize: 14, color: '#f87171' }}>
                {error}
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading} style={{
              width: '100%', padding: 13, fontSize: 16, fontWeight: 700,
              fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em',
              background: loading ? '#3a1f00' : '#e85d04', color: '#fff',
              border: 'none', borderRadius: 4, cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign in →' : 'Create account →'}
            </button>

            <div style={{ marginTop: 18, textAlign: 'center', fontSize: 14, color: '#6b6b6b' }}>
              {mode === 'login' ? (
                <>Don't have an account?{' '}
                  <span onClick={() => setMode('register')} style={{ color: '#e85d04', cursor: 'pointer' }}>Sign up free</span>
                </>
              ) : (
                <>Already have an account?{' '}
                  <span onClick={() => setMode('login')} style={{ color: '#e85d04', cursor: 'pointer' }}>Sign in</span>
                </>
              )}
            </div>
          </div>

          {mode === 'register' && (
            <p style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: '#3a3a3a' }}>
              3 free scripts included. No credit card required.
            </p>
          )}
        </div>
      </div>
    </>
  )
}
