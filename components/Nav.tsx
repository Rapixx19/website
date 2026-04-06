'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const FallbackMark = () => (
  <svg width="26" height="26" viewBox="0 0 80 80" fill="none" aria-hidden="true">
    <path d="M40 10C31 10,20 17,17 29C14 41,20 49,25 55C30 61,30 70,28 78H36C36 69,38 61,40 57C42 61,44 69,44 78H52C50 70,50 61,55 55C60 49,66 41,63 29C60 17,49 10,40 10Z" fill="rgba(226,221,212,0.88)"/>
    <path d="M33 14C26 11,18 7,14 1C16 9,14 17,13 24" stroke="rgba(226,221,212,0.4)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    <circle cx="30" cy="23" r="3" fill="#08090D"/>
  </svg>
)

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/team', label: 'Team' },
  { href: '/articles', label: 'Articles' },
  { href: '/journal', label: 'Journal' },
  { href: '/contact', label: 'Contact' },
  { href: '/login', label: 'Login' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  if (pathname.startsWith('/admin') || pathname === '/login') return null

  const linkStyle = (href: string): React.CSSProperties => ({
    fontSize: '10px',
    letterSpacing: '0.28em',
    textTransform: 'uppercase',
    fontWeight: 300,
    fontFamily: 'var(--font-jost)',
    color: pathname === href ? '#DDD8CE' : 'rgba(221,216,206,0.45)',
    textDecoration: 'none',
    transition: 'color 0.25s',
    padding: '12px 0',
  })

  return (
    <>
      <nav
        role="navigation"
        aria-label="Main navigation"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 48px',
          background: scrolled ? 'rgba(8,9,13,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(14px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
          transition: 'all 0.4s',
        }}
        className="page-padding"
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '9px', textDecoration: 'none', fontFamily: 'var(--font-cormorant)', fontSize: '19px', letterSpacing: '0.14em', color: '#fff', fontWeight: 400 }}>
          {logoError ? <FallbackMark /> : (
            <Image src="/logo.png" alt="Sentavita" width={26} height={26}
              style={{ objectFit: 'contain' }} onError={() => setLogoError(true)} />
          )}
          Sentavita
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', gap: '40px' }} className="desktop-nav">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={linkStyle(link.href)}
              aria-current={pathname === link.href ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="mobile-nav-toggle"
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
          style={{
            display: 'none', background: 'none', border: 'none',
            cursor: 'pointer', padding: '8px', color: '#DDD8CE',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            {mobileOpen ? (
              <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            ) : (
              <>
                <line x1="2" y1="5" x2="18" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="2" y1="15" x2="18" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 199,
            background: 'rgba(8,9,13,0.98)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '28px',
            paddingTop: 'env(safe-area-inset-top, 0px)',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}
        >
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: '26px',
                fontWeight: 300,
                letterSpacing: '0.14em',
                color: pathname === link.href ? '#fff' : 'rgba(221,216,206,0.45)',
                textDecoration: 'none',
                transition: 'color 0.25s',
                padding: '8px 24px',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-current={pathname === link.href ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav-toggle { display: block !important; }
        }
      `}</style>
    </>
  )
}
