import React from "react";
import { Sprout, Wallet, TrendingUp, Package, FileText, Smartphone, Bell, BookOpen, ArrowRight } from "lucide-react";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export default function Onboarding({ onFinish }) {
  const features = [
    { icon: Wallet, color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400", title: t("debts"), desc: t("feature_debts_desc") },
    { icon: TrendingUp, color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400", title: t("market_prices"), desc: t("feature_market_desc") },
    { icon: Package, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400", title: t("stocks"), desc: t("feature_stocks_desc") },
    { icon: FileText, color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400", title: t("contracts"), desc: t("feature_contracts_desc") },
    { icon: Smartphone, color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400", title: t("mobile_money"), desc: t("feature_payments_desc") },
    { icon: Bell, color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400", title: t("notifications"), desc: t("feature_notifications_desc") },
    { icon: BookOpen, color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400", title: t("audit"), desc: t("feature_audit_desc") },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 max-w-md mx-auto w-full">
        <div className="w-20 h-20 rounded-3xl bg-green-600 flex items-center justify-center mb-5 shadow-lg shadow-green-600/30">
          <Sprout className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          {t("welcome_title")} 🌱
        </h1>
        <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">{t("welcome_subtitle")}</p>
        <p className="text-sm text-muted-foreground text-center mt-4 mb-6">{t("onboarding_intro")}</p>

        <div className="space-y-3 w-full">
          {features.map((f, i) => (
            <div key={i} className="flex items-start gap-3 bg-white dark:bg-gray-900 rounded-2xl p-3.5 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${f.color}`}>
                <f.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{f.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Button onClick={onFinish} className="w-full h-12 mt-6 bg-green-600 hover:bg-green-700 rounded-xl font-medium">
          {t("get_started")}
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
        <p className="text-center text-[10px] text-gray-400 mt-4">{t("created_by")}</p>
      </div>
    </div>
  );
}