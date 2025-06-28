"use client"

import { useState } from "react"

interface MarioUIProps {
  transcript: string[]
  currentSpeaker: string | null
  onClearTranscript: () => void
  coins: number
  lives: number
}

export function MarioUI({ transcript, currentSpeaker, onClearTranscript, coins, lives }: MarioUIProps) {
  const [showTranscript, setShowTranscript] = useState(false)

  return (
    <div className="space-y-6">
      {/* Control Blocks */}
      <div className="mario-control-panel">
        <div className="mario-control-title">🎮 MARIO'S CONTROL PANEL</div>

        <div className="mario-control-buttons">
          <button onClick={() => setShowTranscript(!showTranscript)} className="mario-button mario-button-green">
            {showTranscript ? "HIDE" : "SHOW"} TRANSCRIPT
          </button>

          <button onClick={onClearTranscript} className="mario-button mario-button-red">
            CLEAR HISTORY
          </button>

          <button className="mario-button mario-button-blue">END MEETING</button>
        </div>
      </div>

      {/* Transcript Block */}
      {showTranscript && (
        <div className="mario-transcript-block">
          <div className="mario-transcript-header">
            <span className="mario-transcript-icon">📝</span>
            MEETING TRANSCRIPT
          </div>

          <div className="mario-transcript-content">
            {transcript.length === 0 ? (
              <p className="mario-transcript-empty">NO CONVERSATION YET...</p>
            ) : (
              transcript.map((entry, index) => (
                <div key={index} className="mario-transcript-entry">
                  <div className="mario-transcript-bubble">{entry}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Current Speaker Block */}
      {currentSpeaker && (
        <div className="mario-speaker-block">
          <div className="mario-speaker-indicator"></div>
          <span className="mario-speaker-text">CURRENTLY SPEAKING: {currentSpeaker.toUpperCase()}</span>
        </div>
      )}

      {/* Power-Up Stats */}
      <div className="mario-stats-grid">
        <div className="mario-stat-block mario-stat-mushroom">
          <div className="mario-stat-icon">🍄</div>
          <div className="mario-stat-label">POWER-UPS</div>
          <div className="mario-stat-number">{transcript.length.toString().padStart(2, "0")}</div>
        </div>

        <div className="mario-stat-block mario-stat-coin">
          <div className="mario-stat-icon mario-coin-spin">🪙</div>
          <div className="mario-stat-label">COINS EARNED</div>
          <div className="mario-stat-number">{coins.toString().padStart(6, "0")}</div>
        </div>

        <div className="mario-stat-block mario-stat-star">
          <div className="mario-stat-icon mario-star-twinkle">⭐</div>
          <div className="mario-stat-label">MEETING SCORE</div>
          <div className="mario-stat-number">
            {Math.min(transcript.length * 50, 9999)
              .toString()
              .padStart(4, "0")}
          </div>
        </div>
      </div>
    </div>
  )
}
