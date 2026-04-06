'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import dynamic from 'next/dynamic'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/admin')
  }

  const inp: React.CSSProperties = { width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', color: '#DDD8CE', fontSize: '14px', fontFamily: 'var(--font-jost)', outline: 'none' }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#08090D', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            {logoError ? (
              <svg width="44" height="44" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M40 10C31 10,20 17,17 29C14 41,20 49,25 55C30 61,30 70,28 78H36C36 69,38 61,40 57C42 61,44 69,44 78H52C50 70,50 61,55 55C60 49,66 41,63 29C60 17,49 10,40 10Z" fill="rgba(255,255,255,0.85)" /><path d="M33 14C26 11,18 7,14 1C16 9,14 17,13 24" stroke="rgba(255,255,255,0.35)" strokeWidth="1.8" fill="none" strokeLinecap="round" /><circle cx="30" cy="23" r="3" fill="#08090D" /></svg>
            ) : (
              <Image src="/logo.png" alt="Sentavita" width={44} height={44} style={{ objectFit: 'contain' }} onError={() => setLogoError(true)} />
            )}
          </div>
          <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '24px', letterSpacing: '0.14em', color: '#fff', marginBottom: '6px' }}>Sentavita</div>
          <div style={{ fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(221,216,206,0.35)' }}>Team Access</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '4px', padding: '36px 32px' }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label htmlFor="login-email" style={{ display: 'block', fontSize: '9.5px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(221,216,206,0.4)', marginBottom: '8px' }}>Email</label>
              <input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inp} placeholder="you@sentavita.io" />
            </div>
            <div>
              <label htmlFor="login-password" style={{ display: 'block', fontSize: '9.5px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(221,216,206,0.4)', marginBottom: '8px' }}>Password</label>
              <input id="login-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required style={inp} placeholder="••••••••" />
            </div>
            {error && <p role="alert" style={{ fontSize: '12px', color: 'rgba(232,100,100,0.8)', padding: '8px 12px', background: 'rgba(232,100,100,0.07)', borderRadius: '3px' }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ marginTop: '8px', padding: '13px', background: loading ? 'rgba(27,138,143,0.3)' : 'rgba(27,138,143,0.15)', border: '1px solid rgba(27,138,143,0.4)', borderRadius: '3px', color: '#1B8A8F', fontSize: '10px', letterSpacing: '0.26em', textTransform: 'uppercase', fontFamily: 'var(--font-jost)', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
