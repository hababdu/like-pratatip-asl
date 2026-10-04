import React, { useState, useEffect } from 'react';
import { GameScreen, UserProfile, MatchHistoryItem, Transaction } from './types';
import { TopNav } from './components/TopNav';
import { MainLobby } from './components/MainLobby';
import { DuelArena } from './components/DuelArena';
import { BotBattle } from './components/BotBattle';
import { LeaderboardView } from './components/LeaderboardView';
import { ProfileView } from './components/ProfileView';
import { ReferralsView } from './components/ReferralsView';
import { ShopView } from './components/ShopView';
import { WalletView } from './components/WalletView';
import { MobileBottomNav } from './components/MobileBottomNav';
import { NotificationToast } from './components/NotificationToast';
import { sounds } from './utils/audio';

const STORAGE_KEY = 'like_duel_user_profile_v3';
const HISTORY_KEY = 'like_duel_history_v3';
const TX_KEY = 'like_duel_transactions_v3';

const DEFAULT_USER: UserProfile = {
  id: 'user_1',
  tgId: 89124018,
  username: 'habib_apex',
  firstName: 'Habibullo',
  avatarUrl: '🦁',
  coins: 450,
  stars: 50,
  level: 3,
  xp: 420,
  rating: 1280,
  title: 'Duel Ustasi',
  stats: {
    totalGames: 18,
    wins: 12,
    losses: 4,
    draws: 2,
    winRate: 67,
    currentStreak: 2,
    maxStreak: 5,
    totalEarned: 840
  },
  boosters: {
    doubleCoins: 1,
    lossShield: 1,
    luckCharm: 2
  },
  claimedAchievements: ['first_win', 'streak_3']
};

const DEFAULT_HISTORY: MatchHistoryItem[] = [
  {
    id: 'm-1',
    opponentName: 'Sardor_Pro',
    opponentAvatar: '🦁',
    myChoice: 'rock',
    opponentChoice: 'scissors',
    result: 'win',
    stake: 25,
    date: 'Bugun, 15:30',
    mode: 'pvp'
  },
  {
    id: 'm-2',
    opponentName: 'AI Bot (Qiyin)',
    opponentAvatar: '🤖',
    myChoice: 'scissors',
    opponentChoice: 'rock',
    result: 'lose',
    stake: 20,
    date: 'Bugun, 14:15',
    mode: 'bot'
  },
  {
    id: 'm-3',
    opponentName: 'Azizbek_Apex',
    opponentAvatar: '⚡',
    myChoice: 'paper',
    opponentChoice: 'rock',
    result: 'win',
    stake: 50,
    date: 'Kecha, 21:05',
    mode: 'pvp'
  }
];

const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 't-1',
    type: 'signup_bonus',
    amount: 100,
    label: "Ro'yxatdan o'tish bonusi",
    timestamp: '01.10.2026 12:00',
    isCredit: true
  },
  {
    id: 't-2',
    type: 'referral_bonus',
    amount: 50,
    label: "Do'st taklif qilingani uchun",
    timestamp: '02.10.2026 16:30',
    isCredit: true
  },
  {
    id: 't-3',
    type: 'game_win',
    amount: 100,
    label: "Jonli duelda g'alaba",
    timestamp: 'Bugun, 15:30',
    isCredit: true
  }
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('bot');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [notification, setNotification] = useState<{ message: string; type?: 'info' | 'success' | 'error' } | null>(null);

  // User state
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_USER;
  });

  // History state
  const [matchHistory, setMatchHistory] = useState<MatchHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_HISTORY;
  });

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(TX_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_TRANSACTIONS;
  });

  // Save to storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(matchHistory));
    } catch {
      // ignore
    }
  }, [matchHistory]);

  useEffect(() => {
    try {
      localStorage.setItem(TX_KEY, JSON.stringify(transactions));
    } catch {
      // ignore
    }
  }, [transactions]);

  // Telegram WebApp initial expansion
  useEffect(() => {
    try {
      const tg = (window as unknown as { Telegram?: { WebApp?: {
        expand: () => void;
        ready: () => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
      } } }).Telegram?.WebApp;

      if (tg) {
        tg.ready();
        tg.expand();
        tg.setHeaderColor('#111113');
        tg.setBackgroundColor('#0c0c0e');
      }
    } catch {
      // ignore
    }
  }, []);

  const showNotification = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((cur) => (cur?.message === message ? null : cur));
    }, 3200);
  };

  const handleToggleSound = () => {
    sounds.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      sounds.playClick();
    }
  };

  const handleAddMatchHistory = (item: MatchHistoryItem) => {
    setMatchHistory((prev) => [item, ...prev]);

    if (item.result === 'win') {
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'game_win',
        amount: item.stake * 2,
        label: `Duel g'alabasi (${item.opponentName})`,
        timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        isCredit: true
      };
      setTransactions((t) => [newTx, ...t]);
    } else if (item.result === 'lose') {
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'game_lose',
        amount: item.stake,
        label: `Duel stavkasi (${item.opponentName})`,
        timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        isCredit: false
      };
      setTransactions((t) => [newTx, ...t]);
    }
  };

  const handleAddTransaction = (tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev]);
  };

  return (
    <div className="h-[100dvh] bg-[#0c0c0e] text-[#f8f7f4] flex flex-col justify-center sm:py-4 selection:bg-[#6366f1] selection:text-white overflow-hidden">
      {/* App Shell Container (Tactical Dark Spec) */}
      <div className="w-full max-w-[480px] mx-auto h-[100dvh] sm:h-[calc(100vh-2rem)] sm:rounded-[28px] sm:border sm:border-[rgba(248,247,212,0.1)] border-x border-[rgba(248,247,212,0.1)] bg-gradient-to-b from-[#111113] to-[#0c0c0e] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Top Header */}
        <TopNav
          currentScreen={currentScreen}
          onNavigate={setCurrentScreen}
          coins={user.coins}
          stars={user.stars}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
        />

        {/* Main Game Content (Zero scroll for duel screen) */}
        <main className={`flex-1 flex flex-col min-h-0 ${currentScreen === 'duel' ? 'overflow-hidden p-2 sm:p-2.5' : 'overflow-y-auto p-4 gap-4'}`}>
          {currentScreen === 'menu' && (
            <MainLobby
              user={user}
              onNavigate={setCurrentScreen}
              onUpdateUser={setUser}
              onNotification={showNotification}
            />
          )}

          {currentScreen === 'duel' && (
            <DuelArena
              user={user}
              onUpdateUser={setUser}
              onBackToMenu={() => setCurrentScreen('menu')}
              onAddMatchHistory={handleAddMatchHistory}
              onNotification={showNotification}
            />
          )}

          {currentScreen === 'bot' && (
            <BotBattle
              user={user}
              onUpdateUser={setUser}
              onBackToMenu={() => setCurrentScreen('menu')}
              onAddMatchHistory={handleAddMatchHistory}
              onNotification={showNotification}
            />
          )}

          {currentScreen === 'leaderboard' && (
            <LeaderboardView
              user={user}
              onBackToMenu={() => setCurrentScreen('menu')}
            />
          )}

          {currentScreen === 'profile' && (
            <ProfileView
              user={user}
              matchHistory={matchHistory}
              onUpdateUser={setUser}
              onBackToMenu={() => setCurrentScreen('menu')}
              onNotification={showNotification}
            />
          )}

          {currentScreen === 'referrals' && (
            <ReferralsView
              user={user}
              onUpdateUser={setUser}
              onBackToMenu={() => setCurrentScreen('menu')}
              onNotification={showNotification}
            />
          )}

          {currentScreen === 'shop' && (
            <ShopView
              user={user}
              onUpdateUser={setUser}
              onBackToMenu={() => setCurrentScreen('menu')}
              onNotification={showNotification}
            />
          )}

          {currentScreen === 'wallet' && (
            <WalletView
              user={user}
              transactions={transactions}
              onUpdateUser={setUser}
              onAddTransaction={handleAddTransaction}
              onBackToMenu={() => setCurrentScreen('menu')}
              onNotification={showNotification}
            />
          )}
        </main>

        {/* Bottom Tab Bar */}
        <MobileBottomNav
          currentScreen={currentScreen}
          onNavigate={setCurrentScreen}
        />
      </div>

      {/* Notification Toast Alert */}
      <NotificationToast
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
}
