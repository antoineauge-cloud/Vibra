import React, { useState, useCallback } from 'react';
import { 
  Home,
  Download, 
  Radio, 
  Sparkles, 
  Search, 
  Music2, 
  Volume2, 
  Share2, 
  ChevronRight, 
  CheckCircle2, 
  FileArchive, 
  Smartphone, 
  SlidersHorizontal,
  Flame,
  Layers,
  Headphones,
  ListMusic,
  QrCode,
  ExternalLink
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { usePlayer } from '../context/PlayerContext';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { MiniPlayer } from './MiniPlayer';
import { HistoryModal } from './HistoryModal';
import { ApiDiagnosticsModal } from './ApiDiagnosticsModal';
import { ExpandedPlayerModal } from './ExpandedPlayerModal';
import { RadioFMView } from './RadioFMView';
import { VibraNativeView } from './VibraNativeView';
import { AudioEqualizer } from './AudioEqualizer';
import { HomeDashboardView } from './HomeDashboardView';
import { LocalAudioModal } from './LocalAudioModal';
import { CyberSoundboard } from './CyberSoundboard';
import { AudioRecorderModal } from './AudioRecorderModal';
import { LyricsModal } from './LyricsModal';
import { SleepTimerModal } from './SleepTimerModal';

interface VibraAppShellProps {
  onOpenInstallModal: () => void;
  onOpenApkStudio: () => void;
  onOpenProfileModal?: () => void;
  onOpenAuthModal?: () => void;
}

type TabType = 'home' | 'music' | 'radio' | 'equalizer' | 'hub' | 'audio-guide';

const TABS: TabType[] = ['home', 'music', 'radio', 'equalizer', 'hub', 'audio-guide'];

export const VibraAppShell: React.FC<VibraAppShellProps> = ({
  onOpenInstallModal,
  onOpenApkStudio,
  onOpenProfileModal,
  onOpenAuthModal,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const { currentTrack } = usePlayer();

  // Active navigation tab: Default to 'music' if launched as installed PWA/standalone or requested via URL
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view') || params.get('tab');
      if (viewParam === 'music') return 'music';
      if (viewParam === 'radio') return 'radio';
      if (viewParam === 'equalizer') return 'equalizer';
      const isStandalone =
        params.get('source') === 'pwa' ||
        params.get('mode') === 'standalone' ||
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://');
      if (isStandalone) return 'music';
    }
    return 'home';
  });
  const [musicInitialTab, setMusicInitialTab] = useState<'discover' | 'search' | 'deezer' | 'offline' | 'playlists' | 'favorites' | 'spotify'>('discover');
  const [musicInitialQuery, setMusicInitialQuery] = useState('');

  // Modals for Player & Studio
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);
  const [showExpandedPlayer, setShowExpandedPlayer] = useState(false);
  const [showLocalAudioModal, setShowLocalAudioModal] = useState(false);
  const [showSoundboardModal, setShowSoundboardModal] = useState(false);
  const [showRecorderModal, setShowRecorderModal] = useState(false);
  const [showLyricsModal, setShowLyricsModal] = useState(false);
  const [showSleepTimerModal, setShowSleepTimerModal] = useState(false);

  // Swipe Carousel Navigation
  const currentTabIndex = TABS.indexOf(activeTab);

  const handleSwipeLeft = useCallback(() => {
    if (currentTabIndex < TABS.length - 1) {
      setActiveTab(TABS[currentTabIndex + 1]);
    }
  }, [currentTabIndex]);

  const handleSwipeRight = useCallback(() => {
    if (currentTabIndex > 0) {
      setActiveTab(TABS[currentTabIndex - 1]);
    }
  }, [currentTabIndex]);

  const { dragOffset, isDragging, touchHandlers } = useSwipeGesture({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    canSwipeLeft: currentTabIndex < TABS.length - 1,
    canSwipeRight: currentTabIndex > 0,
    threshold: 55,
  });

  const handleNavigateFromHome = (tab: TabType, subView?: string) => {
    if (tab === 'music') {
      if (subView === 'ai') {
        setMusicInitialTab('discover');
      } else if (subView === 'search') {
        setMusicInitialTab('search');
      }
    }
    setActiveTab(tab);
  };

  const handleSearchSubmitFromHome = (query: string) => {
    setMusicInitialQuery(query);
    setMusicInitialTab('search');
    setActiveTab('music');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent text-slate-800 dark:text-slate-100 overflow-hidden transition-colors duration-200">
      {/* Top Controls Bar with Tab Navigation */}
      <div className="px-3 sm:px-4 py-2 border-b border-slate-200/50 dark:border-cyan-500/25 bg-white/40 dark:bg-[#060714]/40 backdrop-blur-2xl flex flex-wrap items-center justify-between gap-2.5 shrink-0 transition-colors duration-200 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        {/* Main Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white/40 dark:bg-[#030513]/55 border border-slate-200/60 dark:border-cyan-500/35 rounded-2xl overflow-x-auto max-w-full backdrop-blur-xl shadow-inner">
          {/* TAB 0: ACCUEIL / MENU PRINCIPAL */}
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'home'
                ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/30 neon-glow-cyan'
                : 'text-slate-600 dark:text-slate-400 hover:text-cyan-300 dark:hover:text-cyan-300 hover:bg-white/60 dark:hover:bg-cyan-500/10'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Accueil</span>
          </button>

          {/* TAB 1: MUSIQUE & YOUTUBE / STUDIO VIBRA NATIVE */}
          <button
            onClick={() => setActiveTab('music')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'music'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-cyan-300 dark:hover:text-cyan-300 hover:bg-white/60 dark:hover:bg-cyan-500/10'
            }`}
          >
            <Music2 className="w-3.5 h-3.5" />
            <span>Musique</span>
          </button>

          {/* TAB 2: RADIO FM (Direct 100%) */}
          <button
            onClick={() => setActiveTab('radio')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'radio'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-cyan-300 dark:hover:text-cyan-300 hover:bg-white/60 dark:hover:bg-cyan-500/10'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
            <span>Radios FM</span>
          </button>

          {/* TAB 3: STUDIO ÉGALISEUR AUDIO */}
          <button
            onClick={() => setActiveTab('equalizer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'equalizer'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-pink-300 dark:hover:text-pink-300 hover:bg-white/60 dark:hover:bg-pink-500/10'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Égaliseur</span>
          </button>

          {/* TAB 4: HUB APK & INSTALLATION OU PLAYLISTS EN MODE INSTALLÉ */}
          {isInstalled ? (
            <button
              onClick={() => {
                setMusicInitialTab('playlists');
                setActiveTab('music');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
                activeTab === 'music' && musicInitialTab === 'playlists'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-md shadow-emerald-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-cyan-300 dark:hover:text-cyan-300 hover:bg-white/60 dark:hover:bg-cyan-500/10'
              }`}
            >
              <ListMusic className="w-3.5 h-3.5 text-emerald-400" />
              <span>Playlists</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('hub')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
                activeTab === 'hub'
                  ? 'bg-gradient-to-r from-cyan-400 to-pink-500 text-slate-950 font-bold shadow-md shadow-cyan-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-cyan-300 dark:hover:text-cyan-300 hover:bg-white/60 dark:hover:bg-cyan-500/10'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Installer APK</span>
            </button>
          )}

          {/* TAB 5: AUDIO ARRIÈRE-PLAN */}
          <button
            onClick={() => setActiveTab('audio-guide')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'audio-guide'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-cyan-300 dark:hover:text-cyan-300 hover:bg-white/60 dark:hover:bg-cyan-500/10'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Arrière-plan</span>
          </button>
        </div>

        {/* Right CTA Button & Quick Action */}
        <div className="flex items-center gap-2">
          {isInstalled ? (
            <button
              onClick={() => setActiveTab('music')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-bold shadow-sm active:scale-95 transition"
              title="Lancer le lecteur de musique en mode autonome"
            >
              <Music2 className="w-3.5 h-3.5" />
              <span>Lecteur Audio</span>
            </button>
          ) : (
            <button
              onClick={isInstallable ? install : onOpenInstallModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white text-xs font-bold shadow-sm active:scale-95 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Installer l'APK</span>
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Slide Position Indicator Bar */}
      <div className="relative h-1 w-full bg-slate-200/60 dark:bg-white/5 overflow-hidden">
        <div 
          className="absolute top-0 bottom-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 rounded-full"
          style={{
            width: `${100 / TABS.length}%`,
            left: `${(currentTabIndex / TABS.length) * 100}%`,
            transform: isDragging ? `translateX(${(-dragOffset / (typeof window !== 'undefined' ? window.innerWidth : 400)) * -100}%)` : undefined,
            transition: isDragging ? 'none' : 'left 320ms cubic-bezier(0.25, 1, 0.5, 1)',
          }}
        />
      </div>

      {/* Main Sliding Carousel Container (with swipe touch handlers and persistent MiniPlayer offset) */}
      <div 
        {...touchHandlers}
        className="flex-1 min-h-0 overflow-hidden relative touch-pan-y"
      >
        <div
          className="w-full h-full flex will-change-transform"
          style={{
            transform: `translateX(calc(-${currentTabIndex * 100}% + ${dragOffset}px))`,
            transition: isDragging ? 'none' : 'transform 320ms cubic-bezier(0.25, 1, 0.5, 1)',
          }}
        >
          {/* TAB 0: ACCUEIL */}
          <div className={`w-full h-full shrink-0 overflow-hidden ${currentTrack ? 'pb-24 sm:pb-20' : ''}`}>
            <HomeDashboardView
              onNavigate={handleNavigateFromHome}
              onOpenInstallModal={onOpenInstallModal}
              onOpenApkStudio={onOpenApkStudio}
              onOpenProfileModal={onOpenProfileModal}
              onOpenAuthModal={onOpenAuthModal}
              onSearchSubmit={handleSearchSubmitFromHome}
              onOpenLocalAudio={() => setShowLocalAudioModal(true)}
              onOpenSoundboard={() => setShowSoundboardModal(true)}
              onOpenRecorder={() => setShowRecorderModal(true)}
              onOpenLyrics={() => setShowLyricsModal(true)}
              onOpenSleepTimer={() => setShowSleepTimerModal(true)}
            />
          </div>

          {/* TAB 1: MUSIQUE & YOUTUBE */}
          <div className={`w-full h-full shrink-0 overflow-hidden ${currentTrack ? 'pb-24 sm:pb-20' : ''}`}>
            <VibraNativeView
              onSwitchToRadio={() => setActiveTab('radio')}
              onOpenProfileModal={onOpenProfileModal}
              initialTab={musicInitialTab}
              initialQuery={musicInitialQuery}
            />
          </div>

          {/* TAB 2: RADIO FM EN DIRECT */}
          <div className={`w-full h-full shrink-0 overflow-hidden ${currentTrack ? 'pb-24 sm:pb-20' : ''}`}>
            <RadioFMView />
          </div>

          {/* TAB 3: STUDIO ÉGALISEUR AUDIO DIRECT */}
          <div className={`w-full h-full shrink-0 overflow-hidden ${currentTrack ? 'pb-24 sm:pb-20' : ''}`}>
            <AudioEqualizer isEmbedded={true} />
          </div>

          {/* TAB 4: HUB APK & INSTALLATION */}
          <div className={`w-full h-full shrink-0 overflow-hidden ${currentTrack ? 'pb-24 sm:pb-20' : ''}`}>
            <div className="w-full h-full overflow-y-auto p-4 sm:p-8 space-y-6 max-w-4xl mx-auto pb-28">
              {/* Hero banner */}
              <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900 text-white border border-purple-500/30 overflow-hidden shadow-2xl">
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4 text-center md:text-left">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-0.5 shadow-xl shadow-purple-600/30 shrink-0">
                      <img src="/pwa-512x512.png" alt="Vibra" className="w-full h-full object-cover rounded-[15px]" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Vibra</h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                          APK & PWA Officielle
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-purple-100 mt-1 max-w-lg">
                        Écouter en toute liberté YouTube, Spotify et les radios FM de France sur cette application simple et futuriste orientée IA.
                      </p>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3 text-xs text-purple-200">
                        <span className="flex items-center gap-1.5 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> WebAPK Android Native
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> 2 fichiers de conformité (manifest & assetlinks)
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> Égaliseur audio studio & PiP
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
                    <button
                      onClick={isInstallable ? install : onOpenInstallModal}
                      className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white text-purple-900 hover:bg-purple-50 font-bold text-sm shadow-xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition"
                    >
                      <Download className="w-4 h-4 text-purple-700" />
                      <span>Installer sur ce téléphone</span>
                    </button>
                    <button
                      onClick={onOpenApkStudio}
                      className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition"
                    >
                      <FileArchive className="w-4 h-4 text-pink-300" />
                      <span>Générer Package APK (.ZIP)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Three key installation routes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex flex-col justify-between hover:border-purple-500/40 shadow-sm dark:shadow-none transition">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">Installation Android (WebAPK)</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Sur Android, Chrome ou Samsung Internet génère directement un <strong className="text-purple-700 dark:text-purple-300">vrai fichier APK</strong> installé au niveau système Android.
                    </p>
                  </div>
                  <button
                    onClick={onOpenInstallModal}
                    className="mt-4 flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 pt-3 border-t border-slate-100 dark:border-white/5"
                  >
                    <span>Voir le tutoriel Android</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex flex-col justify-between hover:border-pink-500/40 shadow-sm dark:shadow-none transition">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                      <Download className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">Télécharger le fichier .APK</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Utilisez notre générateur Bubblewrap / Android Studio pour compiler un package APK signé autonome prêt pour le Play Store.
                    </p>
                  </div>
                  <button
                    onClick={onOpenApkStudio}
                    className="mt-4 flex items-center justify-between text-xs font-semibold text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 pt-3 border-t border-slate-100 dark:border-white/5"
                  >
                    <span>Configurer l'APK Studio</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex flex-col justify-between hover:border-indigo-500/40 shadow-sm dark:shadow-none transition">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">Partager avec un QR Code</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Scannez l'écran depuis un smartphone ou partagez l'URL pour ouvrir instantanément l'invitation d'installation.
                    </p>
                  </div>
                  <button
                    onClick={onOpenInstallModal}
                    className="mt-4 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 pt-3 border-t border-slate-100 dark:border-white/5"
                  >
                    <span>Afficher le QR code</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* WebAPK Android Direct Installation & Mobile Breakout Card */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#10101e] border border-slate-200 dark:border-white/10 shadow-lg space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Technologie Officielle WebAPK Google
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Installer l'APK directement sur smartphone Android
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
                      Google Play Services compile et installe automatiquement l'application au niveau système Android, avec son icône dans vos applications et sans passer par PWABuilder.
                    </p>
                  </div>

                  <a
                    href={typeof window !== 'undefined' ? window.location.origin : '/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shrink-0 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Ouvrir dans Chrome (Plein Écran)</span>
                  </a>
                </div>

                {/* QR Code and Quick Steps */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 flex flex-col sm:flex-row items-center gap-5">
                  <div className="p-2 bg-white rounded-xl shadow-md border border-slate-200 shrink-0">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev-tekmiwwyhnlbloqqpyzffw-581606815826.europe-west3.run.app')}&bgcolor=ffffff&color=000000`}
                      alt="QR Code d'installation"
                      className="w-24 h-24"
                    />
                  </div>

                  <div className="space-y-2 text-xs flex-1">
                    <div className="font-bold text-slate-900 dark:text-white">
                      3 étapes simples sur votre téléphone :
                    </div>
                    <ol className="space-y-1.5 text-slate-600 dark:text-slate-300">
                      <li className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                        <span>Pointez l'appareil photo de votre téléphone sur le QR Code.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                        <span>Ouvrez le lien dans <strong>Google Chrome Android</strong>.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                        <span>Cliquez sur <strong>« Installer l'application »</strong> ou <strong>« Créer un raccourci »</strong> : l'application Vibra est ajoutée sur votre écran d'accueil en plein écran !</span>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TAB 5: AUDIO ARRIÈRE-PLAN */}
          <div className={`w-full h-full shrink-0 overflow-hidden ${currentTrack ? 'pb-24 sm:pb-20' : ''}`}>
            <div className="w-full h-full overflow-y-auto p-4 sm:p-8 space-y-6 max-w-3xl mx-auto pb-28">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white space-y-3 shadow-xl">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-6 h-6 text-pink-300" />
                  <h3 className="text-xl font-extrabold">Écouter avec l'écran verrouillé ou en arrière-plan</h3>
                </div>
                <p className="text-xs sm:text-sm text-purple-100 leading-relaxed">
                  Vibra intègre l'API <strong>MediaSession</strong> ainsi que le mode Picture-in-Picture pour vous permettre d'écouter votre musique et vos radios sans interruption lorsque vous quittez l'application.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex items-start gap-4 shadow-sm dark:shadow-none">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-600/20 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-sm shrink-0">
                    1
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Mode Picture-in-Picture (PiP)</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Sur Android, lorsque vous lancez une vidéo ou musique sur Vibra et que vous retournez à l'écran d'accueil, la vidéo se réduit automatiquement en mini-fenêtre flottante que vous pouvez déplacer partout.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex items-start gap-4 shadow-sm dark:shadow-none">
                  <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-600/20 text-pink-700 dark:text-pink-300 flex items-center justify-center font-bold text-sm shrink-0">
                    2
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Commandes sur l'écran de verrouillage</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      L'application utilise l'API <code>MediaSession</code> pour afficher le titre de la chanson, l'image de la pochette et les boutons Pause / Suivant directement dans le panneau de notifications de votre téléphone.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex items-start gap-4 shadow-sm dark:shadow-none">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm shrink-0">
                    3
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Optimisation de la batterie Android</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Si votre téléphone coupe la musique après quelques minutes d'écran éteint, allez dans les <strong>Paramètres Android &gt; Applications &gt; Vibra &gt; Batterie</strong> et sélectionnez <strong>« Non restreinte »</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Persistent MiniPlayer Docked with Slide Up/Down transitions */}
      <MiniPlayer
        onOpenHistory={() => setShowHistoryModal(true)}
        onOpenDiagnostics={() => setShowDiagnosticsModal(true)}
        onOpenExpanded={() => setShowExpandedPlayer(true)}
      />

      {/* Fullscreen Player Modal */}
      <ExpandedPlayerModal
        isOpen={showExpandedPlayer}
        onClose={() => setShowExpandedPlayer(false)}
        onOpenHistory={() => setShowHistoryModal(true)}
        onOpenDiagnostics={() => setShowDiagnosticsModal(true)}
        onOpenLyrics={() => setShowLyricsModal(true)}
        onOpenSleepTimer={() => setShowSleepTimerModal(true)}
        onOpenSoundboard={() => setShowSoundboardModal(true)}
        onOpenRecorder={() => setShowRecorderModal(true)}
      />

      {/* History Modal */}
      <HistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />

      {/* Diagnostics Modal */}
      <ApiDiagnosticsModal
        isOpen={showDiagnosticsModal}
        onClose={() => setShowDiagnosticsModal(false)}
      />

      {/* Local MP3 Player Modal */}
      <LocalAudioModal
        isOpen={showLocalAudioModal}
        onClose={() => setShowLocalAudioModal(false)}
      />

      {/* Cyberpunk DJ Soundboard */}
      <CyberSoundboard
        isOpen={showSoundboardModal}
        onClose={() => setShowSoundboardModal(false)}
      />

      {/* Audio Recorder Modal */}
      <AudioRecorderModal
        isOpen={showRecorderModal}
        onClose={() => setShowRecorderModal(false)}
      />

      {/* Interactive Lyrics & Karaoke Modal */}
      <LyricsModal
        isOpen={showLyricsModal}
        onClose={() => setShowLyricsModal(false)}
      />

      {/* Sleep Timer Modal */}
      <SleepTimerModal
        isOpen={showSleepTimerModal}
        onClose={() => setShowSleepTimerModal(false)}
      />
    </div>
  );
};
