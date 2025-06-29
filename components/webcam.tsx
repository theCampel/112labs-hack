"use client"

import { useRef, useEffect, useState } from "react"

export function Webcam() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown')

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        // Check if permissions API is available
        if ('permissions' in navigator) {
          const permission = await navigator.permissions.query({ name: 'camera' as PermissionName })
          setPermissionState(permission.state as 'prompt' | 'granted' | 'denied')
          
          // Listen for permission changes
          permission.onchange = () => {
            setPermissionState(permission.state as 'prompt' | 'granted' | 'denied')
          }
        }
      } catch (err) {
        console.log("Permissions API not available")
      }
    }

    checkPermissions()
  }, [])

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
          setError(null)
        }
      } catch (err) {
        console.error("Error accessing webcam:", err)
        
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setError("Camera access denied. Please allow camera permissions and refresh the page.")
          } else if (err.name === 'NotFoundError') {
            setError("No camera found. Please connect a camera and try again.")
          } else if (err.name === 'NotReadableError') {
            setError("Camera is already in use by another application.")
          } else {
            setError("Unable to access webcam. Please check your camera settings.")
          }
        } else {
          setError("Unable to access webcam")
        }
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

  const handleRetry = () => {
    setError(null)
    // Trigger useEffect to restart webcam
    window.location.reload()
  }

  if (error) {
    return (
      <div className="mario-video-error">
        <div className="mario-error-icon">📷</div>
        <p className="mario-error-text">{error}</p>
        {error.includes("denied") && (
          <div className="mario-permission-help">
            <p className="mario-help-text">To fix this:</p>
            <ol className="mario-help-steps">
              <li>Look for a camera icon in your browser's address bar</li>
              <li>Click it and select "Allow"</li>
              <li>Or go to your browser settings and allow camera access for this site</li>
              <li>Refresh the page after granting permission</li>
            </ol>
            <button onClick={handleRetry} className="mario-retry-button">
              Try Again
            </button>
          </div>
        )}
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