import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Wallet, TrendingUp, Package, FileText, Users, Bell, ArrowRight, Activity } from "lucide-react";
import { t } from "@/lib/i18n";
import { formatCurrency, formatDateTime } from "@/lib/helpers";
import StatCard from "@/components/ui/StatCard";
import PageLoader from "@/components/ui/PageLoader";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [recentNotifs, setRecentNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboard(); }, []);

  async function loadDashboard() {
    try {
      const [debts, prices, inventory, contracts, logs, notifs] = await Promise.all([
        base44.entities.Debt.list("-created_date", 50),
        base44.entities.MarketPrice.list("-created_date", 50),
        base44.entities.Inventory.list("-created_date", 50),
        base44.entities.Contract.list("-created_date", 50),
        base44.entities.ActivityLog.list("-created_date", 5),
        base44.entities.Notification.filter({ is_read: false }, "-created_date", 5),
      ]);

      const totalDebt = debts.reduce((s, d) => s + (d.amount - (d.amount_paid || 0)), 0);
      const totalCollected = debts.reduce((s, d) => s + (d.amount_paid || 0), 0);
      const uniqueClients = new Set(debts.map(d => d.client_phone)).size;

      setStats({
        totalDebt,
        totalCollected,
        clientsCount: uniqueClients,
        productsTracked: prices.length,
        stocksPublished: inventory.filter(i => i.is_available).length,
        contractsGenerated: contracts.length,
        currency: debts[0]?.currency || "CDF",
      });
      setRecentActivity(logs);
      setRecentNotifs(notifs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <PageLoader />;

  const actionLabels = {
    creation: "Création",
    modification: "Modification",
    suppression: "Suppression",
    paiement: "Paiement",
    signature: "Signature",
    generation_contrat: "Contrat généré",
    publication_stock: "Stock publié",
    contribution_prix: "Prix soumis",
  };

  return (
    <div className="py-4 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t("dashboard")}</h1>
        <p className="text-xs text-gray-500">{t("tagline")}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Wallet} label={t("total_debts")} value={formatCurrency(stats?.totalDebt || 0, stats?.currency)} color="red" />
        <StatCard icon={TrendingUp} label={t("total_collected")} value={formatCurrency(stats?.totalCollected || 0, stats?.currency)} color="green" />
        <StatCard icon={Users} label={t("clients_count")} value={stats?.clientsCount || 0} color="blue" />
        <StatCard icon={TrendingUp} label={t("products_tracked")} value={stats?.productsTracked || 0} color="orange" />
        <StatCard icon={Package} label={t("stocks_published")} value={stats?.stocksPublished || 0} color="purple" />
        <StatCard icon={FileText} label={t("contracts_generated")} value={stats?.contractsGenerated || 0} color="blue" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/debts/new" className="flex items-center gap-3 bg-green-600 text-white rounded-2xl p-4 shadow-sm hover:bg-green-700 transition-colors">
          <Wallet className="w-5 h-5" />
          <span className="text-sm font-semibold">{t("add_debt")}</span>
        </Link>
        <Link to="/payments" className="flex items-center gap-3 bg-orange-500 text-white rounded-2xl p-4 shadow-sm hover:bg-orange-600 transition-colors">
          <TrendingUp className="w-5 h-5" />
          <span className="text-sm font-semibold">{t("mobile_money")}</span>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-600" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{t("recent_activity")}</h2>
          </div>
          <Link to="/audit" className="text-xs text-green-600 font-medium flex items-center gap-1">
            {t("view_all")} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {recentActivity.length === 0 && (
            <p className="text-xs text-gray-400 py-6 text-center">{t("no_data")}</p>
          )}
          {recentActivity.map(log => (
            <div key={log.id} className="px-4 py-3">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{log.description}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{actionLabels[log.action] || log.action} · {formatDateTime(log.created_date)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{t("recent_notifications")}</h2>
          </div>
          <Link to="/notifications" className="text-xs text-green-600 font-medium flex items-center gap-1">
            {t("view_all")} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {recentNotifs.length === 0 && (
            <p className="text-xs text-gray-400 py-6 text-center">{t("no_data")}</p>
          )}
          {recentNotifs.map(notif => (
            <div key={notif.id} className="px-4 py-3">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{notif.title}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{notif.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}