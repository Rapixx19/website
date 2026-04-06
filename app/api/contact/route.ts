import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { rateLimit } from '@/lib/rate-limit'

// Strip HTML tags to prevent email injection
function sanitize(str: string): string {
  return str.replace(/<[^>]*>/g, '').trim()
}

export async function POST(req: NextRequest) {
  // Rate limit: 5 submissions per hour per IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  const { allowed } = rateLimit(`contact:${ip}`, 5, 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many submissions. Please try again later.' }, { status: 429 })
  }

  try {
    const { name, email, subject, message } = await req.json()

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Name, email and message are required.' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: 'Message too long.' }, { status: 400 })
    }

    const supabase = getAdminClient()
    const cleanName = sanitize(name)
    const cleanEmail = email.trim().toLowerCase()
    const cleanSubject = sanitize(subject || '')
    const cleanMessage = sanitize(message)

    const { error: dbErr } = await supabase.from('contact_messages').insert({
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage,
    } as any)
    if (dbErr) throw dbErr

    // Send email notification via Resend (optional)
    const resendKey = process.env.RESEND_API_KEY
    const contactEmail = process.env.CONTACT_EMAIL
    if (resendKey && contactEmail) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'Sentavita <noreply@sentavita.io>',
            to: contactEmail,
            subject: `New contact: ${cleanSubject || 'No subject'} — ${cleanName}`,
            text: `Name: ${cleanName}\nEmail: ${cleanEmail}\nSubject: ${cleanSubject || 'None'}\n\nMessage:\n${cleanMessage}`,
          }),
        })
      } catch {
        // Email send failure is non-blocking — message is already saved to DB
      }
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
