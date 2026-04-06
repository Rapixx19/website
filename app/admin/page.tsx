import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, Globe, BookOpen, ExternalLink, MessageSquare, FileText } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const [team, articles, posts, linkedin, unread] = await Promise.all([
    supabase.from('team_members').select('id', { count: 'exact', head: true }),
    supabase.from('articles').select('id', { count: 'exact', head: true }).eq('visible', true),
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('visible', true),
    supabase.from('linkedin_posts').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('status', 'unread'),
  ])

  const stats = [
    { label: 'Team members', value: team.count || 0, sub: 'Visible', icon: Users, color: '#1B8A8F', href: '/admin/team' },
    { label: 'Articles', value: articles.count || 0, sub: 'Published', icon: Globe, color: '#1B8A8F', href: '/admin/articles' },
    { label: 'Journal posts', value: posts.count || 0, sub: 'Published', icon: BookOpen, color: '#1B8A8F', href: '/admin/posts' },
    { label: 'LinkedIn posts', value: linkedin.count || 0, sub: 'Published', icon: ExternalLink, color: '#0077B5', href: '/admin/linkedin' },
    { label: 'Unread messages', value: unread.count || 0, sub: 'Contact form', icon: MessageSquare, color: '#E8A82A', href: '/admin/messages' },
  ]

  const card: React.CSSProperties = { padding: '22px 24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', textDecoration: 'none', display: 'block', transition: 'border-color 0.25s' }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '34px', fontWeight: 300, color: '#fff', marginBottom: '8px' }}>Dashboard</h1>
      <p style={{ fontSize: '13px', color: 'rgba(221,216,206,0.4)', marginBottom: '36px' }}>Welcome back. Here is a snapshot of Sentavita.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '12px', marginBottom: '36px' }}>
        {stats.map(s => (
          <Link key={s.label} href={s.href} style={card}>
            <s.icon size={15} color={s.color} style={{ marginBottom: '12px' }} />
            <div style={{ fontSize: '28px', fontWeight: 300, color: '#fff', marginBottom: '3px' }}>{s.value.toLocaleString()}</div>
            <div style={{ fontSize: '12px', color: 'rgba(221,216,206,0.5)', marginBottom: '2px' }}>{s.label}</div>
            <div style={{ fontSize: '10px', color: 'rgba(221,216,206,0.25)' }}>{s.sub}</div>
          </Link>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {[
          { href: '/admin/content', label: 'Edit website text', desc: 'Update all copy on the public site' },
          { href: '/admin/team', label: 'Manage team', desc: 'Add, edit, or reorder team members' },
          { href: '/admin/articles', label: 'Manage articles', desc: 'LinkedIn articles and publication links' },
          { href: '/admin/posts', label: 'Write journal posts', desc: 'Articles, research, and updates with media' },
          { href: '/admin/linkedin', label: 'Post to LinkedIn', desc: 'Draft and publish to your LinkedIn profile' },
          { href: '/admin/messages', label: 'View messages', desc: 'Read and reply to contact form submissions' },
        ].map(q => (
          <Link key={q.href} href={q.href} style={{ padding: '18px 22px', background: 'rgba(27,138,143,0.05)', border: '1px solid rgba(27,138,143,0.12)', borderRadius: '4px', textDecoration: 'none', display: 'block' }}>
            <div style={{ fontSize: '13px', color: '#DDD8CE', marginBottom: '4px' }}>{q.label} →</div>
            <div style={{ fontSize: '11px', color: 'rgba(221,216,206,0.38)' }}>{q.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
