import Link from 'next/link'
import { pageHeading, adminButton } from '@/lib/styles'
import { ArrowLeft } from 'lucide-react'

export default function NewPostPage() {
  return (
    <div>
      <h1 style={pageHeading}>New Post</h1>
      <p style={{ fontSize: '13px', color: 'rgba(221,216,206,0.4)', marginBottom: '24px' }}>The post editor is being finalised.</p>
      <Link href="/admin/posts" style={{ ...adminButton(), textDecoration: 'none', display: 'inline-flex' }}>
        <ArrowLeft size={12} /> Back to posts
      </Link>
    </div>
  )
}
