"use client"

import HeatMap from "@uiw/react-heat-map"
import Tooltip from "@uiw/react-tooltip"
import { Activity } from "lucide-react"

// Heatmap data
interface HeatMapEntry {
  date: string
  count: number
}

interface ProfileTabProps {
  historyData: { id: number; action: string; date: string }[]
  heatMapData: HeatMapEntry[]
}

const ProfileTab = ({historyData, heatMapData }: ProfileTabProps) => {
  return (
    <div className="space-y-10">
      {/* User Info */}
      <div className="flex items-center space-x-4">
        <Activity className="w-10 h-10 text-[#8c52ff]" />
        <div>
          <div className="text-4xl font-extrabold text-gray-800">Welcome!</div>
          <div className="text-gray-500">Here's your recent study activity.</div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-white rounded-xl shadow-lg pt-6 pb-4 pl-6 pr-6">
        <div className="w-full overflow-x-auto">
          <HeatMap
            value={heatMapData}
            width="100%"
            startDate={new Date(new Date().getFullYear(), 0, 1)}
            rectRender={(props, data) => (
              <Tooltip placement="top" content={`Sessions: ${data.count || 0}`}>
                <rect {...props} rx={4} ry={4} />
              </Tooltip>
            )}
            panelColors={{
              0: "#e5e7eb",
              1: "#a5b4fc",
              2: "#6366f1",
              3: "#4338ca",
              4: "#3730a3",
              5: "#312e81",
            }}
          />
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Session History</h2>
        {historyData.length > 0 ? (
          <table className="w-full table-auto">
            <thead className="text-gray-600 text-sm uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left">#</th>
                <th className="px-6 py-4 text-left">Session</th>
                <th className="px-6 py-4 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {historyData.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-800">{entry.id}</td>
                  <td className="px-6 py-4">{entry.action}</td>
                  <td className="px-6 py-4 text-gray-500">{entry.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-gray-500">No study sessions recorded yet.</div>
        )}
      </div>
    </div>
  )
}

export default ProfileTab
