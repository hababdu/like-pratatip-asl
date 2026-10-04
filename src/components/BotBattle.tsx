import React, { useState, useRef, useEffect } from 'react';
import { Choice, BotDifficulty, UserProfile, MatchHistoryItem } from '../types';
import RPSBot from '../utils/RPSBot';
import { sounds } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import confetti from 'canvas-confetti';
import botAvatarImg from '../assets/images/bot_avatar_cyborg_1791081046217.jpg';

interface BotBattleProps {
  user: UserProfile;
  onUpdateUser: (updater: (prev: UserProfile) => UserProfile) => void;
  onBackToMenu: () => void;
  onAddMatchHistory: (item: MatchHistoryItem) => void;
  onNotification: (msg: string, type?: 'info' | 'success' | 'error') => void;
}

const CHOICES: Record<Choice, { label: string; emoji: string; beats: Choice }> = {
  rock: { label: 'Tosh', emoji: '🪨', beats: 'scissors' },
  paper: { label: 'Qog\'oz', emoji: '📄', beats: 'rock' },
  scissors: { label: 'Qaychi', emoji: '✂️', beats: 'paper' }
};

const DIFFICULTIES: Record<BotDifficulty, { label: string; desc: string; winMultiplier: number }> = {
  easy: {
    label: 'Oson',
    desc: 'Boshlovchilar uchun. Bot tasodifiy tanlaydi.',
    winMultiplier: 1.5,
  },
  medium: {
    label: 'O\'rtacha',
    desc: 'O\'rtacha intellekt. Harakatlaringizni tahlil qiladi.',
    winMultiplier: 2.0,
  },
  hard: {
    label: 'Qiyin',
    desc: 'Kuchsiz tomonlaringizni topadi va tez-tez ishlatiladigan tanlovga qarshi harakat qiladi.',
    winMultiplier: 2.5,
  },
  master: {
    label: 'Usta AI',
    desc: 'Markov zanjiri va chuqur ehtimollik algoritmi. Yengish juda qiyin!',
    winMultiplier: 3.5,
  }
};

export const BotBattle: React.FC<BotBattleProps> = ({
  user,
  onUpdateUser,
  onAddMatchHistory,
  onNotification
}) => {
  const [difficulty, setDifficulty] = useState<BotDifficulty>('medium');
  const [stake, setStake] = useState<number>(10);
  const [gameState, setGameState] = useState<'ready' | 'thinking' | 'result'>('ready');
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [botChoice, setBotChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [roundsPlayed, setRoundsPlayed] = useState<number>(0);

  const botRef = useRef<RPSBot>(new RPSBot(difficulty));

  useEffect(() => {
    botRef.current = new RPSBot(difficulty);
  }, [difficulty]);

  const handleMakeChoice = (choice: Choice) => {
    if (gameState !== 'ready') return;

    if (user.coins < stake) {
      sounds.playDefeat();
      triggerHaptic('error');
      onNotification('Hisobingizda ushbu stavka uchun tanga yetarli emas!', 'error');
      return;
    }

    sounds.playSelect();
    triggerHaptic('medium');
    setPlayerChoice(choice);
    setGameState('thinking');

    const botDecision = botRef.current.choose(playerChoice);
    setBotChoice(botDecision);

    setTimeout(() => {
      sounds.playClash();
      triggerHaptic('heavy');

      let outcome: 'win' | 'lose' | 'draw';
      if (choice === botDecision) {
        outcome = 'draw';
      } else if (CHOICES[choice].beats === botDecision) {
        outcome = 'win';
      } else {
        outcome = 'lose';
      }

      botRef.current.remember(choice);
      setResult(outcome);
      setGameState('result');
      setRoundsPlayed((r) => r + 1);

      const multiplier = DIFFICULTIES[difficulty].winMultiplier;
      const winAmount = Math.round(stake * multiplier);

      if (outcome === 'win') {
        sounds.playVictory();
        triggerHaptic('success');
        confetti({ particleCount: 45, spread: 50, origin: { y: 0.6 } });
        setStreak((s) => s + 1);

        onUpdateUser((prev) => {
          const newCoins = prev.coins + winAmount - stake;
          const wins = prev.stats.wins + 1;
          const total = prev.stats.totalGames + 1;
          return {
            ...prev,
            coins: newCoins,
            rating: prev.rating + (difficulty === 'master' ? 25 : 10),
            stats: {
              ...prev.stats,
              totalGames: total,
              wins,
              winRate: Math.round((wins / total) * 100),
              currentStreak: prev.stats.currentStreak + 1,
              maxStreak: Math.max(prev.stats.currentStreak + 1, prev.stats.maxStreak),
              totalEarned: prev.stats.totalEarned + winAmount
            }
          };
        });

        onAddMatchHistory({
          id: `match-bot-${Date.now()}`,
          opponentName: `AI Bot (${DIFFICULTIES[difficulty].label})`,
          myChoice: choice,
          opponentChoice: botDecision,
          result: 'win',
          stake,
          date: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
          mode: 'bot'
        });
      } else if (outcome === 'lose') {
        sounds.playDefeat();
        triggerHaptic('error');
        setStreak(0);

        onUpdateUser((prev) => {
          const newCoins = Math.max(0, prev.coins - stake);
          const losses = prev.stats.losses + 1;
          const total = prev.stats.totalGames + 1;
          return {
            ...prev,
            coins: newCoins,
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
          id: `match-bot-${Date.now()}`,
          opponentName: `AI Bot (${DIFFICULTIES[difficulty].label})`,
          myChoice: choice,
          opponentChoice: botDecision,
          result: 'lose',
          stake,
          date: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
          mode: 'bot'
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
          id: `match-bot-${Date.now()}`,
          opponentName: `AI Bot (${DIFFICULTIES[difficulty].label})`,
          myChoice: choice,
          opponentChoice: botDecision,
          result: 'draw',
          stake,
          date: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
          mode: 'bot'
        });
      }
    }, 850);
  };

  const handleNextRound = () => {
    sounds.playClick();
    triggerHaptic('light');
    setPlayerChoice(null);
    setBotChoice(null);
    setResult(null);
    setGameState('ready');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Game Meta Stats Bar */}
      <div className="flex justify-between items-center font-mono text-[11px] uppercase tracking-wider text-[rgba(248,247,212,0.5)] px-1">
        <span>Raundlar: <b className="text-white">{roundsPlayed}</b></span>
        <span className="text-[#fbbf24]">⚡ Seriya: {streak}x</span>
      </div>

      {/* Main AI Card */}
      <div className="bg-[#161618] border border-[rgba(248,247,212,0.1)] rounded-[20px] p-5 relative overflow-hidden shadow-2xl">
        {/* Top glowing accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#6366f1] to-transparent" />

        {/* AI Header */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-14 h-14 rounded-xl border-2 border-[#6366f1] p-[2px] bg-[#0c0c0e] shrink-0">
            <img
              src={botAvatarImg}
              alt="Bot"
              className="w-full h-full object-cover rounded-lg"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-base font-extrabold text-[#f8f7f4]">CYBER BOT AI</h2>
              <div className="text-[10px] px-2 py-0.5 bg-[rgba(56,189,248,0.1)] text-[#38bdf8] rounded font-bold uppercase tracking-wider font-mono">
                {DIFFICULTIES[difficulty].label}
              </div>
            </div>
            <p className="text-[11px] text-[rgba(248,247,212,0.5)] mt-0.5 leading-snug">
              {DIFFICULTIES[difficulty].desc}
            </p>
          </div>
        </div>

        {/* Difficulty Selector */}
        <div className="grid grid-cols-4 gap-1 bg-[#0c0c0e] p-1 rounded-[10px] mb-4">
          {(['easy', 'medium', 'hard', 'master'] as BotDifficulty[]).map((d) => {
            const isActive = difficulty === d;
            return (
              <button
                key={d}
                disabled={gameState !== 'ready'}
                onClick={() => {
                  sounds.playClick();
                  setDifficulty(d);
                }}
                className={`py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                  isActive
                    ? 'bg-[#6366f1] text-white shadow'
                    : 'text-[rgba(248,247,212,0.4)] hover:text-white'
                }`}
              >
                {DIFFICULTIES[d].label}
              </button>
            );
          })}
        </div>

        {/* Stake Bar */}
        <div className="flex justify-between items-center bg-black/20 px-3 py-2 rounded-lg mb-5">
          <div className="flex items-center gap-1">
            {[5, 10, 25, 50].map((val) => {
              const isSelected = stake === val;
              return (
                <button
                  key={val}
                  disabled={gameState !== 'ready'}
                  onClick={() => {
                    sounds.playClick();
                    setStake(val);
                  }}
                  className={`px-2 py-1 rounded text-[11px] font-mono font-bold border transition-colors ${
                    isSelected
                      ? 'bg-[rgba(251,191,36,0.1)] border-[#fbbf24] text-[#fbbf24]'
                      : 'border-[rgba(248,247,212,0.1)] text-[rgba(248,247,212,0.5)] hover:text-[rgba(248,247,212,0.8)]'
                  }`}
                >
                  🪙 {val}
                </button>
              );
            })}
          </div>
          <div className="text-[#10b981] font-mono text-[11px] font-bold">
            Yutuq: x{DIFFICULTIES[difficulty].winMultiplier}
          </div>
        </div>

        {/* Battle Arena */}
        <div className="h-[180px] flex flex-col items-center justify-center gap-3">
          {gameState === 'ready' && (
            <>
              <div className="text-5xl animate-bounce">🤖</div>
              <div className="text-sm font-semibold text-[rgba(248,247,212,0.8)]">Bot sizni kutmoqda...</div>
              <div className="text-[11px] text-[rgba(248,247,212,0.4)]">Tosh, Qog'oz yoki Qaychi tanlang</div>
            </>
          )}

          {gameState === 'thinking' && (
            <div className="flex flex-col items-center gap-3 animate-pulse">
              <div className="flex items-center gap-6">
                <span className="text-5xl">{playerChoice && CHOICES[playerChoice].emoji}</span>
                <span className="font-display font-extrabold text-[#6366f1] text-xl">VS</span>
                <span className="text-5xl animate-spin">⚙️</span>
              </div>
              <div className="text-xs text-[#38bdf8] font-mono">
                AI tanlovni hisoblamoqda...
              </div>
            </div>
          )}

          {gameState === 'result' && (
            <div className="flex flex-col items-center gap-2.5 animate-in fade-in duration-200">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-5xl">{playerChoice && CHOICES[playerChoice].emoji}</div>
                  <span className="text-[10px] font-bold text-[#6366f1] uppercase font-mono">Siz</span>
                </div>
                <span className="font-display font-extrabold text-[rgba(248,247,212,0.3)] text-xl">VS</span>
                <div className="text-center">
                  <div className="text-5xl">{botChoice && CHOICES[botChoice].emoji}</div>
                  <span className="text-[10px] font-bold text-[#fbbf24] uppercase font-mono">Bot</span>
                </div>
              </div>

              <div>
                {result === 'win' && (
                  <div className="text-[#10b981] font-display text-lg font-bold">
                    🏆 G'ALABA! (+{Math.round(stake * DIFFICULTIES[difficulty].winMultiplier)} tanga)
                  </div>
                )}
                {result === 'lose' && (
                  <div className="text-[#f43f5e] font-display text-lg font-bold">
                    💥 MAG'LUBIYAT (-{stake} tanga)
                  </div>
                )}
                {result === 'draw' && (
                  <div className="text-[#fbbf24] font-display text-lg font-bold">
                    🤝 DURANG (Stavka saqlandi)
                  </div>
                )}
              </div>

              <button
                onClick={handleNextRound}
                className="mt-1 px-5 py-1.5 rounded-lg bg-[#6366f1] hover:bg-[#4f46e5] text-white text-xs font-bold shadow-lg transition-all active:scale-95"
              >
                Keyingi raund ➔
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {(['rock', 'paper', 'scissors'] as Choice[]).map((c) => {
            const item = CHOICES[c];
            const disabled = gameState !== 'ready';
            return (
              <button
                key={c}
                disabled={disabled}
                onClick={() => handleMakeChoice(c)}
                className={`bg-[#161618] border border-[rgba(248,247,212,0.1)] rounded-[16px] py-4 px-2 flex flex-col items-center gap-2 transition-all ${
                  disabled
                    ? 'opacity-40 cursor-not-allowed'
                    : 'cursor-pointer hover:border-[#6366f1] hover:bg-[#1a1a1e] active:scale-95 active:bg-[#6366f1] active:border-[#6366f1]'
                }`}
              >
                <span className="text-4xl">{item.emoji}</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#f8f7f4]">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Strategy Info Callout */}
      <div className="bg-[rgba(99,102,241,0.05)] border border-dashed border-[#6366f1] p-3.5 rounded-xl text-xs leading-relaxed text-[rgba(248,247,212,0.7)]">
        <strong className="block mb-1 text-[#6366f1] font-bold">AI Qanday ishlaydi?</strong>
        Ushbu bot sizning o'yin odatlaringizni tahlil qilib boradi. Yuqori darajadagi AI buni tezda payqaydi va sizga qarshi yutuvchi harakatni chiqaradi!
      </div>
    </div>
  );
};
