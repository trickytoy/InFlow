"use client"

import "../global.css"
import { useEffect, useState } from "react"
import ProfileTab from "./profile-tab"
import SettingsTab from "./settings-tab"
import FAQTab from "./faq-tab"

// Type for your session data stored in chrome.storage.local
interface SessionData {
  textInput: string
  date: string // ISO date string 'YYYY-MM-DD'
}

// Type for the message response from background
interface GetSessionHistoryResponse {
  sessionHistory: SessionData[]
}

// Heatmap data
interface HeatMapEntry {
  date: string
  count: number
}

type TabType = "profile" | "settings" | "faq"

const Profile = () => {
  const [activeTab, setActiveTab] = useState<TabType>("profile")
  const [historyData, setHistoryData] = useState<{ id: number; action: string; date: string }[]>([])
  const [heatMapData, setHeatMapData] = useState<HeatMapEntry[]>([])
  const [allowList, setAllowList] = useState<string[]>([])
  const [blockList, setBlockList] = useState<string[]>([])
  
  useEffect(() => {
    chrome.storage.local.get(["blockList"], (result) => {
      if (Array.isArray(result.blockList)) {
        setBlockList(result.blockList);
      }
    });

    chrome.storage.local.get(["allowList"], (result) => {
      if (Array.isArray(result.allowList)) {
        setAllowList(result.allowList);
      }
    });
  }, []);

  useEffect(() => {
    if (!chrome.runtime?.sendMessage) return
    chrome.runtime.sendMessage({ type: "GET_SESSION_HISTORY" }, (response: GetSessionHistoryResponse) => {
      if (chrome.runtime.lastError) {
        console.error("Error fetching session history:", chrome.runtime.lastError.message)
        return
      }
      const sessions = response?.sessionHistory || []
      // Populate history table
      setHistoryData(
        sessions.map((session, index) => ({
          id: index + 1,
          action: session.textInput || "Study Session",
          date: session.date,
        })),
      )
      // Populate heatmap (aggregate sessions per day)
      const countsByDate = sessions.reduce<Record<string, number>>((acc, session) => {
        acc[session.date] = (acc[session.date] || 0) + 1
        return acc
      }, {})
      const heatmapArray = Object.entries(countsByDate).map(([date, count]) => ({
        date,
        count,
      }))
      setHeatMapData(heatmapArray)
    })
  }, [])

  const saveToStorage = async (key: string, value: any): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => resolve());
    });
  };

  const handleAddToAllowList = async (item: string) => {
    const updatedList = [...allowList, item];
    await saveToStorage("allowList", updatedList);
    setAllowList([...allowList, item])
  }

  const handleAddToBlockList = async (item: string) => {
    const updatedList = [...blockList, item];
    await saveToStorage("blockList", updatedList);
    setBlockList(updatedList);
  };

const handleRemoveFromAllowList = async (item: string) => {
  const updatedList = allowList.filter((site) => site !== item);
  setAllowList(updatedList);
  await saveToStorage("allowList", updatedList);
};

const handleRemoveFromBlockList = async (item: string) => {
  const updatedList = blockList.filter((site) => site !== item);
  setBlockList(updatedList);
  await saveToStorage("blockList", updatedList);
};

  const tabs = [
    { id: "profile" as TabType, label: "Profile", icon: "👤" },
    { id: "settings" as TabType, label: "Settings", icon: "⚙️" },
    { id: "faq" as TabType, label: "FAQ", icon: "❓" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-50 to-gray-100 p-10">
      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-between bg-white rounded-xl p-1 shadow-lg">
          {/* Main Tabs */}
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition ${
                  activeTab === tab.id
                    ? "bg-[#8c52ff] text-white shadow-md"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Feedback Link */}
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSdTAYWRtCMLknlurZFJIxwKeGXl3FD269WIIjBpGkRTNr8gxA/viewform?usp=dialog"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium"
          >
            <span>💬</span>
            <span>Feedback</span>
          </a>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "profile" && (
        <ProfileTab historyData={historyData} heatMapData={heatMapData} />
      )}
      {activeTab === "settings" && (
        <SettingsTab
          allowList={allowList}
          blockList={blockList}
          onAddToAllowList={handleAddToAllowList}
          onAddToBlockList={handleAddToBlockList}
          onRemoveFromAllowList={handleRemoveFromAllowList}
          onRemoveFromBlockList={handleRemoveFromBlockList}
        />
      )}
      {activeTab === "faq" && <FAQTab />}
    </div>
  )
}

export default Profile
