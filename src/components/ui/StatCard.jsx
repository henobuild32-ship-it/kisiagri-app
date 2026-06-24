import React from "react";

export default function StatCard({ icon: Icon, label, value, color = "green", subtitle }) {
  const colorMap = {
    green: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    orange: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    red: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    purple: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate">{label}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1 truncate">{value}</p>
          {subtitle && <p className="text-[10px] text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-xl ${colorMap[color] || colorMap.green}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}