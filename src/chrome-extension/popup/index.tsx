import { useState } from "react";
import { BlockList } from "./blocklist";
import { Profile } from "./profile";
import { LockIn } from "./lockin";
import { User, Activity, Ban, Settings } from "lucide-react";
import "../global.css";

export const Popup = () => {
  const [page, setPage] = useState("home");

  const openOptionsPage = () => {
    if (chrome.runtime?.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL("options.html"));
    }
  };

  const renderPage = () => {
    if (page === "profile") return <Profile />;
    if (page === "blocklist") return <BlockList />;
    return <LockIn />;
  };

  return (
    <div className="w-[300px] h-[300px] mx-auto bg-gradient-to-rshadow-xl p-4 space-y-6">
      {/* Icon Header */}
      <div className="flex justify-between items-center">
        {/* Profile */}
        <button
          onClick={() => setPage("profile")}
          className={`p-2 rounded hover:bg-gray-200 transition ${
            page === "profile" ? "text-indigo-600" : "text-gray-600"
          }`}
          title="Profile"
        >
          <User size={20} />
        </button>

        {/* In Flow */}
        <button
          onClick={() => setPage("lockIn")}
          className={`p-2 rounded hover:bg-gray-200 transition ${
            page === "lockIn" || page === "home" ? "text-indigo-700" : "text-gray-600"
          }`}
          title="In Flow"
        >
          <Activity size={20} />
        </button>

        {/* Block List or Options */}
        {page !== "profile" ? (
          <button
            onClick={() => setPage("blocklist")}
            className={`p-2 rounded hover:bg-gray-200 transition ${
              page === "blocklist" ? "text-red-600" : "text-gray-600"
            }`}
            title="Block List"
          >
            <Ban size={20} />
          </button>
        ) : (
          <button
            onClick={openOptionsPage}
            className="p-2 rounded text-gray-600 hover:bg-gray-200 transition"
            title="Options"
          >
            <Settings size={20} />
          </button>
        )}
      </div>

      {/* Render Active Page */}
      {renderPage()}
    </div>
  );
};
