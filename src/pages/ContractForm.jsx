import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { t } from "@/lib/i18n";
import { CONTRACT_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

export default function ContractForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    type: "vente_agricole", title: "",
    party_a_name: "", party_a_phone: "", party_a_email: "", party_a_address: "",
    party_b_name: "", party_b_phone: "", party_b_email: "", party_b_address: "",
    subject: "", clauses: "", amount: "", currency: "CDF",
    start_date: "", end_date: "", content: ""
  });

  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function generateContract() {
    if (!form.party_a_name || !form.party_b_name || !form.subject) {
      toast({ title: t("error"), description: "Remplissez les informations des parties et l'objet", variant: "destructive" });
      return;
    }
    setGenerating(true);
    try {
      const typeLabel = CONTRACT_TYPES.find(ct => ct.id === form.type)?.label || form.type;
      const prompt = `Génère un contrat professionnel en français de type "${typeLabel}" avec les informations suivantes:

Partie A: ${form.party_a_name}, Tél: ${form.party_a_phone || "N/A"}, Email: ${form.party_a_email || "N/A"}, Adresse: ${form.party_a_address || "N/A"}
Partie B: ${form.party_b_name}, Tél: ${form.party_b_phone || "N/A"}, Email: ${form.party_b_email || "N/A"}, Adresse: ${form.party_b_address || "N/A"}
Objet: ${form.subject}
${form.clauses ? `Clauses spécifiques: ${form.clauses}` : ""}
${form.amount ? `Montant: ${form.amount} ${form.currency}` : ""}
${form.start_date ? `Date de début: ${form.start_date}` : ""}
${form.end_date ? `Date de fin: ${form.end_date}` : ""}

Le contrat doit:
- Être professionnel et juridiquement structuré
- Inclure un en-tête avec "KisiAgri - Plateforme Agricole Numérique"
- Inclure "Créé par HenoBuild Entreprise"
- Avoir des articles numérotés
- Inclure des clauses de force majeure et de résolution de litiges
- Se terminer par des espaces pour les signatures des deux parties
- Être adapté au contexte de la RD Congo`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            content: { type: "string" }
          }
        }
      });

      updateField("content", result.content || "");
      if (result.title && !form.title) updateField("title", result.title);
      toast({ title: t("success"), description: "Contrat généré avec succès" });
    } catch (e) {
      toast({ title: t("error"), description: e.message, variant: "destructive" });
    } finally { setGenerating(false); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.party_a_name || !form.party_b_name || !form.subject) {
      toast({ title: t("error"), description: "Remplissez les champs obligatoires", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const data = { ...form, amount: form.amount ? Number(form.amount) : 0, status: "brouillon" };
      const created = await base44.entities.Contract.create(data);
      await Promise.all([
        base44.entities.ActivityLog.create({
          action: "generation_contrat", entity_type: "Contract", entity_id: created.id,
          description: `Contrat créé: ${form.title}`
        }),
        base44.entities.Notification.create({
          title: "Nouveau contrat", message: `${form.title} - ${form.party_a_name} ↔ ${form.party_b_name}`, type: "contrat"
        })
      ]);
      toast({ title: t("success"), description: "Contrat enregistré" });
      navigate(`/contracts/${created.id}`);
    } catch (e) {
      toast({ title: t("error"), description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  }

  return (
    <div className="py-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <ArrowLeft className="w-4 h-4" /> {t("back")}
      </button>
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t("generate_contract")}</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 space-y-4">
          <h2 className="text-sm font-semibold">Informations générales</h2>
          <div>
            <Label className="text-xs">{t("contract_type")}</Label>
            <Select value={form.type} onValueChange={v => updateField("type", v)}>
              <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CONTRACT_TYPES.map(ct => <SelectItem key={ct.id} value={ct.id}>{ct.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Titre du contrat</Label>
            <Input value={form.title} onChange={e => updateField("title", e.target.value)} className="mt-1 rounded-xl" placeholder="Ex: Contrat de vente de maïs" />
          </div>
          <div>
            <Label className="text-xs">{t("subject")} *</Label>
            <Input value={form.subject} onChange={e => updateField("subject", e.target.value)} className="mt-1 rounded-xl" placeholder="Objet du contrat..." />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 space-y-4">
          <h2 className="text-sm font-semibold">{t("party_a")}</h2>
          <div>
            <Label className="text-xs">{t("name")} *</Label>
            <Input value={form.party_a_name} onChange={e => updateField("party_a_name", e.target.value)} className="mt-1 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">{t("phone")}</Label>
              <Input value={form.party_a_phone} onChange={e => updateField("party_a_phone", e.target.value)} className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label className="text-xs">{t("email")}</Label>
              <Input value={form.party_a_email} onChange={e => updateField("party_a_email", e.target.value)} className="mt-1 rounded-xl" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Adresse</Label>
            <Input value={form.party_a_address} onChange={e => updateField("party_a_address", e.target.value)} className="mt-1 rounded-xl" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 space-y-4">
          <h2 className="text-sm font-semibold">{t("party_b")}</h2>
          <div>
            <Label className="text-xs">{t("name")} *</Label>
            <Input value={form.party_b_name} onChange={e => updateField("party_b_name", e.target.value)} className="mt-1 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">{t("phone")}</Label>
              <Input value={form.party_b_phone} onChange={e => updateField("party_b_phone", e.target.value)} className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label className="text-xs">{t("email")}</Label>
              <Input value={form.party_b_email} onChange={e => updateField("party_b_email", e.target.value)} className="mt-1 rounded-xl" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Adresse</Label>
            <Input value={form.party_b_address} onChange={e => updateField("party_b_address", e.target.value)} className="mt-1 rounded-xl" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 space-y-4">
          <h2 className="text-sm font-semibold">Détails financiers</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">{t("amount")}</Label>
              <Input type="number" value={form.amount} onChange={e => updateField("amount", e.target.value)} className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label className="text-xs">{t("currency")}</Label>
              <Select value={form.currency} onValueChange={v => updateField("currency", v)}>
                <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CDF">CDF</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Date début</Label>
              <Input type="date" value={form.start_date} onChange={e => updateField("start_date", e.target.value)} className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label className="text-xs">Date fin</Label>
              <Input type="date" value={form.end_date} onChange={e => updateField("end_date", e.target.value)} className="mt-1 rounded-xl" />
            </div>
          </div>
        </div>

        <div>
          <Label className="text-xs">Clauses spécifiques</Label>
          <Textarea value={form.clauses} onChange={e => updateField("clauses", e.target.value)} className="mt-1 rounded-xl" rows={3} placeholder="Clauses additionnelles..." />
        </div>

        <Button type="button" onClick={generateContract} disabled={generating} variant="outline" className="w-full rounded-xl h-11 border-green-600 text-green-600">
          <Sparkles className="w-4 h-4 mr-2" /> {generating ? "Génération en cours..." : "Générer le contrat avec l'IA"}
        </Button>

        {form.content && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
            <h2 className="text-sm font-semibold mb-3">Aperçu du contrat</h2>
            <div className="prose prose-xs max-w-none text-xs whitespace-pre-wrap text-gray-700 dark:text-gray-300">{form.content}</div>
          </div>
        )}

        <Button type="submit" disabled={saving} className="w-full bg-green-600 hover:bg-green-700 rounded-xl h-12 text-sm font-semibold">
          {saving ? t("loading") : t("save")}
        </Button>
      </form>
    </div>
  );
}