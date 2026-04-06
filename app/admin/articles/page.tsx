'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Save, AlertCircle } from 'lucide-react'
import { adminInput, adminLabel, adminCard, pageHeading, pageSubtext, adminButton } from '@/lib/styles'

type Article = { id: string; title: string; excerpt: string; tag: string; linkedin_url: string; published_at: string; display_order: number; visible: boolean }

export default function ArticlesAdminPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [edits, setEdits] = useState<Record<string, Partial<Article>>>({})
  const [error, setError] = useState('')
  const [saveMsg, setSaveMsg] = useState<Record<string, string>>({})
  const supabase = createClient()

  const load = async () => {
    const { data, error: err } = await supabase.from('articles').select('*').order('display_order')
    if (err) { setError(err.message); return }
    setArticles(data || [])
  }
  useEffect(() => { load() }, [])

  const upd = (id: string, f: string, v: any) => setEdits(e => ({ ...e, [id]: { ...e[id], [f]: v } }))
  const val = (a: Article, f: keyof Article) => (edits[a.id] && f in edits[a.id] ? (edits[a.id] as any)[f] : a[f]) as string

  const save = async (id: string) => {
    const a = articles.find(a => a.id === id)!
    const { error: err } = await supabase.from('articles').update({ ...a, ...edits[id] }).eq('id', id)
    if (err) { setSaveMsg(s => ({ ...s, [id]: `Error: ${err.message}` })); return }
    setSaveMsg(s => ({ ...s, [id]: 'Saved' }))
    setTimeout(() => setSaveMsg(s => ({ ...s, [id]: '' })), 2500)
    await load(); setEdits(e => { const n = { ...e }; delete n[id]; return n })
    fetch('/api/revalidate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paths: ['/articles'] }) }).catch(() => {})
  }
  const remove = async (id: string) => {
    if (!confirm('Delete this article?')) return
    const { error: err } = await supabase.from('articles').delete().eq('id', id)
    if (err) { setSaveMsg(s => ({ ...s, [id]: `Error: ${err.message}` })); return }
    await load()
    fetch('/api/revalidate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paths: ['/articles'] }) }).catch(() => {})
  }
  const add = async () => {
    const order = Math.max(0, ...articles.map(a => a.display_order)) + 1
    const { error: err } = await supabase.from('articles').insert({ title: 'New Article', excerpt: '', tag: '', linkedin_url: '', published_at: new Date().toISOString().split('T')[0], display_order: order, visible: true })
    if (err) { setError(err.message); return }
    await load()
  }

  if (error) return <p style={{ color: 'rgba(220,100,100,0.8)', fontSize: '13px' }}>{error}</p>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={pageHeading}>Articles</h1>
          <p style={{ ...pageSubtext, marginBottom: 0 }}>LinkedIn articles and publication links shown on the public site.</p>
        </div>
        <button onClick={add} style={adminButton()}><Plus size={13} /> Add article</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {articles.map(a => (
          <div key={a.id} style={adminCard}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div><label style={adminLabel}>Title</label><input value={val(a, 'title')} onChange={e => upd(a.id, 'title', e.target.value)} style={adminInput} /></div>
              <div><label style={adminLabel}>Tag</label><input value={val(a, 'tag')} onChange={e => upd(a.id, 'tag', e.target.value)} style={adminInput} /></div>
              <div><label style={adminLabel}>Published date</label><input type="date" value={val(a, 'published_at')} onChange={e => upd(a.id, 'published_at', e.target.value)} style={adminInput} /></div>
            </div>
            <div style={{ marginBottom: '12px' }}><label style={adminLabel}>Excerpt</label><textarea value={val(a, 'excerpt')} onChange={e => upd(a.id, 'excerpt', e.target.value)} rows={2} style={{ ...adminInput, resize: 'vertical' }} /></div>
            <div style={{ marginBottom: '12px' }}><label style={adminLabel}>LinkedIn URL</label><input value={val(a, 'linkedin_url')} onChange={e => upd(a.id, 'linkedin_url', e.target.value)} style={adminInput} /></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={() => save(a.id)} style={adminButton()}><Save size={11} /> Save</button>
              <button onClick={() => remove(a.id)} style={adminButton('rgba(220,50,50,0.06)', 'rgba(220,50,50,0.15)', 'rgba(220,100,100,0.7)')}><Trash2 size={11} /> Remove</button>
              <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '11px', color: 'rgba(221,216,206,0.4)', cursor: 'pointer' }}>
                <input type="checkbox" checked={!!(edits[a.id]?.visible ?? a.visible)} onChange={e => upd(a.id, 'visible', e.target.checked)} /> Visible
              </label>
              {saveMsg[a.id] && <span style={{ fontSize: '11px', color: saveMsg[a.id].startsWith('Error') ? 'rgba(220,100,100,0.8)' : 'rgba(27,200,143,0.8)' }}>{saveMsg[a.id]}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
