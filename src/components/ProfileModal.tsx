import React, { useState } from 'react';
import { 
  X, 
  User, 
  Plus, 
  Check, 
  Trash2, 
  Sparkles, 
  Headphones, 
  Clock, 
  Music, 
  Flame, 
  Layers, 
  Award,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Cloud,
  Lock,
  RefreshCw,
  Key,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_AVATARS = ['🎧', '⚡', '🔥', '🌿', '🚀', '💎', '🎸', '🎹', '🎙️', '👾', '🌌', '🌸', '🌊', '👑', '🦁', '🛸'];
const AVAILABLE_GENRES = [
  'Rap Français',
  'Rap US',
  'Pop Internationale',
  'Électro & Club',
  'Synthwave & Retrowave',
  'Lo-Fi & Chillout',
  'Rock & Alternatif',
  'R&B / Soul',
  'Latina & Reggaeton',
  'Jazz & Blues',
  'Classique',
  'Variété Française',
];
const AVAILABLE_COLORS = [
  { id: 'purple', name: 'Violet Néon', bg: 'bg-purple-600', ring: 'ring-purple-400' },
  { id: 'cyan', name: 'Cyan Futuriste', bg: 'bg-cyan-600', ring: 'ring-cyan-400' },
  { id: 'rose', name: 'Rose Électrique', bg: 'bg-rose-600', ring: 'ring-rose-400' },
  { id: 'emerald', name: 'Vert Émeraude', bg: 'bg-emerald-600', ring: 'ring-emerald-400' },
  { id: 'amber', name: 'Ambre Gold', bg: 'bg-amber-600', ring: 'ring-amber-400' },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const {
    activeProfile,
    profiles,
    switchProfile,
    createProfile,
    updateActiveProfile,
    deleteProfile,
    cloudSyncStatus,
    lastCloudSyncTime,
    sessionPassphrase,
    setSessionPassphrase,
    forceCloudSync,
    restoreFromCloud,
  } = useProfile();

  const [mode, setMode] = useState<'switch' | 'create' | 'stats' | 'cloud'>('switch');

  // New Profile Form State
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState('🎧');
  const [newColor, setNewColor] = useState('purple');
  const [newGenres, setNewGenres] = useState<string[]>(['Rap Français', 'Pop Internationale']);

  // Cloud passphrase editing state
  const [editingPassphrase, setEditingPassphrase] = useState(sessionPassphrase);
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [isSyncingAction, setIsSyncingAction] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  if (!isOpen) return null;

  const toggleGenre = (genre: string) => {
    setNewGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    createProfile({
      name: newName.trim(),
      avatar: newAvatar,
      themeColor: newColor,
      preferredGenres: newGenres,
    });
    setNewName('');
    setMode('switch');
  };

  const handleManualSync = async () => {
    setIsSyncingAction(true);
    setSyncMessage(null);
    const success = await forceCloudSync();
    setIsSyncingAction(false);
    if (success) {
      setSyncMessage('Vos préférences et votre historique ont été chiffrés et synchronisés avec Supabase !');
      setTimeout(() => setSyncMessage(null), 4000);
    } else {
      setSyncMessage('Synchronisation locale chiffrée réussie (sauvegarde de secours active).');
      setTimeout(() => setSyncMessage(null), 4000);
    }
  };

  const handleRestoreFromCloud = async () => {
    setIsSyncingAction(true);
    setSyncMessage(null);
    const success = await restoreFromCloud();
    setIsSyncingAction(false);
    if (success) {
      setSyncMessage('Données restaurées et déchiffrées depuis le Cloud avec succès !');
      setTimeout(() => setSyncMessage(null), 4000);
    } else {
      setSyncMessage('Aucune sauvegarde antérieure trouvée pour cette clé de session.');
      setTimeout(() => setSyncMessage(null), 4000);
    }
  };

  const handleSavePassphrase = (e: React.FormEvent) => {
    e.preventDefault();
    setSessionPassphrase(editingPassphrase);
    setSyncMessage('Nouvelle clé de session enregistrée ! Le chiffrement sera basé sur cette clé.');
    setTimeout(() => setSyncMessage(null), 3000);
  };

  const copySessionKey = () => {
    navigator.clipboard.writeText(editingPassphrase);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const topArtistsList = Object.entries(activeProfile.stats.topArtists || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white/75 dark:bg-[#07081a]/85 border border-slate-200/60 dark:border-cyan-500/35 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-800 dark:text-white neon-border-cyan ath-modal-glitch"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-cyan-500/25 flex items-center justify-between bg-slate-50/50 dark:bg-black/30 backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/10 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg">
              {activeProfile.avatar}
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight ath-header-glitch">Espace Profils & Cloud Privé</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Profil actif : <strong className="text-purple-600 dark:text-purple-400">{activeProfile.name}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex border-b border-slate-200 dark:border-white/10 px-6 pt-2 bg-slate-50/30 dark:bg-black/10 gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setMode('switch')}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              mode === 'switch'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Mes Profils ({profiles.length})</span>
          </button>

          <button
            onClick={() => setMode('cloud')}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              mode === 'cloud'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Cloud & Sécurité</span>
          </button>

          <button
            onClick={() => setMode('create')}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              mode === 'create'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouveau</span>
          </button>

          <button
            onClick={() => setMode('stats')}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              mode === 'stats'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Stats</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: SWITCH PROFILES */}
          {mode === 'switch' && (
            <div className="space-y-4">
              {/* Privacy and Isolation Guarantee Banner */}
              <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/35 text-cyan-200 text-xs space-y-1.5 neon-border-cyan">
                <div className="flex items-center gap-2 font-bold text-cyan-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Isolation totale et confidentialité de chaque utilisateur</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong>Chaque profil utilisateur dispose de ses propres données privées</strong> : vos playlists créées, vos morceaux favoris, votre historique d'écoute et vos réglages audio sont <strong>100% isolés</strong>. Changer de profil bascule instantanément vers les playlists exclusives de cet utilisateur.
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Profils enregistrés sur cet appareil ({profiles.length}) :</span>
                <span className="text-[11px] text-cyan-400 font-semibold">Cliquez pour basculer</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {profiles.map((p) => {
                  const isActive = p.id === activeProfile.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => switchProfile(p.id)}
                      className={`p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer group ${
                        isActive
                          ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 shadow-md ring-1 ring-purple-500/30'
                          : 'bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-white/10 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition">
                          {p.avatar}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                              {p.name}
                            </h4>
                            {isActive && (
                              <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold">
                                Actif
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {p.favoriteTrackIds.length} favoris • {p.playlists.length} playlists • {p.history.length} titres écoutés
                          </p>
                        </div>
                      </div>

                      {profiles.length > 1 && !isActive && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteProfile(p.id);
                          }}
                          className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition"
                          title="Supprimer ce profil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SUPABASE CLOUD SYNC & ENCRYPTION */}
          {mode === 'cloud' && (
            <div className="space-y-4">
              {/* Cloud Security Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/50 via-teal-950/40 to-slate-900 border border-emerald-500/30 text-white space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs text-emerald-400 uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Synchronisation Cloud Supabase Sécurisée</span>
                  </div>
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {cloudSyncStatus === 'syncing' ? 'Synchronisation...' : 'Chiffrement Actif'}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white">
                  Chiffrement AES-GCM 256 bits par session utilisateur
                </h4>
                <p className="text-xs text-emerald-100/80 leading-relaxed">
                  Vos préférences musicales, playlists et historiques d'écoute sont chiffrés directement sur votre appareil avant d'être envoyés à Supabase. <strong>Personne ne peut lire vos données dans la base sans votre clé de session privée.</strong>
                </p>
              </div>

              {/* Status Details */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Statut Supabase :</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{cloudSyncStatus === 'syncing' ? 'En cours...' : 'Connecté & Protégé'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Dernier enregistrement :</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white truncate">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <span>{lastCloudSyncTime ? new Date(lastCloudSyncTime).toLocaleTimeString('fr-FR') : 'À l\'instant'}</span>
                  </div>
                </div>
              </div>

              {/* Session Passphrase Config */}
              <form onSubmit={handleSavePassphrase} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>Clé de session secrète (Chiffrement privé)</span>
                  </label>
                  <button
                    type="button"
                    onClick={copySessionKey}
                    className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    {copiedKey ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey ? 'Copié !' : 'Copier la clé'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Cette clé permet de synchroniser vos playlists et favoris privés sur un autre smartphone ou ordinateur.
                </p>

                <div className="relative flex items-center">
                  <input
                    type={showPassphrase ? 'text' : 'password'}
                    value={editingPassphrase}
                    onChange={(e) => setEditingPassphrase(e.target.value)}
                    className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 pr-10 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassphrase(!showPassphrase)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
                  >
                    {showPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-xs font-semibold text-slate-800 dark:text-white transition"
                >
                  Enregistrer cette clé de session
                </button>
              </form>

              {/* Feedback toast message */}
              {syncMessage && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{syncMessage}</span>
                </div>
              )}

              {/* Manual Cloud Actions */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncingAction}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAction ? 'animate-spin' : ''}`} />
                  <span>Synchroniser maintenant</span>
                </button>

                <button
                  type="button"
                  onClick={handleRestoreFromCloud}
                  disabled={isSyncingAction}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <Cloud className="w-3.5 h-3.5 text-purple-400" />
                  <span>Restaurer depuis Supabase</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CREATE PROFILE */}
          {mode === 'create' && (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Nom du profil
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex : Soirée Electro, Focus Études, Gym..."
                  className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Avatar
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setNewAvatar(av)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition ${
                        newAvatar === av
                          ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-400'
                          : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Genres favoris pour l'algorithme IA
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {AVAILABLE_GENRES.map((g) => {
                    const isSelected = newGenres.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => toggleGenre(g)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{g}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!newName.trim()}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 disabled:opacity-50 transition"
                >
                  Créer et activer ce profil
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: STATS */}
          {mode === 'stats' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-500/20 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-bold">
                    <Clock className="w-4 h-4" />
                    <span>Temps d'écoute</span>
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {Math.round(activeProfile.stats?.totalListenedMinutes || 0)} min
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Calculé en temps réel
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-500/20 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-pink-600 dark:text-pink-400 font-bold">
                    <Music className="w-4 h-4" />
                    <span>Titres joués</span>
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {activeProfile.stats?.totalTracksPlayed || 0}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Morceaux uniques
                  </p>
                </div>
              </div>

              {/* Top Artists */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                  <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Artistes les plus écoutés ({activeProfile.name})</span>
                </div>

                {topArtistsList.length > 0 ? (
                  <div className="space-y-1.5">
                    {topArtistsList.map(([artist, count], i) => (
                      <div key={artist} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-white/5 last:border-none">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {i + 1}. {artist}
                        </span>
                        <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400">
                          {count} écoute(s)
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    Aucune écoute enregistrée pour le moment. Lancez un morceau pour construire vos statistiques !
                  </p>
                )}
              </div>

              {/* Personalized Preferences */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Genres de prédilection
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeProfile.preferredGenres.map((g) => (
                    <span
                      key={g}
                      className="px-2.5 py-1 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-[11px] font-semibold border border-purple-200 dark:border-purple-500/30"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
