import React, { useState, useEffect, useRef } from 'react';
import { Choice, UserProfile, MatchHistoryItem, ChatMessage } from '../types';
import { sounds } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import confetti from 'canvas-confetti';
import { MessageSquare, ArrowLeft, Send, Sparkles } from 'lucide-react';

interface DuelArenaProps {
  user: UserProfile;
  onUpdateUser: (updater: (prev: UserProfile) => UserProfile) => void;
  onBackToMenu: () => void;
  onAddMatchHistory: (item: MatchHistoryItem) => void;
  onNotification: (msg: string, type?: 'info' | 'success' | 'error') => void;
}

const CHOICES: Record<Choice, { label: string; emoji: string; beats: Choice; losesTo: Choice }> = {
  rock: {
    label: 'Tosh',
    emoji: '🪨',
    beats: 'scissors',
    losesTo: 'paper'
  },
  paper: {
    label: 'Qog\'oz',
    emoji: '📄',
    beats: 'rock',
    losesTo: 'scissors'
  },
  scissors: {
    label: 'Qaychi',
    emoji: '✂️',
    beats: 'paper',
    losesTo: 'rock'
  }
};

const QUICK_TAUNTS = [
  'Yaxshi o\'yin! 🤝',
  'Qoyil! 🔥',
  'Yana bir bor?',
  'Omad! ✨',
  'Tezroq tanla! ⏱️',
  'Hech narsa emas! 😎'
];

const BOT_OPPONENTS = [
  { name: 'Sardor_Pro', rating: 1340, winRate: 67, avatar: '🦁' },
  { name: 'Jasur_Warrior', rating: 1220, winRate: 59, avatar: '🦅' },
  { name: 'Diyor_Master', rating: 1480, winRate: 72, avatar: '⚡' },
  { name: 'Bek_Duelist', rating: 1180, winRate: 54, avatar: '🐺' },
  { name: 'Shaxriyor_07', rating: 1290, winRate: 63, avatar: '👑' },
];

export const DuelArena: React.FC<DuelArenaProps> = ({
  user,
  onUpdateUser,
  onBackToMenu,
  onAddMatchHistory,
  onNotification
}) => {
  // Game states: 'lobby' | 'searching' | 'playing' | 'clashing' | 'round_result' | 'ended'
  const [gameState, setGameState] = useState<'lobby' | 'searching' | 'playing' | 'clashing' | 'round_result' | 'ended'>('lobby');
  const [stake, setStake] = useState<number>(25);
  const [opponent, setOpponent] = useState<{ name: string; rating: number; winRate: number; avatar: string } | null>(null);
  const [myChoice, setMyChoice] = useState<Choice | null>(null);
  const [opponentChoice, setOpponentChoice] = useState<Choice | null>(null);
  const [opponentMadeChoice, setOpponentMadeChoice] = useState<boolean>(false);
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [myScore, setMyScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);
  const [roundWinner, setRoundWinner] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [timer, setTimer] = useState<number>(20);
  const [searchTime, setSearchTime] = useState<number>(0);

  // Chat
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatText, setChatText] = useState<string>('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Stakes options
  const stakeOptions = [10, 25, 50, 100, 250, 500];

  // Search Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'searching') {
      interval = setInterval(() => {
        setSearchTime((t) => t + 1);
      }, 1000);

      const matchTimeout = setTimeout(() => {
        const randomOpp = BOT_OPPONENTS[Math.floor(Math.random() * BOT_OPPONENTS.length)];
        setOpponent(randomOpp);
        setGameState('playing');
        setTimer(20);
        setMyChoice(null);
        setOpponentChoice(null);
        setOpponentMadeChoice(false);
        setRoundWinner(null);
        sounds.playVictory();
        triggerHaptic('success');
        onNotification(`Raqib topildi: ${randomOpp.name}!`, 'info');
      }, 2200);

      return () => {
        clearInterval(interval);
        clearTimeout(matchTimeout);
      };
    }
  }, [gameState, onNotification]);

  // Round countdown timer
  useEffect(() => {
    let timerInterval: NodeJS.Timeout;
    if (gameState === 'playing') {
      timerInterval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            handleTimeout();
            return 0;
          }
          if (prev <= 5) {
            sounds.playTick();
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [gameState, myChoice]);

  // Opponent choice simulation
  useEffect(() => {
    if (gameState === 'playing' && !opponentMadeChoice) {
      const delay = 1200 + Math.random() * 2000;
      const t = setTimeout(() => {
        setOpponentMadeChoice(true);
        triggerHaptic('light');
      }, delay);
      return () => clearTimeout(t);
    }
  }, [gameState, opponentMadeChoice]);

  // Handle timeout
  const handleTimeout = () => {
    if (!myChoice) {
      const choices: Choice[] = ['rock', 'paper', 'scissors'];
      const autoChoice = choices[Math.floor(Math.random() * 3)];
      selectChoice(autoChoice);
    }
  };

  // Chat scroll
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatOpen]);

  // Start Search
  const handleStartSearch = () => {
    if (user.coins < stake) {
      sounds.playDefeat();
      triggerHaptic('error');
      onNotification('Hisobingizda yetarli tanga mavjud emas!', 'error');
      return;
    }
    sounds.playClick();
    triggerHaptic('medium');
    setGameState('searching');
    setSearchTime(0);
    setMyScore(0);
    setOpponentScore(0);
    setRoundNumber(1);
    setMessages([
      {
        id: 'sys-1',
        sender: 'system',
        senderName: 'Tizim',
        text: `Duel boshlandi! Stavka: ${stake} tanga.`,
        timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Cancel Search
  const handleCancelSearch = () => {
    sounds.playClick();
    setGameState('lobby');
    setSearchTime(0);
  };

  // Select Choice
  const selectChoice = (choice: Choice) => {
    if (myChoice || gameState !== 'playing') return;
    sounds.playSelect();
    triggerHaptic('medium');
    setMyChoice(choice);

    const choices: Choice[] = ['rock', 'paper', 'scissors'];
    const oppChoice = choices[Math.floor(Math.random() * 3)];
    setOpponentChoice(oppChoice);
    setOpponentMadeChoice(true);

    setTimeout(() => {
      resolveRound(choice, oppChoice);
    }, 600);
  };

  // Resolve Round
  const resolveRound = (playerPick: Choice, oppPick: Choice) => {
    setGameState('clashing');
    sounds.playClash();
    triggerHaptic('heavy');

    setTimeout(() => {
      let outcome: 'win' | 'lose' | 'draw';
      if (playerPick === oppPick) {
        outcome = 'draw';
      } else if (CHOICES[playerPick].beats === oppPick) {
        outcome = 'win';
      } else {
        outcome = 'lose';
      }

      setRoundWinner(outcome);
      setGameState('round_result');

      if (outcome === 'win') {
        sounds.playVictory();
        triggerHaptic('success');
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        setMyScore((s) => s + 1);

        onUpdateUser((prev) => {
          const newCoins = prev.coins + stake;
          const newRating = prev.rating + 15;
          const wins = prev.stats.wins + 1;
          const total = prev.stats.totalGames + 1;
          const streak = prev.stats.currentStreak + 1;
          return {
            ...prev,
            coins: newCoins,
            rating: newRating,
            stats: {
              ...prev.stats,
              totalGames: total,
              wins,
              winRate: Math.round((wins / total) * 100),
              currentStreak: streak,
              maxStreak: Math.max(streak, prev.stats.maxStreak),
              totalEarned: prev.stats.totalEarned + stake
            }
          };
        });

        onAddMatchHistory({
          id: `match-${Date.now()}`,
          opponentName: opponent?.name || 'Raqib',
          opponentAvatar: opponent?.avatar,
          myChoice: playerPick,
          opponentChoice: oppPick,
          result: 'win',
          stake,
          date: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
          mode: 'pvp'
        });
      } else if (outcome === 'lose') {
        sounds.playDefeat();
        triggerHaptic('error');
        setOpponentScore((s) => s + 1);

        onUpdateUser((prev) => {
          const newCoins = Math.max(0, prev.coins - stake);
          const newRating = Math.max(800, prev.rating - 12);
          const losses = prev.stats.losses + 1;
          const total = prev.stats.totalGames + 1;
          return {
            ...prev,
            coins: newCoins,
            rating: newRating,
            stats: {
              ...prev.stats,
              totalGames: total,
              losses,
              winRate: Math.round((prev.stats.wins / total) * 100),
              currentStreak: 0
            }
          };
        });

        onAddMatchHistory({
          id: `match-${Date.now()}`,
          opponentName: opponent?.name || 'Raqib',
          opponentAvatar: opponent?.avatar,
          myChoice: playerPick,
          opponentChoice: oppPick,
          result: 'lose',
          stake,
          date: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
          mode: 'pvp'
        });
      } else {
        sounds.playClick();
        onUpdateUser((prev) => ({
          ...prev,
          stats: {
            ...prev.stats,
            totalGames: prev.stats.totalGames + 1,
            draws: prev.stats.draws + 1
          }
        }));

        onAddMatchHistory({
          id: `match-${Date.now()}`,
          opponentName: opponent?.name || 'Raqib',
          opponentAvatar: opponent?.avatar,
          myChoice: playerPick,
          opponentChoice: oppPick,
          result: 'draw',
          stake,
          date: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
          mode: 'pvp'
        });
      }
    }, 1000);
  };

  // Next round
  const handleNextRound = () => {
    if (user.coins < stake) {
      onNotification('Hisobingizda keyingi raund uchun tanga yetarli emas!', 'error');
      setGameState('ended');
      return;
    }
    sounds.playClick();
    triggerHaptic('light');
    setRoundNumber((r) => r + 1);
    setGameState('playing');
    setTimer(20);
    setMyChoice(null);
    setOpponentChoice(null);
    setOpponentMadeChoice(false);
    setRoundWinner(null);
  };

  // Leave room
  const handleLeaveDuel = () => {
    sounds.playClick();
    setGameState('lobby');
    setOpponent(null);
    setMyChoice(null);
    setOpponentChoice(null);
    setChatOpen(false);
  };

  // Send Chat message
  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || chatText;
    if (!text.trim()) return;

    sounds.playClick();
    const newMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      sender: 'me',
      senderName: user.firstName,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, newMsg]);
    setChatText('');

    setTimeout(() => {
      const oppReplies = [
        'Qani ko\'ramiz! 😏',
        'Yaxshi o\'ynayapsan!',
        'Bu safar albatta yutaman! 🔥',
        'Toshmi yoki qog\'oz? 🤔',
        'Omad! ✨'
      ];
      const replyText = oppReplies[Math.floor(Math.random() * oppReplies.length)];
      setMessages((prev) => [
        ...prev,
        {
          id: `chat-opp-${Date.now()}`,
          sender: 'opponent',
          senderName: opponent?.name || 'Raqib',
          text: replyText,
          timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1200);
  };

  // ==========================================
  // RENDER: LOBBY (100% NO SCROLL)
  // ==========================================
  if (gameState === 'lobby') {
    return (
      <div className="h-full flex flex-col justify-between overflow-hidden">
        {/* Top Mini Header */}
        <div className="flex items-center justify-between py-1">
          <button
            onClick={onBackToMenu}
            className="flex items-center gap-1.5 text-xs text-[rgba(248,247,212,0.5)] hover:text-white transition-colors"
          >
            <ArrowLeft size={15} />
            <span>Chiqish</span>
          </button>
          <div className="text-[11px] font-mono text-[rgba(248,247,212,0.5)]">
            Onlayn: <strong className="text-[#10b981]">1,428</strong>
          </div>
        </div>

        {/* Main Tactical Card */}
        <div className="flex-1 flex flex-col justify-between my-2 p-4 sm:p-5 rounded-[20px] border border-[rgba(248,247,212,0.1)] bg-[#161618] shadow-2xl relative overflow-hidden min-h-0">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#6366f1] to-transparent" />

          {/* Heading */}
          <div className="text-center space-y-1">
            <span className="text-3xl">⚔️</span>
            <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight text-[#f8f7f4]">
              Jonli PvP Duel
            </h1>
            <p className="text-[11px] text-[rgba(248,247,212,0.6)]">
              Real vaqtda jonli raqib bilan Tosh-Qog'oz-Qaychi jangi
            </p>
          </div>

          {/* Stakes selection */}
          <div className="space-y-2 my-auto">
            <label className="text-[10px] font-mono uppercase tracking-wider text-[rgba(248,247,212,0.5)] block text-center">
              Stavka miqdori (Tanga)
            </label>
            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
              {stakeOptions.map((amount) => {
                const isSelected = stake === amount;
                return (
                  <button
                    key={amount}
                    onClick={() => {
                      sounds.playClick();
                      triggerHaptic('selection');
                      setStake(amount);
                    }}
                    className={`h-9 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-[rgba(251,191,36,0.15)] border border-[#fbbf24] text-[#fbbf24] shadow'
                        : 'bg-[#0c0c0e] hover:bg-[#1a1a1e] text-[rgba(248,247,212,0.6)] border border-[rgba(248,247,212,0.1)]'
                    }`}
                  >
                    <span>🪙</span>
                    <span>{amount}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-center text-[10px] font-mono text-[rgba(248,247,212,0.5)] pt-0.5">
              Yutuq: <span className="text-[#10b981] font-bold">+{stake * 2} tanga</span>
            </p>
          </div>

          {/* Action button */}
          <button
            onClick={handleStartSearch}
            className="w-full h-11 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold text-xs uppercase tracking-wider shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles size={15} />
            <span>Raqib qidirish</span>
          </button>
        </div>

        {/* Compact Rules Strip */}
        <div className="py-1 px-2 text-center text-[10px] font-mono text-[rgba(248,247,212,0.4)] truncate">
          🪨 Tosh &gt; ✂️ Qaychi &nbsp;·&nbsp; ✂️ Qaychi &gt; 📄 Qog'oz &nbsp;·&nbsp; 📄 Qog'oz &gt; 🪨 Tosh
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: SEARCHING (100% NO SCROLL)
  // ==========================================
  if (gameState === 'searching') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-5 overflow-hidden">
        {/* Animated Radar Pulse */}
        <div className="relative flex items-center justify-center w-28 h-28">
          <div className="absolute inset-0 rounded-full bg-[#6366f1]/20 animate-ping" />
          <div className="absolute inset-3 rounded-full bg-[#6366f1]/30 animate-pulse" />
          <div className="relative w-16 h-16 rounded-full bg-[#161618] border border-[#6366f1] flex items-center justify-center text-2xl shadow-xl shadow-[#6366f1]/30">
            ⚔️
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="font-display text-lg font-bold text-[#f8f7f4]">
            Raqib qidirilmoqda...
          </h2>
          <p className="text-xs text-[rgba(248,247,212,0.5)]">
            Darajangizga mos o'yinchi tanlanmoqda
          </p>
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#38bdf8] pt-1">
            <span>Kutish:</span>
            <span className="font-bold">{searchTime}s</span>
            <span>·</span>
            <span>Stavka: {stake} 🪙</span>
          </div>
        </div>

        <button
          onClick={handleCancelSearch}
          className="px-5 py-2 rounded-xl border border-[rgba(248,247,212,0.1)] bg-[#161618] hover:bg-[#1a1a1e] text-[rgba(248,247,212,0.7)] text-xs font-mono font-semibold transition-colors"
        >
          Bekor qilish
        </button>
      </div>
    );
  }

  // ==========================================
  // RENDER: PLAYING / CLASHING / RESULT (100% NO SCROLL)
  // ==========================================
  return (
    <div className="h-full flex flex-col justify-between overflow-hidden relative select-none gap-2">
      {/* Top Match Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#161618] border border-[rgba(248,247,212,0.1)] shrink-0">
        <button
          onClick={handleLeaveDuel}
          className="text-xs text-[rgba(248,247,212,0.5)] hover:text-[#f43f5e] transition-colors flex items-center gap-1 font-mono"
        >
          <ArrowLeft size={13} />
          <span>Chiqish</span>
        </button>

        {/* Score & Round */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[rgba(248,247,212,0.5)] text-[11px]">
            Raund <strong className="text-white font-mono">{roundNumber}</strong>
          </span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#0c0c0e] font-bold text-xs border border-[rgba(248,247,212,0.1)]">
            <span className="text-[#6366f1]">{myScore}</span>
            <span className="text-[rgba(248,247,212,0.3)]">:</span>
            <span className="text-[#fbbf24]">{opponentScore}</span>
          </div>
          <span className="text-[#fbbf24] font-semibold text-[11px]">
            🪙 {stake}
          </span>
        </div>

        {/* Chat trigger */}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
            chatOpen
              ? 'bg-[#6366f1] border-[#6366f1] text-white'
              : 'bg-[#0c0c0e] border-[rgba(248,247,212,0.1)] text-[rgba(248,247,212,0.6)] hover:text-white'
          }`}
          title="O'yin chati"
        >
          <MessageSquare size={13} />
          {messages.length > 0 && <span className="font-mono text-[9px]">{messages.length}</span>}
        </button>
      </div>

      {/* Main Duel Stage (Fills available space) */}
      <div className="flex-1 flex flex-col justify-between p-3 sm:p-4 rounded-[20px] border border-[rgba(248,247,212,0.1)] bg-[#161618] shadow-2xl relative overflow-hidden min-h-0">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#6366f1] to-transparent" />
        
        {/* Opponent Card (Top) */}
        <div className="flex items-center justify-between pb-2.5 border-b border-[rgba(248,247,212,0.08)] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0c0c0e] border border-[rgba(248,247,212,0.15)] flex items-center justify-center text-base shadow">
              {opponent?.avatar || '👤'}
            </div>
            <div>
              <div className="text-xs font-bold text-[#f8f7f4] leading-tight">
                {opponent?.name || 'Raqib'}
              </div>
              <div className="text-[10px] text-[rgba(248,247,212,0.5)] font-mono flex items-center gap-1.5">
                <span>Reyting: <strong className="text-[#6366f1]">{opponent?.rating}</strong></span>
                <span>·</span>
                <span>G'alaba: <strong className="text-[#10b981]">{opponent?.winRate}%</strong></span>
              </div>
            </div>
          </div>

          <div className="text-right">
            {gameState === 'playing' && (
              <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider ${
                opponentMadeChoice
                  ? 'bg-[rgba(16,185,129,0.1)] text-[#10b981]'
                  : 'bg-[rgba(251,191,36,0.1)] text-[#fbbf24] animate-pulse'
              }`}>
                {opponentMadeChoice ? 'Tanladi ✓' : 'O\'ylamoqda...'}
              </span>
            )}
          </div>
        </div>

        {/* Center Arena: Clash / Countdown / Showdown */}
        <div className="flex-1 flex flex-col items-center justify-center relative min-h-0 py-1">
          {/* Round Timer in Playing State */}
          {gameState === 'playing' && (
            <div className="text-center space-y-1.5">
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center font-mono text-lg font-bold mx-auto transition-all ${
                timer <= 5
                  ? 'border-[#f43f5e] text-[#f43f5e] bg-[#f43f5e]/10 animate-ping'
                  : 'border-[#6366f1] text-[#38bdf8] bg-[#0c0c0e] shadow-lg'
              }`}>
                {timer}
              </div>
              <p className="text-[11px] text-[rgba(248,247,212,0.5)] font-mono">
                {myChoice ? 'Raqib kutilyapti...' : 'O\'z tanlovingizni qiling!'}
              </p>
            </div>
          )}

          {/* Clashing Animation */}
          {gameState === 'clashing' && (
            <div className="flex items-center justify-center gap-5 animate-pulse">
              <div className="text-5xl animate-bounce">
                {myChoice ? CHOICES[myChoice].emoji : '❓'}
              </div>
              <span className="font-display font-black text-lg text-[#fbbf24]">VS</span>
              <div className="text-5xl animate-bounce">
                {opponentChoice ? CHOICES[opponentChoice].emoji : '❓'}
              </div>
            </div>
          )}

          {/* Round Result Reveal */}
          {gameState === 'round_result' && (
            <div className="text-center space-y-2 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-center gap-5">
                <div className="text-center">
                  <div className="text-4xl mb-0.5">
                    {myChoice ? CHOICES[myChoice].emoji : '❓'}
                  </div>
                  <span className="text-[9px] font-bold text-[#6366f1] uppercase font-mono">
                    Siz: {myChoice && CHOICES[myChoice].label}
                  </span>
                </div>

                <span className="font-display font-black text-lg text-[rgba(248,247,212,0.3)]">VS</span>

                <div className="text-center">
                  <div className="text-4xl mb-0.5">
                    {opponentChoice ? CHOICES[opponentChoice].emoji : '❓'}
                  </div>
                  <span className="text-[9px] font-bold text-[#fbbf24] uppercase font-mono">
                    Raqib: {opponentChoice && CHOICES[opponentChoice].label}
                  </span>
                </div>
              </div>

              {/* Banner */}
              <div>
                {roundWinner === 'win' && (
                  <div className="text-[#10b981] font-display text-base sm:text-lg font-black">
                    🎉 G'ALABA! (+{stake * 2} tanga)
                  </div>
                )}
                {roundWinner === 'lose' && (
                  <div className="text-[#f43f5e] font-display text-base sm:text-lg font-black">
                    💥 MAG'LUBIYAT (-{stake} tanga)
                  </div>
                )}
                {roundWinner === 'draw' && (
                  <div className="text-[#fbbf24] font-display text-base sm:text-lg font-black">
                    🤝 DURANG (Stavka qaytarildi)
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-center gap-2 pt-0.5">
                <button
                  onClick={handleNextRound}
                  className="px-4 py-1.5 rounded-lg bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all active:scale-95"
                >
                  Keyingi raund ➔
                </button>
                <button
                  onClick={handleLeaveDuel}
                  className="px-3 py-1.5 rounded-lg bg-[#0c0c0e] hover:bg-[#1a1a1e] text-[rgba(248,247,212,0.6)] font-semibold text-xs border border-[rgba(248,247,212,0.1)] transition-all"
                >
                  Tugatish
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Player Controls (Bottom) */}
        <div className="pt-2 border-t border-[rgba(248,247,212,0.08)] shrink-0">
          <div className="flex items-center justify-between mb-2 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-[#6366f1] flex items-center justify-center text-[10px] font-bold text-white">
                {user.firstName[0]}
              </div>
              <span className="font-semibold text-[#f8f7f4] text-xs">{user.firstName} (Siz)</span>
            </div>
            <span className="text-[10px] font-mono text-[rgba(248,247,212,0.5)]">
              Balans: <strong className="text-[#fbbf24]">{user.coins} 🪙</strong>
            </span>
          </div>

          {/* Hand Choices 3 Buttons (Tactical btn-action, fixed height) */}
          <div className="grid grid-cols-3 gap-2">
            {(['rock', 'paper', 'scissors'] as Choice[]).map((choiceKey) => {
              const item = CHOICES[choiceKey];
              const isSelected = myChoice === choiceKey;
              const disabled = gameState !== 'playing' || myChoice !== null;

              return (
                <button
                  key={choiceKey}
                  disabled={disabled}
                  onClick={() => selectChoice(choiceKey)}
                  className={`h-16 sm:h-20 bg-[#0c0c0e] border border-[rgba(248,247,212,0.1)] rounded-[14px] p-2 flex flex-col items-center justify-center gap-1 transition-all ${
                    isSelected
                      ? 'border-[#6366f1] bg-[#6366f1]/20 scale-102 shadow-lg shadow-[#6366f1]/30'
                      : disabled
                      ? 'opacity-40 cursor-not-allowed'
                      : 'cursor-pointer hover:border-[#6366f1] hover:bg-[#1a1a1e] active:scale-95 active:bg-[#6366f1]'
                  }`}
                >
                  <span className="text-2xl sm:text-3xl">{item.emoji}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#f8f7f4] font-mono">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* In-Game Chat Box as an Absolute Slide-up Overlay (Does NOT cause page scroll) */}
        {chatOpen && (
          <div className="absolute inset-x-0 bottom-0 top-12 z-30 bg-[#161618]/95 backdrop-blur-md p-3 flex flex-col justify-between border-t border-[rgba(248,247,212,0.15)] animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between text-[11px] font-mono text-[rgba(248,247,212,0.5)] border-b border-[rgba(248,247,212,0.1)] pb-2 shrink-0">
              <span className="uppercase font-bold text-[#6366f1]">Jonli Duel Chati</span>
              <button onClick={() => setChatOpen(false)} className="hover:text-white text-xs px-1">✕ Yopish</button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 my-2 pr-1 text-xs min-h-0">
              {messages.length === 0 ? (
                <p className="text-center text-[rgba(248,247,212,0.4)] py-6 font-mono text-[11px]">Xabarlar yo'q.</p>
              ) : (
                messages.map((m) => {
                  if (m.sender === 'system') {
                    return (
                      <div key={m.id} className="text-center text-[9px] text-[rgba(248,247,212,0.4)] font-mono py-0.5">
                        {m.text}
                      </div>
                    );
                  }
                  const isMe = m.sender === 'me';
                  return (
                    <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-1.5 text-[9px] font-mono text-[rgba(248,247,212,0.4)] mb-0.5">
                        <span>{m.senderName}</span>
                        <span>·</span>
                        <span>{m.timestamp}</span>
                      </div>
                      <div
                        className={`px-2.5 py-1 rounded-xl max-w-[85%] text-xs ${
                          isMe
                            ? 'bg-[#6366f1] text-white rounded-tr-none'
                            : 'bg-[#0c0c0e] border border-[rgba(248,247,212,0.1)] text-[#f8f7f4] rounded-tl-none'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            <div className="flex gap-2 pt-1 shrink-0">
              <input
                type="text"
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Raqibga xabar..."
                className="flex-1 bg-[#0c0c0e] border border-[rgba(248,247,212,0.1)] rounded-lg px-2.5 py-1.5 text-xs text-[#f8f7f4] placeholder-[rgba(248,247,212,0.3)] focus:outline-none focus:border-[#6366f1]"
              />
              <button
                onClick={() => handleSendMessage()}
                className="px-3 py-1.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg text-xs font-semibold flex items-center justify-center transition-colors"
              >
                <Send size={12} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Taunts Bar (Single compact row) */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none font-mono shrink-0">
        <span className="text-[9px] text-[rgba(248,247,212,0.4)] uppercase shrink-0">Ibora:</span>
        {QUICK_TAUNTS.map((taunt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(taunt)}
            className="text-[10px] px-2 py-0.5 rounded-md bg-[#161618] hover:bg-[#1a1a1e] border border-[rgba(248,247,212,0.1)] text-[rgba(248,247,212,0.7)] hover:text-white whitespace-nowrap transition-colors"
          >
            {taunt}
          </button>
        ))}
      </div>
    </div>
  );
};
