"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ChevronRight, ChevronUp, ChevronDown, Play, RotateCcw } from "lucide-react"

interface LockInProps {
  resetTrigger?: boolean
  onResetHandled?: () => void
}

const TIME_OPTIONS = [
  { label: "00:01:00", minutes: 1, seconds: 60 },
  { label: "00:05:00", minutes: 5, seconds: 300 },
  { label: "00:10:00", minutes: 10, seconds: 600 },
  { label: "00:15:00", minutes: 15, seconds: 900 },
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
  "\"Deep work is like a superpower in our increasingly competitive economy.\" - Obama",
  "\"The ability to focus is becoming increasingly rare and increasingly valuable.\" - Tom",
  "\"Concentration is the secret of strength in politics, in war, in trade, in short in all management.\" - Unknown",
  "\"Focus on being productive instead of busy.\" - Someone important, probably",
  "\"The successful warrior is the average person with laser-like focus.\" - Bruce Lee",
  "\"Where focus goes, energy flows and results show.\" - Chatgpt",
  "\"It is during our darkest moments that we must focus to see the light.\" - ",
  "\"Lack of direction, not lack of time, is the problem.\" - made it up",
  "\"The art of being wise is knowing what to overlook.\" - Tom and Jerry",
  "\"Concentrate all your thoughts upon the work at hand.\" - Einstein"
]

export const LockIn = ({ resetTrigger, onResetHandled }: LockInProps) => {
  const [session, setSession] = useState<any>(null)
  const [step, setStep] = useState(1)
  const [textInput, setTextInput] = useState<string>("")
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(0)
  const [currentQuote, setCurrentQuote] = useState("")

  const fetchSession = () => {
    chrome.runtime.sendMessage({ type: "GET_SESSION" }, (response: { session: any }) => {
      setSession(response?.session)
    })
  }

  useEffect(() => {
    fetchSession()
    const interval = setInterval(fetchSession, 1000)
    // Set a random quote when component mounts
    setCurrentQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)])
    return () => clearInterval(interval)
  }, [])

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
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
        // Reset form state
        setStep(1)
        setTextInput("")
        setSelectedTimeIndex(0)
        // Set new quote for the session
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
    <div className="bg-white p-3 mx-auto max-w-md w-full">
      {!session ? (
        step === 1 ? (
          <div className="space-y-6 pt-4">
            <h2 className="text-xl pb-2 font-semibold text-center text-gray-800">What are you working on?</h2>
            <form onSubmit={handleTextSubmit} className="relative">
              <input
                type="text"
                placeholder="Enter your task..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <button
                type="submit"
                disabled={!textInput.trim()}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors ${
                  textInput.trim() ? "text-indigo-600 hover:text-indigo-800" : "text-gray-300 cursor-not-allowed"
                }`}
              >
                <ChevronRight size={20} />
              </button>
            </form>
            <p className="text-xs text-center text-gray-500">Press Enter or click → to continue</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-semibold text-gray-800">Set your timer</h2>
              <p className="text-sm text-gray-500 italic truncate">{textInput}</p>
            </div>
            <div className="flex items-center justify-center space-x-6">
              <button
                onClick={decrementTime}
                disabled={selectedTimeIndex === 0}
                className={`p-2 rounded-full transition-all ${
                  selectedTimeIndex === 0
                    ? "text-gray-300 cursor-not-allowed"
                    : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                }`}
              >
                <ChevronDown size={20} />
              </button>
              <div className="text-center min-w-[120px]">
                <div className="text-3xl font-semibold text-gray-800">{TIME_OPTIONS[selectedTimeIndex].label}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {selectedTimeIndex + 1} of {TIME_OPTIONS.length}
                </div>
              </div>
              <button
                onClick={incrementTime}
                disabled={selectedTimeIndex === TIME_OPTIONS.length - 1}
                className={`p-2 rounded-full transition-all ${
                  selectedTimeIndex === TIME_OPTIONS.length - 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                }`}
              >
                <ChevronUp size={20} />
              </button>
            </div>
            <button
              onClick={handleFinalSubmit}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2 shadow"
            >
              <Play size={16} />
              <span>Start Session</span>
            </button>
          </div>
        )
      ) : (
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800 px-2">
              {session.stage === "COMPLETED" ? "🎉 Well Done!" : session.textInput}
            </h2>
            {session.stage !== "COMPLETED" && (
              <div className="text-4xl font-mono font-semibold tracking-widest text-indigo-700 px-4 py-2 rounded-lg">
                {getRemainingTime()}
              </div>
            )}
          </div>

          <div className="bg-gray-100 rounded-md px-4 py-2 text-sm text-gray-600 shadow-sm">
            <p className="italic text-xs leading-relaxed">{currentQuote}</p>
          </div>

          {session.stage === "COMPLETED" && (
            <div className="flex justify-center">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <RotateCcw size={16} />
                <span>New Session</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}