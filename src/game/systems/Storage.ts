import type { ControlMode } from '../GameConfig';

export interface SaveData {
  unlockedLevel: number;
  totalTokens: number;
  bestScores: Record<number, number>;
  soundEnabled: boolean;
  musicEnabled: boolean;
  controlMode: ControlMode;
  invertTilt: boolean;
}

const DEFAULT_SAVE: SaveData = {
  unlockedLevel: 1,
  totalTokens: 0,
  bestScores: {},
  soundEnabled: true,
  musicEnabled: true,
  controlMode: 'tilt',
  invertTilt: true,
};

export class Storage {
  private data: SaveData;

  constructor(private key: string) {
    this.data = this.load();
  }

  private load(): SaveData {
    try {
      const raw = localStorage.getItem(this.key);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SaveData>;
        return { ...DEFAULT_SAVE, ...parsed, bestScores: { ...DEFAULT_SAVE.bestScores, ...(parsed.bestScores ?? {}) } };
      }
    } catch {
      // ignore corrupted save
    }
    return { ...DEFAULT_SAVE };
  }

  save(): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(this.data));
    } catch {
      // storage unavailable
    }
  }

  get(): SaveData {
    return this.data;
  }

  setSoundEnabled(value: boolean): void {
    this.data.soundEnabled = value;
    this.save();
  }

  setMusicEnabled(value: boolean): void {
    this.data.musicEnabled = value;
    this.save();
  }

  setControlMode(mode: ControlMode): void {
    this.data.controlMode = mode;
    this.save();
  }

  setInvertTilt(value: boolean): void {
    this.data.invertTilt = value;
    this.save();
  }

  recordBest(level: number, score: number): boolean {
    const prev = this.data.bestScores[level] ?? 0;
    if (score > prev) {
      this.data.bestScores[level] = score;
      this.save();
      return true;
    }
    return false;
  }

  getBest(level: number): number {
    return this.data.bestScores[level] ?? 0;
  }

  unlockLevel(level: number): void {
    if (level > this.data.unlockedLevel) {
      this.data.unlockedLevel = level;
      this.save();
    }
  }

  addTokens(amount: number): void {
    this.data.totalTokens += amount;
    this.save();
  }
}
