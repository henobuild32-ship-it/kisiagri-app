import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Camera } from "lucide-react";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageLoader from "@/components/ui/PageLoader";
import { useToast } from "@/components/ui/use-toast";

export default function DebtForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id && id !== "new";
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    client_name: "",
    client_phone: "",
    amount: "",
    currency: "CDF",
    description: "",
    due_date: "",
    photo_url: "",
  });

  useEffect(() => {
    if (isEdit) loadDebt();
  }, [id]);

  async function loadDebt() {
    try {
      const debt = await base44.entities.Debt.get(id);
      setForm({
        client_name: debt.client_name || "",
        client_phone: debt.client_phone || "",
        amount: debt.amount || "",
        currency: debt.currency || "CDF",
        description: debt.description || "",
        due_date: debt.due_date || "",
        photo_url: debt.photo_url || "",
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      updateField("photo_url", file_url);
    } catch (err) {
      toast({ title: t("error"), description: "Échec du téléchargement", variant: "destructive" });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.client_name || !form.client_phone || !form.amount) {
      toast({ title: t("error"), description: "Remplissez les champs obligatoires", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const data = { ...form, amount: Number(form.amount) };
      if (isEdit) {
        await base44.entities.Debt.update(id, data);
        await base44.entities.ActivityLog.create({
          action: "modification", entity_type: "Debt", entity_id: id,
          description: `Dette modifiée pour ${form.client_name}`
        });
      } else {
        const created = await base44.entities.Debt.create(data);
        await Promise.all([
          base44.entities.ActivityLog.create({
            action: "creation", entity_type: "Debt", entity_id: created.id,
            description: `Nouvelle dette de ${form.amount} ${form.currency} pour ${form.client_name}`
          }),
          base44.entities.Notification.create({
            title: "Nouvelle dette",
            message: `${form.client_name} - ${form.amount} ${form.currency}`,
            type: "dette"
          })
        ]);
      }
      toast({ title: t("success"), description: isEdit ? "Dette modifiée" : "Dette créée" });
      navigate("/debts");
    } catch (err) {
      toast({ title: t("error"), description: err.message, variant: "destructive" });
    } finally { setSaving(false); }
  }

  if (loading) return <PageLoader />;

  return (
    <div className="py-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <ArrowLeft className="w-4 h-4" /> {t("back")}
      </button>
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{isEdit ? t("edit_debt") : t("add_debt")}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="text-xs font-medium">{t("client_name")} *</Label>
          <Input value={form.client_name} onChange={e => updateField("client_name", e.target.value)} className="mt-1 rounded-xl" placeholder="Ex: Jean Mukendi" />
        </div>
        <div>
          <Label className="text-xs font-medium">{t("client_phone")} *</Label>
          <Input value={form.client_phone} onChange={e => updateField("client_phone", e.target.value)} className="mt-1 rounded-xl" placeholder="+243 999 000 000" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-medium">{t("amount")} *</Label>
            <Input type="number" value={form.amount} onChange={e => updateField("amount", e.target.value)} className="mt-1 rounded-xl" placeholder="0" />
          </div>
          <div>
            <Label className="text-xs font-medium">{t("currency")}</Label>
            <Select value={form.currency} onValueChange={v => updateField("currency", v)}>
              <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CDF">CDF</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label className="text-xs font-medium">{t("due_date")}</Label>
          <Input type="date" value={form.due_date} onChange={e => updateField("due_date", e.target.value)} className="mt-1 rounded-xl" />
        </div>
        <div>
          <Label className="text-xs font-medium">{t("description")}</Label>
          <Textarea value={form.description} onChange={e => updateField("description", e.target.value)} className="mt-1 rounded-xl" rows={3} placeholder="Détails..." />
        </div>
        <div>
          <Label className="text-xs font-medium">Photo</Label>
          <div className="mt-1">
            {form.photo_url && <img src={form.photo_url} alt="Photo" className="w-20 h-20 rounded-xl object-cover mb-2" />}
            <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors w-fit">
              <Camera className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Ajouter une photo</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>
        </div>
        <Button type="submit" disabled={saving} className="w-full bg-green-600 hover:bg-green-700 rounded-xl h-12 text-sm font-semibold">
          {saving ? t("loading") : t("save")}
        </Button>
      </form>
    </div>
  );
}