import { pageHeading, pageSubtext, adminCard, adminButton } from '@/lib/styles'
import { BookOpen } from 'lucide-react'

export default function PostsPage() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={pageHeading}>Journal Posts</h1>
          <p style={{ ...pageSubtext, marginBottom: 0 }}>Write and publish articles, research, and updates.</p>
        </div>
        <button style={{ ...adminButton(), opacity: 0.4, cursor: 'default' }} disabled>
          <BookOpen size={13} /> New post
        </button>
      </div>
      <div style={adminCard}>
        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
          <BookOpen size={28} color="rgba(27,138,143,0.3)" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: '14px', color: 'rgba(221,216,206,0.45)', marginBottom: '8px' }}>No posts published yet.</p>
          <p style={{ fontSize: '12px', color: 'rgba(221,216,206,0.25)' }}>The journal post editor is being finalised. You will be able to write, upload media, and cross-post to LinkedIn from here.</p>
        </div>
      </div>
    </div>
  )
}
