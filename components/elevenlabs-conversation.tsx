"use client"

import { useConversation } from '@elevenlabs/react'
import { useCallback, useState, useEffect, useRef } from 'react'

// This is a placeholder for the actual ElevenLabs integration
// Replace this with the correct ElevenLabs React SDK import once available

interface ConversationMessage {
  message?: string
  speaker?: string
  source?: any
}

interface ElevenLabsConversationProps {
  agentId: string
  onConnect?: () => void
  onDisconnect?: () => void
  onMessage?: (message: ConversationMessage) => void
  onError?: (error: any) => void
  hideUI?: boolean
  isMuted?: boolean
  onMethodsReady?: (methods: { startConversation: () => Promise<void>, stopConversation: () => Promise<void> }) => void
}

export function ElevenLabsConversation({
  agentId,
  onConnect,
  onDisconnect,
  onMessage,
  onError,
  hideUI = false,
  isMuted = false,
  onMethodsReady,
}: ElevenLabsConversationProps) {
  const [isStarting, setIsStarting] = useState(false)
  const conversationRef = useRef<any>(null)
  
  const conversation = useConversation({
    micMuted: isMuted,
    onConnect: () => {
      console.log('🟢 Mario Team Connected!')
      onConnect?.()
    },
    onDisconnect: () => {
      console.log('🔴 Mario Team Disconnected')
      onDisconnect?.()
    },
    onMessage: (message) => {
      console.log('💬 Message from Mario Team:', message)
      onMessage?.(message)
    },
    onError: (error) => {
      console.error('❌ Mario Team Error:', error)
      onError?.(error)
    },
  })

  // Store conversation in ref for stable access
  useEffect(() => {
    conversationRef.current = conversation
  }, [conversation])

  // Function to get signed URL for private agents
  const getSignedUrl = async (): Promise<string> => {
    const response = await fetch("/api/get-signed-url")
    if (!response.ok) {
      throw new Error(`Failed to get signed URL: ${response.statusText}`)
    }
    const { signedUrl } = await response.json()
    return signedUrl
  }

  // Create stable wrapper functions that use the ref
  const startConversation = useCallback(async () => {
    try {
      setIsStarting(true)
      
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true })

      // Check if we need to use signed URL for private agents
      const useSignedUrl = process.env.NEXT_PUBLIC_USE_SIGNED_URL === 'true'
      
      if (useSignedUrl) {
        // For private agents, get signed URL
        const signedUrl = await getSignedUrl()
        await conversationRef.current?.startSession({
          signedUrl,
        })
      } else {
        // For public agents, use agent ID directly
        await conversationRef.current?.startSession({
          agentId,
        })
      }
    } catch (error) {
      console.error('Failed to start Mario conversation:', error)
      onError?.(error)
    } finally {
      setIsStarting(false)
    }
  }, [agentId, onError])

  const stopConversation = useCallback(async () => {
    await conversationRef.current?.endSession()
  }, [])

  // Expose methods to parent component - only call once since methods are now stable
  useEffect(() => {
    onMethodsReady?.({
      startConversation,
      stopConversation,
    })
  }, []) // Empty dependency array since methods are now stable

  if (hideUI) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div 
            className={`w-4 h-4 rounded-full ${
              conversation.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="font-bold mario-title text-white">
            Status: {conversation.status.toUpperCase()}
          </span>
        </div>
        
        <div className="text-sm mario-subtitle">
          Agent: {conversation.isSpeaking ? '🗣️ Speaking' : '👂 Listening'}
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={startConversation}
          disabled={conversation.status === 'connected' || isStarting}
          className="mario-button mario-button-green"
        >
          {isStarting ? '🍄 Starting...' : '🎤 Start Meeting'}
        </button>

        <button
          onClick={stopConversation}
          disabled={conversation.status !== 'connected'}
          className="mario-button mario-button-red"
        >
          🛑 End Meeting
        </button>
      </div>

      <div className="mario-question-block">
        <div className="mario-question-mark">🎤</div>
        <div className="mario-block-content">
          <h4 className="mario-block-title">🏰 Super Mario AI Boardroom</h4>
          <ul className="text-sm space-y-1 mario-character-role">
            <li>• Click "Start Meeting" to begin voice conversation</li>
            <li>• Speak naturally with Princess Peach, Donkey Kong, and Luigi</li>
            <li>• Watch character boxes light up when they respond</li>
            <li>• Ask them about marketing, engineering, or meeting notes!</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
