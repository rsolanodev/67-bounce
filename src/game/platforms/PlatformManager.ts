import * as pc from 'playcanvas';
import type { GoalDefinition, PlatformDefinition } from '../levels/LevelDefinition';
import { Platform } from './Platform';

export class PlatformManager {
  private platforms: Platform[] = [];

  constructor(private app: pc.Application) {}

  build(defs: PlatformDefinition[], goal: GoalDefinition): void {
    this.clear();
    for (const def of defs) {
      this.platforms.push(new Platform(this.app, def, false));
    }
    this.platforms.push(
      new Platform(this.app, { x: goal.x, y: goal.y, width: goal.width, type: 'normal' }, true),
    );
  }

  update(time: number): void {
    for (const platform of this.platforms) {
      platform.update(time);
    }
  }

  get active(): Platform[] {
    return this.platforms.filter((p) => p.state === 'active');
  }

  break(platform: Platform): void {
    platform.break();
  }

  clear(): void {
    for (const platform of this.platforms) {
      platform.entity.destroy();
    }
    this.platforms = [];
  }
}
