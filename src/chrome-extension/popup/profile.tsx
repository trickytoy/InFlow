export const Profile = () => {
  const userName = "Hritwik";

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg">
          {userName[0]}
        </div>
        <div>
          <div className="text-2xl font-extrabold text-gray-800">Welcome!</div>
          <div className="text-gray-500">Your activity summary</div>
        </div>
      </div>

      <div
        className="w-full h-36 bg-white border border-gray-200 flex items-center justify-center rounded-xl shadow-inner"
        style={{ marginTop: "20px" }}
      >
        <span className="text-gray-400">Graph will appear here</span>
      </div>
    </div>
  );
};