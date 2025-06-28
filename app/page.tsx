"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ElevenLabsConversation } from "@/components/elevenlabs-conversation"
import { Webcam } from "@/components/webcam"
import { CharacterBox } from "@/components/character-box"

import { BackgroundMusic } from "@/components/background-music"

const characters = [
  {
    id: "peach",
    name: "PRINCESS PEACH",
    role: "MARKETING DIRECTOR",
    avatar: "👑",
    color: "pink",
    photo: "/assets/characters/peach-profile.jpg",
  },
  {
    id: "bowser",
    name: "BOWSER",
    role: "ENGINEERING LEAD",
    avatar: "🐢",
    color: "brown",
    photo: "/assets/characters/bowser-profile.jpg",
  },
  {
    id: "luigi",
    name: "LUIGI",
    role: "PERSONAL ASSISTANT",
    avatar: "👨‍🔧",
    color: "green",
    photo: "/assets/characters/luigi-profile.jpg",
  },
]

// Helper function to map voice IDs to character names
const getCharacterFromRawMessage = (message: string = ''): string | null => {
  // For now, ElevenLabs might be returning "ai" for all non-default voices
  // We'll need to determine the character based on message content or other logic
  // You can update this based on your actual ElevenLabs setup
  // Try to determine character from message content keywords
  const lowerMessage = message.toLowerCase()
  console.log('🎯 Detected message:', lowerMessage)
  if(lowerMessage.includes('luigi')) {
    return 'luigi'
  }
  if(lowerMessage.includes('peach')) {
    return 'peach'
  }
  if(lowerMessage.includes('bowser')) {
    return 'bowser'
  }
  return 'luigi'
}

export default function MarioBoardroom() {
  const [currentSpeaker, setCurrentSpeaker] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [transcript, setTranscript] = useState<string[]>([])
  const [isMuted, setIsMuted] = useState(true)
  const [coins, setCoins] = useState(1670)
  const [lives, setLives] = useState(6)
  const [marioIsSpeaking, setMarioIsSpeaking] = useState(false)
  const [activeSpeakers, setActiveSpeakers] = useState<Set<string>>(new Set())
  const [speakerTimeouts, setSpeakerTimeouts] = useState<Map<string, NodeJS.Timeout>>(new Map())
  const [conversationMethods, setConversationMethods] = useState<{
    startConversation: () => Promise<void>
    stopConversation: () => Promise<void>
  } | null>(null)

  // Speaker management functions
  const addActiveSpeaker = (speakerId: string) => {
    setActiveSpeakers(prev => new Set([...prev, speakerId]))
    
    // Clear existing timeout for this speaker
    const existingTimeout = speakerTimeouts.get(speakerId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }
  }

  const removeActiveSpeakerWithDelay = (speakerId: string) => {
    // Clear any existing timeout
    const existingTimeout = speakerTimeouts.get(speakerId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // Set new timeout to remove speaker after 2 seconds
    const timeout = setTimeout(() => {
      setActiveSpeakers(prev => {
        const newSet = new Set(prev)
        newSet.delete(speakerId)
        return newSet
      })
      setSpeakerTimeouts(prev => {
        const newMap = new Map(prev)
        newMap.delete(speakerId)
        return newMap
      })
    }, 2000)

    setSpeakerTimeouts(prev => new Map([...prev, [speakerId, timeout]]))
  }

  // Voice activity detection for Mario (visual indicators only)
  const detectMarioVoiceActivity = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)
      
      analyser.fftSize = 256
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      
      microphone.connect(analyser)

      const checkAudioLevel = () => {
        analyser.getByteFrequencyData(dataArray)
        
        // Calculate average volume
        const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength
        // When muted, still show visual indicators but ElevenLabs won't receive audio
        const isSpeaking = isMuted ? false : average > 20 // Don't show speaking when muted
        
        if (isSpeaking !== marioIsSpeaking) {
          setMarioIsSpeaking(isSpeaking)
          
          if (isSpeaking) {
            addActiveSpeaker('mario')
          } else {
            removeActiveSpeakerWithDelay('mario')
          }
        }
        
        requestAnimationFrame(checkAudioLevel)
      }
      
      checkAudioLevel()
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  // Initialize voice detection when connected
  useEffect(() => {
    if (isConnected) {
      detectMarioVoiceActivity()
    }
  }, [isConnected])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      // Clear all timeouts when component unmounts
      speakerTimeouts.forEach(timeout => clearTimeout(timeout))
    }
  }, [])

  // Memoize the methods ready callback to prevent infinite re-renders
  const handleMethodsReady = useCallback((methods: {
    startConversation: () => Promise<void>
    stopConversation: () => Promise<void>
  }) => {
    setConversationMethods(methods)
  }, [])

  // Mock API calls for character actions
  const handleCharacterAction = async (character: string, action: string) => {
    try {
      const response = await fetch("/api/character-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ character, action }),
      })
      const result = await response.json()
      console.log("Character action result:", result)

      // Add coins when actions are performed
      setCoins((prev) => prev + 100)
    } catch (error) {
      console.error("Character action failed:", error)
    }
  }

  return (
    <div className="min-h-screen mario-world-bg relative overflow-hidden">
      {/* Floating Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="mario-cloud absolute top-12 left-16" style={{animationDelay: '0s'}}></div>
        <div className="mario-cloud absolute top-24 right-20" style={{animationDelay: '2s'}}></div>
        <div className="mario-cloud absolute top-40 left-1/3" style={{animationDelay: '4s'}}></div>
        <div className="mario-cloud absolute top-16 right-1/3" style={{animationDelay: '1s'}}></div>
        <div className="mario-cloud absolute bottom-40 left-1/4" style={{animationDelay: '3s'}}></div>
        <div className="mario-cloud absolute bottom-20 right-1/4" style={{animationDelay: '5s'}}></div>
      </div>

      <BackgroundMusic isMuted={isMuted} />

      {/* Mario Game Header */}
      <header className="relative z-10 mario-header">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left Side - Mario Logo & Info */}
            <div className="flex items-center space-x-4">
              <div className="mario-logo">
                <span className="mario-m">M</span>
              </div>
              <div>
                <h1 className="mario-title">SUPER MARIO INC.</h1>
                <p className="mario-subtitle">WORLD 1-1 BOARD MEETING</p>
              </div>
            </div>

            {/* Right Side - Game Stats */}
            <div className="flex items-center space-x-6">
              <div className="mario-stat">
                <span className="mario-stat-label">MARIO</span>
                <div className="mario-stat-value">×{lives.toString().padStart(2, "0")}</div>
              </div>
              <div className="mario-stat">
                <span className="mario-coin">🪙</span>
                <span className="mario-stat-value">{coins.toString().padStart(8, "0")}</span>
              </div>
              <div className="mario-stat">
                <span className="mario-stat-label">TIME</span>
                <div className="mario-stat-value">373</div>
              </div>
              <button onClick={() => setIsMuted(!isMuted)} className="mario-button-small">
                {isMuted ? "🔇" : "🔊"}
              </button>
              <div className={`mario-status ${isConnected ? "connected" : "disconnected"}`}>
                {isConnected ? "🟢 CONNECTED" : "🔴 DISCONNECTED"}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="relative z-10 container mx-auto px-4 py-6">
        {/* Modern Video Grid */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Mario (User) - Live Webcam */}
          <div className={`mario-video-container ${activeSpeakers.has('mario') ? 'speaking' : ''}`}>
            <div className="mario-video-frame">
              <Webcam />
            </div>
            <div className="mario-name-tag mario-name-tag-red">
              <span className="mario-m-small">M</span>
              MARIO (CEO)
              {activeSpeakers.has('mario') && <span className="speaking-indicator"> • SPEAKING</span>}
            </div>
          </div>

          {/* Princess Peach */}
          <CharacterBox
            character={characters[0]}
            isActive={activeSpeakers.has(characters[0].id)}
            onAction={(action) => handleCharacterAction(characters[0].id, action)}
          />

          {/* Bowser */}
          <CharacterBox
            character={characters[1]}
            isActive={activeSpeakers.has(characters[1].id)}
            onAction={(action) => handleCharacterAction(characters[1].id, action)}
          />

          {/* Luigi */}
          <CharacterBox
            character={characters[2]}
            isActive={activeSpeakers.has(characters[2].id)}
            onAction={(action) => handleCharacterAction(characters[2].id, action)}
          />
        </div>

        {/* Video Call Controls */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="call-controls-container">
            <div className="flex items-center space-x-4">
              {/* Mute/Unmute */}
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`call-control-btn ${isMuted ? 'muted' : 'unmuted'}`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2s-2-.9-2-2V4c0-1.1.9-2 2-2zm5.3 6.7c0 3-2.54 5.1-5.3 5.1S6.7 11.7 6.7 8.7H5c0 3.41 2.72 6.23 6 6.72V17h2v-1.58c3.28-.49 6-3.31 6-6.72h-1.7z"/>
                  </svg>
                )}
              </button>

              {/* Video On/Off */}
              <button 
                className="call-control-btn video-btn"
                title="Toggle Video"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                </svg>
              </button>

              {/* Screen Share */}
              <button 
                className="call-control-btn screen-share-btn"
                title="Share Screen"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.11-.9-2-2-2H4c-1.11 0-2 .89-2 2v10c0 1.1.89 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>
                </svg>
              </button>

              {/* Participants */}
              <button 
                className="call-control-btn participants-btn"
                title="Participants"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63c-.34-1.02-1.28-1.74-2.46-1.74s-2.12.72-2.46 1.74L12.5 16H15v6h5zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zm1.5 1h-4c-.83 0-1.5.67-1.5 1.5v6h2v7h3v-7h2v-6c0-.83-.67-1.5-1.5-1.5zM6.5 6C7.33 6 8 5.33 8 4.5S7.33 3 6.5 3 5 3.67 5 4.5 5.67 6 6.5 6zm2.5 6h-4C4.17 12 3.5 12.67 3.5 13.5v6H6v7h3v-7h2.5v-6C11.5 12.67 10.83 12 10 12z"/>
                </svg>
                <span className="participants-count">4</span>
              </button>

              {/* Chat */}
              <button 
                className="call-control-btn chat-btn"
                title="Chat"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                </svg>
              </button>

              {/* Join/Leave Call */}
              <button 
                onClick={async () => {
                  if (isConnected && conversationMethods) {
                    // Leave call logic
                    try {
                      await conversationMethods.stopConversation()
                      setActiveSpeakers(new Set())
                      setCurrentSpeaker(null)
                    } catch (error) {
                      console.error('Failed to leave call:', error)
                    }
                  } else if (!isConnected && conversationMethods) {
                    // Join call logic
                    try {
                      await conversationMethods.startConversation()
                    } catch (error) {
                      console.error('Failed to join call:', error)
                    }
                  }
                }}
                disabled={!conversationMethods}
                className={`call-control-btn ${isConnected ? 'leave-call' : 'join-call'}`}
                title={isConnected ? 'Leave Call' : 'Join Call'}
              >
{!conversationMethods ? (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Loading...</span>
                  </>
                ) : isConnected ? (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.7l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.1-.7-.28-.79-.73-1.68-1.36-2.66-1.85-.33-.16-.56-.51-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
                    </svg>
                    <span>Leave</span>
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                    </svg>
                    <span>Join</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Hidden ElevenLabs Conversation Control */}
        <div>
          <ElevenLabsConversation
            agentId={process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || "your-agent-id"}
            hideUI={true}
            isMuted={isMuted}
            onMethodsReady={handleMethodsReady}
            onConnect={() => {
              setIsConnected(true)
              setCoins((prev) => prev + 200)
            }}
            onDisconnect={() => setIsConnected(false)}
            onMessage={(message) => {
              const rawSpeaker = message.source?.voice_id || message.speaker
              console.log('🎯 Detected raw speaker:', rawSpeaker)
              console.log('🎯 Detected message:', message.message)
              const speaker = getCharacterFromRawMessage(message.message)
              setCurrentSpeaker(speaker)
              console.log('🎯 Detected speaker:', speaker, 'from voice_id:', rawSpeaker)
              
              // Use new speaker management system
              if (speaker) {
                addActiveSpeaker(speaker)
                
                // Also set a timeout to remove the speaker after 3 seconds
                // This handles cases where we don't get explicit "end" events
                setTimeout(() => {
                  removeActiveSpeakerWithDelay(speaker)
                }, 3000)
              }
              
              if (message.message && speaker) {
                const characterName = characters.find(c => c.id === speaker)?.name || speaker
                setTranscript((prev) => [...prev, `${characterName}: ${message.message}`])
                setCoins((prev) => prev + 50)
              }
              
              // The speaker timeout will be handled by a separate mechanism
              // when the agent stops speaking
            }}
            onError={(error) => {
              console.error("ElevenLabs error:", error)
            }}
          />
        </div>


      </main>

      {/* Ground/Footer */}
      <footer className="relative z-10 mario-ground">
        <div className="mario-ground-pattern"></div>
        <div className="container mx-auto px-4 py-4 text-center">
          <p className="mario-footer-text">🍄 POWERED BY ELEVENLABS AI</p>
        </div>
      </footer>
    </div>
  )
}
