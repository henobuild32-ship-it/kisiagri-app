import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { Plus, FileText, Search } from "lucide-react";
import { t } from "@/lib/i18n";
import { formatCurrency, formatDate } from "@/lib/helpers";
import { CONTRACT_TYPES } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import PageLoader from "@/components/ui/PageLoader";

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => { loadContracts(); }, []);

  async function loadContracts() {
    try {
      const data = await base44.entities.Contract.list("-created_date", 50);
      setContracts(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const filtered = contracts.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.party_a_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.party_b_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <PageLoader />;

  return (
    <div className="py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t("contracts")}</h1>
        <Button onClick={() => navigate("/contracts/new")} size="sm" className="bg-green-600 hover:bg-green-700 rounded-xl">
          <Plus className="w-4 h-4 mr-1" /> {t("generate_contract")}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder={t("search")} value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-xl bg-white dark:bg-gray-900" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={t("no_data")}
          description="Générez votre premier contrat professionnel"
          action={<Button onClick={() => navigate("/contracts/new")} size="sm" className="bg-green-600 rounded-xl">{t("generate_contract")}</Button>}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(contract => (
            <Link
              key={contract.id}
              to={`/contracts/${contract.id}`}
              className="block bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{contract.title}</h3>
                  <p className="text-xs text-gray-500">{CONTRACT_TYPES.find(t => t.id === contract.type)?.label}</p>
                </div>
                <StatusBadge status={contract.status} />
              </div>
              <div className="flex items-center gap-4 text-[10px] text-gray-500">
                <span>{contract.party_a_name} ↔ {contract.party_b_name}</span>
              </div>
              {contract.amount > 0 && (
                <p className="text-sm font-bold text-green-700 dark:text-green-400 mt-1">{formatCurrency(contract.amount, contract.currency)}</p>
              )}
              <p className="text-[10px] text-gray-400 mt-1">{formatDate(contract.created_date)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}