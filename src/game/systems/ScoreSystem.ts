import { SCORE_CONFIG } from '../GameConfig';

export class ScoreSystem {
  private startY = 0;
  private maxY = 0;
  private tokens = 0;
  private platforms = 0;
  private bonus = 0;

  reset(startY: number): void {
    this.startY = startY;
    this.maxY = startY;
    this.tokens = 0;
    this.platforms = 0;
    this.bonus = 0;
  }

  update(y: number): void {
    if (y > this.maxY) {
      this.maxY = y;
    }
  }

  addToken(): void {
    this.tokens++;
  }

  addPlatform(): void {
    this.platforms++;
  }

  addBonus(value: number): void {
    this.bonus += value;
  }

  get tokenCount(): number {
    return this.tokens;
  }

  get platformCount(): number {
    return this.platforms;
  }

  get score(): number {
    const height = Math.max(0, this.maxY - this.startY);
    return (
      Math.floor(height * SCORE_CONFIG.heightPerUnit) +
      this.tokens * SCORE_CONFIG.tokenValue +
      this.platforms * SCORE_CONFIG.platformValue +
      this.bonus
    );
  }
}
