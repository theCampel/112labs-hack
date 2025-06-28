"use client"

import { useState } from "react"
import { ElevenLabsConversation } from "@/components/elevenlabs-conversation"
import { Webcam } from "@/components/webcam"
import { CharacterBox } from "@/components/character-box"
import { MarioUI } from "@/components/mario-ui"
import { BackgroundMusic } from "@/components/background-music"

const characters = [
  {
    id: "peach",
    name: "PRINCESS PEACH",
    role: "MARKETING DIRECTOR",
    avatar: "👑",
    color: "pink",
    photo: "/peach-profile.jpg", // Add your uploaded photo here
  },
  {
    id: "bowser",
    name: "BOWSER",
    role: "ENGINEERING LEAD",
    avatar: "🦍",
    color: "brown",
    photo: "/bowser-profile.jpg", // Add your uploaded photo here
  },
  {
    id: "luigi",
    name: "LUIGI",
    role: "PERSONAL ASSISTANT",
    avatar: "👨‍🔧",
    color: "green",
    photo: "/luigi-profile.jpg", // Add your uploaded photo here
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
      {/* Mario World Background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: `url('/mario-bg.png')`,
          imageRendering: "pixelated",
        }}
      />

      {/* Pixelated Clouds */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="mario-cloud absolute top-12 left-16"></div>
        <div className="mario-cloud absolute top-24 right-20"></div>
        <div className="mario-cloud absolute top-40 left-1/3"></div>
        <div className="mario-cloud absolute top-16 right-1/3"></div>
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
        {/* Video Grid - Mario Style Platforms */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Mario (User) - Live Webcam */}
          <div className="mario-platform">
            <div className="mario-pipe-top"></div>
            <div className="mario-video-container">
              <Webcam />
              <div className="mario-name-tag mario-name-tag-red">
                <span className="mario-m-small">M</span>
                MARIO (CEO)
              </div>
            </div>
          </div>

          {/* Princess Peach */}
          <div className="mario-platform">
            <div className="mario-pipe-top mario-pipe-pink"></div>
            <CharacterBox
              character={characters[0]}
              isActive={currentSpeaker === characters[0].id}
              onAction={(action) => handleCharacterAction(characters[0].id, action)}
            />
          </div>

          {/* Donkey Kong */}
          <div className="mario-platform">
            <div className="mario-pipe-top mario-pipe-brown"></div>
            <CharacterBox
              character={characters[1]}
              isActive={currentSpeaker === characters[1].id}
              onAction={(action) => handleCharacterAction(characters[1].id, action)}
            />
          </div>

          {/* Luigi */}
          <div className="mario-platform">
            <div className="mario-pipe-top mario-pipe-green"></div>
            <CharacterBox
              character={characters[2]}
              isActive={currentSpeaker === characters[2].id}
              onAction={(action) => handleCharacterAction(characters[2].id, action)}
            />
          </div>
        </div>

        {/* Question Block - AI Conversation Control */}
        <div className="mario-question-block mb-8">
          <div className="mario-question-mark">?</div>
          <div className="mario-block-content">
            <h2 className="mario-block-title">🎤 AI CONVERSATION CONTROL</h2>
            <ElevenLabsConversation
              agentId={process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || "your-agent-id"}
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
                if (message.message && speaker) {
                  const characterName = characters.find(c => c.id === speaker)?.name || speaker
                  setTranscript((prev) => [...prev, `${characterName}: ${message.message}`])
                  setCoins((prev) => prev + 50)
                }
              }}
              onError={(error) => {
                console.error("ElevenLabs error:", error)
              }}
            />
          </div>
        </div>

        {/* Mario UI Components */}
        <MarioUI
          transcript={transcript}
          currentSpeaker={currentSpeaker}
          onClearTranscript={() => setTranscript([])}
          coins={coins}
          lives={lives}
        />
      </main>

      {/* Ground/Footer */}
      <footer className="relative z-10 mario-ground">
        <div className="mario-ground-pattern"></div>
        <div className="container mx-auto px-4 py-4 text-center">
          <p className="mario-footer-text">🍄 POWERED BY ELEVENLABS AI • PRESS ⬅️➡️ TO SWITCH SPEAKERS</p>
        </div>
      </footer>
    </div>
  )
}
