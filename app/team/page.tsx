import { createClient } from '@/lib/supabase/server'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: members } = await supabase.from('team_members').select('*').order('display_order')
  const { data: rows } = await supabase.from('content').select('id,value').eq('id', 'team.context')
  const context = rows?.[0]?.value || ''

  return (
    <>
      <div style={{ paddingTop: '80px' }}>
        <div style={{ padding: '80px 48px 56px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)' }} className="page-padding">
          <p style={{ fontSize: '10px', letterSpacing: '0.34em', textTransform: 'uppercase', color: 'rgba(27,138,143,0.7)', marginBottom: '22px' }}>The people</p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(38px,5vw,64px)', fontWeight: 300, color: '#fff', marginBottom: '14px' }}>Building Sentavita</h1>
          <p style={{ fontSize: '13px', color: 'rgba(221,216,206,0.38)', maxWidth: '400px', margin: '0 auto', lineHeight: 1.7 }}>A focused team at the intersection of equine sport, hardware, and clinical science.</p>
        </div>

        {!members?.length ? (
          <div style={{ padding: '80px 48px', textAlign: 'center' }} className="page-padding">
            <p style={{ fontSize: '14px', color: 'rgba(221,216,206,0.45)', marginBottom: '16px' }}>We are assembling our team.</p>
            <p style={{ fontSize: '13px', color: 'rgba(221,216,206,0.3)' }}>Interested in joining? <Link href="/contact" style={{ color: 'rgba(27,138,143,0.65)', textDecoration: 'none' }}>Get in touch</Link>.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1px', background: 'rgba(255,255,255,0.04)' }}>
            {members.map(m => (
              <div key={m.id} style={{ background: m.is_open_role ? 'rgba(232,168,42,0.015)' : '#08090D', padding: '40px 32px', border: m.is_open_role ? '1px dashed rgba(232,168,42,0.14)' : 'none' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: m.is_open_role ? 'rgba(232,168,42,0.08)' : 'rgba(27,138,143,0.1)', border: `1px solid ${m.is_open_role ? 'rgba(232,168,42,0.18)' : 'rgba(27,138,143,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant)', fontSize: '18px', color: m.is_open_role ? 'rgba(232,168,42,0.5)' : 'rgba(27,138,143,0.7)', marginBottom: '22px' }}>{m.initials}</div>
                <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '20px', fontWeight: 400, color: m.is_open_role ? 'rgba(255,255,255,0.38)' : '#fff', marginBottom: '5px' }}>{m.name}</div>
                <div style={{ fontSize: '9.5px', letterSpacing: '0.24em', textTransform: 'uppercase', color: m.is_open_role ? 'rgba(232,168,42,0.45)' : 'rgba(232,168,42,0.6)', marginBottom: '16px' }}>{m.role}</div>
                <div style={{ fontSize: '13px', lineHeight: 1.75, color: 'rgba(221,216,206,0.45)' }}>{m.bio}</div>
                {m.linkedin_url && !m.is_open_role && <a href={m.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '18px', fontSize: '9.5px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(27,138,143,0.55)', textDecoration: 'none' }}>LinkedIn ↗</a>}
                {m.is_open_role && <Link href="/contact" style={{ display: 'inline-block', marginTop: '18px', fontSize: '9.5px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(232,168,42,0.45)', textDecoration: 'none' }}>Apply ↗</Link>}
              </div>
            ))}
          </div>
        )}

        {context && <div style={{ padding: '64px 48px', maxWidth: '680px', margin: '0 auto', textAlign: 'center', fontSize: '14px', lineHeight: 1.9, color: 'rgba(221,216,206,0.44)' }} className="page-padding">{context}</div>}
      </div>
      <Footer />
    </>
  )
}
