import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Camera, User, Save } from "lucide-react";
import { t } from "@/lib/i18n";
import { AFRICAN_COUNTRIES, DRC_CITIES, USER_ROLES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageLoader from "@/components/ui/PageLoader";
import { useToast } from "@/components/ui/use-toast";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ debts: 0, contracts: 0, stocks: 0, prices: 0 });
  const { toast } = useToast();

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    try {
      const me = await base44.auth.me();
      const profiles = await base44.entities.Profile.filter({ created_by_id: me.id });
      const existingProfile = profiles[0];

      if (existingProfile) {
        setProfile(existingProfile);
      } else {
        setProfile({
          full_name: me.full_name || "", phone: "", email: me.email || "",
          country_code: "+243", country: "RDC", city: "", photo_url: "",
          role: "agriculteur", language: "fr"
        });
      }

      const [debts, contracts, stocks, prices] = await Promise.all([
        base44.entities.Debt.list("-created_date", 50),
        base44.entities.Contract.list("-created_date", 50),
        base44.entities.Inventory.list("-created_date", 50),
        base44.entities.MarketPrice.list("-created_date", 50),
      ]);
      setStats({ debts: debts.length, contracts: contracts.length, stocks: stocks.length, prices: prices.length });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function updateField(field, value) {
    setProfile(prev => ({ ...prev, [field]: value }));
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

  async function handleSave() {
    setSaving(true);
    try {
      const data = { ...profile };
      delete data.id;
      delete data.created_date;
      delete data.updated_date;
      delete data.created_by_id;

      if (profile.id) {
        await base44.entities.Profile.update(profile.id, data);
      } else {
        const created = await base44.entities.Profile.create(data);
        setProfile(created);
      }
      await base44.auth.updateMe({ full_name: profile.full_name });
      toast({ title: t("success"), description: "Profil mis à jour" });
    } catch (e) {
      toast({ title: t("error"), description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  }

  if (loading) return <PageLoader />;

  return (
    <div className="py-4 space-y-5">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t("profile")}</h1>

      {/* Photo */}
      <div className="flex flex-col items-center">
        <div className="relative">
          {profile?.photo_url ? (
            <img src={profile.photo_url} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-green-500" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center border-4 border-green-500">
              <User className="w-10 h-10 text-green-600" />
            </div>
          )}
          <label className="absolute bottom-0 right-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg">
            <Camera className="w-4 h-4 text-white" />
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          </label>
        </div>
        <h2 className="text-lg font-bold mt-3">{profile?.full_name || "Votre nom"}</h2>
        <p className="text-xs text-gray-500">{USER_ROLES.find(r => r.id === profile?.role)?.label}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Dettes", value: stats.debts },
          { label: "Contrats", value: stats.contracts },
          { label: "Stocks", value: stats.stocks },
          { label: "Prix", value: stats.prices },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl p-3 text-center border border-gray-100 dark:border-gray-800">
            <p className="text-lg font-bold text-green-700">{s.value}</p>
            <p className="text-[10px] text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 space-y-4">
        <div>
          <Label className="text-xs">{t("full_name")}</Label>
          <Input value={profile?.full_name || ""} onChange={e => updateField("full_name", e.target.value)} className="mt-1 rounded-xl" />
        </div>
        <div>
          <Label className="text-xs">{t("phone")}</Label>
          <div className="flex gap-2 mt-1">
            <Select value={profile?.country_code || "+243"} onValueChange={v => updateField("country_code", v)}>
              <SelectTrigger className="w-28 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {AFRICAN_COUNTRIES.map(c => (
                  <SelectItem key={c.code} value={c.dial}>{c.dial} {c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input value={profile?.phone || ""} onChange={e => updateField("phone", e.target.value)} className="flex-1 rounded-xl" placeholder="999 000 000" />
          </div>
        </div>
        <div>
          <Label className="text-xs">{t("email")}</Label>
          <Input value={profile?.email || ""} onChange={e => updateField("email", e.target.value)} className="mt-1 rounded-xl" />
        </div>
        <div>
          <Label className="text-xs">{t("city")}</Label>
          <Select value={profile?.city || ""} onValueChange={v => updateField("city", v)}>
            <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Choisir..." /></SelectTrigger>
            <SelectContent>
              {DRC_CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Rôle</Label>
          <Select value={profile?.role || "agriculteur"} onValueChange={v => updateField("role", v)}>
            <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              {USER_ROLES.map(r => <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSave} disabled={saving} className="w-full bg-green-600 hover:bg-green-700 rounded-xl h-11">
          <Save className="w-4 h-4 mr-2" /> {saving ? t("loading") : t("save")}
        </Button>
      </div>
    </div>
  );
}