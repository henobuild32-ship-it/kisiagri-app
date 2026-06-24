import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, DollarSign, CheckCircle } from "lucide-react";
import { t } from "@/lib/i18n";
import { formatCurrency, formatDate, formatDateTime, getDebtProgress } from "@/lib/helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import StatusBadge from "@/components/ui/StatusBadge";
import PageLoader from "@/components/ui/PageLoader";
import { useToast } from "@/components/ui/use-toast";

export default function DebtDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [debt, setDebt] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("cash");
  const [paying, setPaying] = useState(false);

  useEffect(() => { loadData(); }, [id]);

  async function loadData() {
    try {
      const [d, p] = await Promise.all([
        base44.entities.Debt.get(id),
        base44.entities.DebtPayment.filter({ debt_id: id }, "-created_date", 50)
      ]);
      setDebt(d);
      setPayments(p);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handlePayment() {
    const amount = Number(payAmount);
    if (!amount || amount <= 0) return;
    setPaying(true);
    try {
      const newPaid = (debt.amount_paid || 0) + amount;
      const newStatus = newPaid >= debt.amount ? "payee" : "partielle";

      await base44.entities.DebtPayment.create({
        debt_id: id, amount, currency: debt.currency, method: payMethod, status: "confirmed"
      });
      await base44.entities.Debt.update(id, { amount_paid: newPaid, status: newStatus });
      await Promise.all([
        base44.entities.ActivityLog.create({
          action: "paiement", entity_type: "Debt", entity_id: id,
          description: `Paiement de ${amount} ${debt.currency} reçu de ${debt.client_name}`
        }),
        base44.entities.Notification.create({
          title: "Paiement reçu",
          message: `${debt.client_name} a payé ${amount} ${debt.currency}`,
          type: "paiement"
        })
      ]);
      toast({ title: t("success"), description: "Paiement enregistré" });
      setPaymentOpen(false);
      setPayAmount("");
      loadData();
    } catch (e) {
      toast({ title: t("error"), description: e.message, variant: "destructive" });
    } finally { setPaying(false); }
  }

  async function markFullyPaid() {
    try {
      const remaining = debt.amount - (debt.amount_paid || 0);
      await base44.entities.DebtPayment.create({
        debt_id: id, amount: remaining, currency: debt.currency, method: "cash", status: "confirmed"
      });
      await base44.entities.Debt.update(id, { amount_paid: debt.amount, status: "payee" });
      await base44.entities.Notification.create({
        title: "Dette payée", message: `${debt.client_name} a soldé sa dette`, type: "paiement"
      });
      toast({ title: t("success"), description: "Dette marquée comme payée" });
      loadData();
    } catch (e) {
      toast({ title: t("error"), description: e.message, variant: "destructive" });
    }
  }

  async function handleDelete() {
    if (!confirm(t("confirm_delete"))) return;
    try {
      await base44.entities.Debt.delete(id);
      await base44.entities.ActivityLog.create({
        action: "suppression", entity_type: "Debt",
        description: `Dette supprimée pour ${debt.client_name}`
      });
      toast({ title: t("success"), description: "Dette supprimée" });
      navigate("/debts");
    } catch (e) {
      toast({ title: t("error"), description: e.message, variant: "destructive" });
    }
  }

  if (loading) return <PageLoader />;
  if (!debt) return <div className="py-20 text-center text-gray-500">Dette non trouvée</div>;

  const remaining = debt.amount - (debt.amount_paid || 0);
  const progress = getDebtProgress(debt);

  return (
    <div className="py-4 space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate("/debts")} className="flex items-center gap-2 text-sm text-gray-500">
          <ArrowLeft className="w-4 h-4" /> {t("back")}
        </button>
        <div className="flex gap-2">
          <Link to={`/debts/${id}/edit`}>
            <Button size="sm" variant="outline" className="rounded-xl"><Edit className="w-4 h-4" /></Button>
          </Link>
          <Button size="sm" variant="outline" className="rounded-xl text-red-600" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{debt.client_name}</h2>
            <p className="text-xs text-gray-500">{debt.client_phone}</p>
          </div>
          <StatusBadge status={debt.status} />
        </div>
        {debt.photo_url && <img src={debt.photo_url} alt="" className="w-full h-32 rounded-xl object-cover mb-3" />}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{t("amount")} total</span>
            <span className="font-bold">{formatCurrency(debt.amount, debt.currency)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Payé</span>
            <span className="font-medium text-green-600">{formatCurrency(debt.amount_paid || 0, debt.currency)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Reste</span>
            <span className="font-bold text-red-600">{formatCurrency(remaining, debt.currency)}</span>
          </div>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        {debt.description && <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{debt.description}</p>}
        <div className="flex gap-2 text-[10px] text-gray-400">
          <span>Créée: {formatDate(debt.created_date)}</span>
          {debt.due_date && <span>· Échéance: {formatDate(debt.due_date)}</span>}
        </div>
      </div>

      {debt.status !== "payee" && (
        <div className="flex gap-3">
          <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl h-11">
                <DollarSign className="w-4 h-4 mr-2" /> {t("add_payment")}
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader><DialogTitle>{t("add_payment")}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs">Montant (max: {formatCurrency(remaining, debt.currency)})</Label>
                  <Input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} max={remaining} className="mt-1 rounded-xl" placeholder="0" />
                </div>
                <div>
                  <Label className="text-xs">Mode de paiement</Label>
                  <Select value={payMethod} onValueChange={setPayMethod}>
                    <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="mpesa">M-Pesa</SelectItem>
                      <SelectItem value="orange_money">Orange Money</SelectItem>
                      <SelectItem value="airtel_money">Airtel Money</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handlePayment} disabled={paying} className="w-full bg-green-600 rounded-xl">
                  {paying ? t("loading") : t("save")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={markFullyPaid} variant="outline" className="rounded-xl h-11">
            <CheckCircle className="w-4 h-4 mr-2" /> {t("mark_paid")}
          </Button>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <h3 className="text-sm font-semibold px-4 py-3 border-b border-gray-100 dark:border-gray-800">Historique des paiements</h3>
        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {payments.length === 0 && <p className="text-xs text-gray-400 py-6 text-center">Aucun paiement</p>}
          {payments.map(p => (
            <div key={p.id} className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">+{formatCurrency(p.amount, p.currency)}</p>
                <p className="text-[10px] text-gray-400">{p.method} · {formatDateTime(p.created_date)}</p>
              </div>
              <StatusBadge status={p.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}