import { Choice, BotDifficulty } from '../types';

export default class RPSBot {
  public difficulty: BotDifficulty;
  public history: Choice[];
  public stats: Record<Choice, number>;

  constructor(difficulty: BotDifficulty = 'medium') {
    this.difficulty = difficulty;
    this.history = [];
    this.stats = { rock: 0, paper: 0, scissors: 0 };
  }

  public choose(last: Choice | null = null): Choice {
    const opts: Choice[] = ['rock', 'paper', 'scissors'];

    if (this.difficulty === 'easy') {
      return opts[Math.floor(Math.random() * 3)];
    }

    if (!last && this.history.length > 0) {
      last = this.history[this.history.length - 1];
    }

    if (this.difficulty === 'medium') {
      if (last && Math.random() < 0.68) {
        return this.beats(last);
      }
      return opts[Math.floor(Math.random() * 3)];
    }

    if (this.difficulty === 'hard') {
      const most = this.getMostFrequent();
      if (most && Math.random() < 0.82) {
        return this.beats(most);
      }
      if (last && Math.random() < 0.7) {
        return this.beats(last);
      }
      return opts[Math.floor(Math.random() * 3)];
    }

    // Master / Usta AI: transition pattern analysis
    if (this.history.length >= 2) {
      const prev = this.history[this.history.length - 2];
      const cur = this.history[this.history.length - 1];
      // Check what user plays after this pattern
      const transitions: Record<Choice, number> = { rock: 0, paper: 0, scissors: 0 };
      for (let i = 0; i < this.history.length - 2; i++) {
        if (this.history[i] === prev && this.history[i + 1] === cur) {
          const next = this.history[i + 2];
          transitions[next] = (transitions[next] || 0) + 1;
        }
      }
      const likelyNext = (Object.keys(transitions) as Choice[]).reduce((a, b) =>
        transitions[a] > transitions[b] ? a : b
      );
      if (transitions[likelyNext] > 0 && Math.random() < 0.88) {
        return this.beats(likelyNext);
      }
    }

    const mostFreq = this.getMostFrequent();
    if (mostFreq && Math.random() < 0.85) {
      return this.beats(mostFreq);
    }
    if (last) {
      return this.beats(last);
    }
    return opts[Math.floor(Math.random() * 3)];
  }

  public beats(choice: Choice): Choice {
    if (choice === 'rock') return 'paper';
    if (choice === 'paper') return 'scissors';
    return 'rock';
  }

  public getMostFrequent(): Choice | null {
    const values = Object.values(this.stats);
    if (values.length === 0) return null;
    const max = Math.max(...values);
    if (max === 0) return null;
    for (const [key, count] of Object.entries(this.stats)) {
      if (count === max) return key as Choice;
    }
    return null;
  }

  public remember(choice: Choice | null) {
    if (!choice) return;
    this.history.push(choice);
    this.stats[choice] = (this.stats[choice] || 0) + 1;
    if (this.history.length > 30) {
      this.history.shift();
    }
  }

  public reset() {
    this.history = [];
    this.stats = { rock: 0, paper: 0, scissors: 0 };
  }
}
