import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Package, MapPin, Phone, Search } from "lucide-react";
import { t } from "@/lib/i18n";
import { formatCurrency, formatDate } from "@/lib/helpers";
import { DEFAULT_PRODUCTS, DRC_CITIES } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import EmptyState from "@/components/ui/EmptyState";
import PageLoader from "@/components/ui/PageLoader";
import { useToast } from "@/components/ui/use-toast";

export default function Stocks() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const [form, setForm] = useState({
    product: "", quantity: "", unit: "kg", price: "", currency: "CDF",
    city: "", phone: "", description: ""
  });

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    try {
      const data = await base44.entities.Inventory.list("-created_date", 50);
      setItems(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.product || !form.quantity || !form.price || !form.city || !form.phone) {
      toast({ title: t("error"), description: "Remplissez les champs obligatoires", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const me = await base44.auth.me();
      await base44.entities.Inventory.create({
        ...form, quantity: Number(form.quantity), price: Number(form.price),
        country: "RDC", seller_name: me.full_name || me.email || "Vendeur", is_available: true
      });
      await Promise.all([
        base44.entities.ActivityLog.create({
          action: "publication_stock", entity_type: "Inventory",
          description: `Stock publié: ${form.quantity} ${form.unit} de ${form.product} à ${form.city}`
        }),
        base44.entities.Notification.create({
          title: "Nouveau stock publié", message: `${form.product} - ${form.quantity} ${form.unit} à ${form.city}`, type: "stock"
        })
      ]);
      toast({ title: t("success"), description: "Stock publié" });
      setDialogOpen(false);
      setForm({ product: "", quantity: "", unit: "kg", price: "", currency: "CDF", city: "", phone: "", description: "" });
      loadItems();
    } catch (e) {
      toast({ title: t("error"), description: e.message, variant: "destructive" });
    } finally { setSubmitting(false); }
  }

  const filtered = items.filter(i =>
    i.product?.toLowerCase().includes(search.toLowerCase()) ||
    i.city?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <PageLoader />;

  return (
    <div className="py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t("stocks")}</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 rounded-xl">
              <Plus className="w-4 h-4 mr-1" /> {t("publish_stock")}
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{t("publish_stock")}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-xs">{t("product")} *</Label>
                <Select value={form.product} onValueChange={v => setForm(f => ({ ...f, product: v }))}>
                  <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Choisir..." /></SelectTrigger>
                  <SelectContent>
                    {DEFAULT_PRODUCTS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">{t("quantity")} *</Label>
                  <Input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} className="mt-1 rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs">{t("unit")}</Label>
                  <Select value={form.unit} onValueChange={v => setForm(f => ({ ...f, unit: v }))}>
                    <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="sac">Sac</SelectItem>
                      <SelectItem value="tonne">Tonne</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">{t("price")} *</Label>
                  <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="mt-1 rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs">{t("currency")}</Label>
                  <Select value={form.currency} onValueChange={v => setForm(f => ({ ...f, currency: v }))}>
                    <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CDF">CDF</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs">{t("city")} *</Label>
                <Select value={form.city} onValueChange={v => setForm(f => ({ ...f, city: v }))}>
                  <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Choisir..." /></SelectTrigger>
                  <SelectContent>
                    {DRC_CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">{t("phone")} *</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="mt-1 rounded-xl" placeholder="+243..." />
              </div>
              <div>
                <Label className="text-xs">{t("description")}</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="mt-1 rounded-xl" rows={2} />
              </div>
              <Button type="submit" disabled={submitting} className="w-full bg-green-600 rounded-xl">
                {submitting ? t("loading") : t("save")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder={t("search")} value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-xl bg-white dark:bg-gray-900" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Package} title={t("no_data")} description="Publiez votre stock pour trouver des acheteurs" />
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <div key={item.id} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{item.product}</h3>
                  <p className="text-xs text-gray-500">{item.quantity} {item.unit}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${item.is_available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {item.is_available ? t("available") : t("sold_out")}
                </span>
              </div>
              <p className="text-lg font-bold text-green-700 dark:text-green-400 mb-2">{formatCurrency(item.price, item.currency)}<span className="text-xs font-normal text-gray-400">/{item.unit}</span></p>
              <div className="flex items-center gap-3 text-[10px] text-gray-500">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.city}</span>
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{item.phone}</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Par {item.seller_name} · {formatDate(item.created_date)}</p>
              {item.description && <p className="text-[10px] text-gray-400 mt-1">{item.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}