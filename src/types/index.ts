export type Choice = 'rock' | 'paper' | 'scissors';

export type GameScreen = 'menu' | 'duel' | 'bot' | 'leaderboard' | 'profile' | 'referrals' | 'shop' | 'wallet';

export type BotDifficulty = 'easy' | 'medium' | 'hard' | 'master';

export interface UserProfile {
  id: string;
  tgId: number;
  username: string;
  firstName: string;
  avatarUrl: string;
  coins: number;
  stars: number;
  level: number;
  xp: number;
  rating: number;
  title: string;
  avatarBorder?: string;
  stats: {
    totalGames: number;
    wins: number;
    losses: number;
    draws: number;
    winRate: number;
    currentStreak: number;
    maxStreak: number;
    totalEarned: number;
  };
  boosters: {
    doubleCoins: number;
    lossShield: number;
    luckCharm: number;
  };
  claimedAchievements: string[];
}

export interface MatchHistoryItem {
  id: string;
  opponentName: string;
  opponentAvatar?: string;
  myChoice: Choice;
  opponentChoice: Choice;
  result: 'win' | 'lose' | 'draw';
  stake: number;
  date: string;
  mode: 'pvp' | 'bot';
}

export interface LeaderboardPlayer {
  id: string;
  tgId: number;
  name: string;
  username: string;
  avatar: string;
  rating: number;
  wins: number;
  winRate: number;
  rank: number;
  isCurrentUser?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rewardCoins: number;
  progress: number;
  maxProgress: number;
  completed: boolean;
}

export interface ShopPackage {
  id: string;
  title: string;
  coins: number;
  stars: number;
  popular?: boolean;
  bonus?: string;
  iconType: 'coins' | 'pouch' | 'chest' | 'vault';
}

export interface ShopItem {
  id: string;
  name: string;
  type: 'booster' | 'title' | 'border';
  description: string;
  priceCoins: number;
  icon: string;
  duration?: string;
}

export interface Transaction {
  id: string;
  type: 'signup_bonus' | 'referral_bonus' | 'game_stake_hold' | 'game_stake_refund' | 'game_win' | 'game_lose' | 'game_draw_refund' | 'purchase' | 'achievement_reward' | 'deposit';
  amount: number;
  label: string;
  timestamp: string;
  isCredit: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'me' | 'opponent' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
}
