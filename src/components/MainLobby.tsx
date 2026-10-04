import React, { useState } from 'react';
import { GameScreen, UserProfile, Choice } from '../types';
import { sounds } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import confetti from 'canvas-confetti';
import { Swords, Bot, Trophy, Users, ShoppingBag, Gift, Zap, Sparkles } from 'lucide-react';
import arenaBannerImg from '../assets/images/duel_arena_banner_1791081032963.jpg';

interface MainLobbyProps {
  user: UserProfile;
  onNavigate: (screen: GameScreen) => void;
  onUpdateUser: (updater: (prev: UserProfile) => UserProfile) => void;
  onNotification: (msg: string, type?: 'info' | 'success' | 'error') => void;
}

export const MainLobby: React.FC<MainLobbyProps> = ({
  user,
  onNavigate,
  onUpdateUser,
  onNotification
}) => {
  const [dailyClaimed, setDailyClaimed] = useState<boolean>(false);
  const [quickTestResult, setQuickTestResult] = useState<string | null>(null);

  const handleClaimDaily = () => {
    if (dailyClaimed) return;
    sounds.playVictory();
    triggerHaptic('success');
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });

    onUpdateUser((prev) => ({
      ...prev,
      coins: prev.coins + 50
    }));

    setDailyClaimed(true);
    onNotification('Kunlik bonus qabul qilindi: +50 tanga! 🎁', 'success');
  };

  const handleQuickPractice = (choice: Choice) => {
    sounds.playSelect();
    triggerHaptic('medium');
    const options: Choice[] = ['rock', 'paper', 'scissors'];
    const botPick = options[Math.floor(Math.random() * 3)];

    const emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };
    const beats = { rock: 'scissors', paper: 'rock', scissors: 'paper' };

    let res = '';
    if (choice === botPick) {
      res = `Durang! (${emojis[choice]} vs ${emojis[botPick]})`;
    } else if (beats[choice] === botPick) {
      res = `G'alaba! ${emojis[choice]} ${emojis[botPick]} ustidan ustun keldi`;
      sounds.playVictory();
      triggerHaptic('success');
    } else {
      res = `Mag'lubiyat! ${emojis[botPick]} sizning ${emojis[choice]}ingizni yengdi`;
      sounds.playDefeat();
      triggerHaptic('error');
    }
    setQuickTestResult(res);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Hero Banner with Game Visual */}
      <div className="relative rounded-[20px] overflow-hidden border border-[rgba(248,247,212,0.1)] bg-[#161618] shadow-2xl">
        <div className="relative h-44 sm:h-52 w-full">
          <img
            src={arenaBannerImg}
            alt="Like Duel Arena"
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-[#0c0c0e]/70 to-transparent" />
          
          <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2.5">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#38bdf8] bg-[rgba(56,189,248,0.1)] px-2 py-0.5 rounded font-mono">
                TACTICAL DARK ARENA
              </span>
              <h1 className="font-display text-xl sm:text-2xl font-black text-[#f8f7f4] tracking-tight">
                LIKE DUEL
              </h1>
              <p className="text-[11px] text-[rgba(248,247,212,0.6)] max-w-xs">
                Tosh-Qog'oz-Qaychi onlayn janglari va aqlli AI botlar ligasi.
              </p>
            </div>

            {/* Daily Bonus Button */}
            <button
              onClick={handleClaimDaily}
              disabled={dailyClaimed}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all shrink-0 ${
                dailyClaimed
                  ? 'bg-[#161618] text-[rgba(248,247,212,0.3)] cursor-not-allowed border border-[rgba(248,247,212,0.1)]'
                  : 'bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0c0c0e] active:scale-95'
              }`}
            >
              <Gift size={14} />
              <span>{dailyClaimed ? 'Bonus olindi' : 'Kunlik bonus (+50 🪙)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* User Mini Stat Strip */}
      <div className="grid grid-cols-2 gap-2 font-mono text-xs">
        <div className="p-3 rounded-xl bg-[#161618] border border-[rgba(248,247,212,0.1)] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[rgba(99,102,241,0.15)] border border-[#6366f1]/40 flex items-center justify-center text-base shrink-0">
            {user.avatarUrl}
          </div>
          <div className="truncate">
            <div className="text-[10px] text-[rgba(248,247,212,0.4)] uppercase">Daraja</div>
            <div className="font-bold text-[#f8f7f4] truncate">
              LVL {user.level} · {user.title}
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#161618] border border-[rgba(248,247,212,0.1)] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[rgba(251,191,36,0.15)] border border-[#fbbf24]/40 flex items-center justify-center text-base shrink-0">
            🏆
          </div>
          <div>
            <div className="text-[10px] text-[rgba(248,247,212,0.4)] uppercase">Reyting</div>
            <div className="font-bold text-[#fbbf24] tabular-nums">
              {user.rating.toLocaleString()} ball
            </div>
          </div>
        </div>
      </div>

      {/* Primary Game Mode Selection (Tactical Dark Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* AI Bot Battle Card (Primary) */}
        <button
          onClick={() => {
            sounds.playClick();
            triggerHaptic('medium');
            onNavigate('bot');
          }}
          className="group relative rounded-[18px] border border-[rgba(99,102,241,0.3)] bg-[#161618] p-4 text-left shadow-xl hover:border-[#6366f1] transition-all active:scale-98 overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#6366f1] to-transparent" />
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#0c0c0e] border border-[#6366f1] flex items-center justify-center text-xl text-[#6366f1]">
              <Bot size={20} />
            </div>
            <span className="text-[10px] font-mono text-[#38bdf8] bg-[rgba(56,189,248,0.1)] px-2 py-0.5 rounded font-bold uppercase">
              AI BATTLE
            </span>
          </div>

          <div className="mt-3 space-y-1">
            <h3 className="font-display text-base font-extrabold text-[#f8f7f4] group-hover:text-[#6366f1] transition-colors">
              CYBER BOT AI
            </h3>
            <p className="text-[11px] text-[rgba(248,247,212,0.5)] leading-snug">
              Oson, O'rtacha, Qiyin va Usta AI darajalari. O'yin odatlaringizni o'rganuvchi botga qarshi jang qiling.
            </p>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-[#6366f1] font-mono uppercase">
            <span>Boshlash</span>
            <span>➔</span>
          </div>
        </button>

        {/* PVP Duel Card */}
        <button
          onClick={() => {
            sounds.playClick();
            triggerHaptic('medium');
            onNavigate('duel');
          }}
          className="group relative rounded-[18px] border border-[rgba(248,247,212,0.1)] bg-[#161618] p-4 text-left shadow-xl hover:border-[#6366f1]/60 transition-all active:scale-98 overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#0c0c0e] border border-[rgba(248,247,212,0.15)] flex items-center justify-center text-xl text-[#fbbf24]">
              <Swords size={20} />
            </div>
            <span className="text-[10px] font-mono text-[#10b981] bg-[rgba(16,185,129,0.1)] px-2 py-0.5 rounded font-bold uppercase">
              ONLAYN PVP
            </span>
          </div>

          <div className="mt-3 space-y-1">
            <h3 className="font-display text-base font-extrabold text-[#f8f7f4] group-hover:text-[#6366f1] transition-colors">
              Jonli PvP Duel
            </h3>
            <p className="text-[11px] text-[rgba(248,247,212,0.5)] leading-snug">
              Jonli raqib bilan real vaqtda Tosh-Qog'oz-Qaychi jangi. Stavka tiklang va reytingda ko'tariling!
            </p>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-[rgba(248,247,212,0.7)] font-mono uppercase">
            <span>Arenaga kirish</span>
            <span>➔</span>
          </div>
        </button>
      </div>

      {/* Quick Practice Widget */}
      <div className="rounded-[18px] border border-[rgba(248,247,212,0.1)] bg-[#161618] p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#fbbf24]" />
            <h3 className="text-xs font-bold text-[#f8f7f4] uppercase tracking-wider font-mono">
              Tezkor Sinov (Bepul)
            </h3>
          </div>
          <span className="text-[10px] text-[rgba(248,247,212,0.4)] font-mono">Stavkasiz</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(['rock', 'paper', 'scissors'] as Choice[]).map((c) => {
            const labels = { rock: 'Tosh 🪨', paper: 'Qog\'oz 📄', scissors: 'Qaychi ✂️' };
            return (
              <button
                key={c}
                onClick={() => handleQuickPractice(c)}
                className="py-2 rounded-xl bg-[#0c0c0e] hover:bg-[#1a1a1e] text-xs font-bold text-[#f8f7f4] border border-[rgba(248,247,212,0.1)] transition-all active:scale-95"
              >
                {labels[c]}
              </button>
            );
          })}
        </div>

        {quickTestResult && (
          <div className="p-2 rounded-lg bg-[#0c0c0e] text-center text-xs font-mono text-[#38bdf8] animate-in fade-in">
            {quickTestResult}
          </div>
        )}
      </div>

      {/* Secondary Feature Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => { sounds.playClick(); onNavigate('leaderboard'); }}
          className="p-3 rounded-xl border border-[rgba(248,247,212,0.1)] bg-[#161618] hover:border-[#6366f1]/50 text-left transition-all active:scale-95 space-y-1"
        >
          <Trophy size={18} className="text-[#fbbf24]" />
          <div>
            <h4 className="text-xs font-bold text-[#f8f7f4]">Reyting Jadvali</h4>
            <p className="text-[10px] text-[rgba(248,247,212,0.4)] font-mono">Top o'yinchilar</p>
          </div>
        </button>

        <button
          onClick={() => { sounds.playClick(); onNavigate('shop'); }}
          className="p-3 rounded-xl border border-[rgba(248,247,212,0.1)] bg-[#161618] hover:border-[#6366f1]/50 text-left transition-all active:scale-95 space-y-1"
        >
          <ShoppingBag size={18} className="text-[#38bdf8]" />
          <div>
            <h4 className="text-xs font-bold text-[#f8f7f4]">Do'kon & Stars</h4>
            <p className="text-[10px] text-[rgba(248,247,212,0.4)] font-mono">Kuchaytirgichlar</p>
          </div>
        </button>

        <button
          onClick={() => { sounds.playClick(); onNavigate('referrals'); }}
          className="p-3 rounded-xl border border-[rgba(248,247,212,0.1)] bg-[#161618] hover:border-[#6366f1]/50 text-left transition-all active:scale-95 space-y-1"
        >
          <Users size={18} className="text-[#10b981]" />
          <div>
            <h4 className="text-xs font-bold text-[#f8f7f4]">Do'stlar (+50 🪙)</h4>
            <p className="text-[10px] text-[rgba(248,247,212,0.4)] font-mono">Referal bonus</p>
          </div>
        </button>

        <button
          onClick={() => { sounds.playClick(); onNavigate('wallet'); }}
          className="p-3 rounded-xl border border-[rgba(248,247,212,0.1)] bg-[#161618] hover:border-[#6366f1]/50 text-left transition-all active:scale-95 space-y-1"
        >
          <Zap size={18} className="text-[#6366f1]" />
          <div>
            <h4 className="text-xs font-bold text-[#f8f7f4]">Hamyon Balansi</h4>
            <p className="text-[10px] text-[rgba(248,247,212,0.4)] font-mono">Tranzaksiyalar</p>
          </div>
        </button>
      </div>

    </div>
  );
};
