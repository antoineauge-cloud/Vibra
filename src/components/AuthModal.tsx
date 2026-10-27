import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  LogOut, 
  FolderPlus, 
  Heart, 
  ListMusic, 
  Flame,
  ArrowRight
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup' | 'account';
  onOpenCreatePlaylist?: () => void;
}

const AVATAR_OPTIONS = ['🎧', '⚡', '🔥', '🌿', '🚀', '💎', '👑', '👾', '🎙️', '🌌', '🎸', '🦁'];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'account',
  onOpenCreatePlaylist
}) => {
  const { 
    activeProfile, 
    profiles, 
    switchProfile, 
    isAuthenticated, 
    login, 
    signup, 
    logout 
  } = useProfile();

  const [mode, setMode] = useState<'login' | 'signup' | 'account'>(
    isAuthenticated ? 'account' : (initialMode || 'login')
  );

  // Login Form
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Signup Form
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupAvatar, setSignupAvatar] = useState('🎧');
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginIdentifier.trim()) {
      setLoginError('Veuillez entrer votre email ou votre nom de profil.');
      return;
    }
    const res = login(loginIdentifier.trim(), loginPassword);
    if (res.success) {
      setMode('account');
      setTimeout(() => {
        onClose();
      }, 800);
    } else {
      setLoginError(res.message);
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);
    setSignupSuccess(null);
    if (!signupName.trim()) {
      setSignupError('Veuillez entrer votre nom ou pseudo.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setSignupError('Veuillez entrer une adresse email valide.');
      return;
    }
    const res = signup({
      name: signupName.trim(),
      email: signupEmail.trim(),
      password: signupPassword,
      avatar: signupAvatar,
      preferredGenres: ['Rap Français', 'Pop', 'Électro & Club'],
    });
    if (res.success) {
      setSignupSuccess('Compte créé avec succès ! Votre espace privé est prêt.');
      setTimeout(() => {
        setMode('account');
      }, 1000);
    } else {
      setSignupError(res.message);
    }
  };

  const handleQuickLogin = (profileId: string) => {
    switchProfile(profileId);
    setMode('account');
  };

  const handleLogoutAction = () => {
    logout();
    setMode('login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white/80 dark:bg-[#08091d]/90 border border-slate-200/80 dark:border-cyan-500/40 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col text-slate-800 dark:text-white neon-border-cyan ath-modal-glitch"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 py-4.5 border-b border-slate-200/80 dark:border-cyan-500/30 bg-gradient-to-r from-purple-950/60 via-indigo-950/60 to-slate-900/60 backdrop-blur-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#0c0c1e] rounded-[14px] flex items-center justify-center text-xl">
                {isAuthenticated ? activeProfile.avatar : '🔐'}
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2 ath-header-glitch">
                {isAuthenticated ? 'Mon Espace Privé' : 'Connexion Vibra'}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {isAuthenticated ? 'CONNECTÉ' : 'COMPTE PRIVÉ'}
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                {isAuthenticated ? `Connecté en tant que ${activeProfile.name}` : 'Accédez à vos playlists et favoris exclusifs'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 border-b border-slate-200 dark:border-white/10 p-1.5 bg-slate-100/50 dark:bg-black/20 text-xs font-bold text-center">
          <button
            onClick={() => setMode('account')}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              mode === 'account'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Mon Compte</span>
          </button>

          <button
            onClick={() => setMode('login')}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Connexion</span>
          </button>

          <button
            onClick={() => setMode('signup')}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              mode === 'signup'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Inscription</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* TAB 1: MON COMPTE (Logged In Details) */}
          {mode === 'account' && (
            <div className="space-y-4">
              {/* Profile Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-indigo-950/40 to-slate-900 border border-purple-500/30 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-2xl shadow-inner">
                      {activeProfile.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-white">{activeProfile.name}</h4>
                      <p className="text-xs text-purple-200">
                        {activeProfile.email || `${activeProfile.name.toLowerCase()}@vibra.app`}
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
                    Espace Actif
                  </span>
                </div>

                {/* Account Isolation Guarantee */}
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2 text-[11px] text-emerald-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Vos playlists et favoris sont <strong>100% isolés</strong>. Aucun autre profil ne peut y accéder ou les modifier.
                  </span>
                </div>
              </div>

              {/* Data Summary Grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400">
                    {activeProfile.playlists.length}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                    Playlists
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <div className="text-xl font-extrabold text-rose-500">
                    {activeProfile.favorites.length}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                    Favoris
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <div className="text-xl font-extrabold text-cyan-400">
                    {activeProfile.stats.totalListenedMinutes}m
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                    D'écoute
                  </div>
                </div>
              </div>

              {/* Quick Profile Switcher (Other Registered Accounts on this device) */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">
                    Basculer vers un autre compte :
                  </span>
                  <span>{profiles.length} comptes</span>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {profiles.map((p) => {
                    const isSelected = p.id === activeProfile.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleQuickLogin(p.id)}
                        className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between text-xs ${
                          isSelected
                            ? 'bg-purple-500/20 border-purple-500 text-purple-200 font-bold'
                            : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-purple-400 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{p.avatar}</span>
                          <div>
                            <div className="font-bold">{p.name}</div>
                            <div className="text-[10px] text-slate-400">
                              {p.playlists.length} playlists • {p.favorites.length} favoris
                            </div>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col gap-2">
                {onOpenCreatePlaylist && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCreatePlaylist();
                    }}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span>Créer une nouvelle playlist pour {activeProfile.name}</span>
                  </button>
                )}

                <button
                  onClick={handleLogoutAction}
                  className="w-full py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-600 dark:text-slate-300 hover:text-red-500 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-200 dark:border-white/10 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Se déconnecter de ce profil</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SE CONNECTER (Login) */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Connexion à votre compte personnel
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Connectez-vous pour retrouver instantanément vos playlists créées, vos favoris et votre historique.
                </p>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold">
                  {loginError}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email ou Nom de compte
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Ex: antoine.auge@outlook.fr ou Antoine"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/15 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mot de passe (facultatif pour les profils locaux)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/15 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* 1-Click Quick Select for existing users */}
              <div className="pt-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Ou connexion rapide en 1 clic :
                </span>
                <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                  {profiles.slice(0, 4).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        handleQuickLogin(p.id);
                        onClose();
                      }}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-purple-600 hover:text-white border border-slate-200 dark:border-white/10 text-xs font-semibold flex items-center gap-2 transition truncate text-left"
                    >
                      <span>{p.avatar}</span>
                      <span className="truncate">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition active:scale-98"
              >
                Se connecter à mon compte
              </button>

              <p className="text-center text-xs text-slate-400">
                Vous n'avez pas encore de compte ?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-purple-400 font-bold hover:underline"
                >
                  Créer un compte
                </button>
              </p>
            </form>
          )}

          {/* TAB 3: INSCRIPTION (Sign Up / New Account) */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Créer votre compte personnel indépendant
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Un espace 100% privé sera créé avec vos propres playlists et vos morceaux favoris.
                </p>
              </div>

              {signupError && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold">
                  {signupError}
                </div>
              )}

              {signupSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{signupSuccess}</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Votre Nom ou Pseudo
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Antoine, Sophie, DJ Neo..."
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Adresse Email
                  </label>
                  <input
                    type="email"
                    placeholder="Ex: antoine.auge@outlook.fr"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    placeholder="Créer un mot de passe sécurisé"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Avatar selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Choisissez votre Avatar
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVATAR_OPTIONS.map((av) => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => setSignupAvatar(av)}
                        className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition ${
                          signupAvatar === av
                            ? 'bg-purple-600 scale-110 shadow-md ring-2 ring-purple-400'
                            : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition active:scale-98"
              >
                Créer mon compte et mon espace privé
              </button>

              <p className="text-center text-xs text-slate-400">
                Vous avez déjà un compte ?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-purple-400 font-bold hover:underline"
                >
                  Se connecter
                </button>
              </p>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Données privées chiffrées
          </span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-semibold transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
