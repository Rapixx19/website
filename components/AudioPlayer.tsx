'use client'
import { useRef, useState, useEffect } from 'react'

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return

    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play().then(() => {
        setPlaying(true)
        setHasInteracted(true)
      }).catch(() => {})
    }
  }

  return (
    <>
      <audio ref={audioRef} src="/audio.mp3" loop preload="none" />
      <button
        onClick={toggle}
        aria-label={playing ? 'Mute background music' : 'Play background music'}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 300,
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'rgba(8,9,13,0.7)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s',
          opacity: 0.6,
        }}
      >
        {playing ? (
          // Sound on — animated bars
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="1" y="6" width="2" height="4" rx="1" fill="rgba(27,138,143,0.8)">
              <animate attributeName="height" values="4;10;4" dur="0.8s" repeatCount="indefinite" />
              <animate attributeName="y" values="6;3;6" dur="0.8s" repeatCount="indefinite" />
            </rect>
            <rect x="5" y="4" width="2" height="8" rx="1" fill="rgba(27,138,143,0.8)">
              <animate attributeName="height" values="8;4;8" dur="0.6s" repeatCount="indefinite" />
              <animate attributeName="y" values="4;6;4" dur="0.6s" repeatCount="indefinite" />
            </rect>
            <rect x="9" y="5" width="2" height="6" rx="1" fill="rgba(27,138,143,0.8)">
              <animate attributeName="height" values="6;10;6" dur="0.7s" repeatCount="indefinite" />
              <animate attributeName="y" values="5;3;5" dur="0.7s" repeatCount="indefinite" />
            </rect>
            <rect x="13" y="6" width="2" height="4" rx="1" fill="rgba(27,138,143,0.8)">
              <animate attributeName="height" values="4;8;4" dur="0.9s" repeatCount="indefinite" />
              <animate attributeName="y" values="6;4;6" dur="0.9s" repeatCount="indefinite" />
            </rect>
          </svg>
        ) : (
          // Sound off — static bars
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="1" y="7" width="2" height="2" rx="1" fill="rgba(221,216,206,0.3)" />
            <rect x="5" y="6" width="2" height="4" rx="1" fill="rgba(221,216,206,0.3)" />
            <rect x="9" y="7" width="2" height="2" rx="1" fill="rgba(221,216,206,0.3)" />
            <rect x="13" y="6" width="2" height="4" rx="1" fill="rgba(221,216,206,0.3)" />
          </svg>
        )}
      </button>
    </>
  )
}
