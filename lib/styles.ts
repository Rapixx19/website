import type { CSSProperties } from 'react'

// Shared admin style constants — single source of truth for admin UI
export const adminInput: CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '3px',
  color: '#DDD8CE',
  fontSize: '14px',
  fontFamily: 'var(--font-jost)',
  fontWeight: 300,
  outline: 'none',
}

export const adminLabel: CSSProperties = {
  display: 'block',
  fontSize: '9.5px',
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'rgba(221,216,206,0.4)',
  marginBottom: '8px',
}

export const adminButton = (
  bg = 'rgba(27,138,143,0.12)',
  border = 'rgba(27,138,143,0.3)',
  color = '#1B8A8F'
): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '7px',
  padding: '10px 20px',
  background: bg,
  border: `1px solid ${border}`,
  borderRadius: '3px',
  color,
  fontSize: '10px',
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  fontFamily: 'var(--font-jost)',
})

export const adminCard: CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '4px',
  padding: '24px',
}

export const pageHeading: CSSProperties = {
  fontFamily: 'var(--font-cormorant)',
  fontSize: '34px',
  fontWeight: 300,
  color: '#fff',
  marginBottom: '8px',
}

export const pageSubtext: CSSProperties = {
  fontSize: '13px',
  color: 'rgba(221,216,206,0.4)',
  marginBottom: '36px',
}
