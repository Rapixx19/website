# PROMPT 2 — Authentication & Admin Shell
## Run after PROMPT_1.

---

## middleware.ts
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (request.nextUrl.pathname.startsWith('/admin') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return supabaseResponse
}

export const config = { matcher: ['/admin/:path*'] }
```

## app/login/page.tsx
```typescript
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/admin')
  }

  const inp: React.CSSProperties = { width:'100%', padding:'11px 14px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'3px', color:'#DDD8CE', fontSize:'14px', fontFamily:'var(--font-jost)', outline:'none' }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#08090D', padding:'24px' }}>
      <div style={{ width:'100%', maxWidth:'380px' }}>
        <div style={{ textAlign:'center', marginBottom:'40px' }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:'16px' }}>
            {logoError ? (
              <svg width="44" height="44" viewBox="0 0 80 80" fill="none"><path d="M40 10C31 10,20 17,17 29C14 41,20 49,25 55C30 61,30 70,28 78H36C36 69,38 61,40 57C42 61,44 69,44 78H52C50 70,50 61,55 55C60 49,66 41,63 29C60 17,49 10,40 10Z" fill="rgba(255,255,255,0.85)"/><path d="M33 14C26 11,18 7,14 1C16 9,14 17,13 24" stroke="rgba(255,255,255,0.35)" strokeWidth="1.8" fill="none" strokeLinecap="round"/><circle cx="30" cy="23" r="3" fill="#08090D"/></svg>
            ) : (
              <Image src="/logo.png" alt="Sentavita" width={44} height={44} style={{ objectFit:'contain' }} onError={() => setLogoError(true)} />
            )}
          </div>
          <div style={{ fontFamily:'var(--font-cormorant)', fontSize:'24px', letterSpacing:'0.14em', color:'#fff', marginBottom:'6px' }}>Sentavita</div>
          <div style={{ fontSize:'10px', letterSpacing:'0.28em', textTransform:'uppercase', color:'rgba(221,216,206,0.35)' }}>Team Access</div>
        </div>
        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'4px', padding:'36px 32px' }}>
          <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div>
              <label style={{ display:'block', fontSize:'9.5px', letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(221,216,206,0.4)', marginBottom:'8px' }}>Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required style={inp} placeholder="you@sentavita.io" />
            </div>
            <div>
              <label style={{ display:'block', fontSize:'9.5px', letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(221,216,206,0.4)', marginBottom:'8px' }}>Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required style={inp} placeholder="••••••••" />
            </div>
            {error && <p style={{ fontSize:'12px', color:'rgba(232,100,100,0.8)', padding:'8px 12px', background:'rgba(232,100,100,0.07)', borderRadius:'3px' }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ marginTop:'8px', padding:'13px', background:loading?'rgba(27,138,143,0.3)':'rgba(27,138,143,0.15)', border:'1px solid rgba(27,138,143,0.4)', borderRadius:'3px', color:'#1B8A8F', fontSize:'10px', letterSpacing:'0.26em', textTransform:'uppercase', fontFamily:'var(--font-jost)', cursor:loading?'not-allowed':'pointer' }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
```

## app/admin/layout.tsx
```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/admin/AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return (
    <div style={{ minHeight:'100vh', background:'#08090D', display:'flex' }}>
      <AdminNav userEmail={user.email || ''} />
      <main style={{ flex:1, marginLeft:'220px', padding:'40px', maxWidth:'calc(100vw - 220px)' }}>
        {children}
      </main>
    </div>
  )
}
```

## components/admin/AdminNav.tsx
```typescript
'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, FileText, Users, Linkedin, BarChart2, LogOut, Globe, BookOpen, MessageSquare } from 'lucide-react'

const links = [
  { href:'/admin',            label:'Dashboard',  icon:LayoutDashboard },
  { href:'/admin/content',    label:'Content',    icon:FileText },
  { href:'/admin/team',       label:'Team',       icon:Users },
  { href:'/admin/articles',   label:'Articles',   icon:Globe },
  { href:'/admin/posts',      label:'Posts',      icon:BookOpen },
  { href:'/admin/linkedin',   label:'LinkedIn',   icon:Linkedin },
  { href:'/admin/analytics',  label:'Analytics',  icon:BarChart2 },
  { href:'/admin/messages',   label:'Messages',   icon:MessageSquare },
]

export default function AdminNav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const signOut = async () => { await supabase.auth.signOut(); router.push('/login') }

  const isActive = (href: string) => href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  return (
    <aside style={{ position:'fixed', top:0, left:0, bottom:0, width:'220px', background:'#0A0C12', borderRight:'1px solid rgba(255,255,255,0.05)', display:'flex', flexDirection:'column', padding:'28px 0', zIndex:100, overflowY:'auto' }}>
      <div style={{ padding:'0 22px 28px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontFamily:'var(--font-cormorant)', fontSize:'17px', letterSpacing:'0.14em', color:'#fff' }}>Sentavita</div>
        <div style={{ fontSize:'9px', letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(221,216,206,0.28)', marginTop:'3px' }}>Admin</div>
      </div>
      <nav style={{ flex:1, padding:'18px 0' }}>
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 22px', fontSize:'12px', letterSpacing:'0.12em', color:isActive(href)?'#DDD8CE':'rgba(221,216,206,0.38)', textDecoration:'none', background:isActive(href)?'rgba(27,138,143,0.1)':'transparent', borderLeft:isActive(href)?'2px solid #1B8A8F':'2px solid transparent', transition:'all 0.2s' }}>
            <Icon size={14} />{label}
          </Link>
        ))}
      </nav>
      <div style={{ padding:'18px 22px', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize:'10px', color:'rgba(221,216,206,0.3)', marginBottom:'12px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{userEmail}</div>
        <button onClick={signOut} style={{ display:'flex', alignItems:'center', gap:'8px', background:'none', border:'none', color:'rgba(221,216,206,0.3)', fontSize:'11px', cursor:'pointer', padding:0, fontFamily:'var(--font-jost)' }}>
          <LogOut size={12} /> Sign out
        </button>
      </div>
    </aside>
  )
}
```

## Confirm: PROMPT_2 COMPLETE
