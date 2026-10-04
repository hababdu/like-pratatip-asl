import React, { useState } from 'react';
import { UserProfile, Transaction } from '../types';
import { sounds } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import confetti from 'canvas-confetti';
import { ArrowLeft, Plus } from 'lucide-react';

interface WalletViewProps {
  user: UserProfile;
  transactions: Transaction[];
  onUpdateUser: (updater: (prev: UserProfile) => UserProfile) => void;
  onAddTransaction: (tx: Transaction) => void;
  onBackToMenu: () => void;
  onNotification: (msg: string, type?: 'info' | 'success' | 'error') => void;
}

const TX_TYPES: Record<string, { label: string; icon: string }> = {
  signup_bonus: { label: 'Boshlang\'ich bonus', icon: '🎁' },
  referral_bonus: { label: 'Do\'st taklif bonusi', icon: '👥' },
  game_win: { label: 'Duelda g\'alaba', icon: '🏆' },
  game_lose: { label: 'Duel stavkasi', icon: '💥' },
  game_draw_refund: { label: 'Durang qaytarildi', icon: '🤝' },
  purchase: { label: 'Do\'kondan xarid', icon: '⭐' },
  deposit: { label: 'Balans to\'ldirildi', icon: '💳' },
  achievement_reward: { label: 'Yutuq mukofoti', icon: '🎖️' }
};

export const WalletView: React.FC<WalletViewProps> = ({
  user,
  transactions,
  onUpdateUser,
  onAddTransaction,
  onBackToMenu,
  onNotification
}) => {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [showDepositModal, setShowDepositModal] = useState<boolean>(false);
  const [depositAmount, setDepositAmount] = useState<number>(100);

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'income') return tx.isCredit;
    if (filter === 'expense') return !tx.isCredit;
    return true;
  });

  const handleDeposit = () => {
    sounds.playCoin();
    triggerHaptic('success');
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });

    onUpdateUser((prev) => ({
      ...prev,
      coins: prev.coins + depositAmount
    }));

    onAddTransaction({
      id: `tx-${Date.now()}`,
      type: 'deposit',
      amount: depositAmount,
      label: `Test to'ldirish (+${depositAmount} tanga)`,
      timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
      isCredit: true
    });

    setShowDepositModal(false);
    onNotification(`Hisobingizga +${depositAmount} tanga qo'shildi!`, 'success');
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
        <span className="text-[10px] text-[rgba(248,247,212,0.4)] font-mono">Xavfsiz hamyon</span>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Coins Card */}
        <div className="rounded-[18px] border border-[rgba(251,191,36,0.2)] bg-[#161618] p-4 space-y-2 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#fbbf24] uppercase">Tanga Balansi</span>
            <span className="text-xl">🪙</span>
          </div>

          <div className="text-2xl font-display font-black text-[#fbbf24] font-mono tabular-nums">
            {user.coins.toLocaleString()}
          </div>

          <button
            onClick={() => { sounds.playClick(); setShowDepositModal(true); }}
            className="w-full py-1.5 rounded-lg bg-[rgba(251,191,36,0.1)] hover:bg-[rgba(251,191,36,0.2)] border border-[#fbbf24]/30 text-[#fbbf24] text-xs font-bold font-mono flex items-center justify-center gap-1 transition-colors"
          >
            <Plus size={13} />
            <span>To'ldirish</span>
          </button>
        </div>

        {/* Telegram Stars Card */}
        <div className="rounded-[18px] border border-[rgba(56,189,248,0.2)] bg-[#161618] p-4 space-y-2 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#38bdf8] uppercase">Telegram Stars</span>
            <span className="text-xl">⭐</span>
          </div>

          <div className="text-2xl font-display font-black text-[#38bdf8] font-mono tabular-nums">
            {user.stars}
          </div>

          <div className="text-[10px] text-[rgba(248,247,212,0.4)] font-mono py-1.5 text-center">
            Rasmiy integratsiya
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#f8f7f4] uppercase tracking-wider font-mono">
            Tranzaksiyalar
          </h2>

          {/* Filters */}
          <div className="flex items-center gap-1 p-1 bg-[#161618] border border-[rgba(248,247,212,0.1)] rounded-lg text-xs font-mono">
            {(['all', 'income', 'expense'] as const).map((tab) => {
              const labels = { all: 'Barchasi', income: 'Kirim', expense: 'Chiqim' };
              return (
                <button
                  key={tab}
                  onClick={() => { sounds.playClick(); setFilter(tab); }}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                    filter === tab
                      ? 'bg-[#6366f1] text-white shadow'
                      : 'text-[rgba(248,247,212,0.4)] hover:text-white'
                  }`}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Transactions Feed */}
        <div className="rounded-[16px] border border-[rgba(248,247,212,0.1)] bg-[#161618] divide-y divide-[rgba(248,247,212,0.06)]">
          {filteredTransactions.length === 0 ? (
            <p className="text-center text-xs text-[rgba(248,247,212,0.4)] py-6 font-mono">
              Tranzaksiyalar mavjud emas
            </p>
          ) : (
            filteredTransactions.map((tx) => {
              const meta = TX_TYPES[tx.type] || { label: tx.label, icon: '🪙' };

              return (
                <div key={tx.id} className="flex items-center justify-between p-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#0c0c0e] border border-[rgba(248,247,212,0.1)] flex items-center justify-center text-sm shrink-0">
                      {meta.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-[#f8f7f4] text-xs">{meta.label}</div>
                      <div className="text-[10px] font-mono text-[rgba(248,247,212,0.4)]">{tx.timestamp}</div>
                    </div>
                  </div>

                  <div className={`font-mono font-bold text-right text-xs tabular-nums ${
                    tx.isCredit ? 'text-[#10b981]' : 'text-[#f43f5e]'
                  }`}>
                    {tx.isCredit ? '+' : '-'}{tx.amount} 🪙
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xs rounded-[20px] bg-[#161618] border border-[rgba(248,247,212,0.15)] p-5 space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-[#f8f7f4]">Hisobni To'ldirish</h3>
              <button
                onClick={() => setShowDepositModal(false)}
                className="text-[rgba(248,247,212,0.4)] hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-[rgba(248,247,212,0.5)]">
              Sinov uchun bepul tangalar qo'shib olishingiz mumkin:
            </p>

            <div className="grid grid-cols-3 gap-1.5 font-mono">
              {[50, 100, 250, 500, 1000, 2500].map((val) => (
                <button
                  key={val}
                  onClick={() => setDepositAmount(val)}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    depositAmount === val
                      ? 'bg-[#6366f1] text-white shadow'
                      : 'bg-[#0c0c0e] text-[rgba(248,247,212,0.7)] border border-[rgba(248,247,212,0.1)] hover:bg-[#1a1a1e]'
                  }`}
                >
                  +{val} 🪙
                </button>
              ))}
            </div>

            <button
              onClick={handleDeposit}
              className="w-full h-10 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all"
            >
              Tasdiqlash (+{depositAmount} 🪙)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
