import React from 'react';
import { GameScreen } from '../types';
import { Volume2, VolumeX } from 'lucide-react';
import { sounds } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

interface TopNavProps {
  currentScreen: GameScreen;
  onNavigate: (screen: GameScreen) => void;
  coins: number;
  stars: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentScreen,
  onNavigate,
  coins,
  stars,
  soundEnabled,
  onToggleSound
}) => {
  const navItems: { id: GameScreen; label: string }[] = [
    { id: 'menu', label: 'Arena' },
    { id: 'duel', label: 'Duel' },
    { id: 'bot', label: 'AI Bot' },
    { id: 'leaderboard', label: 'Reyting' },
    { id: 'shop', label: 'Do\'kon' },
    { id: 'referrals', label: 'Do\'stlar' },
  ];

  const handleNavClick = (screen: GameScreen) => {
    sounds.playClick();
    triggerHaptic('selection');
    onNavigate(screen);
  };

  return (
    <header className="px-4 py-3.5 border-b border-[rgba(248,247,212,0.1)] bg-[#111113]/90 backdrop-blur-md flex items-center justify-between sticky top-0 z-40">
      {/* Logo */}
      <button
        onClick={() => handleNavClick('menu')}
        className="font-display text-lg tracking-[-0.04em] font-extrabold text-[#f8f7f4] hover:opacity-90 transition-opacity focus:outline-none"
      >
        <span className="text-[#6366f1]">LIKE</span> DUEL
      </button>

      {/* Center Nav for larger screens */}
      <nav className="hidden sm:flex items-center gap-4 text-xs font-semibold">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`transition-colors py-1 ${
                isActive
                  ? 'text-[#6366f1] border-b-2 border-[#6366f1]'
                  : 'text-[#f8f7f4]/50 hover:text-[#f8f7f4]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Wallet & Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleNavClick('wallet')}
          className="bg-[#161618] border border-[rgba(248,247,212,0.1)] hover:border-[rgba(248,247,212,0.2)] rounded-lg px-2.5 py-1.5 flex items-center gap-2.5 font-mono text-xs tabular-nums transition-all active:scale-95"
          title="Hamyon balansi"
        >
          <div className="text-[#fbbf24] font-bold">🪙 {coins.toLocaleString()}</div>
          <div className="text-[rgba(248,247,212,0.2)]">|</div>
          <div className="text-[#38bdf8] font-bold">⭐ {stars}</div>
        </button>

        <button
          onClick={onToggleSound}
          className="p-1.5 text-[#f8f7f4]/50 hover:text-[#f8f7f4] bg-[#161618] border border-[rgba(248,247,212,0.1)] rounded-lg transition-colors"
          title={soundEnabled ? "Ovozni o'chirish" : "Ovozni yoqish"}
          aria-label="Toggle sound"
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} className="text-[#f8f7f4]/30" />}
        </button>

        <button
          onClick={() => handleNavClick('profile')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
            currentScreen === 'profile'
              ? 'bg-[#6366f1] text-white'
              : 'bg-[#161618] text-[#f8f7f4]/70 hover:text-white border border-[rgba(248,247,212,0.1)]'
          }`}
        >
          Profil
        </button>
      </div>
    </header>
  );
};
