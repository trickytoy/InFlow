"use client"

import { useState } from "react"

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
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (err) {
    return false;
  }
};



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
    <div className="space-y-8">
      {/* Allow List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Allow List</h2>
        <p className="text-gray-600 mb-2">Websites that are considered productive for studying</p>

        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newAllowItem}
            onChange={(e) => setNewAllowItem(e.target.value)}
            placeholder="Enter website (e.g., example.com)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === "Enter" && handleAddToAllowList()}
          />
          <button
            onClick={handleAddToAllowList}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            Add
          </button>
        </div>
        {allowWarning && <p className="text-sm text-red-500 mt-1">{allowWarning}</p>}

        <div className="space-y-2 mt-4">
          {allowList.map((site, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-gray-800">{site}</span>
              <button
                onClick={() => onRemoveFromAllowList(site)}
                className="text-red-500 hover:text-red-700 transition"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Block List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Block List</h2>
        <p className="text-gray-600 mb-2">Websites that are considered distracting during study sessions</p>

        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newBlockItem}
            onChange={(e) => setNewBlockItem(e.target.value)}
            placeholder="Enter website (e.g., example.com)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === "Enter" && handleAddToBlockList()}
          />
          <button
            onClick={handleAddToBlockList}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Add
          </button>
        </div>
        {blockWarning && <p className="text-sm text-red-500 mt-1">{blockWarning}</p>}

        <div className="space-y-2 mt-4">
          {blockList.map((site, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="text-gray-800">{site}</span>
              <button
                onClick={() => onRemoveFromBlockList(site)}
                className="text-red-500 hover:text-red-700 transition"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SettingsTab
