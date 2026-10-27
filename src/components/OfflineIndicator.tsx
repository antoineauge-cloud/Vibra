import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-amber-600/90 backdrop-blur-md px-4 py-2.5 text-xs font-semibold text-white shadow-xl shadow-amber-600/30 border border-amber-400/40 animate-bounce">
      <WifiOff className="w-4 h-4 text-white" />
      <span>Mode hors-ligne — Cache local activé</span>
    </div>
  );
};
