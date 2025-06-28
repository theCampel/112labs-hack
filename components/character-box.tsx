"use client"

import { useState, useEffect } from "react"

interface Character {
  id: string
  name: string
  role: string
  avatar: string
  color: string
  photo?: string
}

interface CharacterBoxProps {
  character: Character
  isActive: boolean
  onAction: (action: string) => void
}

export function CharacterBox({ character, isActive, onAction }: CharacterBoxProps) {
  const [showPowerUp, setShowPowerUp] = useState(false)

  useEffect(() => {
    if (isActive) {
      setShowPowerUp(true)
      const timer = setTimeout(() => setShowPowerUp(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [isActive])

  const getCharacterTheme = (color: string) => {
    switch (color) {
      case "pink":
        return "mario-character-pink"
      case "brown":
        return "mario-character-brown"
      case "green":
        return "mario-character-green"
      default:
        return "mario-character-default"
    }
  }

  return (
    <div className="relative">
      <div
        className={`mario-character-box ${getCharacterTheme(character.color)} ${isActive ? "mario-character-active" : ""}`}
      >
        {/* Character Avatar */}
        <div className="mario-character-avatar">
          <div className="mario-avatar-circle">
            {isActive ? (
              // Show animated emoji when speaking
              <span className="mario-avatar-emoji">{character.avatar}</span>
            ) : character.photo ? (
              // Show profile photo when not speaking (like Zoom muted state)
              <img 
                src={character.photo} 
                alt={character.name}
                className="w-full h-full object-cover rounded-full"
                onError={() => {
                  // Fallback handled by React state
                  console.log(`Failed to load photo for ${character.name}, using emoji fallback`)
                }}
              />
            ) : (
              // Fallback to emoji if no photo
              <span className="mario-avatar-emoji">{character.avatar}</span>
            )}
          </div>

          {/* Speaking Indicator */}
          {isActive && (
            <div className="mario-speaking-indicator">
              <div className="mario-sound-wave"></div>
              <div className="mario-sound-wave"></div>
              <div className="mario-sound-wave"></div>
            </div>
          )}
        </div>

        {/* Character Info */}
        <div className="mario-character-info">
          <div className="mario-character-name">{character.name}</div>
          <div className="mario-character-role">{character.role}</div>
        </div>

        {/* Power-up Effect */}
        {showPowerUp && (
          <div className="mario-powerup-effect">
            <div className="mario-star">⭐</div>
            <div className="mario-mushroom">🍄</div>
            <div className="mario-coin-effect">🪙</div>
          </div>
        )}

        {/* Speech Bubble */}
        {isActive && (
          <div className="mario-speech-bubble">
            <div className="mario-speech-content">
              {character.id === "peach" && "🎯 MARKETING MAGIC! 📈"}
              {character.id === "bowser" && "💻 ENGINEERING POWER! 🚀"}
              {character.id === "luigi" && "📝 ASSISTANT MODE! ✨"}
            </div>
            <div className="mario-speech-tail"></div>
          </div>
        )}
      </div>
    </div>
  )
}
