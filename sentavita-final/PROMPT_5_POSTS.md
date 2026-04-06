# PROMPT 5 — Journal Posts with Media (Images · Videos · PDFs)
## Run after PROMPT_4.

---

## components/admin/PostEditor.tsx
```typescript
'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Upload, X, FileText, Image as ImageIcon, Film, Send, Eye, Save } from 'lucide-react'

type MediaItem = { id?:string; url:string; media_type:'image'|'video'|'pdf'; filename:string; file_size:number; caption:string; display_order:number }
type PostData = { id?:string; title:string; slug:string; body:string; excerpt:string; cover_url:string; post_type:'article'|'research'|'update'; tags:string[]; visible:boolean; media:MediaItem[] }

const slugify = (t:string) => t.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').trim()

export default function PostEditor({ initial }: { initial?: Partial<PostData> & { id?:string } }) {
  const router = useRouter()
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [post, setPost] = useState<PostData>({
    title:'', slug:'', body:'', excerpt:'', cover_url:'',
    post_type:'article', tags:[], visible:false, media:[],
    ...initial,
  })
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [publishingLI, setPublishingLI] = useState(false)
  const [msg, setMsg] = useState('')

  const set = (f:keyof PostData, v:any) => setPost(p=>({...p,[f]:v}))

  const handleTitleChange = (v:string) => {
    set('title',v)
    if (!initial?.id) set('slug',slugify(v))
  }

  const handleFiles = async (files:FileList|null) => {
    if (!files?.length) return
    setUploading(true)
    for (const file of Array.from(files)) {
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')
      const isPDF   = file.type==='application/pdf'
      if (!isImage&&!isVideo&&!isPDF) { alert(`${file.name}: unsupported type`); continue }
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('post-media').upload(path,file)
      if (error) { alert(`Upload failed: ${error.message}`); continue }
      const { data:{ publicUrl } } = supabase.storage.from('post-media').getPublicUrl(path)
      const media_type = isImage?'image':isVideo?'video':'pdf'
      setPost(p=>({...p,
        cover_url: isImage&&!p.cover_url?publicUrl:p.cover_url,
        media:[...p.media,{ url:publicUrl, media_type, filename:file.name, file_size:file.size, caption:'', display_order:p.media.length }]
      }))
    }
    setUploading(false)
  }

  const save = async (publish=false) => {
    if (!post.title.trim()) { alert('Title required'); return }
    setSaving(true)
    const payload = { title:post.title, slug:post.slug||slugify(post.title), body:post.body, excerpt:post.excerpt, cover_url:post.cover_url, post_type:post.post_type, tags:post.tags, visible:publish?true:post.visible, published_at:publish?new Date().toISOString():undefined, updated_at:new Date().toISOString() }
    let pid = initial?.id
    if (pid) {
      await supabase.from('posts').update(payload).eq('id',pid)
    } else {
      const { data:{ user } } = await supabase.auth.getUser()
      const { data } = await supabase.from('posts').insert({...payload,created_by:user?.id}).select('id').single()
      pid = data?.id
    }
    if (pid) {
      const newMedia = post.media.filter(m=>!m.id)
      if (newMedia.length) await supabase.from('post_media').insert(newMedia.map((m,i)=>({post_id:pid,...m,display_order:(initial?.media?.length||0)+i})))
      for (const m of post.media.filter(m=>m.id)) await supabase.from('post_media').update({caption:m.caption}).eq('id',m.id)
    }
    setMsg(publish?'✓ Published':'✓ Saved'); setTimeout(()=>setMsg(''),2500)
    if (!initial?.id&&pid) router.push(`/admin/posts/${pid}`)
    setSaving(false)
  }

  const crossPostLinkedIn = async () => {
    if (!initial?.id) { alert('Save the post first'); return }
    const text = `${post.title}\n\n${post.excerpt||post.body.slice(0,200)}\n\nRead more: ${process.env.NEXT_PUBLIC_SITE_URL||'https://sentavita.io'}/journal/${post.slug}`
    setPublishingLI(true)
    try {
      const { data:{ user } } = await supabase.auth.getUser()
      const { data:draft } = await supabase.from('linkedin_posts').insert({ content:text, status:'draft', created_by:user?.id }).select('id').single()
      if (draft?.id) {
        const res = await fetch('/api/linkedin/publish',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({postId:draft.id}) })
        setMsg(res.ok?'✓ Also posted to LinkedIn':'⚠ Saved but LinkedIn failed')
        setTimeout(()=>setMsg(''),3500)
      }
    } catch { setMsg('⚠ LinkedIn failed') }
    setPublishingLI(false)
  }

  const inp: React.CSSProperties = { width:'100%', padding:'10px 13px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'3px', color:'#DDD8CE', fontSize:'14px', fontFamily:'var(--font-jost)', outline:'none' }
  const lbl: React.CSSProperties = { display:'block', fontSize:'9px', letterSpacing:'0.22em', textTransform:'uppercase' as const, color:'rgba(221,216,206,0.38)', marginBottom:'8px' }

  const MEDIA_ICON: Record<string,React.ReactNode> = { image:<ImageIcon size={14}/>, video:<Film size={14}/>, pdf:<FileText size={14} color="rgba(232,168,42,0.7)"/> }

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:'24px', alignItems:'start' }}>

      {/* LEFT — content */}
      <div style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
        <div><label style={lbl}>Title *</label><input value={post.title} onChange={e=>handleTitleChange(e.target.value)} placeholder="Post title" style={{ ...inp, fontSize:'18px', fontFamily:'var(--font-cormorant)', fontWeight:300 }}/></div>
        <div><label style={lbl}>URL slug — sentavita.io/journal/<strong style={{ color:'rgba(221,216,206,0.6)' }}>{post.slug||'…'}</strong></label><input value={post.slug} onChange={e=>set('slug',e.target.value)} style={inp}/></div>
        <div><label style={lbl}>Excerpt (shown in feed)</label><textarea value={post.excerpt} onChange={e=>set('excerpt',e.target.value)} rows={2} placeholder="One or two sentences…" style={{ ...inp, resize:'vertical', lineHeight:1.6 }}/></div>
        <div>
          <label style={lbl}>Body text</label>
          <textarea value={post.body} onChange={e=>set('body',e.target.value)} rows={16} placeholder={`Write your post…\n\nTwo blank lines create a new paragraph.`} style={{ ...inp, resize:'vertical', lineHeight:1.78 }}/>
        </div>

        {/* Media upload */}
        <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'4px', padding:'20px' }}>
          <label style={lbl}>Media — images, videos, PDFs</label>
          <div onClick={()=>fileRef.current?.click()} onDragOver={e=>{e.preventDefault();(e.currentTarget as HTMLElement).style.borderColor='rgba(27,138,143,0.5)'}} onDragLeave={e=>(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.1)'} onDrop={e=>{e.preventDefault();handleFiles(e.dataTransfer.files);(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.1)'}}
            style={{ border:'1px dashed rgba(255,255,255,0.1)', borderRadius:'3px', padding:'28px', textAlign:'center', cursor:'pointer', transition:'border-color 0.25s', marginBottom:'14px' }}>
            <Upload size={18} color="rgba(221,216,206,0.25)" style={{ margin:'0 auto 10px' }}/>
            <p style={{ fontSize:'12px', color:'rgba(221,216,206,0.35)' }}>{uploading?'Uploading…':'Click or drag files here'}</p>
            <p style={{ fontSize:'10px', color:'rgba(221,216,206,0.2)', marginTop:'4px' }}>JPG · PNG · WebP · MP4 · PDF — max 50MB each</p>
          </div>
          <input ref={fileRef} type="file" multiple accept="image/*,video/mp4,application/pdf" style={{ display:'none' }} onChange={e=>handleFiles(e.target.files)}/>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {post.media.map((m,i)=>(
              <div key={i} style={{ display:'grid', gridTemplateColumns:'auto 1fr auto', gap:'10px', alignItems:'start', padding:'10px 12px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'3px' }}>
                <span style={{ color:'rgba(221,216,206,0.5)', marginTop:'2px' }}>{MEDIA_ICON[m.media_type]}</span>
                <div>
                  <p style={{ fontSize:'12px', color:'rgba(221,216,206,0.6)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.filename}</p>
                  <input value={m.caption} onChange={e=>setPost(p=>({...p,media:p.media.map((item,j)=>j===i?{...item,caption:e.target.value}:item)}))} placeholder="Caption (optional)" style={{ ...inp, padding:'5px 8px', fontSize:'11px', marginTop:'5px' }}/>
                  {m.media_type==='image'&&<button onClick={()=>set('cover_url',m.url)} style={{ marginTop:'5px', fontSize:'9px', letterSpacing:'0.14em', background:'none', border:'none', color:post.cover_url===m.url?'rgba(232,168,42,0.8)':'rgba(221,216,206,0.25)', cursor:'pointer', padding:0, fontFamily:'var(--font-jost)' }}>{post.cover_url===m.url?'★ Cover image':'☆ Set as cover'}</button>}
                </div>
                <button onClick={()=>setPost(p=>({...p,media:p.media.filter((_,j)=>j!==i)}))} style={{ background:'none', border:'none', color:'rgba(221,216,206,0.25)', cursor:'pointer', padding:'2px' }}><X size={13}/></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — settings */}
      <div style={{ display:'flex', flexDirection:'column', gap:'14px', position:'sticky', top:'24px' }}>

        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'4px', padding:'18px' }}>
          <label style={lbl}>Publish</label>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            <button onClick={()=>save(false)} disabled={saving} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'7px', padding:'10px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'3px', color:'rgba(221,216,206,0.6)', fontSize:'10px', letterSpacing:'0.2em', textTransform:'uppercase', cursor:'pointer', fontFamily:'var(--font-jost)' }}><Save size={12}/>{saving?'Saving…':'Save draft'}</button>
            <button onClick={()=>save(true)} disabled={saving} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'7px', padding:'10px', background:'rgba(27,138,143,0.12)', border:'1px solid rgba(27,138,143,0.35)', borderRadius:'3px', color:'#1B8A8F', fontSize:'10px', letterSpacing:'0.2em', textTransform:'uppercase', cursor:'pointer', fontFamily:'var(--font-jost)' }}><Eye size={12}/>Publish to site</button>
            {initial?.id&&<a href={`/journal/${post.slug}`} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'7px', padding:'10px', background:'transparent', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'3px', color:'rgba(221,216,206,0.4)', fontSize:'10px', letterSpacing:'0.2em', textTransform:'uppercase', textDecoration:'none' }}>Preview ↗</a>}
          </div>
          <div style={{ marginTop:'12px', paddingTop:'12px', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
            <button onClick={crossPostLinkedIn} disabled={publishingLI||!initial?.id} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'7px', padding:'10px', width:'100%', background:'rgba(0,119,181,0.08)', border:'1px solid rgba(0,119,181,0.2)', borderRadius:'3px', color:'rgba(100,180,255,0.7)', fontSize:'10px', letterSpacing:'0.2em', textTransform:'uppercase', cursor:!initial?.id?'not-allowed':'pointer', fontFamily:'var(--font-jost)' }}>
              <Send size={12}/>{publishingLI?'Posting…':'Also post to LinkedIn'}
            </button>
            {!initial?.id&&<p style={{ fontSize:'9px', color:'rgba(221,216,206,0.2)', marginTop:'6px', textAlign:'center' }}>Save first, then post to LinkedIn</p>}
          </div>
          {msg&&<p style={{ marginTop:'10px', fontSize:'11px', color:'rgba(27,200,143,0.8)', textAlign:'center' }}>{msg}</p>}
        </div>

        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'4px', padding:'18px' }}>
          <label style={lbl}>Post type</label>
          {(['article','research','update'] as const).map(t=>(
            <label key={t} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'5px 0', cursor:'pointer', fontSize:'13px', color:post.post_type===t?'#DDD8CE':'rgba(221,216,206,0.4)' }}>
              <input type="radio" name="type" value={t} checked={post.post_type===t} onChange={()=>set('post_type',t)}/> <span style={{ textTransform:'capitalize' }}>{t}</span>
            </label>
          ))}
        </div>

        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'4px', padding:'18px' }}>
          <label style={lbl}>Tags</label>
          <div style={{ display:'flex', gap:'5px', flexWrap:'wrap', marginBottom:'10px' }}>
            {post.tags.map(tag=>(
              <span key={tag} style={{ display:'flex', alignItems:'center', gap:'4px', padding:'3px 8px', background:'rgba(27,138,143,0.1)', border:'1px solid rgba(27,138,143,0.2)', borderRadius:'2px', fontSize:'10px', color:'rgba(27,138,143,0.7)' }}>
                {tag}<button onClick={()=>set('tags',post.tags.filter(t=>t!==tag))} style={{ background:'none', border:'none', color:'rgba(27,138,143,0.5)', cursor:'pointer', padding:0, lineHeight:1 }}>×</button>
              </span>
            ))}
          </div>
          <input value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={e=>{if((e.key==='Enter'||e.key===',')&&tagInput.trim()&&!post.tags.includes(tagInput.trim())){e.preventDefault();set('tags',[...post.tags,tagInput.trim()]);setTagInput('')}}} placeholder="Add tag, press Enter" style={{ ...inp, fontSize:'12px', padding:'7px 10px' }}/>
          <p style={{ fontSize:'9.5px', color:'rgba(221,216,206,0.2)', marginTop:'5px' }}>Press Enter to add</p>
        </div>
      </div>
    </div>
  )
}
```

---

## app/admin/posts/page.tsx
```typescript
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Eye, EyeOff } from 'lucide-react'

export default async function PostsAdminPage() {
  const supabase = await createClient()
  const { data: posts } = await supabase.from('posts').select('id,title,post_type,visible,published_at,created_at').order('created_at',{ascending:false})
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'32px' }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-cormorant)', fontSize:'34px', fontWeight:300, color:'#fff', marginBottom:'4px' }}>Journal Posts</h1>
          <p style={{ fontSize:'13px', color:'rgba(221,216,206,0.4)' }}>Articles, research, and updates at sentavita.io/journal</p>
        </div>
        <Link href="/admin/posts/new" style={{ display:'flex', alignItems:'center', gap:'7px', padding:'10px 20px', background:'rgba(27,138,143,0.12)', border:'1px solid rgba(27,138,143,0.3)', borderRadius:'3px', color:'#1B8A8F', fontSize:'10px', letterSpacing:'0.22em', textTransform:'uppercase', textDecoration:'none', fontFamily:'var(--font-jost)' }}>
          <Plus size={13}/> New post
        </Link>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'1px', background:'rgba(255,255,255,0.04)' }}>
        {!posts?.length&&<div style={{ padding:'48px', textAlign:'center', fontSize:'13px', color:'rgba(221,216,206,0.3)', background:'#08090D' }}>No posts yet.</div>}
        {posts?.map(p=>(
          <div key={p.id} style={{ display:'flex', alignItems:'center', gap:'20px', padding:'16px 20px', background:'#08090D' }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'14px', color:p.visible?'#DDD8CE':'rgba(221,216,206,0.4)', marginBottom:'3px' }}>{p.title}</div>
              <div style={{ fontSize:'10px', color:'rgba(221,216,206,0.28)', display:'flex', gap:'12px' }}>
                <span style={{ textTransform:'uppercase', letterSpacing:'0.16em' }}>{p.post_type}</span>
                {p.published_at&&<span>{new Date(p.published_at).toLocaleDateString('en-GB')}</span>}
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'9.5px', letterSpacing:'0.14em', textTransform:'uppercase', color:p.visible?'rgba(27,180,100,0.7)':'rgba(221,216,206,0.28)' }}>
              {p.visible?<Eye size={12}/>:<EyeOff size={12}/>}
              <span style={{ marginLeft:'4px' }}>{p.visible?'Live':'Draft'}</span>
            </div>
            <Link href={`/admin/posts/${p.id}`} style={{ padding:'7px 14px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'3px', color:'rgba(221,216,206,0.55)', fontSize:'10px', letterSpacing:'0.16em', textTransform:'uppercase', textDecoration:'none', fontFamily:'var(--font-jost)' }}>Edit</Link>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## app/admin/posts/new/page.tsx
```typescript
import PostEditor from '@/components/admin/PostEditor'
export default function NewPostPage() {
  return (
    <div>
      <h1 style={{ fontFamily:'var(--font-cormorant)', fontSize:'34px', fontWeight:300, color:'#fff', marginBottom:'32px' }}>New Post</h1>
      <PostEditor />
    </div>
  )
}
```

---

## app/admin/posts/[id]/page.tsx
```typescript
import { createClient } from '@/lib/supabase/server'
import PostEditor from '@/components/admin/PostEditor'
import { notFound } from 'next/navigation'

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: post } = await supabase.from('posts').select('*, post_media(*)').eq('id',params.id).single()
  if (!post) notFound()
  return (
    <div>
      <h1 style={{ fontFamily:'var(--font-cormorant)', fontSize:'34px', fontWeight:300, color:'#fff', marginBottom:'32px' }}>Edit Post</h1>
      <PostEditor initial={{ ...post, id:post.id, media:post.post_media||[] }} />
    </div>
  )
}
```

## Confirm: PROMPT_5 COMPLETE
