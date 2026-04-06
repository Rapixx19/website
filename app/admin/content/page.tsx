'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, CheckCircle, AlertCircle } from 'lucide-react'
import { adminInput, adminLabel, adminCard, pageHeading, pageSubtext, adminButton } from '@/lib/styles'

const FIELDS = [
  { id: 'home.about.body', label: 'Home — About paragraph 1', multiline: true },
  { id: 'home.about.body2', label: 'Home — About paragraph 2', multiline: true },
  { id: 'home.apply.url', label: 'Home — Application portal URL', multiline: false },
  { id: 'team.context', label: 'Team — Context paragraph', multiline: true },
]

export default function ContentPage() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('content').select('id,value').then(({ data, error }) => {
      if (error) { setErrors({ _load: error.message }); setLoading(false); return }
      const map: Record<string, string> = {}
      data?.forEach(r => { map[r.id] = r.value })
      setValues(map); setLoading(false)
    })
  }, [])

  const save = async (id: string) => {
    setErrors(e => ({ ...e, [id]: '' }))
    const { error } = await supabase.from('content').upsert({ id, value: values[id] || '' })
    if (error) {
      setErrors(e => ({ ...e, [id]: error.message }))
      return
    }
    setSaved(s => ({ ...s, [id]: true }))
    setTimeout(() => setSaved(s => ({ ...s, [id]: false })), 2500)
    // Trigger on-demand revalidation
    fetch('/api/revalidate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paths: ['/', '/team'] }) }).catch(() => {})
  }

  if (loading) return <p style={{ color: 'rgba(221,216,206,0.4)', fontSize: '13px' }}>Loading...</p>
  if (errors._load) return <p style={{ color: 'rgba(220,100,100,0.8)', fontSize: '13px' }}>Failed to load content: {errors._load}</p>

  return (
    <div>
      <h1 style={pageHeading}>Website Content</h1>
      <p style={pageSubtext}>Edit all public-facing text. Changes go live immediately after saving.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {FIELDS.map(f => (
          <div key={f.id} style={adminCard}>
            <label htmlFor={`content-${f.id}`} style={adminLabel}>{f.label}</label>
            {f.multiline
              ? <textarea id={`content-${f.id}`} value={values[f.id] || ''} onChange={e => setValues(v => ({ ...v, [f.id]: e.target.value }))} rows={4} style={{ ...adminInput, resize: 'vertical', lineHeight: 1.7 }} />
              : <input id={`content-${f.id}`} type="text" value={values[f.id] || ''} onChange={e => setValues(v => ({ ...v, [f.id]: e.target.value }))} style={adminInput} />
            }
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={() => save(f.id)} style={adminButton()}>
                <Save size={12} /> Save
              </button>
              {saved[f.id] && <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'rgba(27,200,143,0.8)' }}><CheckCircle size={12} /> Saved</span>}
              {errors[f.id] && <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'rgba(220,100,100,0.8)' }}><AlertCircle size={12} /> {errors[f.id]}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
