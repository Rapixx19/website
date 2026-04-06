import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/admin/AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return (
    <>
      <div className="admin-layout" style={{ minHeight: '100vh', background: '#08090D', display: 'flex' }}>
        <AdminNav userEmail={user.email || ''} />
        <div className="admin-content" style={{ flex: 1, marginLeft: '220px', padding: '40px', maxWidth: 'calc(100vw - 220px)', overflowX: 'hidden' }}>
          {children}
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .admin-content {
            margin-left: 0 !important;
            max-width: 100vw !important;
            padding: 20px !important;
            padding-top: 70px !important;
          }
        }
      `}</style>
    </>
  )
}
