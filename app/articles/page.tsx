import { createClient } from '@/lib/supabase/server'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default async function ArticlesPage() {
  const supabase = await createClient()
  const { data: articles } = await supabase.from('articles').select('*').eq('visible', true).order('display_order')

  return (
    <>
      <div style={{ paddingTop: '80px' }}>
        <div style={{ padding: '80px 48px 56px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)' }} className="page-padding">
          <p style={{ fontSize: '10px', letterSpacing: '0.34em', textTransform: 'uppercase', color: 'rgba(27,138,143,0.7)', marginBottom: '22px' }}>Writing</p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(38px,5vw,64px)', fontWeight: 300, color: '#fff', marginBottom: '14px' }}>From the Team</h1>
          <p style={{ fontSize: '13px', color: 'rgba(221,216,206,0.38)', maxWidth: '400px', margin: '0 auto', lineHeight: 1.7 }}>Our thinking on equine health, wearable technology, and the science behind the sport.</p>
        </div>

        {!articles?.length ? (
          <div style={{ padding: '80px 48px', textAlign: 'center' }} className="page-padding">
            <p style={{ fontSize: '14px', color: 'rgba(221,216,206,0.45)', marginBottom: '16px' }}>We are working on our first piece.</p>
            <p style={{ fontSize: '13px', color: 'rgba(221,216,206,0.3)' }}>Follow us on <a href="https://linkedin.com/company/sentavita" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(27,138,143,0.65)', textDecoration: 'none' }}>LinkedIn</a> for updates.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255,255,255,0.04)' }}>
            {articles.map(a => (
              <a key={a.id} href={a.linkedin_url || '#'} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px', padding: '38px 52px', background: '#08090D', textDecoration: 'none', transition: 'background 0.25s' }}
                className="page-padding">
                <div>
                  <div style={{ fontSize: '9.5px', letterSpacing: '0.26em', textTransform: 'uppercase', color: 'rgba(27,138,143,0.6)', marginBottom: '12px', display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <span>LinkedIn</span>
                    <span style={{ width: '2px', height: '2px', borderRadius: '50%', background: 'rgba(27,138,143,0.4)', display: 'inline-block' }} />
                    <span>{a.published_at ? new Date(a.published_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : ''}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '22px', fontWeight: 400, color: '#fff', lineHeight: 1.3, marginBottom: '10px' }}>{a.title}</div>
                  <div style={{ fontSize: '13px', lineHeight: 1.72, color: 'rgba(221,216,206,0.38)', maxWidth: '560px' }}>{a.excerpt}</div>
                  {a.tag && <span style={{ display: 'inline-block', marginTop: '14px', padding: '3px 10px', background: 'rgba(27,138,143,0.08)', border: '1px solid rgba(27,138,143,0.16)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(27,138,143,0.6)', borderRadius: '2px' }}>{a.tag}</span>}
                </div>
                <span style={{ color: 'rgba(221,216,206,0.2)', fontSize: '20px', flexShrink: 0, paddingTop: '2px' }}>→</span>
              </a>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
