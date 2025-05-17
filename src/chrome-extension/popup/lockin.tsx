import { useState, useEffect } from "react";

// enum SessionStage {
//   FORM = "FORM",
//   ACTIVE = "ACTIVE",
//   PAUSED = "PAUSED",
//   COMPLETED = "COMPLETED",
// }

export const LockIn = () => {
  const [session, setSession] = useState<any>(null);
  const [textInput, setTextInput] = useState<string>("");
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [error, setError] = useState<string>("");

  const fetchSession = () => {
    chrome.runtime.sendMessage({ type: "GET_SESSION" }, (response) => {
      setSession(response?.session);
    });
  };

  useEffect(() => {
    fetchSession();
    const interval = setInterval(fetchSession, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalMinutes = hours * 60 + minutes;
    if (totalMinutes < 1 || totalMinutes > 240) {
      setError("Total time must be between 1 minute and 4 hours.");
      return;
    }
    setError("");
    const totalSeconds = totalMinutes * 60;
    chrome.runtime.sendMessage({
      type: "START_SESSION",
      payload: { textInput, durationSeconds: totalSeconds },
    }, fetchSession);
  };

  const handlePause = () => chrome.runtime.sendMessage({ type: "PAUSE_SESSION" }, fetchSession);
  const handleResume = () => chrome.runtime.sendMessage({ type: "RESUME_SESSION" }, fetchSession);
  const handleReset = () => chrome.runtime.sendMessage({ type: "RESET_SESSION" }, fetchSession);

  const getRemainingTime = () => {
    if (!session) return "00:00:00";
    let remaining = 0;
    if (session.stage === "ACTIVE") {
      remaining = Math.max(0, Math.floor((session.endTime - Date.now()) / 1000));
    } else if (session.stage === "PAUSED") {
      remaining = session.remainingSeconds;
    }
    const hrs = Math.floor(remaining / 3600);
    const mins = Math.floor((remaining % 3600) / 60);
    const secs = remaining % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <img
          src="https://i.pinimg.com/736x/b2/91/30/b29130b5f0c691bedc94aa68cbe147cb.jpg"
          alt="Profile"
          className="w-20 h-20 rounded-full object-cover border-4 border-gray-200 shadow-md"
        />
      </div>

      {!session ? (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter something..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="w-full border text-base border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
              <input
                type="number"
                placeholder="0 - 4"
                min="0"
                max="4"
                value={hours}
                onChange={(e) => setHours(parseInt(e.target.value) || 0)}
                className="w-full border text-base border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Minutes</label>
              <input
                type="number"
                placeholder="0 - 59"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                className="w-full border text-base border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full text-base bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Start Session
          </button>
        </form>
      ) : (
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-indigo-600">
            {session.stage === "ACTIVE" && "Session in Progress"}
            {session.stage === "PAUSED" && "Session Paused"}
            {session.stage === "COMPLETED" && "🎉 Session Completed!"}
          </h2>

          {session.stage !== "COMPLETED" && (
            <div className="text-4xl font-mono">{getRemainingTime()}</div>
          )}

          <p className="text-gray-600">{session.textInput}</p>

          <div className="flex justify-center space-x-4">
            {session.stage === "ACTIVE" && (
              <button onClick={handlePause} className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                Pause
              </button>
            )}
            {session.stage === "PAUSED" && (
              <button onClick={handleResume} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                Resume
              </button>
            )}
            {(session.stage === "ACTIVE" || session.stage === "PAUSED") && (
              <button onClick={handleReset} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                Stop
              </button>
            )}
            {session.stage === "COMPLETED" && (
              <button onClick={handleReset} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                Start New Session
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
