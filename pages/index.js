import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'

const JOB_TYPES = ['Full roof replacement', 'Storm damage repair', 'Partial repair', 'Insurance claim job', 'Commercial flat roof']
const MATERIALS = ['Architectural shingles', 'Metal roofing', '3-tab shingles', 'Tile', 'Flat / TPO']
const SCRIPT_TYPES = ['In-person close', 'Phone follow-up', 'Text message', 'Objection handler']
const TONES = ['Confident closer', 'Friendly & consultative', 'Urgency-driven', 'Soft sell']
const FREE_LIMIT = 3

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [jobType, setJobType] = useState(JOB_TYPES[0])
  const [amount, setAmount] = useState('')
  const [material, setMaterial] = useState(MATERIALS[0])
  const [scriptType, setScriptType] = useState(SCRIPT_TYPES[0])
  const [notes, setNotes] = useState('')
  const [tone, setTone] = useState(TONES[0])
  const [script, setScript] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [scriptsRemaining, setScriptsRemaining] = useState(null)

  const isPro = session?.user?.plan === 'pro' || session?.user?.plan === 'team'
  const usedScripts = session?.user?.scriptsUsed || 0
  const remaining = scriptsRemaining !== null ? scriptsRemaining : Math.max(0, FREE_LIMIT - usedScripts)

  async function generate() {
    if (!session) { router.push('/auth'); return }
    setLoading(true); setScript(''); setError(''); setCopied(false)

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobType, amount, material, scriptType, tone, notes }),
    })
    const data = await res.json()

    if (res.status === 403 && data.error === 'free_limit_reached') {
      router.push('/pricing')
      setLoading(false)
      return
    }

    if (!res.ok) { setError(data.error || 'Something went wrong'); setLoading(false); return }

    setScript(data.script)
    if (data.scriptsRemaining !== undefined) setScriptsRemaining(data.scriptsRemaining)
    setLoading(false)
  }

  function copy() {
    navigator.clipboard.writeText(script).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }

  const inp = {
    width: '100%', padding: '10px 12px', fontSize: 14,
    background: '#1a1a1a', color: '#f5f2ed',
    border: '1px solid #2e2e2e', borderRadius: 4, outline: 'none',
  }

  return (
    <>
      <Head>
        <title>RoofScript — AI Sales Scripts for Roofers</title>
        <meta name="description" content="Generate custom roofing sales scripts in seconds. Close more jobs." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px 60px' }}>

        {/* Header */}
        <header style={{ padding: '32px 0 28px', borderBottom: '1px solid #2e2e2e', marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', lineHeight: 1 }}>
              <span style={{ color: '#f5f2ed' }}>ROOF</span>
              <span style={{ color: '#e85d04' }}>SCRIPT</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {session ? (
              <>
                {!isPro && (
                  <span style={{ fontSize: 13, color: '#6b6b6b' }}>
                    {remaining} free script{remaining !== 1 ? 's' : ''} left
                  </span>
                )}
                {!isPro && (
                  <button onClick={() => router.push('/pricing')} style={{
                    padding: '7px 14px', fontSize: 13, fontWeight: 600,
                    background: '#e85d04', color: '#fff', border: 'none',
                    borderRadius: 4, cursor: 'pointer', fontFamily: "'Barlow', sans-serif",
                  }}>Upgrade</button>
                )}
                {isPro && <span style={{ fontSize: 13, color: '#e85d04', fontWeight: 600 }}>PRO</span>}
                <button onClick={() => signOut()} style={{
                  padding: '7px 14px', fontSize: 13, background: 'transparent',
                  color: '#6b6b6b', border: '1px solid #2e2e2e', borderRadius: 4, cursor: 'pointer',
                }}>Sign out</button>
              </>
            ) : (
              <button onClick={() => router.push('/auth')} style={{
                padding: '7px 14px', fontSize: 13, fontWeight: 600,
                background: '#e85d04', color: '#fff', border: 'none',
                borderRadius: 4, cursor: 'pointer',
              }}>Sign in</button>
            )}
          </div>
        </header>

        {/* Success message */}
        {router.query.success && (
          <div style={{ marginBottom: 24, padding: '14px 16px', background: '#0a2a0a', border: '1px solid #1a6b1a', borderRadius: 4, fontSize: 14, color: '#4ade80' }}>
            🎉 You're now on Pro! Unlimited scripts unlocked.
          </div>
        )}

        {/* Form */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Job type</label>
            <select style={inp} value={jobType} onChange={e => setJobType(e.target.value)}>
              {JOB_TYPES.map(j => <option key={j}>{j}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Estimate amount</label>
            <input style={inp} value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. $14,500" />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Material</label>
            <select style={inp} value={material} onChange={e => setMaterial(e.target.value)}>
              {MATERIALS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Script type</label>
            <select style={inp} value={scriptType} onChange={e => setScriptType(e.target.value)}>
              {SCRIPT_TYPES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Situation notes (optional)</label>
            <textarea style={{ ...inp, minHeight: 76, resize: 'vertical' }} value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Homeowner wants 3 quotes. Insurance approved. Hesitant on price..." />
          </div>
        </div>

        {/* Tone */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Tone</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TONES.map(t => (
              <button key={t} onClick={() => setTone(t)} style={{
                padding: '7px 16px', borderRadius: 2, fontSize: 13, cursor: 'pointer',
                border: tone === t ? '2px solid #e85d04' : '1px solid #2e2e2e',
                background: tone === t ? '#e85d04' : 'transparent',
                color: tone === t ? '#fff' : '#6b6b6b',
                fontWeight: tone === t ? 600 : 400,
                textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>{t}</button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <button onClick={generate} disabled={loading} style={{
          width: '100%', padding: 15, fontSize: 17, fontWeight: 700,
          fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', letterSpacing: '0.06em',
          background: loading ? '#3a1f00' : '#e85d04', color: loading ? '#6b6b6b' : '#fff',
          border: 'none', borderRadius: 4, cursor: loading ? 'not-allowed' : 'pointer',
        }}>
          {loading ? 'Generating your script...' : 'Generate script →'}
        </button>

        {!session && (
          <p style={{ textAlign: 'center', marginTop: 10, fontSize: 13, color: '#3a3a3a' }}>
            <span onClick={() => router.push('/auth')} style={{ color: '#e85d04', cursor: 'pointer' }}>Sign up free</span> — 3 scripts included, no credit card needed
          </p>
        )}

        {error && (
          <div style={{ marginTop: 18, padding: '12px 16px', background: '#2a0a0a', border: '1px solid #6b1a1a', borderRadius: 4, fontSize: 14, color: '#f87171' }}>
            {error}
          </div>
        )}

        {script && !loading && (
          <div style={{ marginTop: 26, background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 4 }}>
            <div style={{ padding: '12px 18px', borderBottom: '1px solid #2e2e2e', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#e85d04', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'Barlow Condensed', sans-serif" }}>
                Your script — {scriptType}
              </span>
              <span style={{ fontSize: 12, color: '#6b6b6b' }}>{tone}</span>
            </div>
            <div style={{ padding: '22px 18px', fontSize: 15, lineHeight: 1.85, color: '#f5f2ed', whiteSpace: 'pre-wrap' }}>
              {script}
            </div>
            <div style={{ padding: '12px 18px', borderTop: '1px solid #2e2e2e', display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={copy} style={{
                  padding: '8px 16px', fontSize: 13, borderRadius: 4,
                  border: '1px solid #2e2e2e', background: copied ? '#e85d04' : 'transparent',
                  color: copied ? '#fff' : '#f5f2ed', cursor: 'pointer', fontWeight: 500,
                }}>{copied ? 'Copied!' : 'Copy script'}</button>
                <button onClick={() => { setScript(''); setNotes('') }} style={{
                  padding: '8px 16px', fontSize: 13, borderRadius: 4,
                  border: '1px solid #2e2e2e', background: 'transparent', color: '#6b6b6b', cursor: 'pointer',
                }}>New script</button>
              </div>
              {!isPro && remaining <= 1 && (
                <button onClick={() => router.push('/pricing')} style={{
                  padding: '8px 16px', fontSize: 13, borderRadius: 4,
                  background: '#e85d04', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600,
                }}>Upgrade to Pro →</button>
              )}
            </div>
          </div>
        )}

        <footer style={{ marginTop: 56, paddingTop: 20, borderTop: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#2e2e2e' }}>RoofScript — Built for closers.</span>
          <span onClick={() => router.push('/pricing')} style={{ fontSize: 13, color: '#3a3a3a', cursor: 'pointer' }}>Pricing</span>
        </footer>
      </div>
    </>
  )
}
