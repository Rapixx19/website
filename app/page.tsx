import Hero from '@/components/Hero'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/server'
import { ArrowRight } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const { data: rows } = await supabase.from('content').select('id,value')
  const c: Record<string, string> = {}
  rows?.forEach(r => { c[r.id] = r.value })

  return (
    <>
      <Hero />
      <section id="about" style={{ padding: '100px 24px', maxWidth: '620px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: '10px', letterSpacing: '0.34em', textTransform: 'uppercase', color: 'rgba(27,138,143,0.8)', marginBottom: '28px' }}>About</p>
        <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(30px,4vw,46px)', fontWeight: 300, color: '#fff', lineHeight: 1.25, marginBottom: '26px' }}>
          Every horse deserves to be understood.
        </h2>
        <p style={{ fontSize: '14.5px', lineHeight: 1.88, color: 'rgba(221,216,206,0.54)', marginBottom: '16px' }}>
          {c['home.about.body'] || 'We are a Swiss company working at the frontier of equine health and performance science.'}
        </p>
        <p style={{ fontSize: '14.5px', lineHeight: 1.88, color: 'rgba(221,216,206,0.54)', marginBottom: '44px' }}>
          {c['home.about.body2'] || 'We are early, deliberate, and selective about who we work with.'}
        </p>
        <a href={c['home.apply.url'] || 'https://sentavita-portal.vercel.app'} target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 38px', border: '1px solid rgba(232,168,42,0.45)', color: '#E8A82A', fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', fontFamily: 'var(--font-jost)', fontWeight: 300, textDecoration: 'none', background: 'transparent', transition: 'all 0.3s', borderRadius: '2px' }}>
          Apply to join us <ArrowRight size={12} />
        </a>
      </section>
      <Footer />
    </>
  )
}
