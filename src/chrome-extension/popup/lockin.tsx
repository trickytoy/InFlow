import { useState, useEffect } from "react";
import { ChevronRight, ChevronUp, ChevronDown, Play, Pause, Square, RotateCcw } from "lucide-react"


const TIME_OPTIONS = [
  { label: "1 min", minutes: 1 },
  { label: "5 min", minutes: 5 },
  { label: "10 min", minutes: 10 },
  { label: "15 min", minutes: 15 },
  { label: "30 min", minutes: 30 },
  { label: "1 hr", minutes: 60 },
  { label: "1hr 30min", minutes: 90 },
  { label: "2 hr", minutes: 120 },
  { label: "2hr 30min", minutes: 150 },
  { label: "3 hr", minutes: 180 },
  { label: "3hr 30min", minutes: 210 },
  { label: "4 hr", minutes: 240 },
]

export const LockIn = () => {
  const [session, setSession] = useState<any>(null)
  const [step, setStep] = useState(1)
  const [textInput, setTextInput] = useState<string>("")
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(0)

  const fetchSession = () => {
    chrome.runtime.sendMessage({ type: "GET_SESSION" }, (response) => {
      setSession(response?.session)
    })
  }

  useEffect(() => {
    fetchSession()
    const interval = setInterval(fetchSession, 1000)
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
      },
    )
  }

  const handlePause = () => chrome.runtime.sendMessage({ type: "PAUSE_SESSION" }, fetchSession)
  const handleResume = () => chrome.runtime.sendMessage({ type: "RESUME_SESSION" }, fetchSession)
  const handleReset = () => chrome.runtime.sendMessage({ type: "RESET_SESSION" }, fetchSession)

  const getRemainingTime = () => {
    if (!session) return "00:00:00"

    let remaining = 0
    if (session.stage === "ACTIVE" && session.endTime) {
      remaining = Math.max(0, Math.floor((session.endTime - Date.now()) / 1000))
    } else if (session.stage === "PAUSED" && session.remainingSeconds !== undefined) {
      remaining = session.remainingSeconds
    }

    const hrs = Math.floor(remaining / 3600)
    const mins = Math.floor((remaining % 3600) / 60)
    const secs = remaining % 60

    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="bg-white" style={{ marginTop: "10px" }}>
      {/* Profile Image */}
      {!session ? (
        // Form Section
        <div>
          {step === 1 ? (
          <div className="space-y-4 p-2">
            <div className="flex justify-center">
              <img
                src="https://i.pinimg.com/736x/b2/91/30/b29130b5f0c691bedc94aa68cbe147cb.jpg"
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 shadow-sm"
              />
            </div>
              <div className="text-center ">
                <h2 className="text-lg font-medium text-gray-800">What are you working on?</h2>
              </div>

              <form onSubmit={handleTextSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Enter your task..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full text-base border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-gray-400 transition-colors"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!textInput.trim()}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-all ${
                    textInput.trim()
                      ? "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                      : "text-gray-300 cursor-not-allowed"
                  }`}
                >
                  <ChevronRight size={20} />
                </button>
              </form>

              <p className="text-xs text-gray-500 text-center">Press Enter or click → to continue</p>
          </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-lg font-medium text-gray-800">Set your timer</h2>
                <p className="text-sm text-gray-600 mt-1 truncate">"{textInput}"</p>
              </div>

              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={decrementTime}
                  disabled={selectedTimeIndex === 0}
                  className={`p-2 rounded-full transition-all ${
                    selectedTimeIndex === 0
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  <ChevronDown size={20} />
                </button>

                <div className="text-center min-w-[120px]">
                  <div className="text-3xl font-light text-gray-800">{TIME_OPTIONS[selectedTimeIndex].label}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {selectedTimeIndex + 1} of {TIME_OPTIONS.length}
                  </div>
                </div>

                <button
                  onClick={incrementTime}
                  disabled={selectedTimeIndex === TIME_OPTIONS.length - 1}
                  className={`p-2 rounded-full transition-all ${
                    selectedTimeIndex === TIME_OPTIONS.length - 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  <ChevronUp size={20} />
                </button>
              </div>

              <button
                onClick={handleFinalSubmit}
                className="w-full bg-gray-800 text-white font-medium py-3 rounded-xl hover:bg-gray-900 transition-colors flex items-center justify-center space-x-2"
              >
                <Play size={16} />
                <span>Start Session</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        // Session Active Section
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800">
              {session.stage === "ACTIVE" && "Focus Time"}
              {session.stage === "PAUSED" && "Paused"}
              {session.stage === "COMPLETED" && "🎉 Well Done!"}
            </h2>

            {session.stage !== "COMPLETED" && (
              <div className="text-4xl font-mono font-light text-gray-800 tracking-wider">{getRemainingTime()}</div>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-700 text-sm font-medium truncate">{session.textInput}</p>
          </div>

          <div className="flex justify-center space-x-3">
            {session.stage === "ACTIVE" && (
              <>
                <button
                  onClick={handlePause}
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  <Pause size={16} />
                  <span>Pause</span>
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Square size={16} />
                  <span>Stop</span>
                </button>
              </>
            )}

            {session.stage === "PAUSED" && (
              <>
                <button
                  onClick={handleResume}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Play size={16} />
                  <span>Resume</span>
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Square size={16} />
                  <span>Stop</span>
                </button>
              </>
            )}

            {session.stage === "COMPLETED" && (
              <button
                onClick={handleReset}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
              >
                <RotateCcw size={16} />
                <span>New Session</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
