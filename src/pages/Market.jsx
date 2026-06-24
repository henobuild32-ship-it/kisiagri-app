import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Plus, Search, TrendingUp, Filter } from "lucide-react";
import { t } from "@/lib/i18n";
import { formatCurrency, formatDate } from "@/lib/helpers";
import { DEFAULT_PRODUCTS, DRC_CITIES } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import PageLoader from "@/components/ui/PageLoader";
import { useToast } from "@/components/ui/use-toast";

export default function Market() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterProduct, setFilterProduct] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const [form, setForm] = useState({
    product: "", city: "", price: "", currency: "CDF", unit: "kg", comment: ""
  });

  useEffect(() => { loadPrices(); }, []);

  async function loadPrices() {
    try {
      const data = await base44.entities.MarketPrice.list("-created_date", 50);
      setPrices(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.product || !form.city || !form.price) {
      toast({ title: t("error"), description: "Remplissez les champs obligatoires", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const me = await base44.auth.me();
      await base44.entities.MarketPrice.create({
        ...form, price: Number(form.price), country: "RDC",
        author_name: me.full_name || me.email || "Anonyme", status: "soumis"
      });
      await Promise.all([
        base44.entities.ActivityLog.create({
          action: "contribution_prix", entity_type: "MarketPrice",
          description: `Prix soumis: ${form.product} à ${form.city} - ${form.price} ${form.currency}/${form.unit}`
        }),
        base44.entities.Notification.create({
          title: "Nouveau prix soumis", message: `${form.product} à ${form.city}`, type: "prix"
        })
      ]);
      toast({ title: t("success"), description: "Prix soumis avec succès" });
      setDialogOpen(false);
      setForm({ product: "", city: "", price: "", currency: "CDF", unit: "kg", comment: "" });
      loadPrices();
    } catch (e) {
      toast({ title: t("error"), description: e.message, variant: "destructive" });
    } finally { setSubmitting(false); }
  }

  let filtered = prices.filter(p => {
    const matchProduct = filterProduct === "all" || p.product === filterProduct;
    const matchCity = filterCity === "all" || p.city === filterCity;
    return matchProduct && matchCity;
  });

  if (sortBy === "price_asc") filtered.sort((a, b) => a.price - b.price);
  else if (sortBy === "price_desc") filtered.sort((a, b) => b.price - a.price);

  const uniqueProducts = [...new Set(prices.map(p => p.product))];
  const uniqueCities = [...new Set(prices.map(p => p.city))];

  if (loading) return <PageLoader />;

  return (
    <div className="py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t("market_prices")}</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 rounded-xl">
              <Plus className="w-4 h-4 mr-1" /> {t("add_price")}
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{t("add_price")}</DialogTitle></DialogHeader>
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
              <div>
                <Label className="text-xs">{t("city")} *</Label>
                <Select value={form.city} onValueChange={v => setForm(f => ({ ...f, city: v }))}>
                  <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Choisir..." /></SelectTrigger>
                  <SelectContent>
                    {DRC_CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">{t("price")} *</Label>
                  <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="mt-1 rounded-xl" placeholder="0" />
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
                <div>
                  <Label className="text-xs">{t("unit")}</Label>
                  <Select value={form.unit} onValueChange={v => setForm(f => ({ ...f, unit: v }))}>
                    <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="sac">Sac</SelectItem>
                      <SelectItem value="tonne">Tonne</SelectItem>
                      <SelectItem value="piece">Pièce</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs">Commentaire</Label>
                <Textarea value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} className="mt-1 rounded-xl" rows={2} />
              </div>
              <Button type="submit" disabled={submitting} className="w-full bg-green-600 rounded-xl">
                {submitting ? t("loading") : t("save")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        <Select value={filterProduct} onValueChange={setFilterProduct}>
          <SelectTrigger className="min-w-[120px] rounded-xl text-xs h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("all")} produits</SelectItem>
            {uniqueProducts.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterCity} onValueChange={setFilterCity}>
          <SelectTrigger className="min-w-[120px] rounded-xl text-xs h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("all")} villes</SelectItem>
            {uniqueCities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="min-w-[120px] rounded-xl text-xs h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">{t("sort_recent")}</SelectItem>
            <SelectItem value="price_asc">{t("sort_price_asc")}</SelectItem>
            <SelectItem value="price_desc">{t("sort_price_desc")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={TrendingUp} title={t("no_data")} description="Soyez le premier à soumettre un prix" />
      ) : (
        <div className="space-y-3">
          {filtered.map(p => (
            <div key={p.id} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{p.product}</h3>
                  <p className="text-xs text-gray-500">{p.city}, {p.country || "RDC"}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <p className="text-lg font-bold text-green-700 dark:text-green-400">{formatCurrency(p.price, p.currency)}<span className="text-xs font-normal text-gray-400">/{p.unit}</span></p>
              {p.comment && <p className="text-[10px] text-gray-400 mt-1">{p.comment}</p>}
              <p className="text-[10px] text-gray-400 mt-1">Par {p.author_name} · {formatDate(p.created_date)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}