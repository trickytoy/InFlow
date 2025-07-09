import { useState } from "react";
import { LockIn } from "./lockin";
import { Activity, Settings } from "lucide-react";
import "../global.css";

export const Popup = () => {
  const [page, setPage] = useState("home");
  const [resetTrigger, setResetTrigger] = useState(false);

  const openOptionsPage = () => {
    if (chrome.runtime?.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL("options.html"));
    }
  };

  const handleInFlowClick = () => {
    setResetTrigger(true); // Trigger reset in LockIn
    setPage("lockIn");
  };

  return (
    <div className="w-[300px] h-[300px] mx-auto bg-gradient-to-rshadow-xl p-4">
      {/* Icon Header */}
      <div className="flex justify-between items-center">
        {/* Profile */}
        

        {/* In Flow */}
        <button
          onClick={handleInFlowClick}
          className={`p-2 rounded hover:bg-gray-200 transition ${
            page === "lockIn" || page === "home" ? "text-indigo-700" : "text-gray-600"
          }`}
          title="In Flow"
        >
          <Activity size={20} />
        </button>

        {/* Block List or Options */}

          <button
            onClick={openOptionsPage}
            className="p-2 rounded text-gray-600 hover:bg-gray-200 transition"
            title="Options"
          >
            <Settings size={20} />
          </button>
      </div>

      {/* Render Active Page */}
      <div className="flex items-center justify-center">
      <LockIn resetTrigger={resetTrigger} onResetHandled={() => setResetTrigger(false)} />
      </div>
    </div>
  );
};
