# PROMPT 4 — LinkedIn Publishing
## Run after PROMPT_3.

## How to get your LinkedIn credentials (takes ~10 minutes)
1. Go to linkedin.com/developers/apps → Create app
2. Add product "Share on LinkedIn"
3. Under Auth → OAuth 2.0 scopes — request `w_member_social` and `openid`
4. Generate an access token
5. Get your Person URN: call `https://api.linkedin.com/v2/userinfo` with your token
   — it returns `"sub": "urn:li:person:XXXXXXXX"` — copy the full URN
6. Add both to .env.local:
   LINKEDIN_ACCESS_TOKEN=your_token
   LINKEDIN_PERSON_URN=urn:li:person:XXXXXXXX

---

## lib/linkedin.ts
```typescript
export async function postToLinkedIn(content: string): Promise<{ id: string }> {
  const token = process.env.LINKEDIN_ACCESS_TOKEN
  const personUrn = process.env.LINKEDIN_PERSON_URN
  if (!token || !personUrn) throw new Error('Missing LinkedIn credentials. Add LINKEDIN_ACCESS_TOKEN and LINKEDIN_PERSON_URN to .env.local')

  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author: personUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: content },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`LinkedIn API error ${res.status}: ${err}`)
  }
  const data = await res.json()
  return { id: data.id }
}
```

---

## app/api/linkedin/publish/route.ts
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { postToLinkedIn } from '@/lib/linkedin'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error:'Unauthorised' },{ status:401 })

  const { postId } = await req.json()
  const { data: post } = await supabase.from('linkedin_posts').select('*').eq('id',postId).single()
  if (!post) return NextResponse.json({ error:'Post not found' },{ status:404 })
  if (post.status==='published') return NextResponse.json({ error:'Already published' },{ status:400 })

  try {
    const { id: linkedinPostId } = await postToLinkedIn(post.content)
    await supabase.from('linkedin_posts').update({
      status:'published', linkedin_post_id:linkedinPostId, published_at:new Date().toISOString(),
    }).eq('id',postId)
    return NextResponse.json({ ok:true, linkedinPostId })
  } catch (err:any) {
    await supabase.from('linkedin_posts').update({ status:'failed' }).eq('id',postId)
    return NextResponse.json({ error:err.message },{ status:500 })
  }
}
```

---

## app/admin/linkedin/page.tsx
```typescript
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Plus, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react'

type Post = { id:string; content:string; status:string; published_at:string|null; created_at:string }

const STATUS_ICON: Record<string,React.ReactNode> = {
  draft:     <Clock size={13} color="rgba(232,168,42,0.7)"/>,
  published: <CheckCircle size={13} color="rgba(27,180,100,0.8)"/>,
  failed:    <XCircle size={13} color="rgba(220,80,80,0.7)"/>,
}
const STATUS_COLOUR: Record<string,string> = {
  draft:'rgba(232,168,42,0.6)', published:'rgba(27,180,100,0.7)', failed:'rgba(220,80,80,0.6)',
}

export default function LinkedInPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [draft, setDraft] = useState('')
  const [publishing, setPublishing] = useState<string|null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const MAX = 3000
  const supabase = createClient()

  const load = async () => {
    const { data } = await supabase.from('linkedin_posts').select('*').order('created_at',{ascending:false})
    setPosts(data||[])
  }
  useEffect(()=>{ load() },[])

  const saveDraft = async (): Promise<string|null> => {
    if (!draft.trim()) return null
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('linkedin_posts').insert({ content:draft, status:'draft', created_by:user?.id }).select('id').single()
    setDraft(''); setSaving(false); await load()
    return data?.id||null
  }

  const publish = async (postId: string) => {
    setPublishing(postId)
    const res = await fetch('/api/linkedin/publish',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({postId}) })
    const data = await res.json()
    if (!res.ok) { setMsg(`Error: ${data.error}`); setTimeout(()=>setMsg(''),4000) }
    else { setMsg('✓ Published to LinkedIn'); setTimeout(()=>setMsg(''),3000) }
    setPublishing(null); await load()
  }

  const saveAndPublish = async () => {
    const id = await saveDraft()
    if (id) await publish(id)
  }

  const remove = async (id:string) => {
    if (!confirm('Delete this post?')) return
    await supabase.from('linkedin_posts').delete().eq('id',id); await load()
  }

  const inp: React.CSSProperties = { width:'100%', padding:'13px 16px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'3px', color:'#DDD8CE', fontSize:'14px', fontFamily:'var(--font-jost)', fontWeight:300, outline:'none', resize:'vertical', lineHeight:1.75 }
  const btn = (col='rgba(27,138,143,0.12)',brd='rgba(27,138,143,0.3)',c='#1B8A8F'): React.CSSProperties => ({ display:'flex', alignItems:'center', gap:'7px', padding:'10px 20px', background:col, border:`1px solid ${brd}`, borderRadius:'3px', color:c, fontSize:'10px', letterSpacing:'0.2em', textTransform:'uppercase' as const, cursor:'pointer', fontFamily:'var(--font-jost)' })

  return (
    <div>
      <h1 style={{ fontFamily:'var(--font-cormorant)', fontSize:'34px', fontWeight:300, color:'#fff', marginBottom:'8px' }}>LinkedIn</h1>
      <p style={{ fontSize:'13px', color:'rgba(221,216,206,0.4)', marginBottom:'36px' }}>Write and publish posts directly to your LinkedIn profile.</p>

      <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'4px', padding:'24px', marginBottom:'32px' }}>
        <label style={{ display:'block', fontSize:'10px', letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(221,216,206,0.4)', marginBottom:'14px' }}>New post</label>
        <textarea value={draft} onChange={e=>setDraft(e.target.value)} placeholder={`What would you like to share?\n\nTip: Start with a strong opening line. Use line breaks to improve readability.`} rows={8} maxLength={MAX} style={inp}/>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'12px' }}>
          <span style={{ fontSize:'11px', color:draft.length>MAX*0.9?'rgba(232,168,42,0.7)':'rgba(221,216,206,0.28)' }}>{draft.length} / {MAX}</span>
          <div style={{ display:'flex', gap:'10px' }}>
            <button onClick={saveDraft} disabled={!draft.trim()||saving} style={btn('rgba(255,255,255,0.05)','rgba(255,255,255,0.1)','rgba(221,216,206,0.6)')}><Plus size={12}/>{saving?'Saving…':'Save draft'}</button>
            <button onClick={saveAndPublish} disabled={!draft.trim()||saving} style={btn('rgba(0,119,181,0.12)','rgba(0,119,181,0.3)','rgba(100,180,255,0.8)')}><Send size={12}/>Publish to LinkedIn</button>
          </div>
        </div>
        {msg&&<p style={{ marginTop:'12px', fontSize:'11px', color:'rgba(27,200,143,0.8)' }}>{msg}</p>}
      </div>

      <h2 style={{ fontSize:'11px', letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(221,216,206,0.35)', marginBottom:'16px' }}>Post history</h2>
      <div style={{ display:'flex', flexDirection:'column', gap:'1px', background:'rgba(255,255,255,0.04)' }}>
        {!posts.length&&<div style={{ padding:'32px', textAlign:'center', fontSize:'13px', color:'rgba(221,216,206,0.3)', background:'#08090D' }}>No posts yet.</div>}
        {posts.map(p=>(
          <div key={p.id} style={{ padding:'20px 24px', background:'#08090D', display:'grid', gridTemplateColumns:'1fr auto', gap:'20px', alignItems:'start' }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
                {STATUS_ICON[p.status]||STATUS_ICON.draft}
                <span style={{ fontSize:'9.5px', letterSpacing:'0.2em', textTransform:'uppercase', color:STATUS_COLOUR[p.status]||'rgba(221,216,206,0.35)' }}>{p.status}</span>
                <span style={{ fontSize:'10px', color:'rgba(221,216,206,0.25)' }}>· {new Date(p.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</span>
              </div>
              <p style={{ fontSize:'13.5px', lineHeight:1.7, color:'rgba(221,216,206,0.65)', whiteSpace:'pre-wrap', maxHeight:'100px', overflow:'hidden' }}>{p.content.length>280?p.content.slice(0,280)+'…':p.content}</p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px', alignItems:'flex-end' }}>
              {p.status==='draft'&&<button onClick={()=>publish(p.id)} disabled={publishing===p.id} style={{ ...btn('rgba(0,119,181,0.12)','rgba(0,119,181,0.3)','rgba(100,180,255,0.8)'), whiteSpace:'nowrap' }}><Send size={11}/>{publishing===p.id?'Publishing…':'Publish'}</button>}
              <button onClick={()=>remove(p.id)} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 14px', background:'transparent', border:'1px solid rgba(220,50,50,0.15)', borderRadius:'3px', color:'rgba(220,100,100,0.5)', fontSize:'9.5px', cursor:'pointer', fontFamily:'var(--font-jost)' }}><Trash2 size={11}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Confirm: PROMPT_4 COMPLETE
