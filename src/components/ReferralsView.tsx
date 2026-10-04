import React, { useState } from 'react';
import { UserProfile } from '../types';
import { sounds } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import confetti from 'canvas-confetti';
import { ArrowLeft, Copy, Share2, Check, Gift } from 'lucide-react';

interface ReferralsViewProps {
  user: UserProfile;
  onUpdateUser: (updater: (prev: UserProfile) => UserProfile) => void;
  onBackToMenu: () => void;
  onNotification: (msg: string, type?: 'info' | 'success' | 'error') => void;
}

export const ReferralsView: React.FC<ReferralsViewProps> = ({
  user,
  onUpdateUser,
  onBackToMenu,
  onNotification
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [unclaimedCount, setUnclaimedCount] = useState<number>(2);
  const bonusPerFriend = 50;

  const botUsername = 'like_duel_bot';
  const referralLink = `https://t.me/${botUsername}?start=ref_${user.tgId}`;

  const sampleFriends = [
    { id: '1', name: 'Alisher Karimov', username: 'alisher_k', date: 'Bugun, 14:20', reward: 50 },
    { id: '2', name: 'Nodirbek Saidov', username: 'nodir_99', date: 'Kecha, 19:45', reward: 50 },
    { id: '3', name: 'Shahnoza Karimova', username: 'shaxnoza_t', date: '3 kun avval', reward: 50 },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    sounds.playClick();
    triggerHaptic('light');
    setCopied(true);
    onNotification('Havola nusxalandi!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareTelegram = () => {
    sounds.playClick();
    triggerHaptic('medium');
    const shareText = encodeURIComponent(
      `🎮 Like Duel - Tosh-Qog'oz-Qaychi o'yinida men bilan duelga chiq! Ro'yxatdan o'tganing uchun +100 tanga bonus olasan:`
    );
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${shareText}`;
    
    const tg = typeof window !== 'undefined' ? (window as unknown as { Telegram?: { WebApp?: { openTelegramLink: (url: string) => void } } }).Telegram?.WebApp : null;
    if (tg?.openTelegramLink) {
      tg.openTelegramLink(tgUrl);
    } else {
      window.open(tgUrl, '_blank');
    }
  };

  const handleClaimBonus = () => {
    if (unclaimedCount <= 0) return;
    const totalBonus = unclaimedCount * bonusPerFriend;
    sounds.playVictory();
    triggerHaptic('success');
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });

    onUpdateUser((prev) => ({
      ...prev,
      coins: prev.coins + totalBonus
    }));

    setUnclaimedCount(0);
    onNotification(`Referal bonusi olindi: +${totalBonus} tanga!`, 'success');
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-1.5 text-xs text-[rgba(248,247,212,0.5)] hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Asosiy menyu</span>
        </button>
        <span className="text-[10px] text-[rgba(248,247,212,0.4)] font-mono">Bonus: +{bonusPerFriend} tanga/do'st</span>
      </div>

      {/* Hero Banner */}
      <div className="rounded-[20px] border border-[rgba(248,247,212,0.1)] bg-[#161618] p-5 text-center space-y-3.5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent" />
        <div className="w-12 h-12 rounded-xl bg-[#0c0c0e] border border-[#10b981]/50 flex items-center justify-center text-2xl mx-auto shadow-lg">
          👥
        </div>

        <div className="space-y-1 max-w-sm mx-auto">
          <h1 className="font-display text-xl font-bold text-[#f8f7f4]">Do'stlarni Taklif Qilish</h1>
          <p className="text-[11px] text-[rgba(248,247,212,0.5)]">
            Har bir taklif qilingan do'stingiz uchun sizga <strong className="text-[#fbbf24] font-mono">+{bonusPerFriend} tanga</strong> beriladi!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto font-mono text-xs">
          <div className="p-2.5 rounded-lg bg-[#0c0c0e] border border-[rgba(248,247,212,0.1)]">
            <span className="text-[10px] text-[rgba(248,247,212,0.4)] uppercase">Taklif qilingan</span>
            <div className="font-bold text-white">3 kishi</div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0c0c0e] border border-[rgba(248,247,212,0.1)]">
            <span className="text-[10px] text-[rgba(248,247,212,0.4)] uppercase">Jami bonus</span>
            <div className="font-bold text-[#fbbf24]">🪙 150</div>
          </div>
        </div>

        {/* Referral Link Box */}
        <div className="max-w-sm mx-auto space-y-2 pt-1">
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#0c0c0e] border border-[rgba(248,247,212,0.1)]">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="flex-1 bg-transparent px-2 text-[11px] font-mono text-[#38bdf8] truncate focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="px-2.5 py-1 rounded bg-[#161618] hover:bg-[#1a1a1e] text-[rgba(248,247,212,0.8)] text-xs font-semibold flex items-center gap-1 border border-[rgba(248,247,212,0.1)] transition-colors shrink-0"
            >
              {copied ? <Check size={12} className="text-[#10b981]" /> : <Copy size={12} />}
              <span>{copied ? 'Nusxalandi' : 'Nusxa'}</span>
            </button>
          </div>

          <button
            onClick={handleShareTelegram}
            className="w-full h-10 rounded-lg bg-[#38bdf8] hover:bg-[#0284c7] text-[#0c0c0e] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg"
          >
            <Share2 size={14} />
            <span>Telegramda ulashish</span>
          </button>
        </div>

        {/* Claim Pending Bonus Banner */}
        {unclaimedCount > 0 && (
          <div className="p-3 rounded-xl bg-[rgba(251,191,36,0.1)] border border-[#fbbf24]/30 flex items-center justify-between gap-2 max-w-sm mx-auto text-left">
            <div className="flex items-center gap-2">
              <Gift className="text-[#fbbf24] shrink-0" size={16} />
              <div>
                <h4 className="text-xs font-bold text-[#fbbf24]">Yig'ilgan referal bonusi</h4>
                <p className="text-[10px] text-[rgba(248,247,212,0.5)] font-mono">+{unclaimedCount * bonusPerFriend} tanga kutilmoqda</p>
              </div>
            </div>
            <button
              onClick={handleClaimBonus}
              className="px-3 py-1 rounded-lg bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0c0c0e] font-bold text-xs transition-colors shrink-0"
            >
              Yechib olish
            </button>
          </div>
        )}
      </div>

      {/* Friends List */}
      <div className="space-y-2">
        <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[rgba(248,247,212,0.4)]">
          Do'stlar ro'yxati (3)
        </h3>

        <div className="space-y-1.5">
          {sampleFriends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center justify-between p-3 rounded-xl bg-[#161618] border border-[rgba(248,247,212,0.1)] text-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0c0c0e] border border-[rgba(248,247,212,0.1)] flex items-center justify-center font-bold text-white text-xs">
                  {friend.name[0]}
                </div>
                <div>
                  <div className="font-semibold text-[#f8f7f4] text-xs">{friend.name}</div>
                  <div className="text-[10px] font-mono text-[rgba(248,247,212,0.4)]">@{friend.username} · {friend.date}</div>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono text-[#10b981] font-bold text-xs">+{friend.reward} 🪙</span>
                <div className="text-[9px] text-[rgba(248,247,212,0.4)] font-mono uppercase">Faol</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
