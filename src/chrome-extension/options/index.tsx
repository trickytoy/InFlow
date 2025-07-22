"use client"

import "../global.css"
import { useEffect, useState } from "react"
import ProfileTab from "./profile-tab"
import SettingsTab from "./settings-tab"
import FAQTab from "./faq-tab"
import { icons } from "lucide-react"

// Site interface
interface Site {
  url: string;
  duration: number;
}

// Distraction breakdown interface
interface DisBreakdown {
  entertainment: number;
  shopping: number;
  social: number;
  other: number;
  gaming: number;
}

// Enhanced session data type with analytics
interface SessionData {
  textInput: string
  date: string // ISO date string 'YYYY-MM-DD'
  timestamp?: string
  duration?: number
  analytics?: {
    mostTimeSpentSite: Site[];
    distractionBreakdown: DisBreakdown;
    totalDistractions: number;
  }
}

// Enhanced history data type
interface HistoryData {
  id: number;
  action: string;
  date: string;
  duration?: number;
  totalDistractions?: number;
  analytics?: {
    mostTimeSpentSite: Site[];
    distractionBreakdown: DisBreakdown;
    totalDistractions: number;
  };
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
  const [historyData, setHistoryData] = useState<HistoryData[]>([])
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
      
      // Populate history table with enhanced data
      setHistoryData(
        sessions.map((session, index) => ({
          id: index + 1,
          action: session.textInput || "Study Session",
          date: session.date,
          duration: session.duration,
          totalDistractions: session.analytics?.totalDistractions,
          analytics: session.analytics,
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


return (
  <div className="min-h-screen bg-gradient-to-r from-gray-50 to-gray-100 p-10">
    {/* Tab Navigation */}
    <div className="mb-8">
      <div className="flex items-center justify-between bg-white rounded-xl p-1 shadow-lg max-w-fit mx-auto">
        {/* Main Tabs */}
        <div className="flex space-x-1">


          {/* Settings Tab */}
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "settings"
                ? "bg-[#8c52ff] text-white shadow-md transform scale-105"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:shadow-sm"
            }`}
          >
            <span>⚙️</span>
            <span>Settings</span>
          </button>
          {/* Profile Tab */}
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "profile"
                ? "bg-[#8c52ff] text-white shadow-md transform scale-105"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:shadow-sm"
            }`}
          >
            <span>👤</span>
            <span>Profile</span>
          </button>
          {/* FAQ Tab */}
          <button
            onClick={() => setActiveTab("faq")}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "faq"
                ? "bg-[#8c52ff] text-white shadow-md transform scale-105"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:shadow-sm"
            }`}
          >
            <span>❓</span>
            <span>FAQ</span>
          </button>
        </div>

        {/* Feedback Link */}
        <div className="ml-4 border-l border-gray-200 pl-4">
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSdTAYWRtCMLknlurZFJIxwKeGXl3FD269WIIjBpGkRTNr8gxA/viewform?usp=dialog"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium hover:shadow-sm"
          >
            <span>💬</span>
            <span>Feedback</span>
          </a>
        </div>
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