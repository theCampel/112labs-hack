"use client"

import { useRef, useEffect, useState } from "react"

export function Webcam() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setIsActive(true)
        }
      } catch (err) {
        console.error("Error accessing webcam:", err)
        setError("Unable to access webcam")
      }
    }

    startWebcam()

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  if (error) {
    return (
      <div className="mario-video-error">
        <div className="mario-error-icon">📷</div>
        <p className="mario-error-text">{error}</p>
      </div>
    )
  }

  return (
    <div className="mario-video-frame">
      <video ref={videoRef} autoPlay muted playsInline className="mario-video" />

      {/* Mario Hat Overlay */}
      <div className="mario-hat-overlay">
        <div className="mario-hat">
          <span className="mario-hat-m">M</span>
        </div>
      </div>

      {/* Pixelated Border Effect */}
      <div className="mario-video-border"></div>
    </div>
  )
}
