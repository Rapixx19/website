import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/admin/AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return (
    <div style={{ minHeight: '100vh', background: '#08090D', display: 'flex' }}>
      <AdminNav userEmail={user.email || ''} />
      <div style={{ flex: 1, marginLeft: '220px', padding: '40px', maxWidth: 'calc(100vw - 220px)' }}>
        {children}
      </div>
    </div>
  )
}
