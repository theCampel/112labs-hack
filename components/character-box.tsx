"use client"



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
  const getNameTagColor = (color: string) => {
    switch (color) {
      case "pink":
        return "mario-name-tag-pink"
      case "brown":
        return "mario-name-tag-brown"
      case "green":
        return "mario-name-tag-green"
      default:
        return "mario-name-tag"
    }
  }

  return (
    <div className="relative">
      <div className="mario-video-container">
        {/* Full-size Character Display */}
        <div className={`mario-video-frame ${isActive ? "mario-speaking-active" : ""}`}>
          {character.photo ? (
            // Show profile photo (always, whether speaking or not)
            <img 
              src={character.photo} 
              alt={character.name}
              className="w-full h-full object-cover"
              onError={() => {
                console.log(`Failed to load photo for ${character.name}, using emoji fallback`)
              }}
            />
          ) : (
            // Fallback to emoji if no photo - static, not animated
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-gray-200 to-gray-400">
              <span className="text-8xl">{character.avatar}</span>
            </div>
          )}
        </div>

        {/* Name Tag at Bottom */}
        <div className={`mario-name-tag ${getNameTagColor(character.color)}`}>
          <span className="mario-avatar-small">{character.avatar}</span>
          {character.name} ({character.role})
        </div>
      </div>
    </div>
  )
}
