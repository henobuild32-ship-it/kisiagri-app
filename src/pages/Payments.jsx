import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Smartphone, QrCode, CheckCircle, XCircle, Clock } from "lucide-react";
import { t } from "@/lib/i18n";
import { formatCurrency, generateReference } from "@/lib/helpers";
import { MOBILE_MONEY_PROVIDERS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageLoader from "@/components/ui/PageLoader";
import { useToast } from "@/components/ui/use-toast";

export default function Payments() {
  const [debts, setDebts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDebt, setSelectedDebt] = useState("");
  const [provider, setProvider] = useState("mpesa");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState("form"); // form, qr, processing, success, failed
  const [currentRef, setCurrentRef] = useState("");
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [d, tx] = await Promise.all([
        base44.entities.Debt.filter({ status: "en_attente" }, "-created_date", 50),
        base44.entities.MobileMoneyTransaction.list("-created_date", 20)
      ]);
      const partialDebts = await base44.entities.Debt.filter({ status: "partielle" }, "-created_date", 50);
      setDebts([...d, ...partialDebts]);
      setTransactions(tx);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function handleDebtSelect(debtId) {
    setSelectedDebt(debtId);
    const debt = debts.find(d => d.id === debtId);
    if (debt) {
      setAmount(String(debt.amount - (debt.amount_paid || 0)));
      setPhone(debt.client_phone || "");
    }
  }

  function generateQR() {
    if (!selectedDebt || !phone || !amount) {
      toast({ title: t("error"), description: "Remplissez tous les champs", variant: "destructive" });
      return;
    }
    const ref = generateReference();
    setCurrentRef(ref);
    setStep("qr");
  }

  async function simulatePayment() {
    setStep("processing");
    setProcessing(true);
    try {
      const debt = debts.find(d => d.id === selectedDebt);
      const payAmount = Number(amount);

      // Create transaction
      await base44.entities.MobileMoneyTransaction.create({
        debt_id: selectedDebt, amount: payAmount, currency: debt?.currency || "CDF",
        provider, phone, reference: currentRef, status: "success",
        qr_data: JSON.stringify({ ref: currentRef, amount: payAmount, provider, phone })
      });

      // Create payment record
      await base44.entities.DebtPayment.create({
        debt_id: selectedDebt, amount: payAmount, currency: debt?.currency || "CDF",
        method: provider, reference: currentRef, status: "confirmed"
      });

      // Update debt
      const newPaid = (debt?.amount_paid || 0) + payAmount;
      const newStatus = newPaid >= (debt?.amount || 0) ? "payee" : "partielle";
      await base44.entities.Debt.update(selectedDebt, { amount_paid: newPaid, status: newStatus });

      await Promise.all([
        base44.entities.ActivityLog.create({
          action: "paiement", entity_type: "MobileMoneyTransaction",
          description: `Paiement Mobile Money de ${payAmount} ${debt?.currency} via ${provider} - Ref: ${currentRef}`
        }),
        base44.entities.Notification.create({
          title: "Paiement Mobile Money reçu",
          message: `${payAmount} ${debt?.currency} de ${debt?.client_name} via ${provider}`,
          type: "paiement"
        })
      ]);

      setStep("success");
    } catch (e) {
      setStep("failed");
      toast({ title: t("error"), description: e.message, variant: "destructive" });
    } finally { setProcessing(false); }
  }

  function resetForm() {
    setStep("form");
    setSelectedDebt("");
    setProvider("mpesa");
    setPhone("");
    setAmount("");
    setCurrentRef("");
    loadData();
  }

  if (loading) return <PageLoader />;

  const selectedDebtData = debts.find(d => d.id === selectedDebt);
  const providerData = MOBILE_MONEY_PROVIDERS.find(p => p.id === provider);

  return (
    <div className="py-4 space-y-4">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t("mobile_money")}</h1>

      {step === "form" && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
            <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-900/30">
              <Smartphone className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Encaissement Mobile Money</h2>
              <p className="text-[10px] text-gray-500">Recevez des paiements via Mobile Money</p>
            </div>
          </div>

          <div>
            <Label className="text-xs">{t("select_debt")} *</Label>
            <Select value={selectedDebt} onValueChange={handleDebtSelect}>
              <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Choisir une dette..." /></SelectTrigger>
              <SelectContent>
                {debts.map(d => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.client_name} - {formatCurrency(d.amount - (d.amount_paid || 0), d.currency)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Fournisseur *</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MOBILE_MONEY_PROVIDERS.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">{t("phone")} *</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 rounded-xl" placeholder="+243..." />
          </div>

          <div>
            <Label className="text-xs">{t("amount")} *</Label>
            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 rounded-xl" placeholder="0" />
          </div>

          <Button onClick={generateQR} className="w-full bg-orange-500 hover:bg-orange-600 rounded-xl h-12">
            <QrCode className="w-4 h-4 mr-2" /> {t("generate_qr")}
          </Button>
        </div>
      )}

      {step === "qr" && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 text-center space-y-4">
          <div className="inline-flex p-3 rounded-2xl" style={{ backgroundColor: providerData?.color + "15" }}>
            <QrCode className="w-8 h-8" style={{ color: providerData?.color }} />
          </div>
          <h2 className="text-lg font-bold">{providerData?.name}</h2>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Client</span>
              <span className="font-medium">{selectedDebtData?.client_name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Montant</span>
              <span className="font-bold text-lg">{formatCurrency(Number(amount), selectedDebtData?.currency)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Téléphone</span>
              <span className="font-medium">{phone}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Référence</span>
              <span className="font-mono font-bold text-green-600">{currentRef}</span>
            </div>
          </div>
          <div className="w-48 h-48 mx-auto bg-white border-2 border-gray-200 rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <QrCode className="w-24 h-24 text-gray-800 mx-auto" />
              <p className="text-[8px] text-gray-400 mt-1">{currentRef}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={resetForm} variant="outline" className="flex-1 rounded-xl">{t("cancel")}</Button>
            <Button onClick={simulatePayment} className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl">
              {t("simulate_payment")}
            </Button>
          </div>
        </div>
      )}

      {step === "processing" && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 text-center space-y-4">
          <Clock className="w-16 h-16 text-orange-500 mx-auto animate-pulse" />
          <h2 className="text-lg font-bold">Traitement en cours...</h2>
          <p className="text-sm text-gray-500">Vérification du paiement {providerData?.name}</p>
        </div>
      )}

      {step === "success" && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mx-auto flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-green-700 dark:text-green-400">Paiement réussi !</h2>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2 text-left">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Montant</span>
              <span className="font-bold">{formatCurrency(Number(amount), selectedDebtData?.currency)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Via</span>
              <span className="font-medium">{providerData?.name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Référence</span>
              <span className="font-mono font-bold">{currentRef}</span>
            </div>
          </div>
          <Button onClick={resetForm} className="w-full bg-green-600 rounded-xl">Nouveau paiement</Button>
        </div>
      )}

      {step === "failed" && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 text-center space-y-4">
          <XCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-red-600">Paiement échoué</h2>
          <p className="text-sm text-gray-500">Veuillez réessayer</p>
          <Button onClick={resetForm} variant="outline" className="rounded-xl">Réessayer</Button>
        </div>
      )}

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <h3 className="text-sm font-semibold px-4 py-3 border-b border-gray-100 dark:border-gray-800">Transactions récentes</h3>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {transactions.map(tx => (
              <div key={tx.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium">{MOBILE_MONEY_PROVIDERS.find(p => p.id === tx.provider)?.name} · {tx.reference}</p>
                  <p className="text-[10px] text-gray-400">{tx.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">{formatCurrency(tx.amount, tx.currency)}</p>
                  <span className={`text-[10px] ${tx.status === "success" ? "text-green-500" : tx.status === "failed" ? "text-red-500" : "text-yellow-500"}`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}