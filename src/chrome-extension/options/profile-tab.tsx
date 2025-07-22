"use client"

import React, { useState } from "react"
import HeatMap from "@uiw/react-heat-map"
import Tooltip from "@uiw/react-tooltip"
import { Activity, ChevronDown, ChevronRight, Calendar, Clock, TrendingUp, BookOpen, Target } from "lucide-react"
import { PieChart, Pie, Cell, Legend } from "recharts"

// Heatmap data
interface HeatMapEntry {
  date: string
  count: number
}

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

interface ProfileTabProps {
  historyData: {
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
  }[]
  heatMapData: HeatMapEntry[]
}

const ProfileTab = ({ historyData, heatMapData }: ProfileTabProps) => {
  const [openRow, setOpenRow] = useState<number | null>(null)
  console.log(historyData)

  const toggleRow = (id: number) => {
    setOpenRow((prev) => (prev === id ? null : id))
  }

  // Calculate stats from heatmap data
  const totalSessions = heatMapData.reduce((sum, entry) => sum + entry.count, 0)
  const activeDays = heatMapData.filter((entry) => entry.count > 0).length
  const currentStreak = calculateCurrentStreak(heatMapData)

  // Transform distraction breakdown data for pie chart
  const transformDistractionData = (breakdown: DisBreakdown) => {
    return [
      { name: "Entertainment", value: breakdown.entertainment, fill: "#8b5cf6" },
      { name: "Shopping", value: breakdown.shopping, fill: "#06b6d4" },
      { name: "Social", value: breakdown.social, fill: "#10b981" },
      { name: "Gaming", value: breakdown.gaming, fill: "#f59e0b" },
      { name: "Other", value: breakdown.other, fill: "#ef4444" },
    ].filter((item) => item.value > 0)
  }

  return (
    <div className="space-y-8 p-6 min-h-screen">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
            <p className="text-gray-600 mt-1">Track your learning journey and stay motivated</p>
          </div>
        </div>
        {/* Quick Stats */}
        <div className="hidden md:flex space-x-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{totalSessions}</div>
            <div className="text-sm text-gray-500">Total Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{activeDays}</div>
            <div className="text-sm text-gray-500">Active Days</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{currentStreak}</div>
            <div className="text-sm text-gray-500">Day Streak</div>
          </div>
        </div>
      </div>

      {/* Stats Cards for Mobile */}
      <div className="grid grid-cols-3 gap-4 md:hidden">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center p-4">
          <TrendingUp className="w-6 h-6 text-purple-500 mx-auto mb-2" />
          <div className="text-xl font-bold text-purple-600">{totalSessions}</div>
          <div className="text-xs text-gray-500">Sessions</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center p-4">
          <Calendar className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <div className="text-xl font-bold text-blue-600">{activeDays}</div>
          <div className="text-xs text-gray-500">Active Days</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center p-4">
          <Target className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <div className="text-xl font-bold text-green-600">{currentStreak}</div>
          <div className="text-xs text-gray-500">Streak</div>
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Activity Overview</h3>
          </div>
          <p className="text-sm text-gray-600">Your study activity over the past year</p>
        </div>
        <div className="p-6">
          <div className="w-full overflow-x-auto">
            <HeatMap
              value={heatMapData}
              width="100%"
              startDate={new Date(new Date().getFullYear(), 0, 1)}
              rectRender={(props, data) => (
                <Tooltip
                  placement="top"
                  content={
                    <div className="text-center">
                      <div className="font-medium">{data.count || 0} sessions</div>
                      <div className="text-xs opacity-75">{new Date(data.date).toLocaleDateString()}</div>
                    </div>
                  }
                >
                  <rect
                    {...props}
                    rx={3}
                    ry={3}
                    className="transition-all duration-200 hover:stroke-purple-400 hover:stroke-2"
                  />
                </Tooltip>
              )}
              panelColors={{
                0: "#f1f5f9", // Light lavender
                1: "#e9d5ff", // Soft purple
                2: "#d8b4fe", // Light violet
                3: "#c084fc", // Medium purple
                4: "#a855f7", // Deeper purple
                5: "#9333ea", // Vibrant purple
              }}
            />
          </div>
        </div>
      </div>

      {/* Session History */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-600 rounded-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Sessions</h3>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {historyData.length} sessions
            </span>
          </div>
        </div>
        {historyData.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {historyData.map((entry, index) => (
              <React.Fragment key={entry.id}>
                <div
                  className="flex items-center justify-between p-4 hover:bg-pink-50 transition-all duration-200 cursor-pointer group border-l-4 b-t-0 !border-t-0 !border-transparent hover:!border-purple-300"
                  onClick={() => toggleRow(entry.id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-purple-50 border border-purple-200 rounded-full text-sm font-medium text-purple-700 group-hover:bg-purple-100 transition-colors">
                      {entry.id}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 group-hover:text-gray-800">{entry.action}</div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{entry.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full group-hover:bg-gray-100 transition-colors">
                      {openRow === entry.id ? (
                        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      )}
                    </div>
                  </div>
                </div>
                {openRow === entry.id && (
                  <div className="bg-gray-50 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                    <div className="p-6 pl-16">
                      <div className="text-sm text-gray-700">
                        {entry.analytics ? (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                             {/* Distraction Breakdown Pie Chart */}
                            <div className="space-y-4">
                              <div className="flex items-center space-x-2">
                                <div className="w-1 h-5 bg-purple-500 rounded-full"></div>
                                <h4 className="font-semibold text-gray-800">Distraction Breakdown</h4>
                              </div>
                              {Object.values(entry.analytics.distractionBreakdown).some((val) => val > 0) ? (
                                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                                  <div className="h-[200px] flex justify-center">
                                    <PieChart width={320} height={240} margin={{ bottom: 40 }}>
                                      <Pie
                                        data={transformDistractionData(entry.analytics.distractionBreakdown)}
                                        cx="50%"
                                        cy="45%"
                                        innerRadius={35}
                                        outerRadius={65}
                                        dataKey="value"
                                        animationBegin={0}
                                        animationDuration={600}
                                      >
                                        {transformDistractionData(entry.analytics.distractionBreakdown).map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                      </Pie>
                                      <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-white rounded-lg border-2 border-dashed border-gray-200 p-8">
                                  <div className="flex flex-col items-center justify-center text-gray-500 text-sm">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                                      <Clock className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <span className="font-medium">No distractions recorded</span>
                                    <span className="text-xs text-gray-400 mt-1">Great focus session!</span>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Session Stats */}
                            <div className="space-y-4">
                              <div className="flex items-center space-x-2">
                                <div className="w-1 h-5 bg-purple-500 rounded-full"></div>
                                <h4 className="font-semibold text-gray-800">Session Summary</h4>
                              </div>
                              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                    <span className="text-gray-600 font-medium">Total Distractions</span>
                                    <span className="font-semibold text-lg text-gray-900 bg-gray-50 px-3 py-1 rounded-full">
                                      {entry.analytics.totalDistractions}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-start py-2">
                                    <span className="text-gray-600 font-medium">Most Visited</span>
                                    <div className="text-right max-w-[60%]">
                                      <span className="font-medium text-sm text-gray-900 bg-gray-50 px-2 py-1 rounded break-all">
                                        {entry.analytics.mostTimeSpentSite[0]?.url || "None"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white rounded-lg border-2 border-dashed border-gray-200 p-6 text-center">
                            <div className="text-gray-500 text-sm">
                              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Clock className="w-6 h-6 text-gray-400" />
                              </div>
                              <span className="font-medium">No analytics data available</span>
                              <div className="text-xs text-gray-400 mt-1">Data will appear after the session</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-6">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions yet</h3>
            <p className="text-gray-500 mb-4">Start your first study session to see your progress here</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to calculate current streak
function calculateCurrentStreak(heatMapData: HeatMapEntry[]): number {
  const sortedData = [...heatMapData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  let streak = 0
  for (const entry of sortedData) {
    if (entry.count > 0) {
      streak++
    } else {
      break
    }
  }
  return streak
}

export default ProfileTab
