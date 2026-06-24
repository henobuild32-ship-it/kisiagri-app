import React from "react";
import { base44 } from "@/api/base44Client";
import { Globe, Moon, LogOut, Sprout, Heart, Info } from "lucide-react";
import { t, setLanguage, getLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GitHubExport from "@/components/settings/GitHubExport";

export default function Settings() {
  const currentLang = getLanguage();

  function handleLangChange(lang) {
    setLanguage(lang);
    window.location.reload();
  }

  async function handleLogout() {
    await base44.auth.logout("/login");
  }

  return (
    <div className="py-4 space-y-4">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t("settings")}</h1>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Language */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium">Langue</span>
          </div>
          <Select value={currentLang} onValueChange={handleLangChange}>
            <SelectTrigger className="w-32 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="ln">Lingala</SelectItem>
              <SelectItem value="sw">Swahili</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-4 w-full text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <LogOut className="w-5 h-5 text-red-500" />
          <span className="text-sm font-medium text-red-600">{t("logout")}</span>
        </button>
      </div>

      {/* GitHub Export */}
      <GitHubExport />

      {/* About */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-green-600">
          <Sprout className="w-8 h-8" />
          <span className="text-2xl font-bold">KisiAgri</span>
        </div>
        <p className="text-xs text-gray-500">Plateforme agricole numérique</p>
        <p className="text-xs text-gray-500">Version 1.0.0</p>
        <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-1">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t("created_by")}</p>
          <p className="text-xs text-gray-500">{t("founder")}</p>
        </div>
        <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400">
          <span>Fait avec</span>
          <Heart className="w-3 h-3 text-red-500 fill-red-500" />
          <span>en RD Congo</span>
        </div>
      </div>
    </div>
  );
}