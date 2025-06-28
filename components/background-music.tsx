"use client"

import { useRef, useEffect } from "react"

interface BackgroundMusicProps {
  isMuted: boolean
}

export function BackgroundMusic({ isMuted }: BackgroundMusicProps) {
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.1 // Very low volume
      if (!isMuted) {
        audioRef.current.play().catch(console.error)
      } else {
        audioRef.current.pause()
      }
    }
  }, [isMuted])

  return (
    <audio ref={audioRef} loop preload="auto" className="hidden">
      {/* You would add your Mario theme music file here */}
      <source src="/mario-theme.mp3" type="audio/mpeg" />
    </audio>
  )
}
