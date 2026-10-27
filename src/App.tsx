/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { VibraAppShell } from './components/VibraAppShell';
import { InstallModal } from './components/InstallModal';
import { ApkStudioModal } from './components/ApkStudioModal';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { usePWAInstall } from './hooks/usePWAInstall';
import { useTheme } from './hooks/useTheme';
import { PlayerProvider } from './context/PlayerContext';
import { ProfileProvider } from './context/ProfileContext';

import { CyberpunkBackground } from './components/CyberpunkBackground';
import { CyberScanlinesOverlay } from './components/CyberScanlinesOverlay';

export default function App() {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const { themeMode, resolvedTheme, setThemeMode } = useTheme();

  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showApkStudio, setShowApkStudio] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://vibra.app';

  // Check URL params for tabs if launched with shortcut
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'install') {
      setShowInstallModal(true);
    }
  }, []);

  return (
    <ProfileProvider>
      <PlayerProvider>
        <div className="relative flex flex-col h-screen w-screen bg-slate-900/10 dark:bg-transparent text-slate-800 dark:text-slate-100 overflow-hidden font-sans select-none">
          {/* Animated Sliding Cyberpunk Background Layer */}
          <CyberpunkBackground />

          {/* Retro-futuristic semi-transparent scanlines overlay */}
          <CyberScanlinesOverlay />

          {/* Top Navigation with Theme Switcher, User Profile & Connexion */}
          <Navbar
            onOpenInstall={() => setShowInstallModal(true)}
            onOpenApkStudio={() => setShowApkStudio(true)}
            onOpenProfileModal={() => setShowProfileModal(true)}
            onOpenAuthModal={() => setShowAuthModal(true)}
            themeMode={themeMode}
            resolvedTheme={resolvedTheme}
            setThemeMode={setThemeMode}
          />

          {/* Main Workspace & Interactive Vibra Container with persistent MiniPlayer */}
          <VibraAppShell
            onOpenInstallModal={() => setShowInstallModal(true)}
            onOpenApkStudio={() => setShowApkStudio(true)}
            onOpenProfileModal={() => setShowProfileModal(true)}
            onOpenAuthModal={() => setShowAuthModal(true)}
          />

          {/* Offline Status Alert */}
          <OfflineIndicator />

          {/* Modals */}
          <InstallModal
            isOpen={showInstallModal}
            onClose={() => setShowInstallModal(false)}
            onTriggerInstall={install}
            canInstall={isInstallable}
            isInstalled={isInstalled}
            appUrl={appUrl}
            onOpenApkStudio={() => {
              setShowInstallModal(false);
              setShowApkStudio(true);
            }}
          />

          <ApkStudioModal
            isOpen={showApkStudio}
            onClose={() => setShowApkStudio(false)}
            appUrl={appUrl}
          />

          <ProfileModal
            isOpen={showProfileModal}
            onClose={() => setShowProfileModal(false)}
          />

          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
          />
        </div>
      </PlayerProvider>
    </ProfileProvider>
  );
}
