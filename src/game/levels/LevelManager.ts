import type { LevelDefinition } from './LevelDefinition';

export class LevelManager {
  private currentId: number;

  constructor(private levels: LevelDefinition[]) {
    this.currentId = this.levels[0].id;
  }

  load(id: number): LevelDefinition {
    const level = this.levels.find((l) => l.id === id) ?? this.levels[0];
    this.currentId = level.id;
    return level;
  }

  get current(): LevelDefinition {
    return this.levels.find((l) => l.id === this.currentId) ?? this.levels[0];
  }

  get currentIdValue(): number {
    return this.currentId;
  }

  get maxLevel(): number {
    return this.levels[this.levels.length - 1].id;
  }

  nextId(): number | null {
    const next = this.levels.find((l) => l.id === this.currentId + 1);
    return next ? next.id : null;
  }
}
