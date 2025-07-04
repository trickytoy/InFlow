"use client"

import HeatMap from "@uiw/react-heat-map"
import Tooltip from "@uiw/react-tooltip"

// Heatmap data
interface HeatMapEntry {
  date: string
  count: number
}

interface ProfileTabProps {
  userName: string
  historyData: { id: number; action: string; date: string }[]
  heatMapData: HeatMapEntry[]
}

const ProfileTab = ({ userName, historyData, heatMapData }: ProfileTabProps) => {
  return (
    <div className="space-y-10">
      {/* User Info */}
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
          {userName[0]}
        </div>
        <div>
          <div className="text-4xl font-extrabold text-gray-800">Welcome, {userName}!</div>
          <div className="text-gray-500">Here's your recent study activity.</div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Study Heatmap</h2>
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
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Session History</h2>
        {historyData.length > 0 ? (
          <table className="w-full table-auto">
            <thead className="text-gray-600 text-sm uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Session</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {historyData.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">{entry.id}</td>
                  <td className="px-4 py-3">{entry.action}</td>
                  <td className="px-4 py-3 text-gray-500">{entry.date}</td>
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
