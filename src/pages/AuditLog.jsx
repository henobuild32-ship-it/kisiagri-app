import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BookOpen, Filter } from "lucide-react";
import { t } from "@/lib/i18n";
import { formatDateTime } from "@/lib/helpers";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EmptyState from "@/components/ui/EmptyState";
import PageLoader from "@/components/ui/PageLoader";

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

const actionColors = {
  creation: "bg-green-100 text-green-700",
  modification: "bg-blue-100 text-blue-700",
  suppression: "bg-red-100 text-red-700",
  paiement: "bg-orange-100 text-orange-700",
  signature: "bg-purple-100 text-purple-700",
  generation_contrat: "bg-indigo-100 text-indigo-700",
  publication_stock: "bg-teal-100 text-teal-700",
  contribution_prix: "bg-yellow-100 text-yellow-700",
};

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState("all");

  useEffect(() => { loadLogs(); }, []);

  async function loadLogs() {
    try {
      const data = await base44.entities.ActivityLog.list("-created_date", 50);
      setLogs(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const filtered = filterAction === "all" ? logs : logs.filter(l => l.action === filterAction);

  if (loading) return <PageLoader />;

  return (
    <div className="py-4 space-y-4">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t("audit")}</h1>

      <Select value={filterAction} onValueChange={setFilterAction}>
        <SelectTrigger className="rounded-xl bg-white dark:bg-gray-900">
          <SelectValue placeholder="Filtrer par action" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les actions</SelectItem>
          {Object.entries(actionLabels).map(([key, label]) => (
            <SelectItem key={key} value={key}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {filtered.length === 0 ? (
        <EmptyState icon={BookOpen} title="Aucune activité" description="Le journal d'audit sera rempli au fil de vos actions" />
      ) : (
        <div className="space-y-2">
          {filtered.map(log => (
            <div key={log.id} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
              <div className="flex items-start gap-3">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${actionColors[log.action] || "bg-gray-100 text-gray-600"}`}>
                  {actionLabels[log.action] || log.action}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{log.description}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{log.entity_type} · {formatDateTime(log.created_date)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}