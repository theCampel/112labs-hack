"use client"

import { useState } from "react"

interface ConversationMessage {
  message?: string
  speaker?: string
  source?: {
    voice_id?: string
  }
}

interface MockConversationProps {
  agentId: string
  onConnect?: () => void
  onDisconnect?: () => void
  onMessage?: (message: ConversationMessage) => void
  onError?: (error: any) => void
}

export function MockConversation({ agentId, onConnect, onDisconnect, onMessage, onError }: MockConversationProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

  // Mock conversation data
  const mockResponses = [
    { speaker: "peach", message: "Marketing metrics are looking fantastic! Website traffic is up 34%!" },
    { speaker: "bowser", message: "The new feature deployment is ready to go live!" },
    { speaker: "luigi", message: "I've updated all the meeting notes and action items!" },
    { speaker: "peach", message: "Should we post about our success on LinkedIn?" },
    { speaker: "bowser", message: "I can push the code changes right now if you'd like!" },
  ]

  const handleConnect = () => {
    setIsConnected(true)
    onConnect?.()

    // Simulate periodic AI responses
    let responseIndex = 0
    const interval = setInterval(() => {
      if (responseIndex < mockResponses.length) {
        const response = mockResponses[responseIndex]
        onMessage?.({
          message: response.message,
          speaker: response.speaker,
          source: { voice_id: response.speaker },
        })
        responseIndex++
      } else {
        clearInterval(interval)
      }
    }, 5000) // Send a message every 5 seconds

    // Clean up interval after 30 seconds
    setTimeout(() => {
      clearInterval(interval)
    }, 30000)
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setIsRecording(false)
    onDisconnect?.()
  }

  const toggleRecording = () => {
    if (!isConnected) {
      handleConnect()
    }
    setIsRecording(!isRecording)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-4 h-4 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
          <span className="font-bold">Status: {isConnected ? "Connected" : "Disconnected"}</span>
        </div>

        <div className="text-sm text-gray-600">Agent ID: {agentId.slice(0, 8)}...</div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={handleConnect}
          disabled={isConnected}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg border-2 border-green-700 transition-colors pixel-font"
        >
          {isConnected ? "Connected" : "Connect"}
        </button>

        <button
          onClick={handleDisconnect}
          disabled={!isConnected}
          className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg border-2 border-red-700 transition-colors pixel-font"
        >
          Disconnect
        </button>

        <button
          onClick={toggleRecording}
          disabled={!isConnected}
          className={`${
            isRecording ? "bg-red-500 hover:bg-red-600 border-red-700" : "bg-blue-500 hover:bg-blue-600 border-blue-700"
          } disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg border-2 transition-colors pixel-font`}
        >
          {isRecording ? "🛑 Stop" : "🎤 Start"} Recording
        </button>
      </div>

      {isRecording && (
        <div className="bg-red-100 border-2 border-red-400 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-700 font-bold">Recording... Speak to Mario's AI team!</span>
          </div>
        </div>
      )}

      <div className="bg-gray-100 rounded-lg p-4 border-2 border-gray-300">
        <h4 className="font-bold mb-2 pixel-font">💡 Demo Instructions:</h4>
        <ul className="text-sm space-y-1 text-gray-700">
          <li>• Click "Connect" to start the AI conversation</li>
          <li>• Characters will automatically respond every 5 seconds</li>
          <li>• Watch the character boxes light up when they speak</li>
          <li>• Replace this with real ElevenLabs integration</li>
        </ul>
      </div>
    </div>
  )
}
