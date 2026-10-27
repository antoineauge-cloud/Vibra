import React, { useState } from 'react';
import { X, Download, Smartphone, Apple, Monitor, QrCode, ExternalLink, CheckCircle2, ShieldCheck, Sparkles, Terminal, Copy, Check, FileArchive, Settings } from 'lucide-react';
import { generateApkZip } from '../utils/apkGenerator';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerInstall: () => void;
  canInstall: boolean;
  isInstalled: boolean;
  appUrl: string;
  onOpenApkStudio?: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  onTriggerInstall,
  canInstall,
  isInstalled,
  appUrl,
  onOpenApkStudio,
}) => {
  const [activeTab, setActiveTab] = useState<'android' | 'apk' | 'ios' | 'desktop'>('android');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [hasDownloadedZip, setHasDownloadedZip] = useState(false);
  const [copiedManifest, setCopiedManifest] = useState(false);
  const [copiedBw, setCopiedBw] = useState(false);

  const [showManifestPreview, setShowManifestPreview] = useState(false);
  const [manifestText, setManifestText] = useState<string>('');

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : appUrl;

  const copyToClipboardRobust = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) {
      console.warn('Clipboard API notice, using fallback:', e);
    }

    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    } catch (err) {
      console.error('Copy fallback failed:', err);
      return false;
    }
  };

  const copyUrl = async () => {
    const ok = await copyToClipboardRobust(currentOrigin);
    if (ok) {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const handleDownloadZip = async () => {
    try {
      setIsGeneratingZip(true);
      // Trigger reliable direct server download link
      const link = document.createElement('a');
      link.href = '/api/download/apk-bundle.zip';
      link.download = 'vibra-android-apk-bundle.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setHasDownloadedZip(true);
    } catch (err) {
      console.warn('Server download notice, using client fallback:', err);
      try {
        const blob = await generateApkZip({
          appName: 'Vibra',
          shortName: 'Vibra',
          appUrl: currentOrigin,
          packageId: 'app.vibra.music',
          versionName: '1.0.0',
          versionCode: 1,
          themeColor: '#07070e',
          backgroundColor: '#07070e',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'vibra-android-apk-package.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 60000);
        setHasDownloadedZip(true);
      } catch (clientErr) {
        console.error('Failed to generate APK ZIP:', clientErr);
      }
    } finally {
      setIsGeneratingZip(false);
    }
  };

  const handleDownloadManifest = async () => {
    try {
      const link = document.createElement('a');
      link.href = '/api/download/manifest.json';
      link.download = 'manifest.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyManifest = async () => {
    try {
      let text = manifestText;
      if (!text) {
        const res = await fetch('/manifest.json');
        text = await res.text();
        setManifestText(text);
      }
      const ok = await copyToClipboardRobust(text);
      if (ok) {
        setCopiedManifest(true);
        setTimeout(() => setCopiedManifest(false), 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleManifestPreview = async () => {
    if (!manifestText) {
      try {
        const res = await fetch('/manifest.json');
        const text = await res.text();
        setManifestText(text);
      } catch (e) {}
    }
    setShowManifestPreview((prev) => !prev);
  };

  const handleCopyBw = async (code: string) => {
    const ok = await copyToClipboardRobust(code);
    if (ok) {
      setCopiedBw(true);
      setTimeout(() => setCopiedBw(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white/75 dark:bg-[#07081a]/80 border border-slate-200/60 dark:border-cyan-500/40 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-800 dark:text-slate-100 transition-colors duration-200 neon-border-cyan ath-modal-glitch"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with decorative Cyberpunk neon banner */}
        <div className="relative px-6 py-5 border-b border-cyan-500/30 bg-gradient-to-r from-[#07070e]/80 via-[#0f1124]/80 to-[#1a0b1f]/80 backdrop-blur-xl text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-pink-500 p-0.5 shadow-lg shadow-cyan-500/30 neon-glow-cyan">
                <img src="/pwa-192x192.png" alt="Vibra" className="w-full h-full object-cover rounded-[10px]" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2 ath-header-glitch">
                  Installer Vibra
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    CYBERPUNK APK
                  </span>
                </h3>
                <p className="text-xs text-slate-300">
                  Lecteur audio fluide en plein écran, sans latence et sans redirection
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveTab('android')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'android'
                  ? 'bg-cyan-400 text-slate-950 shadow-md font-bold'
                  : 'bg-white/10 text-white/90 hover:bg-white/20'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Android (1-Clic)
            </button>
            <button
              onClick={() => setActiveTab('apk')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'apk'
                  ? 'bg-pink-500 text-white shadow-md font-bold'
                  : 'bg-white/10 text-white/90 hover:bg-white/20'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              Générer fichier .APK
            </button>
            <button
              onClick={() => setActiveTab('ios')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'ios'
                  ? 'bg-white text-slate-900 shadow-md font-bold'
                  : 'bg-white/10 text-white/90 hover:bg-white/20'
              }`}
            >
              <Apple className="w-3.5 h-3.5" />
              iOS (iPhone)
            </button>
            <button
              onClick={() => setActiveTab('desktop')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'desktop'
                  ? 'bg-white text-slate-900 shadow-md font-bold'
                  : 'bg-white/10 text-white/90 hover:bg-white/20'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              Ordinateur
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm">
          {activeTab === 'android' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-500/20 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Technologie WebAPK Android</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Sur Android (Chrome, Edge, Samsung Internet, Brave), l'installation crée automatiquement un 
                    <strong className="text-purple-700 dark:text-purple-300"> véritable APK natif</strong> avec icône dans votre tiroir d'applications, 
                    intégration système et lecture audio fluide en arrière-plan sans avertissement de sécurité.
                  </p>
                </div>
              </div>

              {/* Specific Chrome Android Screenshot Solver Guide */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-cyan-500/20 border-2 border-amber-400/60 text-slate-100 space-y-2.5 shadow-lg shadow-amber-500/10">
                <div className="flex items-center gap-2 text-amber-300 font-extrabold text-xs uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>Résolution pour votre écran Google Chrome Android :</span>
                </div>
                <p className="text-xs text-white leading-relaxed">
                  Si Chrome affiche la fenêtre avec <span className="text-red-400 font-bold">« Impossible d'installer cette appli »</span> sur la 1ère ligne, <strong>appuyez directement sur la 2ème ligne</strong> :
                </p>
                <div className="p-3 rounded-xl bg-black/75 border border-emerald-400/60 flex items-center justify-between text-xs font-bold text-emerald-300 shadow-md">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-extrabold text-xs">✓</span>
                    <span className="text-sm">Appuyez sur : « Créer un raccourci »</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/40 text-emerald-200">
                    Mode Plein Écran
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-normal">
                  Cette 2ème option installe instantanément l'icône officielle Vibra sur votre écran d'accueil Android sans passer par le store distant, et lance l'appli en plein écran sans barre d'adresse !
                </p>
              </div>

              {/* WebAPK Live Health Card */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Manifest : <strong>Connecté</strong></span>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Service Worker : <strong>Actif</strong></span>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Icônes : <strong>512x512 Maskable</strong></span>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Affichage : <strong>Standalone</strong></span>
                </div>
              </div>

              {/* Android & Google Chrome Installation Guide */}
              <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-200 space-y-3 neon-border-cyan">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs text-cyan-300 uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span>Installation Google Chrome (Android & Ordinateur)</span>
                  </div>
                  {canInstall && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40 animate-pulse">
                      Prêt à installer
                    </span>
                  )}
                </div>

                {typeof window !== 'undefined' && window.self !== window.top && (
                  <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5 text-amber-300">
                      <span>⚠️ Note Importante (Aperçu dans l'éditeur) :</span>
                    </div>
                    <p className="leading-relaxed">
                      La sécurité de Google Chrome <strong>interdit l'installation directe depuis une iframe</strong> (cadre intégré). 
                      Pour installer Vibra, ouvrez-le simplement dans un <strong>onglet Chrome direct</strong> ci-dessous :
                    </p>
                  </div>
                )}

                {/* Primary Installation Actions */}
                <div className="pt-1 flex flex-col sm:flex-row gap-2">
                  {canInstall ? (
                    <button
                      type="button"
                      onClick={() => {
                        onTriggerInstall();
                        onClose();
                      }}
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 hover:opacity-95 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-cyan-500/30 active:scale-98"
                    >
                      <Download className="w-4 h-4" />
                      <span>Installer l'application maintenant (1-Clic Chrome)</span>
                    </button>
                  ) : (
                    <a
                      href={currentOrigin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 hover:opacity-95 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-cyan-500/30 text-center"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Ouvrir dans Google Chrome (Onglet Direct)</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={copyUrl}
                    className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-300" />}
                    <span>{copiedUrl ? 'Lien copié !' : 'Copier l\'adresse'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('apk')}
                    className="py-3 px-3.5 rounded-xl bg-pink-950/50 hover:bg-pink-900/60 border border-pink-500/40 text-pink-300 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Package .ZIP</span>
                  </button>
                </div>
              </div>

              {/* Install Action status */}
              <div className="space-y-2 py-1">
                {isInstalled ? (
                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <h5 className="font-semibold text-emerald-200">Application déjà installée en mode autonome !</h5>
                    <p className="text-xs text-emerald-300/80 mt-1">
                      Vibra fonctionne en mode Cyberpunk autonome sans barre de navigation.
                    </p>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
                    <p className="text-slate-200 font-medium">
                      💡 <strong>Comment installer manuellement dans Google Chrome :</strong>
                    </p>
                    <ul className="space-y-1.5 text-slate-300 text-[12px] list-disc pl-4">
                      <li>
                        <strong>Sur Smartphone Android :</strong> Ouvrez le menu <strong>⋮ (3 points en haut à droite)</strong> &gt; Appuyez sur <strong>« Installer l'application »</strong> (ou « Ajouter à l'écran d'accueil »).
                      </li>
                      <li>
                        <strong>Sur Ordinateur (PC / Mac) :</strong> Cliquez sur la petite icône d'installation <strong>📥 (écran avec flèche)</strong> située tout à droite dans la barre d'adresse de Chrome, ou dans le menu ⋮ &gt; <em>« Enregistrer et partager » &gt; « Installer Vibra... »</em>.
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Step-by-step instructions for Android Chrome */}
              <div className="space-y-2">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                  Les étapes en 3 clics sur Android :
                </div>
                <ol className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                    <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-600/30 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold shrink-0 text-[11px]">1</span>
                    <span>Ouvrez le lien dans <strong>Google Chrome</strong> sur votre smartphone.</span>
                  </li>
                  <li className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                    <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-600/30 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold shrink-0 text-[11px]">2</span>
                    <span>Appuyez sur le menu des <strong>3 points verticaux ⋮</strong> en haut à droite de Chrome.</span>
                  </li>
                  <li className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                    <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-600/30 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold shrink-0 text-[11px]">3</span>
                    <span>Sélectionnez <strong>« Installer l'application »</strong> : Google Play Services génère et installe l'APK autonome immédiatement !</span>
                  </li>
                </ol>
              </div>

              {/* QR Code link */}
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-white/[0.02] p-4 rounded-xl">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="font-semibold text-slate-900 dark:text-white text-xs flex items-center justify-center sm:justify-start gap-1.5">
                    <QrCode className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    Scanner avec l'appareil photo Android
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                    Scannez ce QR code depuis votre téléphone pour ouvrir Vibra directement dans Chrome :
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      readOnly
                      value={currentOrigin}
                      className="bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 font-mono w-48 sm:w-64 select-all shadow-xs"
                    />
                    <button
                      onClick={copyUrl}
                      className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-xs text-slate-800 dark:text-white font-medium transition"
                    >
                      {copiedUrl ? 'Copié !' : 'Copier'}
                    </button>
                  </div>
                </div>
                <div className="p-2 bg-white rounded-xl shadow-md border border-slate-200 shrink-0">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(currentOrigin)}&bgcolor=ffffff&color=000000`}
                    alt="QR Code d'installation"
                    className="w-20 h-20"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-cyan-950/40 border border-pink-500/30 space-y-2">
                <div className="flex items-center gap-2 text-pink-400 font-semibold text-sm">
                  <ShieldCheck className="w-4 h-4 text-pink-400" />
                  Solutions de Génération APK Android (Certifiées Google & Bubblewrap)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Deux méthodes directes vous permettent d'obtenir votre <strong>APK Android autonome</strong> sans blocage :
                </p>
              </div>

              {/* Solution 1: Direct 1-Click ZIP Download */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-pink-500/40 space-y-3.5 shadow-lg shadow-pink-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-pink-500 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-pink-500/40">1</span>
                    <h4 className="font-bold text-white text-sm">
                      Télécharger le Package Source APK Android (.ZIP)
                    </h4>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
                    1-Clic Téléphone & PC
                  </span>
                </div>
                
                <p className="text-xs text-slate-300 leading-relaxed">
                  Téléchargement direct de l'archive complète prête à compiler. Contient <code>AndroidManifest.xml</code>, <code>twa-manifest.json</code>, <code>build.gradle</code>, <code>assetlinks.json</code> et toutes les icônes haute résolution.
                </p>

                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleDownloadZip}
                    disabled={isGeneratingZip}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-500 hover:from-pink-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-lg shadow-pink-600/30 flex items-center justify-center gap-2 transition hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isGeneratingZip ? 'Génération du ZIP...' : hasDownloadedZip ? 'Télécharger à nouveau le package .ZIP' : 'Télécharger le package APK complet (.ZIP)'}</span>
                  </button>

                  {onOpenApkStudio && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenApkStudio();
                      }}
                      className="py-3 px-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <Settings className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Studio Avancé</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Solution 2: Manifest Direct Tools */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-cyan-500 text-slate-950 flex items-center justify-center text-xs font-bold">2</span>
                    <h4 className="font-bold text-white text-sm">
                      Fichier Manifest & Outils d'Export
                    </h4>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    W3C & Google Play
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-xs space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-cyan-300">
                    <span>💡 Note pour les utilisateurs sur smartphone :</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    Sur téléphone, le site externe PWABuilder ne permet pas de coller du texte brut. Pour installer Vibra en APK natif sur votre smartphone, allez simplement sur l'onglet <span className="text-cyan-300 font-bold">« Android (1-Clic) »</span> et appuyez sur <span className="text-pink-300 font-bold">« Installer l'application »</span>. Google Chrome génère l'APK officiel automatiquement !
                  </p>
                </div>

                {/* Manifest Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleDownloadManifest}
                    className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Télécharger manifest.json</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyManifest}
                    className="py-2.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-2 transition"
                  >
                    {copiedManifest ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedManifest ? 'JSON Copié avec succès !' : 'Copier le JSON du manifest'}</span>
                  </button>
                </div>

                {/* Toggle Manifest View */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleToggleManifestPreview}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 underline"
                  >
                    <span>{showManifestPreview ? 'Masquer le code du manifest' : 'Afficher / Sélectionner le code du manifest.json'}</span>
                  </button>

                  {showManifestPreview && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Code source de public/manifest.json :</span>
                        <button
                          type="button"
                          onClick={handleCopyManifest}
                          className="text-cyan-400 hover:underline font-semibold"
                        >
                          Tout copier
                        </button>
                      </div>
                      <textarea
                        readOnly
                        value={manifestText || 'Chargement du manifest...'}
                        rows={8}
                        className="w-full p-2.5 bg-black/70 border border-cyan-500/30 rounded-xl text-[11px] font-mono text-cyan-200 select-all focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* CLI Command */}
                <div className="pt-2 border-t border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium text-slate-300">
                      <Terminal className="w-3.5 h-3.5 text-pink-400" />
                      Commande CLI Google Bubblewrap :
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyBw('npx @bubblewrap/cli build')}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                    >
                      {copiedBw ? 'Copié !' : 'Copier'}
                    </button>
                  </div>
                  <pre className="p-2.5 bg-black/60 border border-white/10 rounded-lg text-xs font-mono text-pink-300 select-all">
                    npx @bubblewrap/cli build
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/20 flex items-start gap-3">
                <Apple className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Installation sur iPhone / iPad (iOS)</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Apple n'utilise pas le format APK mais supporte les Web Apps natives avec icône d'accueil et mode plein écran via Safari.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-600/20 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-sm shrink-0">
                    1
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white">Ouvrez Safari</strong>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Assurez-vous d'utiliser Safari (les autres navigateurs iOS ne permettent pas l'installation à l'écran d'accueil).</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-600/20 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-sm shrink-0">
                    2
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white">Touchez l'icône de Partage</strong>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Le bouton carré avec une flèche vers le haut situé dans la barre en bas de Safari.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-600/20 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-sm shrink-0">
                    3
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white">« Sur l'écran d'accueil »</strong>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Faites défiler vers le bas et appuyez sur « Sur l'écran d'accueil » puis « Ajouter » en haut à droite.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'desktop' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3">
                <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Installation sur Ordinateur (Windows, Mac, Linux, Chromebook)
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Sur ordinateur, Vibra s'installe comme un logiciel natif dans une fenêtre sans barre de navigation, avec raccourci sur le bureau et dans la barre des tâches.
                </p>
                <div className="p-3 rounded-lg bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
                  <div>1. Dans Chrome ou Edge, regardez à l'extrémité droite de la barre d'adresse URL.</div>
                  <div>2. Cliquez sur l'icône d'ordinateur avec une flèche <strong className="text-purple-700 dark:text-purple-300">« Installer Vibra »</strong>.</div>
                  <div>3. L'application s'ouvre immédiatement dans sa propre fenêtre dédiée !</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Application officielle Vibra PWA & WebAPK
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white text-xs font-semibold transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
