import * as pc from 'playcanvas';
import type { CollectibleDefinition } from '../levels/LevelDefinition';
import { Token67 } from './Token67';

export interface CollectResult {
  x: number;
  y: number;
}

export class CollectibleManager {
  private tokens: Token67[] = [];

  constructor(private app: pc.Application) {}

  build(defs: CollectibleDefinition[]): void {
    this.clear();
    for (const def of defs) {
      this.tokens.push(new Token67(this.app, def.x, def.y));
    }
  }

  update(time: number, dt: number): void {
    for (const token of this.tokens) {
      token.update(time, dt);
    }
  }

  tryCollect(playerX: number, playerY: number): CollectResult[] {
    const collected: CollectResult[] = [];
    for (const token of this.tokens) {
      if (token.isCollected()) continue;
      const dx = token.x - playerX;
      const dy = token.y - playerY;
      if (dx * dx + dy * dy < 0.85 * 0.85) {
        token.collect();
        collected.push({ x: token.x, y: token.y });
      }
    }
    return collected;
  }

  clear(): void {
    for (const token of this.tokens) {
      token.entity.destroy();
    }
    this.tokens = [];
  }
}
