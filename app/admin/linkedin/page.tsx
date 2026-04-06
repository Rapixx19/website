import { pageHeading, pageSubtext, adminCard, adminButton } from '@/lib/styles'
import { ExternalLink, Send } from 'lucide-react'

export default function LinkedInPage() {
  return (
    <div>
      <h1 style={pageHeading}>LinkedIn Publisher</h1>
      <p style={pageSubtext}>Draft and publish posts directly to your company LinkedIn.</p>
      <div style={adminCard}>
        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
          <ExternalLink size={28} color="rgba(27,138,143,0.3)" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: '14px', color: 'rgba(221,216,206,0.45)', marginBottom: '8px' }}>No LinkedIn posts yet.</p>
          <p style={{ fontSize: '12px', color: 'rgba(221,216,206,0.25)', maxWidth: '400px', margin: '0 auto 20px', lineHeight: 1.6 }}>The LinkedIn publisher is being connected. You will be able to draft posts, preview them, and publish directly to your LinkedIn profile from here.</p>
          <a href="https://linkedin.com/company/sentavita" target="_blank" rel="noopener noreferrer" style={{ ...adminButton(), textDecoration: 'none', display: 'inline-flex' }}>
            <ExternalLink size={12} /> Open LinkedIn
          </a>
        </div>
      </div>
    </div>
  )
}
