import React, { useState, useRef, useEffect } from 'react';
import { Download, Smartphone, FileArchive, CheckCircle2, Sun, Moon, Laptop, ChevronDown, User, LogIn, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useProfile } from '../context/ProfileContext';
import { ThemeMode, ResolvedTheme } from '../hooks/useTheme';

interface NavbarProps {
  onOpenInstall: () => void;
  onOpenApkStudio: () => void;
  onOpenProfileModal: () => void;
  onOpenAuthModal?: () => void;
  themeMode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setThemeMode: (mode: ThemeMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenInstall,
  onOpenApkStudio,
  onOpenProfileModal,
  onOpenAuthModal,
  themeMode,
  resolvedTheme,
  setThemeMode,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const { activeProfile, isAuthenticated } = useProfile();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="px-4 py-2.5 bg-white/40 dark:bg-[#060714]/40 border-b border-slate-200/50 dark:border-cyan-500/25 backdrop-blur-2xl flex items-center justify-between shrink-0 z-30 transition-colors duration-200 shadow-[0_4px_30px_rgba(0,240,255,0.08)]">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="relative group">
          <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 opacity-60 dark:opacity-80 blur-xs group-hover:opacity-100 transition duration-300" />
          <div className="relative w-9 h-9 rounded-xl bg-slate-950/90 p-0.5 border border-cyan-500/40 overflow-hidden flex items-center justify-center shadow-sm">
            <img src="/pwa-192x192.png" alt="Vibra Logo" className="w-full h-full object-cover rounded-[9px]" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              <span className="dark:neon-text-cyan">Vibra</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-400/40 dark:border-cyan-500/40 uppercase tracking-wider backdrop-blur-md shadow-xs shadow-cyan-500/20">
                CYBERPUNK
              </span>
            </h1>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
            Studio Audio Futuriste & Streaming Sans Pub
          </p>
        </div>
      </div>

      {/* Action buttons & Theme Switcher */}
      <div className="flex items-center gap-2">
        {/* User Connexion / Mon Compte Button */}
        {isAuthenticated ? (
          <button
            onClick={onOpenAuthModal || onOpenProfileModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/15 dark:bg-purple-950/40 hover:bg-purple-500/25 border border-purple-500/40 text-purple-900 dark:text-purple-200 text-xs font-bold transition group shadow-2xs backdrop-blur-md"
            title={`Compte connecté : ${activeProfile.name} (${activeProfile.email || 'Privé'}) - Cliquer pour gérer mon compte`}
          >
            <span className="text-base group-hover:scale-110 transition-transform">{activeProfile.avatar}</span>
            <span className="max-w-[95px] truncate font-extrabold">{activeProfile.name}</span>
            <span className="hidden md:inline px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Connecté
            </span>
          </button>
        ) : (
          <button
            onClick={onOpenAuthModal || onOpenProfileModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition active:scale-95"
            title="Se connecter ou créer un compte pour retrouver vos playlists privées"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Connexion</span>
          </button>
        )}

        {/* Theme Selector Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            title={`Thème: ${themeMode === 'system' ? 'Système (' + (resolvedTheme === 'dark' ? 'Sombre' : 'Clair') + ')' : themeMode === 'dark' ? 'Sombre' : 'Clair'}`}
            className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-100/70 dark:bg-white/5 hover:bg-slate-200/80 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/10 text-xs font-medium transition backdrop-blur-md"
            aria-label="Changer de thème"
          >
            {themeMode === 'system' ? (
              <Laptop className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            ) : themeMode === 'dark' ? (
              <Moon className="w-4 h-4 text-purple-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showThemeMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white/80 dark:bg-[#07091c]/80 border border-slate-200/80 dark:border-cyan-500/35 shadow-2xl backdrop-blur-2xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-cyan-400/80 border-b border-slate-100 dark:border-white/10">
                Thème d'affichage
              </div>

              <button
                onClick={() => {
                  setThemeMode('system');
                  setShowThemeMenu(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 hover:bg-purple-50 dark:hover:bg-white/5 transition ${
                  themeMode === 'system' ? 'text-purple-600 dark:text-purple-400 font-bold bg-purple-50/50 dark:bg-purple-950/20' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Laptop className="w-3.5 h-3.5" />
                  <span>Système (Automatique)</span>
                </div>
                {themeMode === 'system' && (
                  <span className="text-[10px] text-purple-600 dark:text-purple-400">
                    ({resolvedTheme === 'dark' ? 'Sombre' : 'Clair'})
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setThemeMode('dark');
                  setShowThemeMenu(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 hover:bg-purple-50 dark:hover:bg-white/5 transition ${
                  themeMode === 'dark' ? 'text-purple-600 dark:text-purple-400 font-bold bg-purple-50/50 dark:bg-purple-950/20' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Moon className="w-3.5 h-3.5" />
                  <span>Mode Sombre</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setThemeMode('light');
                  setShowThemeMenu(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 hover:bg-purple-50 dark:hover:bg-white/5 transition ${
                  themeMode === 'light' ? 'text-purple-600 dark:text-purple-400 font-bold bg-purple-50/50 dark:bg-purple-950/20' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Mode Clair</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Studio APK Button */}
        <button
          onClick={onOpenApkStudio}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 text-xs font-semibold transition"
          title="Gérer les sources Android APK (.ZIP)"
        >
          <FileArchive className="w-3.5 h-3.5 text-pink-500 dark:text-pink-400" />
          <span>Package APK</span>
        </button>

        {/* Visual Indicator: Prêt pour l'installation (appears ONLY when PWA criteria are met & not installed) */}
        {isInstallable && !isInstalled && (
          <button
            onClick={install}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/25 via-cyan-500/20 to-teal-500/25 hover:from-emerald-500/35 hover:to-teal-500/35 border border-emerald-400/60 text-emerald-300 text-xs font-extrabold transition shadow-lg shadow-emerald-500/25 animate-pulse active:scale-95 cursor-pointer neon-border-cyan group"
            title="Critères PWA remplis à 100% ! Cliquez pour installer Vibra instantanément sur votre appareil"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden md:inline font-bold">Prêt pour l'installation</span>
            <span className="md:hidden font-bold">Prêt</span>
          </button>
        )}

        {/* Primary Install Button */}
        {isInstalled ? (
          <button
            onClick={onOpenInstall}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition"
            title="Application Vibra installée en mode autonome"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Mode Autonome</span>
            <span className="sm:hidden">Autonome</span>
          </button>
        ) : (
          <button
            onClick={isInstallable ? install : onOpenInstall}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-purple-600 to-pink-500 hover:from-cyan-300 hover:to-pink-400 text-slate-950 font-extrabold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition neon-glow-cyan"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>Installer l'APK</span>
          </button>
        )}
      </div>
    </header>
  );
};
