import React from 'react';
import { GameScreen } from '../types';
import { sounds } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

interface MobileBottomNavProps {
  currentScreen: GameScreen;
  onNavigate: (screen: GameScreen) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentScreen, onNavigate }) => {
  const tabs: { id: GameScreen; label: string; icon: React.ReactNode }[] = [
    {
      id: 'menu',
      label: 'Arena',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5 stroke-[2.2px]">
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
      )
    },
    {
      id: 'duel',
      label: 'Duel',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5 stroke-[2.2px]">
          <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
      )
    },
    {
      id: 'bot',
      label: 'AI Bot',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5 stroke-[2.2px]">
          <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
      )
    },
    {
      id: 'leaderboard',
      label: 'Reyting',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5 stroke-[2.2px]">
          <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
      )
    },
    {
      id: 'profile',
      label: 'Profil',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5 stroke-[2.2px]">
          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
      )
    },
  ];

  return (
    <nav
      aria-label="Mobil navigatsiya"
      className="sticky bottom-0 left-0 right-0 z-40 grid grid-cols-5 p-2 bg-[#161618] border-t border-[rgba(248,247,212,0.1)]"
    >
      {tabs.map((tab) => {
        const isActive = currentScreen === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => {
              sounds.playClick();
              triggerHaptic('selection');
              onNavigate(tab.id);
            }}
            className={`flex flex-col items-center justify-center gap-1 py-1.5 transition-colors ${
              isActive ? 'text-[#6366f1]' : 'text-[rgba(248,247,212,0.4)] hover:text-[rgba(248,247,212,0.8)]'
            }`}
          >
            {tab.icon}
            <span className="text-[10px] font-semibold uppercase tracking-wider font-mono">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
