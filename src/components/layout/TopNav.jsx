import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bell, User, Menu, X, Sprout, LogOut, BookOpen, Settings, Globe, Wallet } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { t, setLanguage, getLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TopNav() {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useState(getLanguage());

  useEffect(() => {
    loadNotifications();
  }, [location.pathname]);

  async function loadNotifications() {
    try {
      const notifs = await base44.entities.Notification.filter({ is_read: false });
      setUnreadCount(notifs.length);
    } catch(e) { /* ignore */ }
  }

  function toggleLang() {
    const cycle = { fr: "ln", ln: "sw", sw: "fr" };
    const newLang = cycle[lang] || "fr";
    setLanguage(newLang);
    setLang(newLang);
    window.location.reload();
  }

  async function handleLogout() {
    await base44.auth.logout("/login");
  }

  const mobileLinks = [
    { path: "/payments", label: t("mobile_money"), icon: Wallet },
    { path: "/audit", label: t("audit"), icon: BookOpen },
    { path: "/notifications", label: t("notifications"), icon: Bell },
    { path: "/profile", label: t("profile"), icon: User },
    { path: "/settings", label: t("settings"), icon: Settings },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-green-700 text-white safe-area-top">
        <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
          <Link to="/" className="flex items-center gap-2">
            <Sprout className="w-6 h-6" />
            <span className="font-bold text-lg tracking-tight">KisiAgri</span>
          </Link>
          <div className="flex items-center gap-1">
            <button onClick={toggleLang} className="p-2 rounded-full hover:bg-green-600 transition-colors">
              <Globe className="w-5 h-5" />
            </button>
            <Link to="/notifications" className="p-2 rounded-full hover:bg-green-600 transition-colors relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-full hover:bg-green-600 transition-colors">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-40 pt-14" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute right-0 top-14 w-64 bg-white dark:bg-gray-900 shadow-xl rounded-bl-2xl" onClick={e => e.stopPropagation()}>
            <div className="py-2">
              {mobileLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Icon className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">{label}</span>
                </Link>
              ))}
              <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-medium">{t("logout")}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}