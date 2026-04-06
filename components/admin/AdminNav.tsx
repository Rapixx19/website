'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, FileText, Users, ExternalLink, LogOut, Globe, BookOpen, MessageSquare } from 'lucide-react'

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/content', label: 'Content', icon: FileText },
  { href: '/admin/team', label: 'Team', icon: Users },
  { href: '/admin/articles', label: 'Articles', icon: Globe },
  { href: '/admin/posts', label: 'Posts', icon: BookOpen },
  { href: '/admin/linkedin', label: 'LinkedIn', icon: ExternalLink },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
]

export default function AdminNav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const signOut = async () => { await supabase.auth.signOut(); router.push('/login') }

  const isActive = (href: string) => href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  return (
    <aside style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '220px', background: '#0A0C12', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', padding: '28px 0', zIndex: 100, overflowY: 'auto' }}>
      <div style={{ padding: '0 22px 28px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '17px', letterSpacing: '0.14em', color: '#fff' }}>Sentavita</div>
        <div style={{ fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(221,216,206,0.28)', marginTop: '3px' }}>Admin</div>
      </div>
      <nav style={{ flex: 1, padding: '18px 0' }}>
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 22px', fontSize: '12px', letterSpacing: '0.12em', color: isActive(href) ? '#DDD8CE' : 'rgba(221,216,206,0.38)', textDecoration: 'none', background: isActive(href) ? 'rgba(27,138,143,0.1)' : 'transparent', borderLeft: isActive(href) ? '2px solid #1B8A8F' : '2px solid transparent', transition: 'all 0.2s' }}>
            <Icon size={14} />{label}
          </Link>
        ))}
      </nav>
      <div style={{ padding: '18px 22px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '10px', color: 'rgba(221,216,206,0.3)', marginBottom: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</div>
        <button onClick={signOut} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'rgba(221,216,206,0.3)', fontSize: '11px', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-jost)' }}>
          <LogOut size={12} /> Sign out
        </button>
      </div>
    </aside>
  )
}
