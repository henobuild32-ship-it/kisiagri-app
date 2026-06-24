import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Pen, Check, Trash2, Sprout } from "lucide-react";
import { t } from "@/lib/i18n";
import { formatCurrency, formatDate } from "@/lib/helpers";
import { CONTRACT_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import StatusBadge from "@/components/ui/StatusBadge";
import PageLoader from "@/components/ui/PageLoader";
import { useToast } from "@/components/ui/use-toast";

export default function ContractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signParty, setSignParty] = useState(null);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => { loadContract(); }, [id]);

  async function loadContract() {
    try {
      const c = await base44.entities.Contract.get(id);
      setContract(c);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function startDrawing(e) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  }

  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000";
    ctx.lineCap = "round";
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function stopDrawing() { setIsDrawing(false); }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  async function saveSignature() {
    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL("image/png");
    try {
      const updateData = signParty === "a"
        ? { signature_a: signatureData, signed_at_a: new Date().toISOString() }
        : { signature_b: signatureData, signed_at_b: new Date().toISOString() };

      const updatedContract = { ...contract, ...updateData };
      const newStatus = updatedContract.signature_a && updatedContract.signature_b ? "signe" : "en_signature";
      updateData.status = newStatus;

      await base44.entities.Contract.update(id, updateData);
      await Promise.all([
        base44.entities.ActivityLog.create({
          action: "signature", entity_type: "Contract", entity_id: id,
          description: `Contrat signé par ${signParty === "a" ? contract.party_a_name : contract.party_b_name}`
        }),
        base44.entities.Notification.create({
          title: "Signature effectuée",
          message: `${signParty === "a" ? contract.party_a_name : contract.party_b_name} a signé le contrat`,
          type: "signature"
        })
      ]);
      toast({ title: t("success"), description: "Signature enregistrée" });
      setSignParty(null);
      loadContract();
    } catch (e) {
      toast({ title: t("error"), description: e.message, variant: "destructive" });
    }
  }

  function downloadPDF() {
    const printContent = document.getElementById("contract-content");
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>${contract.title} - KisiAgri</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto;font-size:14px;line-height:1.6}
      h1{text-align:center;color:#16a34a;margin-bottom:5px}
      .brand{text-align:center;color:#666;margin-bottom:30px;font-size:12px}
      .signatures{display:flex;justify-content:space-between;margin-top:40px}
      .sig-box{width:45%;text-align:center}
      .sig-img{max-width:200px;height:60px}
      .footer{text-align:center;margin-top:60px;color:#999;font-size:10px;border-top:1px solid #eee;padding-top:10px}</style></head>
      <body>
      <h1>🌱 KisiAgri</h1>
      <div class="brand">Plateforme Agricole Numérique<br/>Créé par HenoBuild Entreprise</div>
      <h2 style="text-align:center">${contract.title}</h2>
      <pre style="white-space:pre-wrap;font-family:Arial,sans-serif">${contract.content || ""}</pre>
      <div class="signatures">
        <div class="sig-box">
          <p><strong>${contract.party_a_name}</strong></p>
          ${contract.signature_a ? `<img src="${contract.signature_a}" class="sig-img"/>` : "<p>________________</p>"}
          ${contract.signed_at_a ? `<p style="font-size:10px">${new Date(contract.signed_at_a).toLocaleDateString("fr-FR")}</p>` : ""}
        </div>
        <div class="sig-box">
          <p><strong>${contract.party_b_name}</strong></p>
          ${contract.signature_b ? `<img src="${contract.signature_b}" class="sig-img"/>` : "<p>________________</p>"}
          ${contract.signed_at_b ? `<p style="font-size:10px">${new Date(contract.signed_at_b).toLocaleDateString("fr-FR")}</p>` : ""}
        </div>
      </div>
      <div class="footer">KisiAgri - Créé par HenoBuild Entreprise · Fondateur : Henock Aduma</div>
      </body></html>
    `);
    win.document.close();
    win.print();
  }

  async function handleDelete() {
    if (!confirm(t("confirm_delete"))) return;
    try {
      await base44.entities.Contract.delete(id);
      toast({ title: t("success"), description: "Contrat supprimé" });
      navigate("/contracts");
    } catch (e) {
      toast({ title: t("error"), description: e.message, variant: "destructive" });
    }
  }

  if (loading) return <PageLoader />;
  if (!contract) return <div className="py-20 text-center text-gray-500">Contrat non trouvé</div>;

  return (
    <div className="py-4 space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate("/contracts")} className="flex items-center gap-2 text-sm text-gray-500">
          <ArrowLeft className="w-4 h-4" /> {t("back")}
        </button>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="rounded-xl" onClick={downloadPDF}>
            <Download className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" className="rounded-xl text-red-600" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold">{contract.title}</h2>
            <p className="text-xs text-gray-500">{CONTRACT_TYPES.find(ct => ct.id === contract.type)?.label}</p>
          </div>
          <StatusBadge status={contract.status} />
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs mb-4">
          <div>
            <p className="text-gray-500 mb-1">{t("party_a")}</p>
            <p className="font-medium">{contract.party_a_name}</p>
            {contract.party_a_phone && <p className="text-gray-400">{contract.party_a_phone}</p>}
          </div>
          <div>
            <p className="text-gray-500 mb-1">{t("party_b")}</p>
            <p className="font-medium">{contract.party_b_name}</p>
            {contract.party_b_phone && <p className="text-gray-400">{contract.party_b_phone}</p>}
          </div>
        </div>
        {contract.amount > 0 && (
          <p className="text-sm font-bold text-green-700 mb-3">{formatCurrency(contract.amount, contract.currency)}</p>
        )}
      </div>

      {contract.content && (
        <div id="contract-content" className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-3 text-green-600">
            <Sprout className="w-4 h-4" />
            <span className="text-xs font-semibold">KisiAgri</span>
          </div>
          <div className="prose prose-xs max-w-none text-xs whitespace-pre-wrap text-gray-700 dark:text-gray-300">{contract.content}</div>
        </div>
      )}

      {/* Signatures */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 space-y-4">
        <h3 className="text-sm font-semibold">Signatures</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">{contract.party_a_name}</p>
            {contract.signature_a ? (
              <div>
                <img src={contract.signature_a} alt="Signature A" className="h-12 mx-auto" />
                <p className="text-[10px] text-green-600 mt-1 flex items-center justify-center gap-1"><Check className="w-3 h-3" /> Signé</p>
              </div>
            ) : (
              <Button size="sm" variant="outline" className="rounded-xl text-xs" onClick={() => setSignParty("a")}>
                <Pen className="w-3 h-3 mr-1" /> Signer
              </Button>
            )}
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">{contract.party_b_name}</p>
            {contract.signature_b ? (
              <div>
                <img src={contract.signature_b} alt="Signature B" className="h-12 mx-auto" />
                <p className="text-[10px] text-green-600 mt-1 flex items-center justify-center gap-1"><Check className="w-3 h-3" /> Signé</p>
              </div>
            ) : (
              <Button size="sm" variant="outline" className="rounded-xl text-xs" onClick={() => setSignParty("b")}>
                <Pen className="w-3 h-3 mr-1" /> Signer
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Signature Dialog */}
      <Dialog open={!!signParty} onOpenChange={() => setSignParty(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Signer - {signParty === "a" ? contract.party_a_name : contract.party_b_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-xs text-gray-500">Dessinez votre signature ci-dessous</p>
            <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden">
              <canvas
                ref={canvasRef}
                width={300}
                height={150}
                className="w-full bg-white cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={clearCanvas} className="flex-1 rounded-xl">Effacer</Button>
              <Button onClick={saveSignature} className="flex-1 bg-green-600 rounded-xl">Confirmer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}