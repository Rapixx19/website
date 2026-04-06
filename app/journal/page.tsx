import { createClient } from '@/lib/supabase/server'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Image from 'next/image'

const TYPE_COLOUR: Record<string, string> = {
  article: 'rgba(27,138,143,0.6)', research: 'rgba(232,168,42,0.6)', update: 'rgba(221,216,206,0.4)',
}

export default async function JournalPage() {
  const supabase = await createClient()
  const { data: posts } = await supabase.from('posts').select('*, post_media(url,media_type,display_order)').eq('visible', true).lte('published_at', new Date().toISOString()).order('published_at', { ascending: false })

  return (
    <>
      <div style={{ paddingTop: '80px' }}>
        <div style={{ padding: '80px 48px 56px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)' }} className="page-padding">
          <p style={{ fontSize: '10px', letterSpacing: '0.34em', textTransform: 'uppercase', color: 'rgba(27,138,143,0.7)', marginBottom: '22px' }}>Journal</p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(38px,5vw,64px)', fontWeight: 300, color: '#fff', marginBottom: '14px' }}>From Sentavita</h1>
          <p style={{ fontSize: '13px', color: 'rgba(221,216,206,0.38)', maxWidth: '400px', margin: '0 auto', lineHeight: 1.7 }}>Research, updates, and writing from the team.</p>
        </div>
        {!posts?.length && <div style={{ padding: '80px', textAlign: 'center', fontSize: '14px', color: 'rgba(221,216,206,0.3)' }}>No posts yet. Check back soon.</div>}
        <div style={{ maxWidth: '820px', margin: '0 auto', padding: '60px 24px' }}>
          {posts?.map(post => {
            const cover = post.cover_url || post.post_media?.find((m: any) => m.media_type === 'image')?.url
            return (
              <Link key={post.id} href={`/journal/${post.slug}`} style={{ display: 'block', marginBottom: '64px', textDecoration: 'none' }}>
                {cover && <div style={{ position: 'relative', width: '100%', height: '260px', overflow: 'hidden', borderRadius: '3px', marginBottom: '24px', background: '#0D1018' }}><Image src={cover} alt={post.title} fill style={{ objectFit: 'cover', opacity: 0.85 }} /></div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '9.5px', letterSpacing: '0.24em', textTransform: 'uppercase', color: TYPE_COLOUR[post.post_type] || 'rgba(221,216,206,0.4)' }}>{post.post_type}</span>
                  {post.published_at && <><span style={{ width: '2px', height: '2px', borderRadius: '50%', background: 'rgba(221,216,206,0.2)', display: 'inline-block' }} /><span style={{ fontSize: '9.5px', color: 'rgba(221,216,206,0.3)' }}>{new Date(post.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span></>}
                </div>
                <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(24px,3vw,34px)', fontWeight: 300, color: '#fff', lineHeight: 1.25, marginBottom: '12px' }}>{post.title}</h2>
                {post.excerpt && <p style={{ fontSize: '14px', lineHeight: 1.78, color: 'rgba(221,216,206,0.45)', marginBottom: '16px' }}>{post.excerpt}</p>}
                {post.tags?.length > 0 && <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{post.tags.map((tag: string) => <span key={tag} style={{ padding: '3px 10px', background: 'rgba(27,138,143,0.07)', border: '1px solid rgba(27,138,143,0.15)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(27,138,143,0.6)', borderRadius: '2px' }}>{tag}</span>)}</div>}
                <div style={{ marginTop: '18px', fontSize: '10.5px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(27,138,143,0.55)' }}>Read more →</div>
                <div style={{ marginTop: '40px', height: '1px', background: 'rgba(255,255,255,0.05)' }} />
              </Link>
            )
          })}
        </div>
      </div>
      <Footer />
    </>
  )
}
