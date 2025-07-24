"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ChevronRight, ChevronUp, ChevronDown, Play, RotateCcw } from "lucide-react"

interface LockInProps {
  resetTrigger?: boolean
  onResetHandled?: () => void
}

const TIME_OPTIONS = [
  { label: "00:30:00", minutes: 30, seconds: 1800 },
  { label: "01:00:00", minutes: 60, seconds: 3600 },
  { label: "01:30:00", minutes: 90, seconds: 5400 },
  { label: "02:00:00", minutes: 120, seconds: 7200 },
  { label: "02:30:00", minutes: 150, seconds: 9000 },
  { label: "03:00:00", minutes: 180, seconds: 10800 },
  { label: "03:30:00", minutes: 210, seconds: 12600 },
  { label: "04:00:00", minutes: 240, seconds: 14400 },
]

const MOTIVATIONAL_QUOTES = [
  "\"Deep work is like a superpower in our increasingly competitive economy.\"",
  "\"The ability to focus is becoming increasingly rare and increasingly valuable.\"", 
  "\"Concentration is the secret of strength in politics, in war, in trade, in short in all management.\"",
  "\"Focus on being productive instead of busy.\"",
  "\"The successful warrior is the average person with laser-like focus.\"",
  "\"Where focus goes, energy flows and results show.\"",
  "\"It is during our darkest moments that we must focus to see the light.\"",
  "\"Lack of direction, not lack of time, is the problem.\"",
  "\"The art of being wise is knowing what to overlook.\"",
  "\"Concentrate all your thoughts upon the work at hand.\""
]

export const LockIn = ({ resetTrigger, onResetHandled }: LockInProps) => {
  const [session, setSession] = useState<any>(null)
  const [step, setStep] = useState(1)
  const [textInput, setTextInput] = useState<string>("")
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(2)
  const [currentQuote, setCurrentQuote] = useState("")

  const fetchSession = () => {
    chrome.runtime.sendMessage({ type: "GET_SESSION" }, (response: { session: any }) => {
      setSession(response?.session)
    })
  }

  useEffect(() => {
    fetchSession()
    const interval = setInterval(fetchSession, 1000)
    setCurrentQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)])
    return () => clearInterval(interval)
  }, [])

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      setStep(2)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && textInput.trim()) {
      setStep(2)
    }
  }

  const incrementTime = () => {
    setSelectedTimeIndex((prev) => (prev < TIME_OPTIONS.length - 1 ? prev + 1 : prev))
  }

  const decrementTime = () => {
    setSelectedTimeIndex((prev) => (prev > 0 ? prev - 1 : prev))
  }

  const handleFinalSubmit = () => {
    const selectedTime = TIME_OPTIONS[selectedTimeIndex]
    const totalSeconds = selectedTime.minutes * 60
    chrome.runtime.sendMessage(
      {
        type: "START_SESSION",
        payload: { textInput, durationSeconds: totalSeconds },
      },
      () => {
        fetchSession()
        setStep(1)
        setTextInput("")
        setSelectedTimeIndex(2)
        setCurrentQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)])
      },
    )
  }

  const handleReset = () => chrome.runtime.sendMessage({ type: "RESET_SESSION" }, fetchSession)

  const getRemainingTime = () => {
    if (!session) return "00:00:00"
    let remaining = 0
    if (session.stage === "ACTIVE" && session.endTime) {
      remaining = Math.max(0, Math.floor((session.endTime - Date.now()) / 1000))
    }
    const hrs = Math.floor(remaining / 3600)
    const mins = Math.floor((remaining % 3600) / 60)
    const secs = remaining % 60
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  useEffect(() => {
    if (resetTrigger) {
      handleReset()
      onResetHandled?.()
    }
  }, [resetTrigger])

  return (
    <div className="p-4 h-full">
      {!session ? (
        step === 1 ? (
          <div className="space-y-6 pt-4">
            <div className="text-center">
              <h2 className="text-lg font-medium text-gray-900 mb-2">What are you working on?</h2>
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Enter your task..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
              <button
                onClick={handleTextSubmit}
                disabled={!textInput.trim()}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 ${
                  textInput.trim() 
                    ? "text-blue-600 hover:text-blue-700" 
                    : "text-gray-300 cursor-not-allowed"
                }`}
              >
                <ChevronRight size={18} />
              </button>
            </div>
            
            <p className="text-xs text-gray-500 text-center">Press Enter or click → to continue</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <button
                onClick={() => setStep(1)}
                className="text-xs text-gray-500 hover:text-gray-700 mb-3"
              >
                ← Back
              </button>
              <h2 className="text-lg font-medium text-gray-900 mb-1">Set your timer</h2>
              <p className="text-sm text-gray-600 truncate">"{textInput}"</p>
            </div>
            
            <div className="flex items-center justify-center space-x-6">
              <button
                onClick={decrementTime}
                disabled={selectedTimeIndex === 0}
                className={`p-2 rounded ${
                  selectedTimeIndex === 0
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <ChevronDown size={20} />
              </button>
              
              <div className="text-center min-w-[100px]">
                <div className="text-2xl font-mono font-semibold text-gray-900">
                  {TIME_OPTIONS[selectedTimeIndex].label}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {selectedTimeIndex + 1} of {TIME_OPTIONS.length}
                </div>
              </div>
              
              <button
                onClick={incrementTime}
                disabled={selectedTimeIndex === TIME_OPTIONS.length - 1}
                className={`p-2 rounded ${
                  selectedTimeIndex === TIME_OPTIONS.length - 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <ChevronUp size={20} />
              </button>
            </div>
            
            <button
              onClick={handleFinalSubmit}
              className="w-full bg-blue-600 text-white py-2.5 rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Play size={16} />
              <span>Start Session</span>
            </button>
          </div>
        )
      ) : (
        <div className="text-center space-y-6 py-4">
          <div className="space-y-3">
            <h2 className="text-lg font-medium text-gray-900">
              {session.stage === "COMPLETED" ? "🎉 Session Complete!" : session.textInput}
            </h2>
            {session.stage !== "COMPLETED" && (
              <div className="text-3xl font-mono font-bold text-blue-600">
                {getRemainingTime()}
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-500">
            <p className="text-xs text-gray-700 italic leading-relaxed">
              {currentQuote}
            </p>
          </div>

          {session.stage === "COMPLETED" && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              <RotateCcw size={14} />
              <span>New Session</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}