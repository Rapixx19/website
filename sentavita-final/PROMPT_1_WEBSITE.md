# PROMPT 1 — Public Website
## Run after PROMPT_0. Builds every public-facing page.
## CRITICAL: Copy all code blocks exactly. Do not convert inline styles to Tailwind.

---

## lib/supabase/client.ts
```typescript
import { createBrowserClient } from '@supabase/ssr'
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

## lib/supabase/server.ts
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) }
          catch {}
        },
      },
    }
  )
}
```

## app/globals.css
```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@200;300;400;500&display=swap');

:root {
  --font-cormorant: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
  --font-jost: 'Jost', 'Helvetica Neue', system-ui, sans-serif;
}

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; }

body {
  background-color: #08090D;
  color: #DDD8CE;
  font-family: var(--font-jost);
  font-weight: 300;
  overflow-x: hidden;
  min-height: 100vh;
}

::selection { background: rgba(27,138,143,0.3); color: #fff; }

::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-track { background: #08090D; }
::-webkit-scrollbar-thumb { background: rgba(27,138,143,0.25); border-radius: 2px; }

:focus-visible { outline: 1px solid rgba(27,138,143,0.5); outline-offset: 2px; }

input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 100px #08090D inset;
  -webkit-text-fill-color: #DDD8CE;
}
```

## app/layout.tsx
```typescript
import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import PageViewTracker from '@/components/PageViewTracker'

export const metadata: Metadata = {
  title: 'Sentavita',
  description: 'Equine health monitoring — Switzerland',
  openGraph: { title: 'Sentavita', description: 'Sensing the life of the horse.', siteName: 'Sentavita' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <PageViewTracker />
        {children}
      </body>
    </html>
  )
}
```

## components/Nav.tsx
```typescript
'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const FallbackMark = () => (
  <svg width="26" height="26" viewBox="0 0 80 80" fill="none">
    <path d="M40 10C31 10,20 17,17 29C14 41,20 49,25 55C30 61,30 70,28 78H36C36 69,38 61,40 57C42 61,44 69,44 78H52C50 70,50 61,55 55C60 49,66 41,63 29C60 17,49 10,40 10Z" fill="rgba(226,221,212,0.88)"/>
    <path d="M33 14C26 11,18 7,14 1C16 9,14 17,13 24" stroke="rgba(226,221,212,0.4)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    <circle cx="30" cy="23" r="3" fill="#08090D"/>
  </svg>
)

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  if (pathname.startsWith('/admin') || pathname === '/login') return null

  const linkStyle = (href: string): React.CSSProperties => ({
    fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase' as const,
    fontWeight: 300, fontFamily: 'var(--font-jost)',
    color: pathname === href ? '#DDD8CE' : 'rgba(221,216,206,0.45)',
    textDecoration: 'none', transition: 'color 0.25s',
  })

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '18px 48px',
      background: scrolled ? 'rgba(8,9,13,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(14px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
      transition: 'all 0.4s',
    }}>
      <Link href="/" style={{ display:'flex', alignItems:'center', gap:'9px', textDecoration:'none', fontFamily:'var(--font-cormorant)', fontSize:'19px', letterSpacing:'0.14em', color:'#fff', fontWeight:400 }}>
        {logoError ? <FallbackMark /> : (
          <Image src="/logo.png" alt="Sentavita" width={26} height={26}
            style={{ objectFit:'contain' }} onError={() => setLogoError(true)} />
        )}
        Sentavita
      </Link>
      <div style={{ display:'flex', gap:'40px' }}>
        <Link href="/" style={linkStyle('/')}>Home</Link>
        <Link href="/team" style={linkStyle('/team')}>Team</Link>
        <Link href="/articles" style={linkStyle('/articles')}>Articles</Link>
        <Link href="/journal" style={linkStyle('/journal')}>Journal</Link>
        <Link href="/contact" style={linkStyle('/contact')}>Contact</Link>
      </div>
    </nav>
  )
}
```

## components/Footer.tsx
```typescript
export default function Footer() {
  return (
    <footer style={{ borderTop:'1px solid rgba(255,255,255,0.04)', padding:'36px 48px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px' }}>
      <span style={{ fontFamily:'var(--font-cormorant)', fontSize:'16px', letterSpacing:'0.14em', color:'rgba(255,255,255,0.28)' }}>Sentavita</span>
      <a href="mailto:hello@sentavita.io" style={{ fontSize:'10px', letterSpacing:'0.16em', color:'rgba(27,138,143,0.45)', textDecoration:'none' }}>hello@sentavita.io</a>
      <span style={{ fontSize:'9.5px', letterSpacing:'0.12em', color:'rgba(221,216,206,0.18)' }}>© 2026 Sentavita</span>
    </footer>
  )
}
```

## components/Hero.tsx
```typescript
'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [logoError, setLogoError] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let animId: number

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize()
    window.addEventListener('resize', resize)

    const particles = Array.from({ length: 32 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.3 + 0.3,
      vx: (Math.random() - 0.5) * 0.1, vy: (Math.random() - 0.5) * 0.07,
      flicker: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.018 + 0.006,
      teal: Math.random() > 0.68,
    }))

    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t += 0.004
      const gx = canvas.width * 0.5 + Math.sin(t * 0.3) * canvas.width * 0.06
      const gy = canvas.height * 0.42 + Math.cos(t * 0.2) * canvas.height * 0.05
      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, canvas.width * 0.4)
      g.addColorStop(0, 'rgba(27,138,143,0.055)')
      g.addColorStop(1, 'transparent')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.flicker += p.speed
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0
        const a = 0.55 + 0.45 * Math.sin(p.flicker)
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.teal ? `rgba(27,138,143,${(a*0.7).toFixed(2)})` : `rgba(226,221,212,${(a*0.28).toFixed(2)})`
        ctx.fill()
      })
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <section style={{ position:'relative', height:'100vh', minHeight:'500px', overflow:'hidden', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#08090D' }}>
      {/* Replace /horse.mp4 with your video file in /public/ */}
      <video autoPlay muted loop playsInline style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.18, zIndex:1 }}>
        <source src="/horse.mp4" type="video/mp4" />
      </video>
      <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', zIndex:2 }} />
      <div style={{ position:'absolute', inset:0, zIndex:3, background:'radial-gradient(ellipse 70% 50% at 50% 45%, rgba(27,138,143,0.07) 0%, transparent 70%)' }} />
      <div style={{ position:'absolute', inset:0, zIndex:4, background:'linear-gradient(to bottom, rgba(8,9,13,0.2) 0%, transparent 40%, rgba(8,9,13,0.85) 85%, #08090D 100%)' }} />
      <div style={{ position:'relative', zIndex:5, textAlign:'center', padding:'0 24px', display:'flex', flexDirection:'column', alignItems:'center' }}>
        <div style={{ marginBottom:'16px', animation:'sv-fadeUp 1.2s ease forwards', opacity:0, animationDelay:'0.3s' }}>
          {logoError ? (
            <svg width="62" height="62" viewBox="0 0 80 80" fill="none">
              <path d="M40 10C31 10,20 17,17 29C14 41,20 49,25 55C30 61,30 70,28 78H36C36 69,38 61,40 57C42 61,44 69,44 78H52C50 70,50 61,55 55C60 49,66 41,63 29C60 17,49 10,40 10Z" fill="rgba(255,255,255,0.9)"/>
              <path d="M33 14C26 11,18 7,14 1C16 9,14 17,13 24" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
              <circle cx="30" cy="23" r="3" fill="#08090D"/>
            </svg>
          ) : (
            <Image src="/logo.png" alt="Sentavita" width={62} height={62} style={{ objectFit:'contain' }} onError={() => setLogoError(true)} />
          )}
        </div>
        <h1 style={{ fontFamily:'var(--font-cormorant)', fontSize:'clamp(54px,9vw,88px)', fontWeight:300, letterSpacing:'0.2em', color:'#fff', lineHeight:1, animation:'sv-fadeUp 1.2s ease forwards', opacity:0, animationDelay:'0.55s' }}>
          Sentavita
        </h1>
        <div style={{ width:'40px', height:'1px', background:'rgba(232,168,42,0.55)', margin:'18px auto', animation:'sv-fadeIn 1s ease forwards', opacity:0, animationDelay:'1.1s' }} />
        <p style={{ fontSize:'10px', letterSpacing:'0.36em', textTransform:'uppercase', color:'rgba(221,216,206,0.4)', animation:'sv-fadeUp 1s ease forwards', opacity:0, animationDelay:'1.3s' }}>
          Equine health · Switzerland · Est. 2026
        </p>
        <div onClick={() => document.getElementById('about')?.scrollIntoView({ behavior:'smooth' })} style={{ marginTop:'44px', cursor:'pointer', opacity:0, animation:'sv-fadeIn 1s ease forwards', animationDelay:'2s', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px' }}>
          <span style={{ fontSize:'9px', letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(221,216,206,0.3)' }}>Discover</span>
          <div style={{ width:'1px', height:'38px', background:'linear-gradient(to bottom, rgba(27,138,143,0.7), transparent)', animation:'sv-pulse 2s ease infinite' }} />
        </div>
      </div>
      <style>{`
        @keyframes sv-fadeUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes sv-fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes sv-pulse { 0%,100%{opacity:.35} 50%{opacity:1} }
      `}</style>
    </section>
  )
}
```

## components/PageViewTracker.tsx
```typescript
'use client'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

export default function PageViewTracker() {
  const pathname = usePathname()
  const last = useRef('')
  useEffect(() => {
    if (pathname === last.current) return
    last.current = pathname
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname, referrer: document.referrer }),
    }).catch(() => {})
  }, [pathname])
  return null
}
```

## app/api/track/route.ts
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
export async function POST(req: NextRequest) {
  try {
    const { path, referrer } = await req.json()
    await supabase.from('page_views').insert({ path, referrer: referrer || '' })
  } catch {}
  return NextResponse.json({ ok: true })
}
```

## app/page.tsx
```typescript
import Hero from '@/components/Hero'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/server'
import { ArrowRight } from 'lucide-react'
export const revalidate = 60

export default async function Home() {
  const supabase = await createClient()
  const { data: rows } = await supabase.from('content').select('id,value')
  const c: Record<string,string> = {}
  rows?.forEach(r => { c[r.id] = r.value })

  return (
    <>
      <Hero />
      <section id="about" style={{ padding:'100px 24px', maxWidth:'620px', margin:'0 auto', textAlign:'center' }}>
        <p style={{ fontSize:'10px', letterSpacing:'0.34em', textTransform:'uppercase', color:'rgba(27,138,143,0.8)', marginBottom:'28px' }}>About</p>
        <h2 style={{ fontFamily:'var(--font-cormorant)', fontSize:'clamp(30px,4vw,46px)', fontWeight:300, color:'#fff', lineHeight:1.25, marginBottom:'26px' }}>
          Every horse deserves to be understood.
        </h2>
        <p style={{ fontSize:'14.5px', lineHeight:1.88, color:'rgba(221,216,206,0.54)', marginBottom:'16px' }}>
          {c['home.about.body'] || 'We are a Swiss company working at the frontier of equine health and performance science.'}
        </p>
        <p style={{ fontSize:'14.5px', lineHeight:1.88, color:'rgba(221,216,206,0.54)', marginBottom:'44px' }}>
          {c['home.about.body2'] || 'We are early, deliberate, and selective about who we work with.'}
        </p>
        <a href={c['home.apply.url'] || 'https://yourportal.com'} target="_blank" rel="noopener noreferrer"
          style={{ display:'inline-flex', alignItems:'center', gap:'10px', padding:'14px 38px', border:'1px solid rgba(232,168,42,0.45)', color:'#E8A82A', fontSize:'10px', letterSpacing:'0.28em', textTransform:'uppercase', fontFamily:'var(--font-jost)', fontWeight:300, textDecoration:'none', background:'transparent', transition:'all 0.3s', borderRadius:'2px' }}>
          Open Application Portal <ArrowRight size={12} />
        </a>
      </section>
      <Footer />
    </>
  )
}
```

## app/team/page.tsx
```typescript
import { createClient } from '@/lib/supabase/server'
import Footer from '@/components/Footer'
import Link from 'next/link'
export const revalidate = 60

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: members } = await supabase.from('team_members').select('*').order('display_order')
  const { data: rows } = await supabase.from('content').select('id,value').eq('id','team.context')
  const context = rows?.[0]?.value || ''

  return (
    <>
      <div style={{ paddingTop:'80px' }}>
        <div style={{ padding:'80px 48px 56px', textAlign:'center', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
          <p style={{ fontSize:'10px', letterSpacing:'0.34em', textTransform:'uppercase', color:'rgba(27,138,143,0.7)', marginBottom:'22px' }}>The people</p>
          <h1 style={{ fontFamily:'var(--font-cormorant)', fontSize:'clamp(38px,5vw,64px)', fontWeight:300, color:'#fff', marginBottom:'14px' }}>Building Sentavita</h1>
          <p style={{ fontSize:'13px', color:'rgba(221,216,206,0.38)', maxWidth:'400px', margin:'0 auto', lineHeight:1.7 }}>A focused team at the intersection of equine sport, hardware, and clinical science.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'1px', background:'rgba(255,255,255,0.04)' }}>
          {members?.map(m => (
            <div key={m.id} style={{ background: m.is_open_role ? 'rgba(232,168,42,0.015)' : '#08090D', padding:'40px 32px', border: m.is_open_role ? '1px dashed rgba(232,168,42,0.14)' : 'none' }}>
              <div style={{ width:'50px', height:'50px', borderRadius:'50%', background: m.is_open_role ? 'rgba(232,168,42,0.08)' : 'rgba(27,138,143,0.1)', border:`1px solid ${m.is_open_role ? 'rgba(232,168,42,0.18)' : 'rgba(27,138,143,0.2)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-cormorant)', fontSize:'18px', color: m.is_open_role ? 'rgba(232,168,42,0.5)' : 'rgba(27,138,143,0.7)', marginBottom:'22px' }}>{m.initials}</div>
              <div style={{ fontFamily:'var(--font-cormorant)', fontSize:'20px', fontWeight:400, color: m.is_open_role ? 'rgba(255,255,255,0.38)' : '#fff', marginBottom:'5px' }}>{m.name}</div>
              <div style={{ fontSize:'9.5px', letterSpacing:'0.24em', textTransform:'uppercase', color: m.is_open_role ? 'rgba(232,168,42,0.45)' : 'rgba(232,168,42,0.6)', marginBottom:'16px' }}>{m.role}</div>
              <div style={{ fontSize:'13px', lineHeight:1.75, color:'rgba(221,216,206,0.45)' }}>{m.bio}</div>
              {m.linkedin_url && !m.is_open_role && <a href={m.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ display:'inline-block', marginTop:'18px', fontSize:'9.5px', letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(27,138,143,0.55)', textDecoration:'none' }}>LinkedIn ↗</a>}
              {m.is_open_role && <Link href="/#about" style={{ display:'inline-block', marginTop:'18px', fontSize:'9.5px', letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(232,168,42,0.45)', textDecoration:'none' }}>Apply ↗</Link>}
            </div>
          ))}
        </div>
        {context && <div style={{ padding:'64px 48px', maxWidth:'680px', margin:'0 auto', textAlign:'center', fontSize:'14px', lineHeight:1.9, color:'rgba(221,216,206,0.44)' }}>{context}</div>}
      </div>
      <Footer />
    </>
  )
}
```

## app/articles/page.tsx
```typescript
import { createClient } from '@/lib/supabase/server'
import Footer from '@/components/Footer'
export const revalidate = 60

export default async function ArticlesPage() {
  const supabase = await createClient()
  const { data: articles } = await supabase.from('articles').select('*').eq('visible',true).order('display_order')
  return (
    <>
      <div style={{ paddingTop:'80px' }}>
        <div style={{ padding:'80px 48px 56px', textAlign:'center', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
          <p style={{ fontSize:'10px', letterSpacing:'0.34em', textTransform:'uppercase', color:'rgba(27,138,143,0.7)', marginBottom:'22px' }}>Writing</p>
          <h1 style={{ fontFamily:'var(--font-cormorant)', fontSize:'clamp(38px,5vw,64px)', fontWeight:300, color:'#fff', marginBottom:'14px' }}>From the Team</h1>
          <p style={{ fontSize:'13px', color:'rgba(221,216,206,0.38)', maxWidth:'400px', margin:'0 auto', lineHeight:1.7 }}>Our thinking on equine health, wearable technology, and the science behind the sport.</p>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'1px', background:'rgba(255,255,255,0.04)' }}>
          {articles?.map(a => (
            <a key={a.id} href={a.linkedin_url||'#'} target="_blank" rel="noopener noreferrer"
              style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'24px', padding:'38px 52px', background:'#08090D', textDecoration:'none', transition:'background 0.25s' }}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#0D1018'}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='#08090D'}>
              <div>
                <div style={{ fontSize:'9.5px', letterSpacing:'0.26em', textTransform:'uppercase', color:'rgba(27,138,143,0.6)', marginBottom:'12px', display:'flex', gap:'14px', alignItems:'center' }}>
                  <span>LinkedIn</span>
                  <span style={{ width:'2px', height:'2px', borderRadius:'50%', background:'rgba(27,138,143,0.4)', display:'inline-block' }}/>
                  <span>{a.published_at ? new Date(a.published_at).toLocaleDateString('en-GB',{month:'long',year:'numeric'}) : ''}</span>
                </div>
                <div style={{ fontFamily:'var(--font-cormorant)', fontSize:'22px', fontWeight:400, color:'#fff', lineHeight:1.3, marginBottom:'10px' }}>{a.title}</div>
                <div style={{ fontSize:'13px', lineHeight:1.72, color:'rgba(221,216,206,0.38)', maxWidth:'560px' }}>{a.excerpt}</div>
                {a.tag && <span style={{ display:'inline-block', marginTop:'14px', padding:'3px 10px', background:'rgba(27,138,143,0.08)', border:'1px solid rgba(27,138,143,0.16)', fontSize:'9px', letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(27,138,143,0.6)', borderRadius:'2px' }}>{a.tag}</span>}
              </div>
              <span style={{ color:'rgba(221,216,206,0.2)', fontSize:'20px', flexShrink:0, paddingTop:'2px' }}>→</span>
            </a>
          ))}
        </div>
      </div>
      <Footer />
    </>
  )
}
```

## app/journal/page.tsx
```typescript
import { createClient } from '@/lib/supabase/server'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Image from 'next/image'
export const revalidate = 60

const TYPE_COLOUR: Record<string,string> = {
  article:'rgba(27,138,143,0.6)', research:'rgba(232,168,42,0.6)', update:'rgba(221,216,206,0.4)',
}

export default async function JournalPage() {
  const supabase = await createClient()
  const { data: posts } = await supabase.from('posts').select('*, post_media(url,media_type,display_order)').eq('visible',true).lte('published_at',new Date().toISOString()).order('published_at',{ascending:false})
  return (
    <>
      <div style={{ paddingTop:'80px' }}>
        <div style={{ padding:'80px 48px 56px', textAlign:'center', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
          <p style={{ fontSize:'10px', letterSpacing:'0.34em', textTransform:'uppercase', color:'rgba(27,138,143,0.7)', marginBottom:'22px' }}>Journal</p>
          <h1 style={{ fontFamily:'var(--font-cormorant)', fontSize:'clamp(38px,5vw,64px)', fontWeight:300, color:'#fff', marginBottom:'14px' }}>From Sentavita</h1>
          <p style={{ fontSize:'13px', color:'rgba(221,216,206,0.38)', maxWidth:'400px', margin:'0 auto', lineHeight:1.7 }}>Research, updates, and writing from the team.</p>
        </div>
        {!posts?.length && <div style={{ padding:'80px', textAlign:'center', fontSize:'14px', color:'rgba(221,216,206,0.3)' }}>No posts yet.</div>}
        <div style={{ maxWidth:'820px', margin:'0 auto', padding:'60px 24px' }}>
          {posts?.map(post => {
            const cover = post.cover_url || post.post_media?.find((m:any)=>m.media_type==='image')?.url
            return (
              <Link key={post.id} href={`/journal/${post.slug}`} style={{ display:'block', marginBottom:'64px', textDecoration:'none' }}>
                {cover && <div style={{ position:'relative', width:'100%', height:'260px', overflow:'hidden', borderRadius:'3px', marginBottom:'24px', background:'#0D1018' }}><Image src={cover} alt={post.title} fill style={{ objectFit:'cover', opacity:0.85 }} /></div>}
                <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'12px' }}>
                  <span style={{ fontSize:'9.5px', letterSpacing:'0.24em', textTransform:'uppercase', color:TYPE_COLOUR[post.post_type]||'rgba(221,216,206,0.4)' }}>{post.post_type}</span>
                  {post.published_at && <><span style={{ width:'2px', height:'2px', borderRadius:'50%', background:'rgba(221,216,206,0.2)', display:'inline-block' }}/><span style={{ fontSize:'9.5px', color:'rgba(221,216,206,0.3)' }}>{new Date(post.published_at).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</span></>}
                </div>
                <h2 style={{ fontFamily:'var(--font-cormorant)', fontSize:'clamp(24px,3vw,34px)', fontWeight:300, color:'#fff', lineHeight:1.25, marginBottom:'12px' }}>{post.title}</h2>
                {post.excerpt && <p style={{ fontSize:'14px', lineHeight:1.78, color:'rgba(221,216,206,0.45)', marginBottom:'16px' }}>{post.excerpt}</p>}
                {post.tags?.length>0 && <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>{post.tags.map((tag:string)=><span key={tag} style={{ padding:'3px 10px', background:'rgba(27,138,143,0.07)', border:'1px solid rgba(27,138,143,0.15)', fontSize:'9px', letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(27,138,143,0.6)', borderRadius:'2px' }}>{tag}</span>)}</div>}
                <div style={{ marginTop:'18px', fontSize:'10.5px', letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(27,138,143,0.55)' }}>Read more →</div>
                <div style={{ marginTop:'40px', height:'1px', background:'rgba(255,255,255,0.05)' }} />
              </Link>
            )
          })}
        </div>
      </div>
      <Footer />
    </>
  )
}
```

## app/journal/[slug]/page.tsx
```typescript
import { createClient } from '@/lib/supabase/server'
import Footer from '@/components/Footer'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { FileText } from 'lucide-react'
export const revalidate = 60

export default async function PostPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()
  const { data: post } = await supabase.from('posts').select('*, post_media(*)').eq('slug',params.slug).eq('visible',true).single()
  if (!post) notFound()

  const images = post.post_media?.filter((m:any)=>m.media_type==='image').sort((a:any,b:any)=>a.display_order-b.display_order)
  const videos = post.post_media?.filter((m:any)=>m.media_type==='video').sort((a:any,b:any)=>a.display_order-b.display_order)
  const pdfs   = post.post_media?.filter((m:any)=>m.media_type==='pdf').sort((a:any,b:any)=>a.display_order-b.display_order)

  return (
    <>
      <div style={{ paddingTop:'80px' }}>
        {post.cover_url && <div style={{ position:'relative', width:'100%', height:'420px', overflow:'hidden', background:'#0D1018' }}><Image src={post.cover_url} alt={post.title} fill style={{ objectFit:'cover', opacity:0.7 }}/><div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,transparent 40%,#08090D 100%)' }}/></div>}
        <article style={{ maxWidth:'720px', margin:'0 auto', padding:'60px 24px 100px' }}>
          <div style={{ display:'flex', gap:'16px', alignItems:'center', marginBottom:'18px' }}>
            <span style={{ fontSize:'9.5px', letterSpacing:'0.24em', textTransform:'uppercase', color:'rgba(27,138,143,0.65)' }}>{post.post_type}</span>
            {post.published_at && <><span style={{ width:'2px', height:'2px', borderRadius:'50%', background:'rgba(221,216,206,0.2)', display:'inline-block' }}/><span style={{ fontSize:'9.5px', color:'rgba(221,216,206,0.3)' }}>{new Date(post.published_at).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</span></>}
          </div>
          <h1 style={{ fontFamily:'var(--font-cormorant)', fontSize:'clamp(32px,4vw,52px)', fontWeight:300, color:'#fff', lineHeight:1.2, marginBottom:'28px' }}>{post.title}</h1>
          {post.tags?.length>0 && <div style={{ display:'flex', gap:'8px', marginBottom:'36px', flexWrap:'wrap' }}>{post.tags.map((tag:string)=><span key={tag} style={{ padding:'3px 10px', background:'rgba(27,138,143,0.07)', border:'1px solid rgba(27,138,143,0.15)', fontSize:'9px', letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(27,138,143,0.6)', borderRadius:'2px' }}>{tag}</span>)}</div>}
          <div style={{ fontSize:'15px', lineHeight:1.88, color:'rgba(221,216,206,0.72)' }}>{post.body.split('\n\n').map((para:string,i:number)=><p key={i} style={{ marginBottom:'20px' }}>{para}</p>)}</div>
          {images?.length>0 && <div style={{ marginTop:'40px', display:'flex', flexDirection:'column', gap:'20px' }}>{images.map((img:any)=><figure key={img.id} style={{ margin:0 }}><div style={{ position:'relative', width:'100%', borderRadius:'3px', overflow:'hidden', background:'#0D1018' }}><Image src={img.url} alt={img.caption||''} width={720} height={420} style={{ width:'100%', height:'auto', display:'block' }}/></div>{img.caption&&<figcaption style={{ marginTop:'8px', fontSize:'11px', color:'rgba(221,216,206,0.3)' }}>{img.caption}</figcaption>}</figure>)}</div>}
          {videos?.length>0 && <div style={{ marginTop:'40px', display:'flex', flexDirection:'column', gap:'20px' }}>{videos.map((vid:any)=><figure key={vid.id} style={{ margin:0 }}><video controls style={{ width:'100%', borderRadius:'3px', background:'#000', display:'block' }}><source src={vid.url} type="video/mp4"/></video>{vid.caption&&<figcaption style={{ marginTop:'8px', fontSize:'11px', color:'rgba(221,216,206,0.3)' }}>{vid.caption}</figcaption>}</figure>)}</div>}
          {pdfs?.length>0 && <div style={{ marginTop:'40px' }}><p style={{ fontSize:'10px', letterSpacing:'0.26em', textTransform:'uppercase', color:'rgba(221,216,206,0.35)', marginBottom:'14px' }}>Attachments</p><div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>{pdfs.map((pdf:any)=><a key={pdf.id} href={pdf.url} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:'12px', padding:'14px 18px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'3px', textDecoration:'none' }}><FileText size={16} color="rgba(232,168,42,0.7)"/><span style={{ flex:1, fontSize:'13px', color:'rgba(221,216,206,0.65)' }}>{pdf.caption||pdf.filename}</span><span style={{ fontSize:'9.5px', letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(221,216,206,0.3)' }}>PDF ↗</span></a>)}</div></div>}
        </article>
      </div>
      <Footer />
    </>
  )
}
```

## app/contact/page.tsx
```typescript
'use client'
import { useState } from 'react'
import Footer from '@/components/Footer'

const SUBJECTS = ['General enquiry','Investment & partnership','Join the team','Press & media','Veterinary collaboration','Other']
type Status = 'idle'|'sending'|'success'|'error'

export default function ContactPage() {
  const [form, setForm] = useState({ name:'', email:'', subject:'', message:'' })
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const set = (f:string,v:string) => setForm(p=>({...p,[f]:v}))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setStatus('sending'); setErrorMsg('')
    try {
      const res = await fetch('/api/contact',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) { setErrorMsg(data.error||'Something went wrong.'); setStatus('error') }
      else setStatus('success')
    } catch { setErrorMsg('Network error. Please try again.'); setStatus('error') }
  }

  const inp: React.CSSProperties = { width:'100%', padding:'13px 16px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'3px', color:'#DDD8CE', fontSize:'14px', fontFamily:'var(--font-jost)', fontWeight:300, outline:'none', transition:'border-color 0.25s' }
  const lbl: React.CSSProperties = { display:'block', fontSize:'9.5px', letterSpacing:'0.26em', textTransform:'uppercase' as const, color:'rgba(221,216,206,0.38)', marginBottom:'9px' }
  const focus = (e:any) => (e.currentTarget as HTMLElement).style.borderColor='rgba(27,138,143,0.45)'
  const blur  = (e:any) => (e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.08)'

  if (status==='success') return (
    <>
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'80px 24px' }}>
        <div style={{ maxWidth:'480px', textAlign:'center' }}>
          <div style={{ width:'48px', height:'48px', borderRadius:'50%', border:'1px solid rgba(27,138,143,0.4)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 28px', fontSize:'20px' }}>✓</div>
          <h2 style={{ fontFamily:'var(--font-cormorant)', fontSize:'36px', fontWeight:300, color:'#fff', marginBottom:'16px' }}>Message received.</h2>
          <p style={{ fontSize:'14px', lineHeight:1.8, color:'rgba(221,216,206,0.5)' }}>Thank you for reaching out. We read every message and will be in touch shortly.</p>
          <button onClick={()=>{setStatus('idle');setForm({name:'',email:'',subject:'',message:''})}} style={{ marginTop:'32px', padding:'12px 32px', border:'1px solid rgba(255,255,255,0.12)', background:'transparent', borderRadius:'3px', color:'rgba(221,216,206,0.5)', fontSize:'10px', letterSpacing:'0.24em', textTransform:'uppercase', cursor:'pointer', fontFamily:'var(--font-jost)' }}>Send another message</button>
        </div>
      </div>
      <Footer />
    </>
  )

  return (
    <>
      <div style={{ paddingTop:'80px' }}>
        <div style={{ padding:'80px 48px 64px', textAlign:'center', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
          <p style={{ fontSize:'10px', letterSpacing:'0.34em', textTransform:'uppercase', color:'rgba(27,138,143,0.7)', marginBottom:'22px' }}>Get in touch</p>
          <h1 style={{ fontFamily:'var(--font-cormorant)', fontSize:'clamp(38px,5vw,64px)', fontWeight:300, color:'#fff', marginBottom:'16px' }}>Contact Us</h1>
          <p style={{ fontSize:'13.5px', color:'rgba(221,216,206,0.38)', maxWidth:'440px', margin:'0 auto', lineHeight:1.75 }}>Whether you are an investor, a researcher, a rider, or simply curious — we would like to hear from you.</p>
        </div>
        <div style={{ maxWidth:'960px', margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 2fr', gap:'80px', padding:'72px 48px 100px' }}>
          <div>
            {[
              { label:'Email', content:<a href="mailto:hello@sentavita.io" style={{ fontSize:'14px', color:'rgba(221,216,206,0.65)', textDecoration:'none' }}>hello@sentavita.io</a> },
              { label:'Based in', content:<p style={{ fontSize:'14px', color:'rgba(221,216,206,0.5)', lineHeight:1.6 }}>Zurich, Switzerland</p> },
            ].map(item=>(
              <div key={item.label} style={{ marginBottom:'36px' }}>
                <p style={{ fontSize:'9.5px', letterSpacing:'0.26em', textTransform:'uppercase', color:'rgba(27,138,143,0.65)', marginBottom:'12px' }}>{item.label}</p>
                {item.content}
              </div>
            ))}
            <div>
              <p style={{ fontSize:'9.5px', letterSpacing:'0.26em', textTransform:'uppercase', color:'rgba(27,138,143,0.65)', marginBottom:'14px' }}>Good reasons to write</p>
              {['Investment enquiry','Veterinary collaboration','Join the team','Press & media','General curiosity'].map(r=>(
                <p key={r} style={{ fontSize:'13px', color:'rgba(221,216,206,0.38)', marginBottom:'8px', display:'flex', alignItems:'center', gap:'8px' }}>
                  <span style={{ width:'3px', height:'3px', borderRadius:'50%', background:'rgba(27,138,143,0.5)', flexShrink:0, display:'inline-block' }}/>
                  {r}
                </p>
              ))}
            </div>
          </div>
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
              <div><label style={lbl}>Your name *</label><input type="text" required value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Jane Smith" style={inp} onFocus={focus} onBlur={blur}/></div>
              <div><label style={lbl}>Email address *</label><input type="email" required value={form.email} onChange={e=>set('email',e.target.value)} placeholder="jane@example.com" style={inp} onFocus={focus} onBlur={blur}/></div>
            </div>
            <div><label style={lbl}>Subject</label><select value={form.subject} onChange={e=>set('subject',e.target.value)} style={{ ...inp, appearance:'none', cursor:'pointer' }} onFocus={focus} onBlur={blur}><option value="">Select (optional)</option>{SUBJECTS.map(s=><option key={s} value={s} style={{ background:'#08090D' }}>{s}</option>)}</select></div>
            <div>
              <label style={lbl}>Message *</label>
              <textarea required value={form.message} onChange={e=>set('message',e.target.value)} placeholder="Tell us what is on your mind…" rows={7} style={{ ...inp, resize:'vertical', lineHeight:1.75 }} onFocus={focus} onBlur={blur}/>
              <p style={{ marginTop:'6px', fontSize:'10px', color:'rgba(221,216,206,0.2)' }}>{form.message.length} / 5000</p>
            </div>
            {status==='error'&&<div style={{ padding:'12px 16px', background:'rgba(220,50,50,0.07)', border:'1px solid rgba(220,50,50,0.15)', borderRadius:'3px', fontSize:'13px', color:'rgba(220,100,100,0.8)' }}>{errorMsg}</div>}
            <button type="submit" disabled={status==='sending'}
              style={{ alignSelf:'flex-start', display:'flex', alignItems:'center', gap:'10px', padding:'14px 44px', border:'1px solid rgba(232,168,42,0.45)', color:'#E8A82A', fontSize:'10px', letterSpacing:'0.28em', textTransform:'uppercase', fontFamily:'var(--font-jost)', fontWeight:300, background:'transparent', cursor:status==='sending'?'not-allowed':'pointer', opacity:status==='sending'?0.6:1, transition:'all 0.3s', borderRadius:'2px' }}>
              {status==='sending' ? 'Sending…' : 'Send message →'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  )
}
```

## app/api/contact/route.ts
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json()
    if (!name?.trim()||!email?.trim()||!message?.trim()) return NextResponse.json({ error:'Name, email and message are required.' },{ status:400 })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error:'Invalid email address.' },{ status:400 })
    if (message.length>5000) return NextResponse.json({ error:'Message too long.' },{ status:400 })

    const { error: dbErr } = await supabase.from('contact_messages').insert({ name:name.trim(), email:email.trim().toLowerCase(), subject:subject?.trim()||'', message:message.trim() })
    if (dbErr) throw dbErr

    const resendKey = process.env.RESEND_API_KEY
    const contactEmail = process.env.CONTACT_EMAIL
    if (resendKey && contactEmail) {
      await fetch('https://api.resend.com/emails', {
        method:'POST',
        headers:{ Authorization:`Bearer ${resendKey}`, 'Content-Type':'application/json' },
        body: JSON.stringify({
          from:'Sentavita Contact <noreply@sentavita.io>',
          to:[contactEmail],
          subject:`New message from ${name}${subject?` — ${subject}`:''}`,
          html:`<div style="font-family:sans-serif;max-width:560px"><p style="color:#888;font-size:13px">New contact form submission</p><table style="font-size:14px;width:100%"><tr><td style="color:#888;padding:6px 0;width:70px">Name</td><td><strong>${name}</strong></td></tr><tr><td style="color:#888;padding:6px 0">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>${subject?`<tr><td style="color:#888;padding:6px 0">Subject</td><td>${subject}</td></tr>`:''}</table><div style="margin-top:20px;padding:16px;background:#f7f7f7;border-radius:4px;font-size:14px;line-height:1.7;white-space:pre-wrap">${message}</div></div>`,
          reply_to:email,
        }),
      })
    }
    return NextResponse.json({ ok:true })
  } catch (err:any) {
    return NextResponse.json({ error:'Something went wrong.' },{ status:500 })
  }
}
```

## Confirm: PROMPT_1 COMPLETE
