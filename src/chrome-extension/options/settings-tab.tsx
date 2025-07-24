"use client"

import { useState } from "react"
import { Shield, Plus, X, CheckCircle, XCircle, Settings } from "lucide-react"
import { useTheme } from "./index"

interface SettingsTabProps {
  allowList: string[]
  blockList: string[]
  onAddToAllowList: (item: string) => void
  onAddToBlockList: (item: string) => void
  onRemoveFromAllowList: (item: string) => void
  onRemoveFromBlockList: (item: string) => void
}

const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch (err) {
    return false
  }
}

const SettingsTab = ({
  allowList,
  blockList,
  onAddToAllowList,
  onAddToBlockList,
  onRemoveFromAllowList,
  onRemoveFromBlockList,
}: SettingsTabProps) => {
  const [newAllowItem, setNewAllowItem] = useState("")
  const [newBlockItem, setNewBlockItem] = useState("")
  const [allowWarning, setAllowWarning] = useState("")
  const [blockWarning, setBlockWarning] = useState("")

  const theme = useTheme()

  const handleAddToAllowList = () => {
    if (!isValidUrl(newAllowItem)) {
      setAllowWarning("Please enter a valid URL.")
      return
    }
    if (blockList.includes(newAllowItem)) {
      setAllowWarning("This site is already in your Block List.")
      return
    }
    if (allowList.includes(newAllowItem)) {
      setAllowWarning("This site is already in your Allow List.")
      return
    }
    onAddToAllowList(newAllowItem)
    setNewAllowItem("")
    setAllowWarning("")
  }

  const handleAddToBlockList = () => {
    if (!isValidUrl(newBlockItem)) {
      setBlockWarning("Please enter a valid URL.")
      return
    }
    if (allowList.includes(newBlockItem)) {
      setBlockWarning("This site is already in your Allow List.")
      return
    }
    if (blockList.includes(newBlockItem)) {
      setBlockWarning("This site is already in your Block List.")
      return
    }
    onAddToBlockList(newBlockItem)
    setNewBlockItem("")
    setBlockWarning("")
  }

  return (
    <div className="space-y-8 p-6 min-h-screen">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className={`p-4 ${theme.colors.gradient.primary} rounded-full`}>
            <Settings className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your website permissions for focused study sessions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Allowed Sites</h3>
          </div>
          <div className="text-3xl font-bold text-emerald-600 mb-1">{allowList.length}</div>
          <p className="text-sm text-gray-500">Productive websites</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-rose-500 rounded-lg">
              <XCircle className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Blocked Sites</h3>
          </div>
          <div className="text-3xl font-bold text-rose-600 mb-1">{blockList.length}</div>
          <p className="text-sm text-gray-500">Distracting websites</p>
        </div>
      </div>

      {/* Allow List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 ">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Allow List</h2>
              <p className="text-sm text-gray-600 mt-1">Websites considered productive for studying</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <input
                type="text"
                value={newAllowItem}
                onChange={(e) => setNewAllowItem(e.target.value)}
                placeholder="Enter website URL (e.g., https://example.com)"
                className={`w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none ${theme.colors.focus.border} ${theme.colors.focus.ring} transition-all duration-200`}
                onKeyDown={(e) => e.key === "Enter" && handleAddToAllowList()}
              />
              {allowWarning && (
                <p className="text-sm text-rose-500 mt-2 flex items-center">
                  <XCircle className="w-4 h-4 mr-1" />
                  {allowWarning}
                </p>
              )}
            </div>
            <button
              onClick={handleAddToAllowList}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>

          {allowList.length > 0 ? (
            <div className="space-y-3">
              {allowList.map((site, index) => (
                <div
                  key={index}
                  className="group flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg hover:from-emerald-100 hover:to-green-100 transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-gray-800 font-medium">{site}</span>
                  </div>
                  <button
                    onClick={() => onRemoveFromAllowList(site)}
                    className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No allowed sites yet. Add your first productive website!</p>
            </div>
          )}
        </div>
      </div>

      {/* Block List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 ">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-rose-500 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Block List</h2>
              <p className="text-sm text-gray-600 mt-1">Websites considered distracting during study sessions</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <input
                type="text"
                value={newBlockItem}
                onChange={(e) => setNewBlockItem(e.target.value)}
                placeholder="Enter website URL (e.g., https://example.com)"
                className={`w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none ${theme.colors.focus.border} ${theme.colors.focus.ring} transition-all duration-200`}
                onKeyDown={(e) => e.key === "Enter" && handleAddToBlockList()}
              />
              {blockWarning && (
                <p className="text-sm text-rose-500 mt-2 flex items-center">
                  <XCircle className="w-4 h-4 mr-1" />
                  {blockWarning}
                </p>
              )}
            </div>
            <button
              onClick={handleAddToBlockList}
              className="px-6 py-3 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-lg hover:from-rose-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>

          {blockList.length > 0 ? (
            <div className="space-y-3">
              {blockList.map((site, index) => (
                <div
                  key={index}
                  className="group flex items-center justify-between p-4 bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 rounded-lg hover:from-rose-100 hover:to-red-100 transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                    <span className="text-gray-800 font-medium">{site}</span>
                  </div>
                  <button
                    onClick={() => onRemoveFromBlockList(site)}
                    className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No blocked sites yet. Add distracting websites to stay focused!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsTab
