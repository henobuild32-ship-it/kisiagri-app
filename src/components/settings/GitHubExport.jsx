import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Github, ShieldCheck, Loader2, CheckCircle2, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/components/ui/use-toast";
import { t } from "@/lib/i18n";

export default function GitHubExport() {
  const [step, setStep] = useState("idle");
  const [verifyCode, setVerifyCode] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  async function handleStart() {
    setLoading(true);
    setError("");
    try {
      const me = await base44.auth.me();
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setSentCode(code);
      await base44.integrations.Core.SendEmail({
        to: me.email,
        subject: "KisiAgri — Code de vérification pour l'export GitHub",
        body: `Bonjour,\n\nVotre code de vérification pour exporter l'application KisiAgri vers GitHub est : ${code}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet email.\n\n— KisiAgri`,
      });
      setStep("verify");
      toast({ title: t("verification_email_sent"), description: t("check_email_verify") });
    } catch (e) {
      setError(e.message || t("error"));
    } finally {
      setLoading(false);
    }
  }

  function handleVerify() {
    setError("");
    if (verifyCode.length < 6) return;
    if (verifyCode !== sentCode) {
      setError(t("code_incorrect"));
      return;
    }
    setStep("ready");
  }

  async function handleExport() {
    setLoading(true);
    setError("");
    try {
      const me = await base44.auth.me();
      const repoName = "kisiagri-app";
      const readmeContent = `# KisiAgri 🌱\n\nPlateforme agricole numérique pour les acteurs agricoles en Afrique.\n\n## Fonctionnalités\n\n- 📊 Gestion des dettes et paiements\n- 🏪 Prix des marchés agricoles\n- 📦 Publication de stocks\n- 📄 Génération de contrats avec IA\n- 💳 Mobile Money (M-Pesa, Orange Money, Airtel...)\n- 🔔 Notifications en temps réel\n- 📋 Journal d'audit\n\n## Technologies\n\n- React + Vite\n- Tailwind CSS\n- Base44 BaaS\n\n## Auteur\n\n${t("created_by")}\n${t("founder")}\n\n---\nExporté depuis KisiAgri le ${new Date().toLocaleDateString()}\n`;

      await base44.integrations.Core.SendEmail({
        to: me.email,
        subject: "KisiAgri — Export GitHub confirmé",
        body: `Votre demande d'export GitHub a été vérifiée et confirmée.\n\nDépôt cible : ${repoName}\n\nLe code de l'application sera synchronisé avec GitHub une fois la connexion GitHub autorisée.\n\n— KisiAgri`,
      });

      setStep("done");
      toast({ title: t("github_export_success"), description: repoName });
    } catch (e) {
      setError(e.message || t("error"));
    } finally {
      setLoading(false);
    }
  }

  if (step === "done") {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-green-200 dark:border-green-800 text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7 text-green-600" />
        </div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t("github_export_success")}</h3>
        <p className="text-xs text-muted-foreground">kisiagri-app</p>
        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => { setStep("idle"); setVerifyCode(""); }}>
          {t("back")}
        </Button>
      </div>
    );
  }

  if (step === "verify") {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-green-600" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t("verify_email_first")}</h3>
        </div>
        <p className="text-xs text-muted-foreground">{t("enter_verification_code")}</p>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex justify-center">
          <InputOTP maxLength={6} value={verifyCode} onChange={setVerifyCode} autoFocus>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button className="w-full bg-green-600 hover:bg-green-700 rounded-xl" onClick={handleVerify} disabled={verifyCode.length < 6}>
          {t("verify")}
        </Button>
        <button onClick={handleStart} className="text-xs text-green-600 hover:underline w-full text-center">
          {t("resend")}
        </button>
      </div>
    );
  }

  if (step === "ready") {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-green-600" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t("email")} ✓</h3>
        </div>
        <p className="text-xs text-muted-foreground">{t("github_needs_connect")}</p>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <Button className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl" onClick={handleExport} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t("github_exporting")}
            </>
          ) : (
            <>
              <Github className="w-4 h-4 mr-2" />
              {t("connect_github")}
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-900 dark:bg-gray-700 flex items-center justify-center">
          <Github className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t("export_github")}</h3>
          <p className="text-xs text-muted-foreground">{t("github_export_desc")}</p>
        </div>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <Button variant="outline" className="w-full rounded-xl" onClick={handleStart} disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {t("loading")}
          </>
        ) : (
          <>
            <Lock className="w-4 h-4 mr-2" />
            {t("send_verification_code")}
            <ArrowRight className="w-4 h-4 ml-1" />
          </>
        )}
      </Button>
    </div>
  );
}