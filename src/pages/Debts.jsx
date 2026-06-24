import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Wallet } from "lucide-react";
import { t } from "@/lib/i18n";
import { formatCurrency, formatDate, getDebtProgress, isOverdue } from "@/lib/helpers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import PageLoader from "@/components/ui/PageLoader";

export default function Debts() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => { loadDebts(); }, []);

  async function loadDebts() {
    try {
      const data = await base44.entities.Debt.list("-created_date", 50);
      // Auto-update overdue
      const updated = data.map(d => {
        if (d.status === "en_attente" && isOverdue(d.due_date)) {
          return { ...d, status: "en_retard" };
        }
        return d;
      });
      setDebts(updated);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const filtered = debts.filter(d => {
    const matchSearch = d.client_name.toLowerCase().includes(search.toLowerCase()) ||
      d.client_phone.includes(search);
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statuses = ["all", "en_attente", "partielle", "payee", "en_retard"];

  if (loading) return <PageLoader />;

  return (
    <div className="py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t("debts")}</h1>
        <Button onClick={() => navigate("/debts/new")} size="sm" className="bg-green-600 hover:bg-green-700 rounded-xl">
          <Plus className="w-4 h-4 mr-1" /> {t("add_debt")}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder={t("search")}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 rounded-xl bg-white dark:bg-gray-900"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              statusFilter === s
                ? "bg-green-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
            }`}
          >
            {s === "all" ? t("all") : t(s)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title={t("no_data")}
          description="Ajoutez votre première dette pour commencer le suivi"
          action={<Button onClick={() => navigate("/debts/new")} size="sm" className="bg-green-600 rounded-xl">{t("add_debt")}</Button>}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(debt => (
            <Link
              key={debt.id}
              to={`/debts/${debt.id}`}
              className="block bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{debt.client_name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{debt.client_phone}</p>
                </div>
                <StatusBadge status={debt.status} />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(debt.amount, debt.currency)}</p>
                  {debt.amount_paid > 0 && (
                    <p className="text-[10px] text-green-600">Payé: {formatCurrency(debt.amount_paid, debt.currency)}</p>
                  )}
                </div>
                {debt.due_date && (
                  <p className={`text-[10px] ${isOverdue(debt.due_date) ? "text-red-500 font-semibold" : "text-gray-400"}`}>
                    Échéance: {formatDate(debt.due_date)}
                  </p>
                )}
              </div>
              {debt.amount_paid > 0 && (
                <div className="mt-2 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${getDebtProgress(debt)}%` }}
                  />
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}