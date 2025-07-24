"use client"

import type React from "react"

import "../global.css"
import { useEffect, useState, createContext, useContext } from "react"
import ProfileTab from "./profile-tab"
import SettingsTab from "./settings-tab"
import FAQTab from "./faq-tab"
import AchievementsTab from "./achievements"
import { Settings, User, HelpCircle, Trophy, MessageSquare, ShoppingBag } from "lucide-react"
import ShopTab from "./shop-tab"

// Site interface
interface Site {
  url: string
  duration: number
}

// Distraction breakdown interface
interface DisBreakdown {
  entertainment: number
  shopping: number
  social: number
  other: number
  gaming: number
}

// Enhanced session data type with analytics
interface SessionData {
  textInput: string
  date: string // ISO date string 'YYYY-MM-DD'
  timestamp?: string
  duration?: number
  analytics?: {
    mostTimeSpentSite: Site[]
    distractionBreakdown: DisBreakdown
    totalDistractions: number
  }
}

// Enhanced history data type
interface HistoryData {
  id: number
  action: string
  date: string
  duration?: number
  totalDistractions?: number
  analytics?: {
    mostTimeSpentSite: Site[]
    distractionBreakdown: DisBreakdown
    totalDistractions: number
  }
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

// Theme interface
interface Theme {
  id: string
  name: string
  description: string
  price: number
  preview: string
  colors: {
    primary: {
      50: string
      100: string
      200: string
      300: string
      400: string
      500: string
      600: string
      700: string
      800: string
      900: string
    }
    text: {
      primary: string
      primaryLight: string
      primaryDark: string
      white: string
    }
    border: {
      primary: string
      primaryLight: string
      primaryDark: string
    }
    hover: {
      primary: string
      primaryDark: string
      text: string
    }
    focus: {
      ring: string
      border: string
    }
    gradient: {
      primary: string
      primaryHover: string
    }
  }
}

type TabType = "profile" | "settings" | "faq" | "achievement" | "shop"

// Available Themes
const availableThemes: Theme[] = [
  {
    id: "purple",
    name: "Purple Default",
    description: "Classic purple theme with elegant gradients",
    price: 0,
    preview: "bg-gradient-to-r from-purple-500 to-purple-600",
    colors: {
      primary: {
        50: "bg-purple-50",
        100: "bg-purple-100",
        200: "bg-purple-200",
        300: "bg-purple-300",
        400: "bg-purple-400",
        500: "bg-purple-500",
        600: "bg-purple-600",
        700: "bg-purple-700",
        800: "bg-purple-800",
        900: "bg-purple-900",
      },
      text: {
        primary: "text-purple-600",
        primaryLight: "text-purple-500",
        primaryDark: "text-purple-700",
        white: "text-white",
      },
      border: {
        primary: "border-purple-300",
        primaryLight: "border-purple-200",
        primaryDark: "border-purple-400",
      },
      hover: {
        primary: "hover:bg-purple-100",
        primaryDark: "hover:bg-purple-600",
        text: "hover:text-purple-600",
      },
      focus: {
        ring: "focus:ring-purple-200",
        border: "focus:border-purple-500",
      },
      gradient: {
        primary: "bg-gradient-to-r from-purple-500 to-purple-600",
        primaryHover: "hover:from-purple-600 hover:to-purple-700",
      },
    }
  },
  {
    id: "ocean",
    name: "Ocean Blue",
    description: "Calming ocean-inspired blue theme",
    price: 50,
    preview: "bg-gradient-to-r from-blue-500 to-cyan-500",
    colors: {
      primary: {
        50: "bg-blue-50",
        100: "bg-blue-100",
        200: "bg-blue-200",
        300: "bg-blue-300",
        400: "bg-blue-400",
        500: "bg-blue-500",
        600: "bg-blue-600",
        700: "bg-blue-700",
        800: "bg-blue-800",
        900: "bg-blue-900",
      },
      text: {
        primary: "text-blue-600",
        primaryLight: "text-blue-500",
        primaryDark: "text-blue-700",
        white: "text-white",
      },
      border: {
        primary: "border-blue-300",
        primaryLight: "border-blue-200",
        primaryDark: "border-blue-400",
      },
      hover: {
        primary: "hover:bg-blue-100",
        primaryDark: "hover:bg-blue-600",
        text: "hover:text-blue-600",
      },
      focus: {
        ring: "focus:ring-blue-200",
        border: "focus:border-blue-500",
      },
      gradient: {
        primary: "bg-gradient-to-r from-blue-500 to-cyan-500",
        primaryHover: "hover:from-blue-600 hover:to-cyan-600",
      },
    }
  },
  {
    id: "forest",
    name: "Forest Green",
    description: "Natural forest green theme for focus",
    price: 75,
    preview: "bg-gradient-to-r from-green-500 to-emerald-500",
    colors: {
      primary: {
        50: "bg-green-50",
        100: "bg-green-100",
        200: "bg-green-200",
        300: "bg-green-300",
        400: "bg-green-400",
        500: "bg-green-500",
        600: "bg-green-600",
        700: "bg-green-700",
        800: "bg-green-800",
        900: "bg-green-900",
      },
      text: {
        primary: "text-green-600",
        primaryLight: "text-green-500",
        primaryDark: "text-green-700",
        white: "text-white",
      },
      border: {
        primary: "border-green-300",
        primaryLight: "border-green-200",
        primaryDark: "border-green-400",
      },
      hover: {
        primary: "hover:bg-green-100",
        primaryDark: "hover:bg-green-600",
        text: "hover:text-green-600",
      },
      focus: {
        ring: "focus:ring-green-200",
        border: "focus:border-green-500",
      },
      gradient: {
        primary: "bg-gradient-to-r from-green-500 to-emerald-500",
        primaryHover: "hover:from-green-600 hover:to-emerald-600",
      },
    }
  },
  {
    id: "sunset",
    name: "Sunset Orange",
    description: "Warm sunset-inspired orange theme",
    price: 100,
    preview: "bg-gradient-to-r from-orange-500 to-red-500",
    colors: {
      primary: {
        50: "bg-orange-50",
        100: "bg-orange-100",
        200: "bg-orange-200",
        300: "bg-orange-300",
        400: "bg-orange-400",
        500: "bg-orange-500",
        600: "bg-orange-600",
        700: "bg-orange-700",
        800: "bg-orange-800",
        900: "bg-orange-900",
      },
      text: {
        primary: "text-orange-600",
        primaryLight: "text-orange-500",
        primaryDark: "text-orange-700",
        white: "text-white",
      },
      border: {
        primary: "border-orange-300",
        primaryLight: "border-orange-200",
        primaryDark: "border-orange-400",
      },
      hover: {
        primary: "hover:bg-orange-100",
        primaryDark: "hover:bg-orange-600",
        text: "hover:text-orange-600",
      },
      focus: {
        ring: "focus:ring-orange-200",
        border: "focus:border-orange-500",
      },
      gradient: {
        primary: "bg-gradient-to-r from-orange-500 to-red-500",
        primaryHover: "hover:from-orange-600 hover:to-red-600",
      },
    }
  },
  {
    id: "rose",
    name: "Rose Pink",
    description: "Elegant rose pink theme",
    price: 80,
    preview: "bg-gradient-to-r from-pink-500 to-rose-500",
    colors: {
      primary: {
        50: "bg-pink-50",
        100: "bg-pink-100",
        200: "bg-pink-200",
        300: "bg-pink-300",
        400: "bg-pink-400",
        500: "bg-pink-500",
        600: "bg-pink-600",
        700: "bg-pink-700",
        800: "bg-pink-800",
        900: "bg-pink-900",
      },
      text: {
        primary: "text-pink-600",
        primaryLight: "text-pink-500",
        primaryDark: "text-pink-700",
        white: "text-white",
      },
      border: {
        primary: "border-pink-300",
        primaryLight: "border-pink-200",
        primaryDark: "border-pink-400",
      },
      hover: {
        primary: "hover:bg-pink-100",
        primaryDark: "hover:bg-pink-600",
        text: "hover:text-pink-600",
      },
      focus: {
        ring: "focus:ring-pink-200",
        border: "focus:border-pink-500",
      },
      gradient: {
        primary: "bg-gradient-to-r from-pink-500 to-rose-500",
        primaryHover: "hover:from-pink-600 hover:to-rose-600",
      },
    }
  },
  {
    id: "midnight",
    name: "Midnight Dark",
    description: "Premium dark theme with indigo accents",
    price: 150,
    preview: "bg-gradient-to-r from-slate-800 to-indigo-800",
    colors: {
      primary: {
        50: "bg-slate-50",
        100: "bg-slate-100",
        200: "bg-slate-200",
        300: "bg-slate-300",
        400: "bg-slate-400",
        500: "bg-slate-500",
        600: "bg-slate-600",
        700: "bg-slate-700",
        800: "bg-slate-800",
        900: "bg-slate-900",
      },
      text: {
        primary: "text-indigo-400",
        primaryLight: "text-indigo-300",
        primaryDark: "text-indigo-500",
        white: "text-white",
      },
      border: {
        primary: "border-slate-600",
        primaryLight: "border-slate-500",
        primaryDark: "border-slate-700",
      },
      hover: {
        primary: "hover:bg-slate-700",
        primaryDark: "hover:bg-indigo-600",
        text: "hover:text-indigo-400",
      },
      focus: {
        ring: "focus:ring-indigo-500",
        border: "focus:border-indigo-400",
      },
      gradient: {
        primary: "bg-gradient-to-r from-slate-800 to-indigo-800",
        primaryHover: "hover:from-slate-700 hover:to-indigo-700",
      },
    }
  }
]

// Theme Context
const ThemeContext = createContext<Theme>(availableThemes[0])

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

// Theme Provider Component
const ThemeProvider = ({ children, theme }: { children: React.ReactNode, theme: Theme }) => {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

const Profile = () => {
  const [activeTab, setActiveTab] = useState<TabType>("profile")
  const [historyData, setHistoryData] = useState<HistoryData[]>([])
  const [heatMapData, setHeatMapData] = useState<HeatMapEntry[]>([])
  const [allowList, setAllowList] = useState<string[]>([])
  const [blockList, setBlockList] = useState<string[]>([])
  
  // Theme and shop state
  const [currentTheme, setCurrentTheme] = useState<string>("purple")
  const [ownedThemes, setOwnedThemes] = useState<string[]>(["purple"])
  const [coins, setCoins] = useState<number>(0)

  // Get current theme object
  const activeTheme = availableThemes.find(theme => theme.id === currentTheme) || availableThemes[0]

  // Load data from localStorage
  useEffect(() => {
    // Load existing Chrome storage data
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(["blockList"], (result) => {
        if (Array.isArray(result.blockList)) {
          setBlockList(result.blockList)
        }
      })

      chrome.storage.local.get(["allowList"], (result) => {
        if (Array.isArray(result.allowList)) {
          setAllowList(result.allowList)
        }
      })
    }

    // Load theme shop data from localStorage
    const savedCoins = localStorage.getItem('themeShopCoins')
    const savedOwnedThemes = localStorage.getItem('ownedThemes')
    const savedCurrentTheme = localStorage.getItem('currentTheme')

    if (savedCoins) {
      setCoins(parseInt(savedCoins))
    }
    if (savedOwnedThemes) {
      setOwnedThemes(JSON.parse(savedOwnedThemes))
    }
    if (savedCurrentTheme) {
      setCurrentTheme(savedCurrentTheme)
    }
  }, [])

  // Save theme shop data to localStorage
  const saveToLocalStorage = (key: string, value: any) => {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
  }

  // Load session history (mock for this example)
  useEffect(() => {
    if (!chrome.runtime?.sendMessage) return
    chrome.runtime.sendMessage({ type: "GET_SESSION_HISTORY" }, (response: GetSessionHistoryResponse) => {
      if (chrome.runtime.lastError) {
        console.error("Error fetching session history:", chrome.runtime.lastError.message)
        return
      }
      const sessions = response?.sessionHistory || []

      console.log(sessions)

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

  const handlePurchaseTheme = (themeId: string, price: number) => {
    if (coins >= price && !ownedThemes.includes(themeId)) {
      const newCoins = coins - price
      const newOwnedThemes = [...ownedThemes, themeId]
      
      setCoins(newCoins)
      setOwnedThemes(newOwnedThemes)
      
      saveToLocalStorage('themeShopCoins', newCoins)
      saveToLocalStorage('ownedThemes', newOwnedThemes)
      
      // Auto-select purchased theme
      setCurrentTheme(themeId)
      saveToLocalStorage('currentTheme', themeId)
    }
  }

  const handleSelectTheme = (themeId: string) => {
    if (ownedThemes.includes(themeId)) {
      setCurrentTheme(themeId)
      saveToLocalStorage('currentTheme', themeId)
    }
  }

  // Handle achievement coin claiming
  const handleClaimAchievement = (achievementId: string, coinReward: number) => {
    const newCoins = coins + coinReward
    setCoins(newCoins)
    saveToLocalStorage('themeShopCoins', newCoins)
    
    // Show a success message or notification here if desired
    console.log(`Claimed achievement ${achievementId} for ${coinReward} coins!`)
  }

  const saveToStorage = async (key: string, value: any): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ [key]: value }, () => resolve())
      } else {
        resolve()
      }
    })
  }

  const handleAddToAllowList = async (item: string) => {
    const updatedList = [...allowList, item]
    await saveToStorage("allowList", updatedList)
    setAllowList([...allowList, item])
  }

  const handleAddToBlockList = async (item: string) => {
    const updatedList = [...blockList, item]
    await saveToStorage("blockList", updatedList)
    setBlockList(updatedList)
  }

  const handleRemoveFromAllowList = async (item: string) => {
    const updatedList = allowList.filter((site) => site !== item)
    setAllowList(updatedList)
    await saveToStorage("allowList", updatedList)
  }

  const handleRemoveFromBlockList = async (item: string) => {
    const updatedList = blockList.filter((site) => site !== item)
    setBlockList(updatedList)
    await saveToStorage("blockList", updatedList)
  }

  return (
    <ThemeProvider theme={activeTheme}>
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
                    ? `${activeTheme.colors.primary[600]} ${activeTheme.colors.text.white} shadow-md transform scale-105`
                    : `text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:shadow-sm`
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>

              {/* Profile Tab */}
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === "profile"
                    ? `${activeTheme.colors.primary[600]} ${activeTheme.colors.text.white} shadow-md transform scale-105`
                    : `text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:shadow-sm`
                }`}
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </button>

              {/* Shop Tab */}
              <button
                onClick={() => setActiveTab("shop")}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === "shop"
                    ? `${activeTheme.colors.primary[600]} ${activeTheme.colors.text.white} shadow-md transform scale-105`
                    : `text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:shadow-sm`
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Shop</span>
              </button>

              {/* FAQ Tab */}
              <button
                onClick={() => setActiveTab("faq")}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === "faq"
                    ? `${activeTheme.colors.primary[600]} ${activeTheme.colors.text.white} shadow-md transform scale-105`
                    : `text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:shadow-sm`
                }`}
              >
                <HelpCircle className="w-5 h-5" />
                <span>FAQ</span>
              </button>

              {/* Achievements Tab */}
              <button
                onClick={() => setActiveTab("achievement")}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === "achievement"
                    ? `${activeTheme.colors.primary[600]} ${activeTheme.colors.text.white} shadow-md transform scale-105`
                    : `text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:shadow-sm`
                }`}
              >
                <Trophy className="w-5 h-5" />
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
                <MessageSquare className="w-5 h-5" />
                <span>Feedback</span>
              </a>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "profile" && <ProfileTab historyData={historyData} heatMapData={heatMapData} />}
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
        {activeTab === "shop" && (
          <ShopTab
            coins={coins}
            ownedThemes={ownedThemes}
            currentTheme={currentTheme}
            onPurchaseTheme={handlePurchaseTheme}
            onSelectTheme={handleSelectTheme}
          />
        )}
        {activeTab === "faq" && <FAQTab />}
        {activeTab === "achievement" && (
          <AchievementsTab 
            historyData={historyData} 
            heatMapData={heatMapData}
            coins={coins}
            onClaimAchievement={handleClaimAchievement}
          />
        )}
      </div>
    </ThemeProvider>
  )
}

export default Profile