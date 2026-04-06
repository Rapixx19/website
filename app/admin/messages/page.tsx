'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Archive, Reply, CheckCircle } from 'lucide-react'
import { adminInput, adminLabel, adminButton, pageHeading } from '@/lib/styles'

type Message = { id: string; name: string; email: string; subject: string; message: string; status: string; admin_notes: string; created_at: string }

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  unread: { color: 'rgba(232,168,42,0.8)', background: 'rgba(232,168,42,0.08)', border: '1px solid rgba(232,168,42,0.18)' },
  read: { color: 'rgba(221,216,206,0.45)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' },
  replied: { color: 'rgba(27,180,100,0.75)', background: 'rgba(27,180,100,0.07)', border: '1px solid rgba(27,180,100,0.15)' },
  archived: { color: 'rgba(221,216,206,0.25)', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' },
}
const FILTERS = ['all', 'unread', 'read', 'replied', 'archived']

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [selected, setSelected] = useState<Message | null>(null)
  const [filter, setFilter] = useState('all')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const load = async () => {
    let q = supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
    if (filter !== 'all') q = q.eq('status', filter)
    const { data, error: err } = await q
    if (err) { setError(err.message); return }
    setMessages(data || [])
  }
  useEffect(() => { load() }, [filter])

  const open = async (msg: Message) => {
    setSelected(msg); setNotes(msg.admin_notes || '')
    if (msg.status === 'unread') {
      await supabase.from('contact_messages').update({ status: 'read' }).eq('id', msg.id)
      setMessages(ms => ms.map(m => m.id === msg.id ? { ...m, status: 'read' } : m))
    }
  }
  const setStatus = async (id: string, status: string) => {
    const { error: err } = await supabase.from('contact_messages').update({ status }).eq('id', id)
    if (err) { setError(err.message); return }
    setMessages(ms => ms.map(m => m.id === id ? { ...m, status } : m))
    if (selected?.id === id) setSelected(s => s ? { ...s, status } : s)
  }
  const saveNotes = async () => {
    if (!selected) return; setSaving(true)
    const { error: err } = await supabase.from('contact_messages').update({ admin_notes: notes }).eq('id', selected.id)
    if (err) { setError(err.message); setSaving(false); return }
    setMessages(ms => ms.map(m => m.id === selected.id ? { ...m, admin_notes: notes } : m))
    setSaving(false)
  }

  const unreadCount = messages.filter(m => m.status === 'unread').length
  const pill: React.CSSProperties = { fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase' as const, padding: '3px 9px', borderRadius: '2px', fontFamily: 'var(--font-jost)', cursor: 'pointer' }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
        <h1 style={{ ...pageHeading, marginBottom: 0 }}>Messages</h1>
        {unreadCount > 0 && <span style={{ padding: '3px 10px', background: 'rgba(232,168,42,0.12)', border: '1px solid rgba(232,168,42,0.25)', borderRadius: '12px', fontSize: '11px', color: 'rgba(232,168,42,0.8)' }}>{unreadCount} unread</span>}
      </div>
      {error && <p role="alert" style={{ color: 'rgba(220,100,100,0.8)', fontSize: '12px', marginBottom: '12px' }}>{error}</p>}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ ...pill, background: filter === f ? 'rgba(27,138,143,0.12)' : 'transparent', border: filter === f ? '1px solid rgba(27,138,143,0.3)' : '1px solid rgba(255,255,255,0.07)', color: filter === f ? '#1B8A8F' : 'rgba(221,216,206,0.38)' }}>{f}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: '1px', background: 'rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255,255,255,0.04)' }}>
          {!messages.length && <div style={{ padding: '48px', textAlign: 'center', fontSize: '13px', color: 'rgba(221,216,206,0.3)', background: '#08090D' }}>No messages.</div>}
          {messages.map(msg => (
            <div key={msg.id} onClick={() => open(msg)} style={{ padding: '16px 20px', background: selected?.id === msg.id ? '#0F1520' : '#08090D', cursor: 'pointer', borderLeft: selected?.id === msg.id ? '2px solid #1B8A8F' : '2px solid transparent' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                <span style={{ fontSize: '14px', color: msg.status === 'unread' ? '#fff' : 'rgba(221,216,206,0.6)', fontWeight: msg.status === 'unread' ? 400 : 300 }}>{msg.name}</span>
                <span style={{ ...pill, ...(STATUS_STYLE[msg.status] || STATUS_STYLE.read) }}>{msg.status}</span>
              </div>
              <p style={{ fontSize: '12px', color: 'rgba(221,216,206,0.4)', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.subject || 'No subject'}</p>
              <p style={{ fontSize: '10px', color: 'rgba(221,216,206,0.2)', marginTop: '8px' }}>{new Date(msg.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
          ))}
        </div>
        {selected && (
          <div style={{ background: '#08090D', padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '22px', fontWeight: 400, color: '#fff', marginBottom: '5px' }}>{selected.name}</h2>
                <a href={`mailto:${selected.email}`} style={{ fontSize: '12px', color: 'rgba(27,138,143,0.65)', textDecoration: 'none' }}>{selected.email}</a>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'rgba(221,216,206,0.3)', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}>×</button>
            </div>
            {selected.subject && <div><p style={adminLabel}>Subject</p><p style={{ fontSize: '13px', color: 'rgba(221,216,206,0.6)' }}>{selected.subject}</p></div>}
            <div style={{ padding: '18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '3px' }}>
              <p style={{ fontSize: '14px', lineHeight: 1.8, color: 'rgba(221,216,206,0.72)', whiteSpace: 'pre-wrap' }}>{selected.message}</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <a href={`mailto:${selected.email}?subject=Re: ${selected.subject || 'Your message'}`} onClick={() => setStatus(selected.id, 'replied')} style={{ ...adminButton(), textDecoration: 'none' }}><Reply size={11} /> Reply in email</a>
              {selected.status !== 'replied' && <button onClick={() => setStatus(selected.id, 'replied')} style={adminButton('rgba(27,180,100,0.07)', 'rgba(27,180,100,0.15)', 'rgba(27,180,100,0.7)')}><CheckCircle size={11} /> Mark replied</button>}
              {selected.status !== 'archived' && <button onClick={() => setStatus(selected.id, 'archived')} style={adminButton('transparent', 'rgba(255,255,255,0.08)', 'rgba(221,216,206,0.35)')}><Archive size={11} /> Archive</button>}
            </div>
            <div>
              <label htmlFor="admin-notes" style={adminLabel}>Private notes</label>
              <textarea id="admin-notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} style={{ ...adminInput, resize: 'vertical', lineHeight: 1.65 }} />
              <button onClick={saveNotes} disabled={saving} style={{ ...adminButton('rgba(255,255,255,0.04)', 'rgba(255,255,255,0.08)', 'rgba(221,216,206,0.45)'), marginTop: '8px' }}>{saving ? 'Saving...' : 'Save notes'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
