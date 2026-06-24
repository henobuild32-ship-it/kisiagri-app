import React, { useState } from "react";
import { Github, Loader2, ChevronDown, ChevronUp, ExternalLink, Key, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { getExportFiles } from "@/lib/exportFiles";

export default function GitHubExportButton() {
  const [expanded, setExpanded] = useState(false);
  const [pat, setPat] = useState("");
  const [repoName, setRepoName] = useState("kisiagri-app");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  function toBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }

  async function handleExport() {
    setError("");
    setRepoUrl("");
    if (!pat.trim()) {
      setError("Veuillez entrer votre Personal Access Token GitHub");
      return;
    }
    setLoading(true);
    try {
      setProgress("Vérification du token GitHub...");
      const userRes = await fetch("https://api.github.com/user", {
        headers: { Authorization: "token " + pat.trim(), Accept: "application/vnd.github.v3+json" },
      });
      if (!userRes.ok) throw new Error("Token GitHub invalide");
      const user = await userRes.json();
      const owner = user.login;

      setProgress("Création du dépôt...");
      try {
        await fetch("https://api.github.com/user/repos", {
          method: "POST",
          headers: { Authorization: "token " + pat.trim(), "Content-Type": "application/json", Accept: "application/vnd.github.v3+json" },
          body: JSON.stringify({ name: repoName, private: false, auto_init: true, description: "KisiAgri - Plateforme agricole numérique (version autonome localStorage)" }),
        });
      } catch (e) {
        // Repo may already exist, continue
      }

      const files = getExportFiles();
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        setProgress("Envoi: " + f.path + " (" + (i + 1) + "/" + files.length + ")");
        await fetch("https://api.github.com/repos/" + owner + "/" + repoName + "/contents/" + f.path, {
          method: "PUT",
          headers: { Authorization: "token " + pat.trim(), "Content-Type": "application/json", Accept: "application/vnd.github.v3+json" },
          body: JSON.stringify({ message: "Add " + f.path, content: toBase64(f.content) }),
        });
      }

      setRepoUrl("https://github.com/" + owner + "/" + repoName);
      setProgress("");
      toast({ title: "Export réussi !", description: "Dépôt créé sur GitHub" });
    } catch (e) {
      setError(e.message || "Erreur lors de l'export");
      setProgress("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Github className="w-4 h-4" />
          Exporter sur GitHub (Gratuit)
        </span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
        <div className="p-4 space-y-4">
          {repoUrl ? (
            <div className="text-center space-y-3 py-2">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Application exportée avec succès !</p>
              <a href={repoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-green-600 hover:underline">
                <ExternalLink className="w-3.5 h-3.5" />
                {repoUrl}
              </a>
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => { setRepoUrl(""); setExpanded(false); }}>
                Fermer
              </Button>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Exportez une version autonome de l'application (frontend + backend en localStorage, sans dépendance Base44) vers votre dépôt GitHub. Gratuit, sans plan Builder+.
              </p>

              <div className="space-y-2">
                <Label htmlFor="pat" className="text-xs flex items-center gap-1">
                  <Key className="w-3 h-3" />
                  Personal Access Token GitHub
                </Label>
                <Input
                  id="pat"
                  type="password"
                  value={pat}
                  onChange={(e) => setPat(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxx"
                  className="h-10 rounded-xl text-sm"
                  disabled={loading}
                />
                <a href="https://github.com/settings/tokens/new?scopes=repo,read:user&description=KisiAgri%20Export" target="_blank" rel="noreferrer" className="text-[10px] text-green-600 hover:underline">
                  → Créer un token GitHub (scopes: repo)
                </a>
              </div>

              <div className="space-y-2">
                <Label htmlFor="repo" className="text-xs">Nom du dépôt</Label>
                <Input
                  id="repo"
                  type="text"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value.replace(/\s+/g, '-'))}
                  className="h-10 rounded-xl text-sm"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 text-xs">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {progress && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {progress}
                </div>
              )}

              <Button
                type="button"
                className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl"
                onClick={handleExport}
                disabled={loading || !pat.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Export en cours...
                  </>
                ) : (
                  <>
                    <Github className="w-4 h-4 mr-2" />
                    Exporter gratuitement
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}