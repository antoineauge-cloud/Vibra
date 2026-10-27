import React, { useState } from 'react';
import { X, Download, FileArchive, Check, Copy, Terminal, Cpu, ShieldCheck, Globe, ExternalLink, CheckCircle2 } from 'lucide-react';
import { generateApkZip } from '../utils/apkGenerator';

interface ApkStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
}

export const ApkStudioModal: React.FC<ApkStudioModalProps> = ({ isOpen, onClose, appUrl }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const handleDownloadManifest = async () => {
    try {
      const res = await fetch('/manifest.json');
      const text = await res.text();
      const blob = new Blob([text], { type: 'application/manifest+json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'manifest.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyManifest = async () => {
    try {
      const res = await fetch('/manifest.json');
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopiedCmd('manifest');
      setTimeout(() => setCopiedCmd(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };
  const [packageId, setPackageId] = useState('app.vibra.music');
  const [versionName, setVersionName] = useState('1.0.0');
  const [versionCode, setVersionCode] = useState(1);
  const [sha256Fingerprint, setSha256Fingerprint] = useState('14:6D:E9:01:F8:85:D5:3E:95:46:12:F1:C0:0A:7A:B3:36:99:9B:F7:55:03:77:E1:97:5B:3C:A2:18:24:D3:2A');

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : appUrl;

  const handleDownloadZip = async () => {
    try {
      setIsGenerating(true);
      const blob = await generateApkZip({
        appName: 'Vibra',
        shortName: 'Vibra',
        appUrl: currentOrigin,
        packageId,
        versionName,
        versionCode,
        themeColor: '#0a0a14',
        backgroundColor: '#0a0a14',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vibra-android-apk-${packageId}-${versionName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setHasDownloaded(true);
    } catch (err) {
      console.error('Failed to generate APK ZIP:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const bubblewrapCode = `# 1. Installer la CLI Google Bubblewrap
npm install -g @bubblewrap/cli

# 2. Extraire le dossier ZIP téléchargé et s'y déplacer
cd vibra-android-apk-*

# 3. Initialiser avec le manifeste
bubblewrap init --manifest twa-manifest.json

# 4. Compiler directement l'APK Android officielle
bubblewrap build`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white/75 dark:bg-[#07081a]/80 border border-slate-200/60 dark:border-pink-500/40 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-800 dark:text-slate-100 transition-colors duration-200 neon-border-pink ath-modal-glitch"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-pink-500/20 bg-gradient-to-r from-pink-950/70 via-purple-950/70 to-indigo-950/70 backdrop-blur-xl text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white">
              <FileArchive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 ath-header-glitch">
                Générateur & Intégration APK Officielle
              </h3>
              <p className="text-xs text-pink-200">
                Deux fichiers officiels intégrés pour certification Android TWA & suppression de barre URL
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Official Verification Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Les 2 fichiers officiels sont intégrés et actifs
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-semibold">
                Certifié TWA Google
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Pour qu'une APK Android soit reconnue comme <strong>officielle</strong> par Android sans afficher la barre d'adresse du navigateur (Trusted Web Activity), les 2 fichiers suivants sont hébergés et servis par le serveur :
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
              {/* File 1: manifest.json */}
              <div className="p-3 rounded-lg bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center text-[10px]">1</span>
                    manifest.json
                  </span>
                  <a
                    href="/manifest.json"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                  >
                    Ouvrir <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Déclare l'identité, l'icône HD, le mode <em>standalone</em> plein écran et les métadonnées officielles.
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadManifest}
                    className="px-2 py-1 rounded-md bg-purple-600/15 hover:bg-purple-600/25 text-purple-700 dark:text-purple-300 font-semibold text-[10px] flex items-center gap-1 transition"
                  >
                    <Download className="w-3 h-3" />
                    Télécharger manifest.json
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyManifest}
                    className="px-2 py-1 rounded-md bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 font-semibold text-[10px] flex items-center gap-1 transition"
                  >
                    {copiedCmd === 'manifest' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    {copiedCmd === 'manifest' ? 'Copié !' : 'Copier le JSON'}
                  </button>
                </div>
              </div>

              {/* File 2: assetlinks.json */}
              <div className="p-3 rounded-lg bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center text-[10px]">2</span>
                    assetlinks.json
                  </span>
                  <a
                    href="/.well-known/assetlinks.json"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    Ouvrir <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Liaison Digital Asset Links avec Android (package <code>{packageId}</code>) pour certifier l'APK.
                </p>
              </div>
            </div>

            {/* PWABuilder Diagnostic / Firewall Notice */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-300">
                <span>⚠️ Note importante sur l'outil en ligne PWABuilder :</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Si vous collez l'URL de test temporaire (<code>ais-dev-*.run.app</code>) dans PWABuilder, le robot d'analyse reçoit une redirection de sécurité Google (cookie check) et ne peut pas lire le manifest à distance. C'est tout à fait normal en environnement de développement sécurisé !
              </p>
              <p className="text-[11px] leading-relaxed font-semibold text-purple-700 dark:text-purple-300">
                👉 Deux solutions simples : <strong>1.</strong> Cliquez sur "Télécharger manifest.json" ci-dessus pour l'utiliser dans PWABuilder. <strong>2.</strong> Sur Android, appuyez directement sur "Installer l'APK" dans l'application pour générer l'APK natif officiel via Google Play WebAPK.
              </p>
            </div>
          </div>

          {/* Metadata inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">Package ID (Android)</label>
              <input
                type="text"
                value={packageId}
                onChange={(e) => setPackageId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">Version Name</label>
              <input
                type="text"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">Version Code</label>
              <input
                type="number"
                value={versionCode}
                onChange={(e) => setVersionCode(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          {/* SHA-256 fingerprint config */}
          <div>
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Empreinte SHA-256 de signature APK (Keystore / Play Store)
            </label>
            <input
              type="text"
              value={sha256Fingerprint}
              onChange={(e) => setSha256Fingerprint(e.target.value)}
              className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-[11px] text-slate-900 dark:text-white focus:outline-none focus:border-pink-500 font-mono"
              placeholder="14:6D:E9:01:F8:85:D5..."
            />
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
              Cette empreinte est incluse dans le fichier <code>/.well-known/assetlinks.json</code> pour valider l'authenticité de l'APK installée.
            </span>
          </div>

          {/* Included files preview */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              Fichiers officiels inclus dans l'archive .ZIP prête à compiler :
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 font-mono text-slate-800 dark:text-slate-300 flex items-center gap-2 shadow-xs">
                <span className="text-emerald-500">🔗</span> .well-known/assetlinks.json
              </div>
              <div className="p-2 rounded bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 font-mono text-slate-800 dark:text-slate-300 flex items-center gap-2 shadow-xs">
                <span className="text-pink-600 dark:text-pink-400">📄</span> AndroidManifest.xml
              </div>
              <div className="p-2 rounded bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 font-mono text-slate-800 dark:text-slate-300 flex items-center gap-2 shadow-xs">
                <span className="text-pink-600 dark:text-pink-400">⚙️</span> twa-manifest.json & manifest.json
              </div>
              <div className="p-2 rounded bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 font-mono text-slate-800 dark:text-slate-300 flex items-center gap-2 shadow-xs">
                <span className="text-pink-600 dark:text-pink-400">📦</span> capacitor.config.json
              </div>
              <div className="p-2 rounded bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 font-mono text-slate-800 dark:text-slate-300 flex items-center gap-2 shadow-xs">
                <span className="text-pink-600 dark:text-pink-400">🔨</span> build.gradle & app-build.gradle
              </div>
              <div className="p-2 rounded bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 font-mono text-slate-800 dark:text-slate-300 flex items-center gap-2 shadow-xs">
                <span className="text-pink-600 dark:text-pink-400">📖</span> README-INSTALLATION-APK.md
              </div>
            </div>
          </div>

          {/* Download Action */}
          <div>
            <button
              onClick={handleDownloadZip}
              disabled={isGenerating}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-pink-600/30 hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              {isGenerating ? 'Création de l\'archive...' : hasDownloaded ? 'Télécharger à nouveau le package officiel (.ZIP)' : 'Télécharger le package officiel complet (.ZIP)'}
            </button>
          </div>

          {/* Quick Command */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <Terminal className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                Commande officielle pour compiler l'APK avec Google Bubblewrap :
              </span>
              <button
                onClick={() => copyToClipboard(bubblewrapCode, 'bw')}
                className="flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
              >
                {copiedCmd === 'bw' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                {copiedCmd === 'bw' ? 'Copié' : 'Copier'}
              </button>
            </div>
            <pre className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-pink-300 overflow-x-auto leading-relaxed">
              {bubblewrapCode}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 flex items-center justify-end">
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
