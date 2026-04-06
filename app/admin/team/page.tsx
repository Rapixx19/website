'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Save, AlertCircle } from 'lucide-react'
import { adminInput, adminLabel, adminCard, pageHeading, pageSubtext, adminButton } from '@/lib/styles'

type Member = { id: string; name: string; role: string; bio: string; linkedin_url: string; initials: string; display_order: number; is_open_role: boolean; visible: boolean }

export default function TeamAdminPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [edits, setEdits] = useState<Record<string, Partial<Member>>>({})
  const [error, setError] = useState('')
  const [saveMsg, setSaveMsg] = useState<Record<string, string>>({})
  const supabase = createClient()

  const load = async () => {
    const { data, error: err } = await supabase.from('team_members').select('*').order('display_order')
    if (err) { setError(err.message); return }
    setMembers(data || [])
  }
  useEffect(() => { load() }, [])

  const upd = (id: string, f: string, v: any) => setEdits(e => ({ ...e, [id]: { ...e[id], [f]: v } }))
  const val = (m: Member, f: keyof Member) => (edits[m.id] && f in edits[m.id] ? (edits[m.id] as any)[f] : m[f]) as string

  const save = async (id: string) => {
    const m = members.find(m => m.id === id)!
    const { error: err } = await supabase.from('team_members').update({ ...m, ...edits[id] }).eq('id', id)
    if (err) { setSaveMsg(s => ({ ...s, [id]: `Error: ${err.message}` })); return }
    setSaveMsg(s => ({ ...s, [id]: 'Saved' }))
    setTimeout(() => setSaveMsg(s => ({ ...s, [id]: '' })), 2500)
    await load(); setEdits(e => { const n = { ...e }; delete n[id]; return n })
    fetch('/api/revalidate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paths: ['/team'] }) }).catch(() => {})
  }
  const remove = async (id: string) => {
    if (!confirm('Remove this team member?')) return
    const { error: err } = await supabase.from('team_members').delete().eq('id', id)
    if (err) { setSaveMsg(s => ({ ...s, [id]: `Error: ${err.message}` })); return }
    await load()
    fetch('/api/revalidate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paths: ['/team'] }) }).catch(() => {})
  }
  const add = async () => {
    const order = Math.max(0, ...members.map(m => m.display_order)) + 1
    const { error: err } = await supabase.from('team_members').insert({ name: 'New Member', role: '', bio: '', linkedin_url: '', initials: '?', display_order: order, is_open_role: false, visible: true })
    if (err) { setError(err.message); return }
    await load()
  }

  if (error) return <p style={{ color: 'rgba(220,100,100,0.8)', fontSize: '13px' }}>{error}</p>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={pageHeading}>Team Members</h1>
          <p style={{ ...pageSubtext, marginBottom: 0 }}>Edit, reorder, or add team members shown on the public site.</p>
        </div>
        <button onClick={add} style={adminButton()}><Plus size={13} /> Add member</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {members.map(m => (
          <div key={m.id} style={adminCard}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 56px 1fr', gap: '12px', marginBottom: '12px' }}>
              <div><label style={adminLabel}>Name</label><input value={val(m, 'name')} onChange={e => upd(m.id, 'name', e.target.value)} style={adminInput} /></div>
              <div><label style={adminLabel}>Role</label><input value={val(m, 'role')} onChange={e => upd(m.id, 'role', e.target.value)} style={adminInput} /></div>
              <div><label style={adminLabel}>Init.</label><input value={val(m, 'initials')} onChange={e => upd(m.id, 'initials', e.target.value)} style={adminInput} /></div>
              <div><label style={adminLabel}>LinkedIn URL</label><input value={val(m, 'linkedin_url')} onChange={e => upd(m.id, 'linkedin_url', e.target.value)} style={adminInput} /></div>
            </div>
            <div style={{ marginBottom: '12px' }}><label style={adminLabel}>Bio</label><textarea value={val(m, 'bio')} onChange={e => upd(m.id, 'bio', e.target.value)} rows={3} style={{ ...adminInput, resize: 'vertical' }} /></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={() => save(m.id)} style={adminButton()}><Save size={11} /> Save</button>
              <button onClick={() => remove(m.id)} style={adminButton('rgba(220,50,50,0.06)', 'rgba(220,50,50,0.15)', 'rgba(220,100,100,0.7)')}><Trash2 size={11} /> Remove</button>
              <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '11px', color: 'rgba(221,216,206,0.4)', cursor: 'pointer' }}>
                <input type="checkbox" checked={!!(edits[m.id]?.visible ?? m.visible)} onChange={e => upd(m.id, 'visible', e.target.checked)} /> Visible
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '11px', color: 'rgba(221,216,206,0.4)', cursor: 'pointer' }}>
                <input type="checkbox" checked={!!(edits[m.id]?.is_open_role ?? m.is_open_role)} onChange={e => upd(m.id, 'is_open_role', e.target.checked)} /> Open role
              </label>
              {saveMsg[m.id] && <span style={{ fontSize: '11px', color: saveMsg[m.id].startsWith('Error') ? 'rgba(220,100,100,0.8)' : 'rgba(27,200,143,0.8)', display: 'flex', alignItems: 'center', gap: '5px' }}>{saveMsg[m.id].startsWith('Error') && <AlertCircle size={11} />}{saveMsg[m.id]}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
