'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [logoError, setLogoError] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let animId: number

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize()
    window.addEventListener('resize', resize)

    const particles = Array.from({ length: 32 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.3 + 0.3,
      vx: (Math.random() - 0.5) * 0.1, vy: (Math.random() - 0.5) * 0.07,
      flicker: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.018 + 0.006,
      teal: Math.random() > 0.68,
    }))

    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t += 0.004
      const gx = canvas.width * 0.5 + Math.sin(t * 0.3) * canvas.width * 0.06
      const gy = canvas.height * 0.42 + Math.cos(t * 0.2) * canvas.height * 0.05
      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, canvas.width * 0.4)
      g.addColorStop(0, 'rgba(27,138,143,0.055)')
      g.addColorStop(1, 'transparent')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.flicker += p.speed
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0
        const a = 0.55 + 0.45 * Math.sin(p.flicker)
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.teal ? `rgba(27,138,143,${(a * 0.7).toFixed(2)})` : `rgba(226,221,212,${(a * 0.28).toFixed(2)})`
        ctx.fill()
      })
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <section style={{ position: 'relative', height: '100vh', minHeight: '500px', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#08090D' }}>
      {/* Poster fallback image — shows instantly, video replaces when loaded */}
      <Image
        src="/horse-poster.jpg"
        alt=""
        fill
        priority
        style={{ objectFit: 'cover', opacity: 0.18, zIndex: 1 }}
        aria-hidden="true"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
      {/* Video — loads over poster */}
      <video
        autoPlay muted loop playsInline
        poster="/horse-poster.jpg"
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.22, zIndex: 1 }}
      >
        <source src="/horse.mp4" type="video/mp4" />
      </video>
      <canvas ref={canvasRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 2 }} />
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 3, background: 'radial-gradient(ellipse 70% 50% at 50% 45%, rgba(27,138,143,0.07) 0%, transparent 70%)' }} />
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 4, background: 'linear-gradient(to bottom, rgba(8,9,13,0.2) 0%, transparent 40%, rgba(8,9,13,0.85) 85%, #08090D 100%)' }} />
      <div style={{ position: 'relative', zIndex: 5, textAlign: 'center', padding: '0 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ marginBottom: '16px', animation: 'sv-fadeUp 1.2s ease forwards', opacity: 0, animationDelay: '0.3s' }}>
          {logoError ? (
            <svg width="90" height="90" viewBox="0 0 80 80" fill="none" aria-hidden="true">
              <path d="M40 10C31 10,20 17,17 29C14 41,20 49,25 55C30 61,30 70,28 78H36C36 69,38 61,40 57C42 61,44 69,44 78H52C50 70,50 61,55 55C60 49,66 41,63 29C60 17,49 10,40 10Z" fill="rgba(255,255,255,0.9)" />
              <path d="M33 14C26 11,18 7,14 1C16 9,14 17,13 24" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              <circle cx="30" cy="23" r="3" fill="#08090D" />
            </svg>
          ) : (
            <Image src="/logo.png" alt="Sentavita" width={90} height={90} style={{ objectFit: 'contain' }} onError={() => setLogoError(true)} />
          )}
        </div>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(54px,9vw,88px)', fontWeight: 300, letterSpacing: '0.2em', color: '#fff', lineHeight: 1, animation: 'sv-fadeUp 1.2s ease forwards', opacity: 0, animationDelay: '0.55s' }}>
          Sentavita
        </h1>
        <div style={{ width: '40px', height: '1px', background: 'rgba(232,168,42,0.55)', margin: '18px auto', animation: 'sv-fadeIn 1s ease forwards', opacity: 0, animationDelay: '1.1s' }} />
        <p style={{ fontSize: '10px', letterSpacing: '0.36em', textTransform: 'uppercase', color: 'rgba(221,216,206,0.4)', animation: 'sv-fadeUp 1s ease forwards', opacity: 0, animationDelay: '1.3s' }}>
          Equine health · Switzerland · Est. 2026
        </p>
        <button
          onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
          aria-label="Scroll to about section"
          style={{ marginTop: '44px', cursor: 'pointer', opacity: 0, animation: 'sv-fadeIn 1s ease forwards', animationDelay: '2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'none', border: 'none', padding: 0 }}
        >
          <span style={{ fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(221,216,206,0.3)' }}>Discover</span>
          <div style={{ width: '1px', height: '38px', background: 'linear-gradient(to bottom, rgba(27,138,143,0.7), transparent)', animation: 'sv-pulse 2s ease infinite' }} />
        </button>
      </div>
    </section>
  )
}
