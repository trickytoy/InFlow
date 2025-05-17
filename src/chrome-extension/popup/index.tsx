import { useState } from "react";
import { BlockList } from "./blocklist";
import { Profile } from "./profile";
import { LockIn } from "./lockin";
import "../global.css";


export const Popup = () => {
  const [page, setPage] = useState("home");

  const openOptionsPage = () => {
    if (chrome.runtime?.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
  };

  const renderPage = () => {
    if (page === "profile") return <Profile />;
    if (page === "blocklist") return <BlockList />;
    else return <LockIn />;
  }

  return (
    <div className="max-w-md h-[380px] mx-auto bg-gradient-to-r from-grey-50 to-grey-100 shadow-xl p-4 space-y-6">
      {/* Header Buttons */}
      <div className="flex justify-between items-center">
        <button
          className={`text-md font-semibold ${
            page === "profile" ? "text-indigo-600" : "text-gray-600"
          } hover:underline`}
          onClick={() => setPage("profile")}
        >
          Profile
        </button>
        <h1
          className="text-lg font-bold text-indigo-700 cursor-pointer"
          onClick={() => setPage("lockIn")}
        >
          LOCK IN
        </h1>
        {page !== "profile" ? (
          <button
            className={`text-md font-semibold ${
              page === "blocklist" ? "text-red-600" : "text-gray-600"
            } hover:underline`}
            onClick={() => setPage("blocklist")}
          >
            Block List
          </button>
        ) : (
          <button
            className="text-md text-gray-600 font-semibold hover:underline"
            onClick={() => openOptionsPage()}
          >
            Options
          </button>
        )}
      </div>
      {/* Render Dynamic Page */}
      {renderPage()}
    </div>
  );
};
