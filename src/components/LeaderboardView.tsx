import React, { useState } from 'react';
import { LeaderboardPlayer, UserProfile } from '../types';
import { sounds } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { ArrowLeft, Search } from 'lucide-react';
import trophyImg from '../assets/images/champion_trophy_gold_1791081061104.jpg';

interface LeaderboardViewProps {
  user: UserProfile;
  onBackToMenu: () => void;
}

const SAMPLE_LEADERS: LeaderboardPlayer[] = [
  { id: '1', tgId: 1001, name: 'Sardorbek Pro', username: 'sardor_pro', avatar: '👑', rating: 2450, wins: 342, winRate: 74, rank: 1 },
  { id: '2', tgId: 1002, name: 'Azizbek_Warrior', username: 'aziz_apex', avatar: '⚡', rating: 2280, wins: 298, winRate: 71, rank: 2 },
  { id: '3', tgId: 1003, name: 'Malika Queen', username: 'malika_q', avatar: '💎', rating: 2190, wins: 280, winRate: 69, rank: 3 },
  { id: '4', tgId: 1004, name: 'Javohir Tosh', username: 'javohir_rock', avatar: '🪨', rating: 1980, wins: 245, winRate: 65, rank: 4 },
  { id: '5', tgId: 1005, name: 'Bobur_Uz', username: 'bobur_cyber', avatar: '🦁', rating: 1840, wins: 210, winRate: 63, rank: 5 },
  { id: '6', tgId: 1006, name: 'Nodira Scissors', username: 'nodira_cut', avatar: '✂️', rating: 1750, wins: 195, winRate: 61, rank: 6 },
  { id: '7', tgId: 1007, name: 'Timur Duelist', username: 'timur_play', avatar: '🎯', rating: 1680, wins: 182, winRate: 59, rank: 7 },
  { id: '8', tgId: 1008, name: 'Kamola Paper', username: 'kamola_p', avatar: '📄', rating: 1590, wins: 164, winRate: 58, rank: 8 },
  { id: '9', tgId: 1009, name: 'Otabek_77', username: 'otabek_ninja', avatar: '🔥', rating: 1470, wins: 152, winRate: 56, rank: 9 },
  { id: '10', tgId: 1010, name: 'Rustam Master', username: 'rustam_m', avatar: '🦅', rating: 1390, wins: 141, winRate: 55, rank: 10 }
];

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ user, onBackToMenu }) => {
  const [filter, setFilter] = useState<'all' | 'weekly' | 'daily'>('all');
  const [search, setSearch] = useState<string>('');

  const filteredLeaders = SAMPLE_LEADERS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.username.toLowerCase().includes(search.toLowerCase())
  );

  const top3 = SAMPLE_LEADERS.slice(0, 3);

  return (
    <div className="space-y-4 pb-14">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-1.5 text-xs text-[rgba(248,247,212,0.5)] hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Asosiy menyu</span>
        </button>

        <div className="flex items-center gap-1 p-1 bg-[#161618] border border-[rgba(248,247,212,0.1)] rounded-lg text-xs font-mono">
          {(['all', 'weekly', 'daily'] as const).map((tabKey) => {
            const labels = { all: 'Barchasi', weekly: 'Haftalik', daily: 'Bugun' };
            const isActive = filter === tabKey;
            return (
              <button
                key={tabKey}
                onClick={() => {
                  sounds.playClick();
                  triggerHaptic('selection');
                  setFilter(tabKey);
                }}
                className={`px-2.5 py-1 rounded font-semibold transition-all ${
                  isActive
                    ? 'bg-[#6366f1] text-white shadow'
                    : 'text-[rgba(248,247,212,0.4)] hover:text-white'
                }`}
              >
                {labels[tabKey]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Podium Section (Top 3) */}
      <div className="relative rounded-[20px] border border-[rgba(248,247,212,0.1)] bg-[#161618] p-5 overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#fbbf24] to-transparent" />
        <div className="flex flex-col items-center mb-5 text-center space-y-1">
          <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#fbbf24]/40 shadow-lg shadow-[#fbbf24]/20 mb-1.5">
            <img
              src={trophyImg}
              alt="Chempion Kubogi"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="font-display text-xl font-bold text-[#f8f7f4]">Chempionlar Jadvali</h1>
          <p className="text-[11px] text-[rgba(248,247,212,0.5)]">
            Hafta yakunida kuchli o'yinchilar maxsus Telegram Stars va unvonlar oladi
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-3 gap-2 items-end max-w-sm mx-auto pt-2">
          
          {/* 2nd Place */}
          {top3[1] && (
            <div className="flex flex-col items-center text-center space-y-1.5">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-[#0c0c0e] border border-[rgba(248,247,212,0.2)] flex items-center justify-center text-xl shadow">
                  {top3[1].avatar}
                </div>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-300 text-slate-950 font-mono font-bold text-[10px] flex items-center justify-center border-2 border-[#161618]">
                  2
                </span>
              </div>
              <div className="w-full">
                <h4 className="text-[11px] font-bold text-[#f8f7f4] truncate">{top3[1].name}</h4>
                <span className="text-[10px] font-mono text-[rgba(248,247,212,0.5)] tabular-nums">
                  {top3[1].rating} b
                </span>
              </div>
              <div className="w-full h-16 bg-[#0c0c0e] rounded-t-lg border-t border-[rgba(248,247,212,0.2)] flex items-center justify-center text-slate-400 font-bold text-xs">
                🥈
              </div>
            </div>
          )}

          {/* 1st Place */}
          {top3[0] && (
            <div className="flex flex-col items-center text-center space-y-1.5 -mt-3">
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-[#0c0c0e] border-2 border-[#fbbf24] flex items-center justify-center text-2xl shadow-xl shadow-[#fbbf24]/20">
                  {top3[0].avatar}
                </div>
                <span className="absolute -bottom-1.5 -right-1 w-6 h-6 rounded-full bg-[#fbbf24] text-slate-950 font-mono font-black text-xs flex items-center justify-center border-2 border-[#161618]">
                  1
                </span>
              </div>
              <div className="w-full">
                <h4 className="text-xs font-bold text-[#fbbf24] truncate">{top3[0].name}</h4>
                <span className="text-[11px] font-mono text-[#fbbf24] font-bold tabular-nums">
                  {top3[0].rating} ball
                </span>
              </div>
              <div className="w-full h-22 bg-gradient-to-t from-[#fbbf24]/10 to-[#fbbf24]/20 rounded-t-lg border-t-2 border-[#fbbf24] flex items-center justify-center text-[#fbbf24] font-black text-base">
                🥇
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <div className="flex flex-col items-center text-center space-y-1.5">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-[#0c0c0e] border border-[rgba(248,247,212,0.2)] flex items-center justify-center text-xl shadow">
                  {top3[2].avatar}
                </div>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-700 text-white font-mono font-bold text-[10px] flex items-center justify-center border-2 border-[#161618]">
                  3
                </span>
              </div>
              <div className="w-full">
                <h4 className="text-[11px] font-bold text-[#f8f7f4] truncate">{top3[2].name}</h4>
                <span className="text-[10px] font-mono text-[rgba(248,247,212,0.5)] tabular-nums">
                  {top3[2].rating} b
                </span>
              </div>
              <div className="w-full h-14 bg-[#0c0c0e] rounded-t-lg border-t border-amber-700/50 flex items-center justify-center text-amber-600 font-bold text-xs">
                🥉
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(248,247,212,0.4)]" size={14} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="O'yinchi nomi yoki username..."
          className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#161618] border border-[rgba(248,247,212,0.1)] text-xs text-[#f8f7f4] placeholder-[rgba(248,247,212,0.3)] focus:outline-none focus:border-[#6366f1]"
        />
      </div>

      {/* Players List Table */}
      <div className="rounded-[16px] border border-[rgba(248,247,212,0.1)] bg-[#161618] overflow-hidden">
        <div className="grid grid-cols-12 px-3.5 py-2 text-[10px] font-mono uppercase tracking-wider text-[rgba(248,247,212,0.4)] border-b border-[rgba(248,247,212,0.1)]">
          <span className="col-span-2 text-center">O'rin</span>
          <span className="col-span-6">O'yinchi</span>
          <span className="col-span-2 text-center">G'alaba</span>
          <span className="col-span-2 text-right">Ball</span>
        </div>

        <div className="divide-y divide-[rgba(248,247,212,0.06)]">
          {filteredLeaders.map((player) => (
            <div
              key={player.id}
              className="grid grid-cols-12 px-3.5 py-2.5 items-center text-xs hover:bg-[#1a1a1e] transition-colors"
            >
              <div className="col-span-2 flex items-center justify-center font-mono font-bold text-xs">
                {player.rank === 1 && <span className="text-[#fbbf24]">🥇 1</span>}
                {player.rank === 2 && <span className="text-slate-300">🥈 2</span>}
                {player.rank === 3 && <span className="text-amber-600">🥉 3</span>}
                {player.rank > 3 && <span className="text-[rgba(248,247,212,0.4)]">#{player.rank}</span>}
              </div>

              <div className="col-span-6 flex items-center gap-2 truncate">
                <span className="text-base">{player.avatar}</span>
                <div className="truncate">
                  <div className="font-semibold text-[#f8f7f4] truncate text-xs">{player.name}</div>
                  <div className="text-[10px] font-mono text-[rgba(248,247,212,0.4)]">@{player.username}</div>
                </div>
              </div>

              <div className="col-span-2 text-center font-mono tabular-nums text-[#10b981] text-xs font-semibold">
                {player.winRate}%
              </div>

              <div className="col-span-2 text-right font-mono tabular-nums font-bold text-[#f8f7f4] text-xs">
                {player.rating.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
