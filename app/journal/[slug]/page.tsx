import { createClient } from '@/lib/supabase/server'
import Footer from '@/components/Footer'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { FileText } from 'lucide-react'

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: post } = await supabase.from('posts').select('*, post_media(*)').eq('slug', slug).eq('visible', true).single()
  if (!post) notFound()

  const images = post.post_media?.filter((m: any) => m.media_type === 'image').sort((a: any, b: any) => a.display_order - b.display_order)
  const videos = post.post_media?.filter((m: any) => m.media_type === 'video').sort((a: any, b: any) => a.display_order - b.display_order)
  const pdfs = post.post_media?.filter((m: any) => m.media_type === 'pdf').sort((a: any, b: any) => a.display_order - b.display_order)

  return (
    <>
      <div style={{ paddingTop: '80px' }}>
        {post.cover_url && <div style={{ position: 'relative', width: '100%', height: '420px', overflow: 'hidden', background: '#0D1018' }}><Image src={post.cover_url} alt={post.title} fill style={{ objectFit: 'cover', opacity: 0.7 }} /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 40%,#08090D 100%)' }} /></div>}
        <article style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 100px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '18px' }}>
            <span style={{ fontSize: '9.5px', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(27,138,143,0.65)' }}>{post.post_type}</span>
            {post.published_at && <><span style={{ width: '2px', height: '2px', borderRadius: '50%', background: 'rgba(221,216,206,0.2)', display: 'inline-block' }} /><span style={{ fontSize: '9.5px', color: 'rgba(221,216,206,0.3)' }}>{new Date(post.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span></>}
          </div>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(32px,4vw,52px)', fontWeight: 300, color: '#fff', lineHeight: 1.2, marginBottom: '28px' }}>{post.title}</h1>
          {post.tags?.length > 0 && <div style={{ display: 'flex', gap: '8px', marginBottom: '36px', flexWrap: 'wrap' }}>{post.tags.map((tag: string) => <span key={tag} style={{ padding: '3px 10px', background: 'rgba(27,138,143,0.07)', border: '1px solid rgba(27,138,143,0.15)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(27,138,143,0.6)', borderRadius: '2px' }}>{tag}</span>)}</div>}
          <div style={{ fontSize: '15px', lineHeight: 1.88, color: 'rgba(221,216,206,0.72)' }}>{post.body.split('\n\n').map((para: string, i: number) => <p key={i} style={{ marginBottom: '20px' }}>{para}</p>)}</div>
          {images?.length > 0 && <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>{images.map((img: any) => <figure key={img.id} style={{ margin: 0 }}><div style={{ position: 'relative', width: '100%', borderRadius: '3px', overflow: 'hidden', background: '#0D1018' }}><Image src={img.url} alt={img.caption || ''} width={720} height={420} style={{ width: '100%', height: 'auto', display: 'block' }} /></div>{img.caption && <figcaption style={{ marginTop: '8px', fontSize: '11px', color: 'rgba(221,216,206,0.3)' }}>{img.caption}</figcaption>}</figure>)}</div>}
          {videos?.length > 0 && <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>{videos.map((vid: any) => <figure key={vid.id} style={{ margin: 0 }}><video controls style={{ width: '100%', borderRadius: '3px', background: '#000', display: 'block' }}><source src={vid.url} type="video/mp4" /></video>{vid.caption && <figcaption style={{ marginTop: '8px', fontSize: '11px', color: 'rgba(221,216,206,0.3)' }}>{vid.caption}</figcaption>}</figure>)}</div>}
          {pdfs?.length > 0 && <div style={{ marginTop: '40px' }}><p style={{ fontSize: '10px', letterSpacing: '0.26em', textTransform: 'uppercase', color: 'rgba(221,216,206,0.35)', marginBottom: '14px' }}>Attachments</p><div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>{pdfs.map((pdf: any) => <a key={pdf.id} href={pdf.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '3px', textDecoration: 'none' }}><FileText size={16} color="rgba(232,168,42,0.7)" /><span style={{ flex: 1, fontSize: '13px', color: 'rgba(221,216,206,0.65)' }}>{pdf.caption || pdf.filename}</span><span style={{ fontSize: '9.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(221,216,206,0.3)' }}>PDF ↗</span></a>)}</div></div>}
        </article>
      </div>
      <Footer />
    </>
  )
}
