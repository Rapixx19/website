# PROMPT 3 — Admin Dashboard, Content, Team, Articles, Analytics, Messages
## Run after PROMPT_2.

---

## app/admin/page.tsx — Dashboard
```typescript
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Eye, Users, Globe, BookOpen, Linkedin, MessageSquare, BarChart2, FileText } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const weekAgo = new Date(Date.now()-7*24*60*60*1000).toISOString()
  const [total, week, team, articles, posts, linkedin, unread] = await Promise.all([
    supabase.from('page_views').select('id',{count:'exact',head:true}),
    supabase.from('page_views').select('id',{count:'exact',head:true}).gte('viewed_at',weekAgo),
    supabase.from('team_members').select('id',{count:'exact',head:true}),
    supabase.from('articles').select('id',{count:'exact',head:true}).eq('visible',true),
    supabase.from('posts').select('id',{count:'exact',head:true}).eq('visible',true),
    supabase.from('linkedin_posts').select('id',{count:'exact',head:true}).eq('status','published'),
    supabase.from('contact_messages').select('id',{count:'exact',head:true}).eq('status','unread'),
  ])

  const stats = [
    { label:'Total views', value:total.count||0, sub:'All time', icon:Eye, color:'#1B8A8F', href:'/admin/analytics' },
    { label:'Views this week', value:week.count||0, sub:'Last 7 days', icon:BarChart2, color:'#E8A82A', href:'/admin/analytics' },
    { label:'Team members', value:team.count||0, sub:'Visible', icon:Users, color:'#1B8A8F', href:'/admin/team' },
    { label:'Articles', value:articles.count||0, sub:'Published', icon:Globe, color:'#1B8A8F', href:'/admin/articles' },
    { label:'Journal posts', value:posts.count||0, sub:'Published', icon:BookOpen, color:'#1B8A8F', href:'/admin/posts' },
    { label:'LinkedIn posts', value:linkedin.count||0, sub:'Published', icon:Linkedin, color:'#0077B5', href:'/admin/linkedin' },
    { label:'Unread messages', value:unread.count||0, sub:'Contact form', icon:MessageSquare, color:'#E8A82A', href:'/admin/messages' },
  ]

  const card: React.CSSProperties = { padding:'22px 24px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'4px', textDecoration:'none', display:'block', transition:'border-color 0.25s' }

  return (
    <div>
      <h1 style={{ fontFamily:'var(--font-cormorant)', fontSize:'34px', fontWeight:300, color:'#fff', marginBottom:'8px' }}>Dashboard</h1>
      <p style={{ fontSize:'13px', color:'rgba(221,216,206,0.4)', marginBottom:'36px' }}>Welcome back. Here is a snapshot of Sentavita.</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:'12px', marginBottom:'36px' }}>
        {stats.map(s=>(
          <Link key={s.label} href={s.href} style={card}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor='rgba(27,138,143,0.3)'}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.06)'}>
            <s.icon size={15} color={s.color} style={{ marginBottom:'12px' }}/>
            <div style={{ fontSize:'28px', fontWeight:300, color:'#fff', marginBottom:'3px' }}>{s.value.toLocaleString()}</div>
            <div style={{ fontSize:'12px', color:'rgba(221,216,206,0.5)', marginBottom:'2px' }}>{s.label}</div>
            <div style={{ fontSize:'10px', color:'rgba(221,216,206,0.25)' }}>{s.sub}</div>
          </Link>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
        {[
          { href:'/admin/content',  label:'Edit website text',    desc:'Update all copy on the public site' },
          { href:'/admin/team',     label:'Manage team',          desc:'Add, edit, or reorder team members' },
          { href:'/admin/articles', label:'Manage articles',      desc:'LinkedIn articles and publication links' },
          { href:'/admin/posts',    label:'Write journal posts',  desc:'Articles, research, and updates with media' },
          { href:'/admin/linkedin', label:'Post to LinkedIn',     desc:'Draft and publish to your LinkedIn profile' },
          { href:'/admin/messages', label:'View messages',        desc:'Read and reply to contact form submissions' },
        ].map(q=>(
          <Link key={q.href} href={q.href} style={{ padding:'18px 22px', background:'rgba(27,138,143,0.05)', border:'1px solid rgba(27,138,143,0.12)', borderRadius:'4px', textDecoration:'none', display:'block' }}>
            <div style={{ fontSize:'13px', color:'#DDD8CE', marginBottom:'4px' }}>{q.label} →</div>
            <div style={{ fontSize:'11px', color:'rgba(221,216,206,0.38)' }}>{q.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

---

## app/admin/content/page.tsx
```typescript
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, CheckCircle } from 'lucide-react'

const FIELDS = [
  { id:'home.about.body',  label:'Home — About paragraph 1', multiline:true },
  { id:'home.about.body2', label:'Home — About paragraph 2', multiline:true },
  { id:'home.apply.url',   label:'Home — Application portal URL', multiline:false },
  { id:'team.context',     label:'Team — Context paragraph', multiline:true },
]

export default function ContentPage() {
  const [values, setValues] = useState<Record<string,string>>({})
  const [saved, setSaved]   = useState<Record<string,boolean>>({})
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('content').select('id,value').then(({ data }) => {
      const map: Record<string,string> = {}
      data?.forEach(r => { map[r.id] = r.value })
      setValues(map); setLoading(false)
    })
  }, [])

  const save = async (id: string) => {
    await supabase.from('content').upsert({ id, value: values[id]||'' })
    setSaved(s=>({...s,[id]:true}))
    setTimeout(()=>setSaved(s=>({...s,[id]:false})),2500)
  }

  const inp: React.CSSProperties = { width:'100%', padding:'11px 14px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'3px', color:'#DDD8CE', fontSize:'14px', fontFamily:'var(--font-jost)', outline:'none' }
  const lbl: React.CSSProperties = { display:'block', fontSize:'10px', letterSpacing:'0.22em', textTransform:'uppercase' as const, color:'rgba(221,216,206,0.5)', marginBottom:'12px' }

  if (loading) return <p style={{ color:'rgba(221,216,206,0.4)', fontSize:'13px' }}>Loading…</p>
  return (
    <div>
      <h1 style={{ fontFamily:'var(--font-cormorant)', fontSize:'34px', fontWeight:300, color:'#fff', marginBottom:'8px' }}>Website Content</h1>
      <p style={{ fontSize:'13px', color:'rgba(221,216,206,0.4)', marginBottom:'36px' }}>Edit all public-facing text. Changes go live within 60 seconds.</p>
      <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
        {FIELDS.map(f=>(
          <div key={f.id} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'4px', padding:'24px' }}>
            <label style={lbl}>{f.label}</label>
            {f.multiline
              ? <textarea value={values[f.id]||''} onChange={e=>setValues(v=>({...v,[f.id]:e.target.value}))} rows={4} style={{ ...inp, resize:'vertical', lineHeight:1.7 }}/>
              : <input type="text" value={values[f.id]||''} onChange={e=>setValues(v=>({...v,[f.id]:e.target.value}))} style={inp}/>
            }
            <div style={{ marginTop:'12px', display:'flex', alignItems:'center', gap:'12px' }}>
              <button onClick={()=>save(f.id)} style={{ display:'flex', alignItems:'center', gap:'7px', padding:'9px 20px', background:'rgba(27,138,143,0.12)', border:'1px solid rgba(27,138,143,0.3)', borderRadius:'3px', color:'#1B8A8F', fontSize:'10px', letterSpacing:'0.22em', textTransform:'uppercase', cursor:'pointer', fontFamily:'var(--font-jost)' }}>
                <Save size={12}/> Save
              </button>
              {saved[f.id]&&<span style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'11px', color:'rgba(27,200,143,0.8)' }}><CheckCircle size={12}/> Saved</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## app/admin/team/page.tsx
```typescript
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Save } from 'lucide-react'

type Member = { id:string; name:string; role:string; bio:string; linkedin_url:string; initials:string; display_order:number; is_open_role:boolean; visible:boolean }

export default function TeamAdminPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [edits, setEdits] = useState<Record<string,Partial<Member>>>({})
  const supabase = createClient()

  const load = async () => {
    const { data } = await supabase.from('team_members').select('*').order('display_order')
    setMembers(data||[])
  }
  useEffect(()=>{ load() },[])

  const upd = (id:string, f:string, v:any) => setEdits(e=>({...e,[id]:{...e[id],[f]:v}}))
  const val = (m: Member, f: keyof Member) => (edits[m.id]&&f in edits[m.id] ? (edits[m.id] as any)[f] : m[f]) as string

  const save = async (id:string) => {
    const m = members.find(m=>m.id===id)!
    await supabase.from('team_members').update({...m,...edits[id]}).eq('id',id)
    await load(); setEdits(e=>{const n={...e}; delete n[id]; return n})
  }
  const remove = async (id:string) => {
    if (!confirm('Remove this team member?')) return
    await supabase.from('team_members').delete().eq('id',id); await load()
  }
  const add = async () => {
    const order = Math.max(0,...members.map(m=>m.display_order))+1
    await supabase.from('team_members').insert({ name:'New Member', role:'', bio:'', linkedin_url:'', initials:'?', display_order:order, is_open_role:false, visible:true })
    await load()
  }

  const inp: React.CSSProperties = { width:'100%', padding:'9px 12px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'3px', color:'#DDD8CE', fontSize:'13px', fontFamily:'var(--font-jost)', outline:'none' }
  const lbl = (s:string): React.CSSProperties => ({ display:'block', fontSize:'9px', letterSpacing:'0.2em', textTransform:'uppercase' as const, color:'rgba(221,216,206,0.35)', marginBottom:'6px' })

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'32px' }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-cormorant)', fontSize:'34px', fontWeight:300, color:'#fff', marginBottom:'4px' }}>Team Members</h1>
          <p style={{ fontSize:'13px', color:'rgba(221,216,206,0.4)' }}>Edit, reorder, or add team members shown on the public site.</p>
        </div>
        <button onClick={add} style={{ display:'flex', alignItems:'center', gap:'7px', padding:'10px 20px', background:'rgba(27,138,143,0.12)', border:'1px solid rgba(27,138,143,0.3)', borderRadius:'3px', color:'#1B8A8F', fontSize:'10px', letterSpacing:'0.22em', textTransform:'uppercase', cursor:'pointer', fontFamily:'var(--font-jost)' }}>
          <Plus size={13}/> Add member
        </button>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
        {members.map(m=>(
          <div key={m.id} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'4px', padding:'22px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 56px 1fr', gap:'12px', marginBottom:'12px' }}>
              <div><label style={lbl('name')}>Name</label><input value={val(m,'name')} onChange={e=>upd(m.id,'name',e.target.value)} style={inp}/></div>
              <div><label style={lbl('role')}>Role</label><input value={val(m,'role')} onChange={e=>upd(m.id,'role',e.target.value)} style={inp}/></div>
              <div><label style={lbl('init')}>Init.</label><input value={val(m,'initials')} onChange={e=>upd(m.id,'initials',e.target.value)} style={inp}/></div>
              <div><label style={lbl('li')}>LinkedIn URL</label><input value={val(m,'linkedin_url')} onChange={e=>upd(m.id,'linkedin_url',e.target.value)} style={inp}/></div>
            </div>
            <div style={{ marginBottom:'12px' }}><label style={lbl('bio')}>Bio</label><textarea value={val(m,'bio')} onChange={e=>upd(m.id,'bio',e.target.value)} rows={3} style={{ ...inp, resize:'vertical' }}/></div>
            <div style={{ display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
              <button onClick={()=>save(m.id)} style={{ display:'flex', alignItems:'center', gap:'7px', padding:'8px 18px', background:'rgba(27,138,143,0.12)', border:'1px solid rgba(27,138,143,0.3)', borderRadius:'3px', color:'#1B8A8F', fontSize:'10px', letterSpacing:'0.2em', textTransform:'uppercase', cursor:'pointer', fontFamily:'var(--font-jost)' }}><Save size={11}/> Save</button>
              <button onClick={()=>remove(m.id)} style={{ display:'flex', alignItems:'center', gap:'7px', padding:'8px 18px', background:'rgba(220,50,50,0.06)', border:'1px solid rgba(220,50,50,0.15)', borderRadius:'3px', color:'rgba(220,100,100,0.7)', fontSize:'10px', letterSpacing:'0.2em', textTransform:'uppercase', cursor:'pointer', fontFamily:'var(--font-jost)' }}><Trash2 size={11}/> Remove</button>
              <label style={{ display:'flex', alignItems:'center', gap:'7px', fontSize:'11px', color:'rgba(221,216,206,0.4)', cursor:'pointer' }}>
                <input type="checkbox" checked={!!(edits[m.id]?.visible ?? m.visible)} onChange={e=>upd(m.id,'visible',e.target.checked)}/> Visible
              </label>
              <label style={{ display:'flex', alignItems:'center', gap:'7px', fontSize:'11px', color:'rgba(221,216,206,0.4)', cursor:'pointer' }}>
                <input type="checkbox" checked={!!(edits[m.id]?.is_open_role ?? m.is_open_role)} onChange={e=>upd(m.id,'is_open_role',e.target.checked)}/> Open role
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## app/admin/articles/page.tsx
Build identically to app/admin/team/page.tsx above but for the `articles` table.
Fields to include: title, excerpt, tag, linkedin_url, published_at (date input), display_order, visible.
Same Add / Save / Remove pattern. No is_open_role field.

---

## app/admin/analytics/page.tsx
```typescript
import { createClient } from '@/lib/supabase/server'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { count: total } = await supabase.from('page_views').select('id',{count:'exact',head:true})
  const thirtyAgo = new Date(Date.now()-30*24*60*60*1000).toISOString()
  const { data: recent } = await supabase.from('page_views').select('viewed_at,path').gte('viewed_at',thirtyAgo).order('viewed_at',{ascending:false}).limit(1000)

  const byDay: Record<string,number> = {}
  const byPath: Record<string,number> = {}
  recent?.forEach(v => {
    byDay[v.viewed_at.split('T')[0]] = (byDay[v.viewed_at.split('T')[0]]||0)+1
    byPath[v.path] = (byPath[v.path]||0)+1
  })
  const days = Object.entries(byDay).sort(([a],[b])=>a.localeCompare(b))
  const pages = Object.entries(byPath).sort(([,a],[,b])=>b-a)
  const max = Math.max(1,...days.map(([,v])=>v))

  return (
    <div>
      <h1 style={{ fontFamily:'var(--font-cormorant)', fontSize:'34px', fontWeight:300, color:'#fff', marginBottom:'8px' }}>Analytics</h1>
      <p style={{ fontSize:'13px', color:'rgba(221,216,206,0.4)', marginBottom:'36px' }}>Page views since launch.</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', marginBottom:'40px' }}>
        {[
          { label:'Total views', value:(total||0).toLocaleString() },
          { label:'Last 30 days', value:(recent?.length||0).toLocaleString() },
          { label:'Pages tracked', value:Object.keys(byPath).length },
        ].map(s=>(
          <div key={s.label} style={{ padding:'22px 24px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'4px' }}>
            <div style={{ fontSize:'30px', fontWeight:300, color:'#fff', marginBottom:'6px' }}>{s.value}</div>
            <div style={{ fontSize:'11px', color:'rgba(221,216,206,0.4)' }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ marginBottom:'36px' }}>
        <h2 style={{ fontSize:'11px', letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(221,216,206,0.35)', marginBottom:'16px' }}>Daily views — last 30 days</h2>
        <div style={{ display:'flex', alignItems:'flex-end', gap:'3px', height:'80px' }}>
          {days.map(([day,count])=>(
            <div key={day} title={`${day}: ${count}`} style={{ flex:1, minWidth:'5px', background:`rgba(27,138,143,${(0.2+0.75*(count/max)).toFixed(2)})`, height:`${Math.max(4,(count/max)*100)}%`, borderRadius:'2px 2px 0 0' }}/>
          ))}
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:'6px' }}>
          <span style={{ fontSize:'9px', color:'rgba(221,216,206,0.25)' }}>{days[0]?.[0]||''}</span>
          <span style={{ fontSize:'9px', color:'rgba(221,216,206,0.25)' }}>{days[days.length-1]?.[0]||''}</span>
        </div>
      </div>
      <div>
        <h2 style={{ fontSize:'11px', letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(221,216,206,0.35)', marginBottom:'16px' }}>Top pages</h2>
        <div style={{ display:'flex', flexDirection:'column', gap:'1px', background:'rgba(255,255,255,0.04)' }}>
          {pages.map(([path,count])=>(
            <div key={path} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 18px', background:'#08090D' }}>
              <span style={{ fontSize:'13px', color:'rgba(221,216,206,0.6)', fontFamily:'var(--font-jost)' }}>{path}</span>
              <span style={{ fontSize:'13px', color:'#1B8A8F' }}>{count.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

---

## app/admin/messages/page.tsx
```typescript
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, Archive, Reply, Eye, EyeOff, CheckCircle } from 'lucide-react'

type Message = { id:string; name:string; email:string; subject:string; message:string; status:string; admin_notes:string; created_at:string }

const STATUS_STYLE: Record<string,React.CSSProperties> = {
  unread:   { color:'rgba(232,168,42,0.8)',   background:'rgba(232,168,42,0.08)',  border:'1px solid rgba(232,168,42,0.18)' },
  read:     { color:'rgba(221,216,206,0.45)', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' },
  replied:  { color:'rgba(27,180,100,0.75)',  background:'rgba(27,180,100,0.07)',  border:'1px solid rgba(27,180,100,0.15)' },
  archived: { color:'rgba(221,216,206,0.25)', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)' },
}
const FILTERS = ['all','unread','read','replied','archived']

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [selected, setSelected] = useState<Message|null>(null)
  const [filter, setFilter] = useState('all')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const load = async () => {
    let q = supabase.from('contact_messages').select('*').order('created_at',{ascending:false})
    if (filter!=='all') q = q.eq('status',filter)
    const { data } = await q
    setMessages(data||[])
  }
  useEffect(()=>{ load() },[filter])

  const open = async (msg: Message) => {
    setSelected(msg); setNotes(msg.admin_notes||'')
    if (msg.status==='unread') {
      await supabase.from('contact_messages').update({status:'read'}).eq('id',msg.id)
      setMessages(ms=>ms.map(m=>m.id===msg.id?{...m,status:'read'}:m))
    }
  }
  const setStatus = async (id:string, status:string) => {
    await supabase.from('contact_messages').update({status}).eq('id',id)
    setMessages(ms=>ms.map(m=>m.id===id?{...m,status}:m))
    if (selected?.id===id) setSelected(s=>s?{...s,status}:s)
  }
  const saveNotes = async () => {
    if (!selected) return; setSaving(true)
    await supabase.from('contact_messages').update({admin_notes:notes}).eq('id',selected.id)
    setMessages(ms=>ms.map(m=>m.id===selected.id?{...m,admin_notes:notes}:m))
    setSaving(false)
  }

  const unreadCount = messages.filter(m=>m.status==='unread').length
  const pill: React.CSSProperties = { fontSize:'9px', letterSpacing:'0.18em', textTransform:'uppercase' as const, padding:'3px 9px', borderRadius:'2px', fontFamily:'var(--font-jost)' }

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'24px' }}>
        <h1 style={{ fontFamily:'var(--font-cormorant)', fontSize:'34px', fontWeight:300, color:'#fff' }}>Messages</h1>
        {unreadCount>0&&<span style={{ padding:'3px 10px', background:'rgba(232,168,42,0.12)', border:'1px solid rgba(232,168,42,0.25)', borderRadius:'12px', fontSize:'11px', color:'rgba(232,168,42,0.8)' }}>{unreadCount} unread</span>}
      </div>
      <div style={{ display:'flex', gap:'4px', marginBottom:'16px' }}>
        {FILTERS.map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{ ...pill, background:filter===f?'rgba(27,138,143,0.12)':'transparent', border:filter===f?'1px solid rgba(27,138,143,0.3)':'1px solid rgba(255,255,255,0.07)', color:filter===f?'#1B8A8F':'rgba(221,216,206,0.38)', cursor:'pointer' }}>{f}</button>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:selected?'1fr 1fr':'1fr', gap:'1px', background:'rgba(255,255,255,0.04)' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:'1px', background:'rgba(255,255,255,0.04)' }}>
          {!messages.length&&<div style={{ padding:'48px', textAlign:'center', fontSize:'13px', color:'rgba(221,216,206,0.3)', background:'#08090D' }}>No messages.</div>}
          {messages.map(msg=>(
            <div key={msg.id} onClick={()=>open(msg)} style={{ padding:'16px 20px', background:selected?.id===msg.id?'#0F1520':'#08090D', cursor:'pointer', borderLeft:selected?.id===msg.id?'2px solid #1B8A8F':'2px solid transparent' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'4px' }}>
                <span style={{ fontSize:'14px', color:msg.status==='unread'?'#fff':'rgba(221,216,206,0.6)', fontWeight:msg.status==='unread'?400:300 }}>{msg.name}</span>
                <span style={{ ...pill, ...(STATUS_STYLE[msg.status]||STATUS_STYLE.read) }}>{msg.status}</span>
              </div>
              <p style={{ fontSize:'12px', color:'rgba(221,216,206,0.4)', marginBottom:'3px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{msg.subject||'No subject'}</p>
              <p style={{ fontSize:'11px', color:'rgba(221,216,206,0.25)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{msg.message.slice(0,80)}{msg.message.length>80?'…':''}</p>
              <p style={{ fontSize:'10px', color:'rgba(221,216,206,0.2)', marginTop:'8px' }}>{new Date(msg.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</p>
            </div>
          ))}
        </div>

        {selected&&(
          <div style={{ background:'#08090D', padding:'28px', display:'flex', flexDirection:'column', gap:'18px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <h2 style={{ fontFamily:'var(--font-cormorant)', fontSize:'22px', fontWeight:400, color:'#fff', marginBottom:'5px' }}>{selected.name}</h2>
                <a href={`mailto:${selected.email}`} style={{ fontSize:'12px', color:'rgba(27,138,143,0.65)', textDecoration:'none' }}>{selected.email}</a>
              </div>
              <button onClick={()=>setSelected(null)} style={{ background:'none', border:'none', color:'rgba(221,216,206,0.3)', cursor:'pointer', fontSize:'18px', lineHeight:1 }}>×</button>
            </div>
            {selected.subject&&<div><p style={{ fontSize:'9.5px', letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(221,216,206,0.3)', marginBottom:'6px' }}>Subject</p><p style={{ fontSize:'13px', color:'rgba(221,216,206,0.6)' }}>{selected.subject}</p></div>}
            <div style={{ padding:'18px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'3px' }}>
              <p style={{ fontSize:'14px', lineHeight:1.8, color:'rgba(221,216,206,0.72)', whiteSpace:'pre-wrap' }}>{selected.message}</p>
            </div>
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              <a href={`mailto:${selected.email}?subject=Re: ${selected.subject||'Your message'}`} onClick={()=>setStatus(selected.id,'replied')} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 16px', background:'rgba(27,138,143,0.1)', border:'1px solid rgba(27,138,143,0.25)', borderRadius:'3px', color:'#1B8A8F', fontSize:'10px', letterSpacing:'0.18em', textTransform:'uppercase', textDecoration:'none', fontFamily:'var(--font-jost)' }}><Reply size={11}/> Reply in email</a>
              {selected.status!=='replied'&&<button onClick={()=>setStatus(selected.id,'replied')} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 14px', background:'rgba(27,180,100,0.07)', border:'1px solid rgba(27,180,100,0.15)', borderRadius:'3px', color:'rgba(27,180,100,0.7)', fontSize:'10px', letterSpacing:'0.18em', textTransform:'uppercase', cursor:'pointer', fontFamily:'var(--font-jost)' }}><CheckCircle size={11}/> Mark replied</button>}
              {selected.status!=='archived'&&<button onClick={()=>setStatus(selected.id,'archived')} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 14px', background:'transparent', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'3px', color:'rgba(221,216,206,0.35)', fontSize:'10px', letterSpacing:'0.18em', textTransform:'uppercase', cursor:'pointer', fontFamily:'var(--font-jost)' }}><Archive size={11}/> Archive</button>}
            </div>
            <div>
              <label style={{ display:'block', fontSize:'9.5px', letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(221,216,206,0.3)', marginBottom:'9px' }}>Private notes</label>
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} style={{ width:'100%', padding:'10px 13px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'3px', color:'#DDD8CE', fontSize:'13px', fontFamily:'var(--font-jost)', lineHeight:1.65, resize:'vertical', outline:'none' }}/>
              <button onClick={saveNotes} disabled={saving} style={{ marginTop:'8px', padding:'7px 16px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'3px', color:'rgba(221,216,206,0.45)', fontSize:'9.5px', letterSpacing:'0.18em', textTransform:'uppercase', cursor:'pointer', fontFamily:'var(--font-jost)' }}>{saving?'Saving…':'Save notes'}</button>
            </div>
            <p style={{ fontSize:'10px', color:'rgba(221,216,206,0.2)' }}>Received {new Date(selected.created_at).toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'})}</p>
          </div>
        )}
      </div>
    </div>
  )
}
```

## Confirm: PROMPT_3 COMPLETE
