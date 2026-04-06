'use client'
import { useState } from 'react'
import Footer from '@/components/Footer'

const SUBJECTS = ['General enquiry', 'Investment & partnership', 'Join the team', 'Press & media', 'Veterinary collaboration', 'Other']
type Status = 'idle' | 'sending' | 'success' | 'error'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setStatus('sending'); setErrorMsg('')
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) { setErrorMsg(data.error || 'Something went wrong.'); setStatus('error') }
      else setStatus('success')
    } catch { setErrorMsg('Network error. Please try again.'); setStatus('error') }
  }

  const inp: React.CSSProperties = { width: '100%', padding: '13px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', color: '#DDD8CE', fontSize: '14px', fontFamily: 'var(--font-jost)', fontWeight: 300, outline: 'none', transition: 'border-color 0.25s' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: '9.5px', letterSpacing: '0.26em', textTransform: 'uppercase' as const, color: 'rgba(221,216,206,0.38)', marginBottom: '9px' }
  const focus = (e: React.FocusEvent) => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(27,138,143,0.45)'
  const blur = (e: React.FocusEvent) => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'

  if (status === 'success') return (
    <>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
        <div style={{ maxWidth: '480px', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1px solid rgba(27,138,143,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', fontSize: '20px' }} aria-hidden="true">✓</div>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '36px', fontWeight: 300, color: '#fff', marginBottom: '16px' }}>Message received.</h2>
          <p style={{ fontSize: '14px', lineHeight: 1.8, color: 'rgba(221,216,206,0.5)' }}>Thank you for reaching out. We read every message and will be in touch shortly.</p>
          <button onClick={() => { setStatus('idle'); setForm({ name: '', email: '', subject: '', message: '' }) }} style={{ marginTop: '32px', padding: '12px 32px', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', borderRadius: '3px', color: 'rgba(221,216,206,0.5)', fontSize: '10px', letterSpacing: '0.24em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-jost)' }}>Send another message</button>
        </div>
      </div>
      <Footer />
    </>
  )

  return (
    <>
      <div style={{ paddingTop: '80px' }}>
        <div style={{ padding: '80px 48px 64px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)' }} className="page-padding">
          <p style={{ fontSize: '10px', letterSpacing: '0.34em', textTransform: 'uppercase', color: 'rgba(27,138,143,0.7)', marginBottom: '22px' }}>Get in touch</p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(38px,5vw,64px)', fontWeight: 300, color: '#fff', marginBottom: '16px' }}>Contact Us</h1>
          <p style={{ fontSize: '13.5px', color: 'rgba(221,216,206,0.38)', maxWidth: '440px', margin: '0 auto', lineHeight: 1.75 }}>Whether you are an investor, a researcher, a rider, or simply curious — we would like to hear from you.</p>
        </div>
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '80px', padding: '72px 48px 100px' }} className="page-padding contact-grid">
          <div>
            {[
              { label: 'Email', content: <a href="mailto:hello@sentavita.io" style={{ fontSize: '14px', color: 'rgba(221,216,206,0.65)', textDecoration: 'none' }}>hello@sentavita.io</a> },
              { label: 'Based in', content: <p style={{ fontSize: '14px', color: 'rgba(221,216,206,0.5)', lineHeight: 1.6 }}>Zurich, Switzerland</p> },
            ].map(item => (
              <div key={item.label} style={{ marginBottom: '36px' }}>
                <p style={{ fontSize: '9.5px', letterSpacing: '0.26em', textTransform: 'uppercase', color: 'rgba(27,138,143,0.65)', marginBottom: '12px' }}>{item.label}</p>
                {item.content}
              </div>
            ))}
            <div>
              <p style={{ fontSize: '9.5px', letterSpacing: '0.26em', textTransform: 'uppercase', color: 'rgba(27,138,143,0.65)', marginBottom: '14px' }}>Good reasons to write</p>
              {['Investment enquiry', 'Veterinary collaboration', 'Join the team', 'Press & media', 'General curiosity'].map(r => (
                <p key={r} style={{ fontSize: '13px', color: 'rgba(221,216,206,0.38)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(27,138,143,0.5)', flexShrink: 0, display: 'inline-block' }} />
                  {r}
                </p>
              ))}
            </div>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="contact-name-email">
              <div><label htmlFor="contact-name" style={lbl}>Your name *</label><input id="contact-name" type="text" required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Jane Smith" style={inp} onFocus={focus} onBlur={blur} /></div>
              <div><label htmlFor="contact-email" style={lbl}>Email address *</label><input id="contact-email" type="email" required value={form.email} onChange={e => set('email', e.target.value)} placeholder="jane@example.com" style={inp} onFocus={focus} onBlur={blur} /></div>
            </div>
            <div><label htmlFor="contact-subject" style={lbl}>Subject</label><select id="contact-subject" value={form.subject} onChange={e => set('subject', e.target.value)} style={{ ...inp, appearance: 'none', cursor: 'pointer' }} onFocus={focus} onBlur={blur}><option value="">Select (optional)</option>{SUBJECTS.map(s => <option key={s} value={s} style={{ background: '#08090D' }}>{s}</option>)}</select></div>
            <div>
              <label htmlFor="contact-message" style={lbl}>Message *</label>
              <textarea id="contact-message" required value={form.message} onChange={e => set('message', e.target.value)} placeholder="Tell us what is on your mind..." rows={7} style={{ ...inp, resize: 'vertical', lineHeight: 1.75 }} onFocus={focus} onBlur={blur} />
              <p style={{ marginTop: '6px', fontSize: '10px', color: 'rgba(221,216,206,0.2)' }}>{form.message.length} / 5000</p>
            </div>
            {status === 'error' && <div role="alert" style={{ padding: '12px 16px', background: 'rgba(220,50,50,0.07)', border: '1px solid rgba(220,50,50,0.15)', borderRadius: '3px', fontSize: '13px', color: 'rgba(220,100,100,0.8)' }}>{errorMsg}</div>}
            <button type="submit" disabled={status === 'sending'}
              style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 44px', border: '1px solid rgba(232,168,42,0.45)', color: '#E8A82A', fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', fontFamily: 'var(--font-jost)', fontWeight: 300, background: 'transparent', cursor: status === 'sending' ? 'not-allowed' : 'pointer', opacity: status === 'sending' ? 0.6 : 1, transition: 'all 0.3s', borderRadius: '2px' }}>
              {status === 'sending' ? 'Sending...' : 'Send message →'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
      <style>{`
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
        @media (max-width: 640px) {
          .contact-name-email { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
