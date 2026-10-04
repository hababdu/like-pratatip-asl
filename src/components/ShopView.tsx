import React, { useState } from 'react';
import { UserProfile, ShopPackage, ShopItem } from '../types';
import { sounds } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import confetti from 'canvas-confetti';
import { ArrowLeft } from 'lucide-react';
import chestImg from '../assets/images/stars_coins_chest_1791081077144.jpg';

interface ShopViewProps {
  user: UserProfile;
  onUpdateUser: (updater: (prev: UserProfile) => UserProfile) => void;
  onBackToMenu: () => void;
  onNotification: (msg: string, type?: 'info' | 'success' | 'error') => void;
}

const STAR_PACKAGES: ShopPackage[] = [
  { id: 'pack-1', title: 'Hamyonbop xalta', coins: 1000, stars: 100, iconType: 'pouch' },
  { id: 'pack-2', title: 'Mashhur to\'plam', coins: 3000, stars: 250, popular: true, bonus: '+20% BONUS', iconType: 'chest' },
  { id: 'pack-3', title: 'Jangchi sandig\'i', coins: 7000, stars: 500, bonus: '+40% BONUS', iconType: 'chest' },
  { id: 'pack-4', title: 'Sulton xazinasi', coins: 16000, stars: 1000, bonus: '+60% BONUS', iconType: 'vault' },
];

const BOOSTERS: ShopItem[] = [
  {
    id: 'boost-double',
    name: '2x Tanga Kuchi',
    type: 'booster',
    description: 'Keyingi 3 ta g\'alabadan olinadigan tangalarni 2 karra oshiradi',
    priceCoins: 150,
    icon: '⚡',
    duration: '3 g\'alaba'
  },
  {
    id: 'boost-shield',
    name: 'Himoya Qalqoni',
    type: 'booster',
    description: 'Bir martalik mag\'lubiyatda stavkani to\'liq saqlab qoladi',
    priceCoins: 120,
    icon: '🛡️',
    duration: '1 mag\'lubiyat'
  },
  {
    id: 'boost-luck',
    name: 'Omad Talismani',
    type: 'booster',
    description: 'Durang natijada stavkangizning 50% miqdorini yutuq qilib beradi',
    priceCoins: 200,
    icon: '🍀',
    duration: '5 raund'
  }
];

const TITLES_AND_BORDERS: ShopItem[] = [
  {
    id: 'title-cyber',
    name: 'Kiber Qahramon',
    type: 'title',
    description: 'Profilingizda unikal kiber unvoni paydo bo\'ladi',
    priceCoins: 250,
    icon: '🤖'
  },
  {
    id: 'title-rockking',
    name: 'Tosh Qiroli',
    type: 'title',
    description: 'Tosh harakatlarining buyuk ustalari uchun faxriy unvon',
    priceCoins: 400,
    icon: '👑'
  },
  {
    id: 'border-gold',
    name: 'Oltin Aura Ramkasi',
    type: 'border',
    description: 'Duelda va reyting jadvalida alohida ajralib turuvchi oltin aura',
    priceCoins: 500,
    icon: '✨'
  }
];

export const ShopView: React.FC<ShopViewProps> = ({
  user,
  onUpdateUser,
  onBackToMenu,
  onNotification
}) => {
  const [activeTab, setActiveTab] = useState<'stars' | 'boosters' | 'items'>('stars');
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const handleBuyStarsPackage = (pkg: ShopPackage) => {
    if (user.stars < pkg.stars) {
      sounds.playDefeat();
      triggerHaptic('error');
      onNotification(`Sizda yetarli Telegram Stars mavjud emas! (Kerak: ${pkg.stars} ⭐)`, 'error');
      return;
    }

    setPurchasingId(pkg.id);
    sounds.playClick();
    triggerHaptic('medium');

    setTimeout(() => {
      sounds.playCoin();
      triggerHaptic('success');
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });

      onUpdateUser((prev) => ({
        ...prev,
        coins: prev.coins + pkg.coins,
        stars: prev.stars - pkg.stars
      }));

      setPurchasingId(null);
      onNotification(`Xarid amalga oshirildi! +${pkg.coins.toLocaleString()} tanga qo'shildi!`, 'success');
    }, 500);
  };

  const handleBuyBooster = (item: ShopItem) => {
    if (user.coins < item.priceCoins) {
      sounds.playDefeat();
      triggerHaptic('error');
      onNotification(`Hisobingizda yetarli tanga yo'q! (Kerak: ${item.priceCoins} 🪙)`, 'error');
      return;
    }

    sounds.playCoin();
    triggerHaptic('success');

    onUpdateUser((prev) => {
      const boosters = { ...prev.boosters };
      if (item.id === 'boost-double') boosters.doubleCoins += 3;
      if (item.id === 'boost-shield') boosters.lossShield += 1;
      if (item.id === 'boost-luck') boosters.luckCharm += 5;

      return {
        ...prev,
        coins: prev.coins - item.priceCoins,
        boosters
      };
    });

    onNotification(`"${item.name}" muvaffaqiyatli xarid qilindi!`, 'success');
  };

  const handleBuyCustomization = (item: ShopItem) => {
    if (user.coins < item.priceCoins) {
      sounds.playDefeat();
      triggerHaptic('error');
      onNotification(`Hisobingizda yetarli tanga yo'q! (Kerak: ${item.priceCoins} 🪙)`, 'error');
      return;
    }

    sounds.playVictory();
    triggerHaptic('success');

    onUpdateUser((prev) => {
      const updates: Partial<UserProfile> = {
        coins: prev.coins - item.priceCoins
      };
      if (item.type === 'title') {
        updates.title = item.name;
      }
      if (item.type === 'border') {
        updates.avatarBorder = item.name;
      }
      return { ...prev, ...updates };
    });

    onNotification(`"${item.name}" faollashtirildi!`, 'success');
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
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#fbbf24]">🪙 {user.coins}</span>
          <span className="text-[rgba(248,247,212,0.2)]">·</span>
          <span className="text-[#38bdf8]">⭐ {user.stars} Stars</span>
        </div>
      </div>

      {/* Hero Showcase */}
      <div className="relative rounded-[20px] border border-[rgba(248,247,212,0.1)] bg-[#161618] p-4 sm:p-5 overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#6366f1] to-transparent" />
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#6366f1] shrink-0 bg-[#0c0c0e]">
            <img
              src={chestImg}
              alt="Sandig'i"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-base font-extrabold text-[#f8f7f4]">Do'kon & Kuchaytirgichlar</h1>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[rgba(251,191,36,0.1)] text-[#fbbf24] uppercase">
                Stars
              </span>
            </div>
            <p className="text-[11px] text-[rgba(248,247,212,0.5)] mt-0.5">
              Telegram Stars orqali tangalar va taktik kuchaytirgichlarni xarid qiling.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[#161618] border border-[rgba(248,247,212,0.1)] rounded-lg text-xs font-mono">
        <button
          onClick={() => { sounds.playClick(); setActiveTab('stars'); }}
          className={`flex-1 py-1.5 rounded font-semibold transition-all ${
            activeTab === 'stars'
              ? 'bg-[#6366f1] text-white shadow'
              : 'text-[rgba(248,247,212,0.4)] hover:text-white'
          }`}
        >
          ⭐ Stars
        </button>
        <button
          onClick={() => { sounds.playClick(); setActiveTab('boosters'); }}
          className={`flex-1 py-1.5 rounded font-semibold transition-all ${
            activeTab === 'boosters'
              ? 'bg-[#6366f1] text-white shadow'
              : 'text-[rgba(248,247,212,0.4)] hover:text-white'
          }`}
        >
          ⚡ Kuchaytirgichlar
        </button>
        <button
          onClick={() => { sounds.playClick(); setActiveTab('items'); }}
          className={`flex-1 py-1.5 rounded font-semibold transition-all ${
            activeTab === 'items'
              ? 'bg-[#6366f1] text-white shadow'
              : 'text-[rgba(248,247,212,0.4)] hover:text-white'
          }`}
        >
          👑 Unvonlar
        </button>
      </div>

      {/* TAB 1: STARS PACKAGES */}
      {activeTab === 'stars' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {STAR_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative rounded-[16px] border p-3.5 space-y-2 transition-all ${
                pkg.popular
                  ? 'border-[#6366f1] bg-[#161618] shadow-lg'
                  : 'border-[rgba(248,247,212,0.1)] bg-[#161618]'
              }`}
            >
              {pkg.bonus && (
                <span className="absolute -top-2 right-2.5 text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.2 rounded bg-[#fbbf24] text-[#0c0c0e]">
                  {pkg.bonus}
                </span>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#f8f7f4]">{pkg.title}</h3>
                  <div className="text-lg font-bold font-mono text-[#fbbf24] flex items-center gap-1 mt-0.5">
                    <span>🪙</span>
                    <span>+{pkg.coins.toLocaleString()}</span>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#0c0c0e] border border-[rgba(248,247,212,0.1)] flex items-center justify-center text-lg">
                  {pkg.iconType === 'pouch' && '💰'}
                  {pkg.iconType === 'chest' && '🎁'}
                  {pkg.iconType === 'vault' && '💎'}
                </div>
              </div>

              <button
                disabled={purchasingId === pkg.id}
                onClick={() => handleBuyStarsPackage(pkg)}
                className="w-full h-8 rounded-lg bg-[#0c0c0e] hover:bg-[#6366f1] text-white font-mono font-bold text-xs flex items-center justify-center gap-1.5 border border-[rgba(248,247,212,0.1)] hover:border-[#6366f1] transition-all active:scale-98"
              >
                <span>⭐</span>
                <span>{pkg.stars} Stars bilan xarid</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: BOOSTERS */}
      {activeTab === 'boosters' && (
        <div className="space-y-2">
          {BOOSTERS.map((booster) => (
            <div
              key={booster.id}
              className="flex items-center justify-between p-3 rounded-xl bg-[#161618] border border-[rgba(248,247,212,0.1)] gap-2.5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0c0c0e] border border-[rgba(248,247,212,0.1)] flex items-center justify-center text-xl shrink-0">
                  {booster.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-[#f8f7f4]">{booster.name}</h3>
                    {booster.duration && (
                      <span className="text-[9px] text-[rgba(248,247,212,0.4)] font-mono bg-[#0c0c0e] px-1.5 py-0.2 rounded">
                        {booster.duration}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[rgba(248,247,212,0.5)] mt-0.5">{booster.description}</p>
                </div>
              </div>

              <button
                onClick={() => handleBuyBooster(booster)}
                className="px-3 py-1.5 rounded-lg bg-[#6366f1] hover:bg-[#4f46e5] text-white font-mono font-bold text-xs flex items-center gap-1 transition-all active:scale-95 shrink-0"
              >
                <span>🪙</span>
                <span>{booster.priceCoins}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: TITLES & BORDERS */}
      {activeTab === 'items' && (
        <div className="space-y-2">
          {TITLES_AND_BORDERS.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-xl bg-[#161618] border border-[rgba(248,247,212,0.1)] gap-2.5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0c0c0e] border border-[rgba(248,247,212,0.1)] flex items-center justify-center text-xl shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#f8f7f4]">{item.name}</h3>
                  <p className="text-[11px] text-[rgba(248,247,212,0.5)] mt-0.5">{item.description}</p>
                </div>
              </div>

              <button
                onClick={() => handleBuyCustomization(item)}
                className="px-3 py-1.5 rounded-lg bg-[#6366f1] hover:bg-[#4f46e5] text-white font-mono font-bold text-xs flex items-center gap-1 transition-all active:scale-95 shrink-0"
              >
                <span>🪙</span>
                <span>{item.priceCoins}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
