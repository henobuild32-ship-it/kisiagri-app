import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Wallet, TrendingUp, Package, FileText } from "lucide-react";
import { t } from "@/lib/i18n";

const navItems = [
  { path: "/", icon: LayoutDashboard, labelKey: "dashboard" },
  { path: "/debts", icon: Wallet, labelKey: "debts" },
  { path: "/market", icon: TrendingUp, labelKey: "market" },
  { path: "/stocks", icon: Package, labelKey: "stocks" },
  { path: "/contracts", icon: FileText, labelKey: "contracts" },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ path, icon: Icon, labelKey }) => {
          const isActive = location.pathname === path || 
            (path !== "/" && location.pathname.startsWith(path));
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5px]" : ""}`} />
              <span className="text-[10px] mt-0.5 font-medium leading-tight">{t(labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}