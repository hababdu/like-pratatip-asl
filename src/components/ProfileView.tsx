import React, { useState } from 'react';
import { UserProfile, MatchHistoryItem, Achievement } from '../types';
import { sounds } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import confetti from 'canvas-confetti';
import { ArrowLeft } from 'lucide-react';

interface ProfileViewProps {
  user: UserProfile;
  matchHistory: MatchHistoryItem[];
  onUpdateUser: (updater: (prev: UserProfile) => UserProfile) => void;
  onBackToMenu: () => void;
  onNotification: (msg: string, type?: 'info' | 'success' | 'error') => void;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_win',
    title: 'Birinchi Qadam',
    description: 'Ilk bor raqib ustidan g\'alaba qozoning',
    icon: '⚔️',
    rewardCoins: 50,
    progress: 1,
    maxProgress: 1,
    completed: true
  },
  {
    id: 'streak_3',
    title: 'Olovli Seriya',
    description: 'Ketma-ket 3 ta g\'alabaga erishing',
    icon: '🔥',
    rewardCoins: 120,
    progress: 3,
    maxProgress: 3,
    completed: true
  },
  {
    id: 'games_20',
    title: 'Arena Jangchisi',
    description: 'Jami 20 ta duelda ishtirok eting',
    icon: '🛡️',
    rewardCoins: 200,
    progress: 14,
    maxProgress: 20,
    completed: false
  },
  {
    id: 'rich_player',
    title: 'Boyvachcha',
    description: 'Hisobingizdagi tangalarni 1,000 taga yetkazing',
    icon: '💎',
    rewardCoins: 300,
    progress: 650,
    maxProgress: 1000,
    completed: false
  },
  {
    id: 'ref_ambassador',
    title: 'Duel Elchisi',
    description: '3 ta do\'stingizni o\'yinga taklif qiling',
    icon: '👥',
    rewardCoins: 250,
    progress: 2,
    maxProgress: 3,
    completed: false
  }
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  matchHistory,
  onUpdateUser,
  onBackToMenu,
  onNotification
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements' | 'history'>('stats');

  const nextLevelXp = user.level * 300;
  const currentLevelProgress = Math.min(100, Math.round((user.xp / nextLevelXp) * 100));

  const handleClaimAchievement = (ach: Achievement) => {
    if (user.claimedAchievements.includes(ach.id)) return;

    sounds.playVictory();
    triggerHaptic('success');
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });

    onUpdateUser((prev) => ({
      ...prev,
      coins: prev.coins + ach.rewardCoins,
      claimedAchievements: [...prev.claimedAchievements, ach.id]
    }));

    onNotification(`Yutuq mukofoti olindi: +${ach.rewardCoins} tanga!`, 'success');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-1.5 text-xs text-[rgba(248,247,212,0.5)] hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Asosiy menyu</span>
        </button>
        <span className="text-[11px] text-[rgba(248,247,212,0.4)] font-mono">TG ID: {user.tgId}</span>
      </div>

      {/* User Hero Identity Card */}
      <div className="relative rounded-[20px] border border-[rgba(248,247,212,0.1)] bg-[#161618] p-5 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#6366f1] to-transparent" />
        <div className="flex items-center gap-3.5">
          
          {/* Avatar with Custom Ring */}
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-xl bg-[#0c0c0e] border-2 border-[#6366f1] flex items-center justify-center text-2xl shadow-xl">
              {user.avatarUrl || '🦁'}
            </div>
            <div className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded bg-[#6366f1] text-white font-mono text-[9px] font-bold">
              L{user.level}
            </div>
          </div>

          {/* Name & Title */}
          <div className="flex-1 space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-base font-extrabold text-[#f8f7f4] truncate">
                {user.firstName}
              </h1>
              <span className="text-[10px] font-mono font-bold text-[#38bdf8] bg-[rgba(56,189,248,0.1)] px-1.5 py-0.5 rounded uppercase shrink-0">
                {user.title}
              </span>
            </div>
            <p className="text-[11px] text-[rgba(248,247,212,0.5)] font-mono">
              @{user.username} · <strong className="text-[#fbbf24]">{user.rating} ball</strong>
            </p>

            {/* Level XP Bar */}
            <div className="pt-1.5 space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-[rgba(248,247,212,0.4)]">
                <span>XP Progress</span>
                <span>{user.xp} / {nextLevelXp}</span>
              </div>
              <div className="h-1.5 w-full bg-[#0c0c0e] rounded-full overflow-hidden border border-[rgba(248,247,212,0.08)]">
                <div
                  className="h-full bg-gradient-to-r from-[#6366f1] to-[#38bdf8] transition-all duration-500"
                  style={{ width: `${currentLevelProgress}%` }}
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-1 p-1 bg-[#161618] border border-[rgba(248,247,212,0.1)] rounded-lg text-xs font-mono">
        <button
          onClick={() => { sounds.playClick(); setActiveTab('stats'); }}
          className={`flex-1 py-1.5 rounded font-semibold transition-all ${
            activeTab === 'stats'
              ? 'bg-[#6366f1] text-white shadow'
              : 'text-[rgba(248,247,212,0.4)] hover:text-white'
          }`}
        >
          Statistika
        </button>
        <button
          onClick={() => { sounds.playClick(); setActiveTab('achievements'); }}
          className={`flex-1 py-1.5 rounded font-semibold transition-all ${
            activeTab === 'achievements'
              ? 'bg-[#6366f1] text-white shadow'
              : 'text-[rgba(248,247,212,0.4)] hover:text-white'
          }`}
        >
          Yutuqlar
        </button>
        <button
          onClick={() => { sounds.playClick(); setActiveTab('history'); }}
          className={`flex-1 py-1.5 rounded font-semibold transition-all ${
            activeTab === 'history'
              ? 'bg-[#6366f1] text-white shadow'
              : 'text-[rgba(248,247,212,0.4)] hover:text-white'
          }`}
        >
          Tarix
        </button>
      </div>

      {/* TAB 1: STATS */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-2 gap-2.5 font-mono">
          <div className="p-3 rounded-xl bg-[#161618] border border-[rgba(248,247,212,0.1)] space-y-0.5">
            <span className="text-[10px] text-[rgba(248,247,212,0.4)] uppercase">Jami o'yinlar</span>
            <div className="text-lg font-bold text-white tabular-nums">
              {user.stats.totalGames}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#161618] border border-[rgba(248,247,212,0.1)] space-y-0.5">
            <span className="text-[10px] text-[rgba(248,247,212,0.4)] uppercase">G'alabalar</span>
            <div className="text-lg font-bold text-[#10b981] tabular-nums">
              {user.stats.wins}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#161618] border border-[rgba(248,247,212,0.1)] space-y-0.5">
            <span className="text-[10px] text-[rgba(248,247,212,0.4)] uppercase">G'alaba ulushi</span>
            <div className="text-lg font-bold text-[#38bdf8] tabular-nums">
              {user.stats.winRate}%
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#161618] border border-[rgba(248,247,212,0.1)] space-y-0.5">
            <span className="text-[10px] text-[rgba(248,247,212,0.4)] uppercase">Mag'lubiyat</span>
            <div className="text-lg font-bold text-[#f43f5e] tabular-nums">
              {user.stats.losses}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#161618] border border-[rgba(248,247,212,0.1)] space-y-0.5">
            <span className="text-[10px] text-[rgba(248,247,212,0.4)] uppercase">Maks seriya</span>
            <div className="text-lg font-bold text-[#fbbf24] tabular-nums">
              {user.stats.maxStreak}x
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#161618] border border-[rgba(248,247,212,0.1)] space-y-0.5">
            <span className="text-[10px] text-[rgba(248,247,212,0.4)] uppercase">Jami yutilgan</span>
            <div className="text-lg font-bold text-[#fbbf24] tabular-nums">
              🪙 {user.stats.totalEarned.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACHIEVEMENTS */}
      {activeTab === 'achievements' && (
        <div className="space-y-2">
          {ACHIEVEMENTS.map((ach) => {
            const isClaimed = user.claimedAchievements.includes(ach.id);
            const canClaim = ach.completed && !isClaimed;

            return (
              <div
                key={ach.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#161618] border border-[rgba(248,247,212,0.1)] gap-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#0c0c0e] border border-[rgba(248,247,212,0.1)] flex items-center justify-center text-lg shrink-0">
                    {ach.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#f8f7f4]">{ach.title}</h4>
                    <p className="text-[10px] text-[rgba(248,247,212,0.5)]">{ach.description}</p>
                    <div className="text-[9px] text-[rgba(248,247,212,0.4)] font-mono mt-0.5">
                      Progress: {ach.progress}/{ach.maxProgress}
                    </div>
                  </div>
                </div>

                <div>
                  {isClaimed ? (
                    <span className="text-[10px] text-[rgba(248,247,212,0.4)] font-mono px-2 py-0.5 bg-[#0c0c0e] rounded">
                      Olingan ✓
                    </span>
                  ) : canClaim ? (
                    <button
                      onClick={() => handleClaimAchievement(ach)}
                      className="px-2.5 py-1 bg-[#10b981] hover:bg-[#059669] text-white rounded text-[11px] font-mono font-bold transition-all active:scale-95"
                    >
                      +{ach.rewardCoins} 🪙 Olish
                    </button>
                  ) : (
                    <span className="text-[10px] text-[rgba(248,247,212,0.4)] font-mono">
                      +{ach.rewardCoins} 🪙
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: MATCH HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-2">
          {matchHistory.length === 0 ? (
            <p className="text-center text-xs text-[rgba(248,247,212,0.4)] py-6 font-mono">
              Hozircha o'yinlar mavjud emas.
            </p>
          ) : (
            matchHistory.map((item) => {
              const isWin = item.result === 'win';
              const isDraw = item.result === 'draw';

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#161618] border border-[rgba(248,247,212,0.1)] text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{item.opponentAvatar || (item.mode === 'bot' ? '🤖' : '👤')}</span>
                    <div>
                      <div className="font-semibold text-[#f8f7f4] text-xs">{item.opponentName}</div>
                      <div className="text-[10px] font-mono text-[rgba(248,247,212,0.4)]">
                        {item.myChoice} vs {item.opponentChoice} · {item.date}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-mono font-bold text-xs ${
                      isWin ? 'text-[#10b981]' : isDraw ? 'text-[#fbbf24]' : 'text-[#f43f5e]'
                    }`}>
                      {isWin ? `+${item.stake * 2}` : isDraw ? `±0` : `-${item.stake}`} 🪙
                    </div>
                    <span className="text-[9px] text-[rgba(248,247,212,0.4)] uppercase font-mono">
                      {item.result}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
};
