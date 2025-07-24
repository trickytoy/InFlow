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
    setResetTrigger(true);
    setPage("lockIn");
  };

  return (
    <div className="w-[300px] h-[300px] bg-white border border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-blue-600 rounded-sm flex items-center justify-center">
            <Activity size={12} className="text-white" />
          </div>
          <span className="font-medium text-gray-900 text-sm">Focus</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={handleInFlowClick}
            className={`p-1.5 rounded-md transition-colors ${
              page === "lockIn" || page === "home" 
                ? "bg-blue-100 text-blue-600" 
                : "text-gray-500 hover:bg-gray-100"
            }`}
            title="Focus Session"
          >
            <Activity size={16} />
          </button>

          <button
            onClick={openOptionsPage}
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <LockIn 
          resetTrigger={resetTrigger} 
          onResetHandled={() => setResetTrigger(false)} 
        />
      </div>
    </div>
  );
};