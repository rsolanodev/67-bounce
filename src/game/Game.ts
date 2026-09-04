import * as pc from 'playcanvas';
import { DEATH_MARGIN, PLAYER_CONFIG, SCORE_CONFIG, STORAGE_KEY } from './GameConfig';
import type { GameCallbacks, GameState, HudData } from './state/GameState';
import { Storage } from './systems/Storage';
import { AudioManager } from './systems/AudioManager';
import { ParticleManager } from './systems/ParticleManager';
import { BackgroundController } from './systems/BackgroundController';
import { ScoreSystem } from './systems/ScoreSystem';
import { Player } from './player/Player';
import { PlayerController } from './player/PlayerController';
import { PlatformManager } from './platforms/PlatformManager';
import { Platform } from './platforms/Platform';
import { CollectibleManager } from './collectibles/CollectibleManager';
import { CameraController } from './camera/CameraController';
import { LevelManager } from './levels/LevelManager';
import { LEVELS } from './levels/levels';

export class Game {
  private app: pc.Application;
  private player: Player;
  private controller: PlayerController;
  private platforms: PlatformManager;
  private collectibles: CollectibleManager;
  private camera: CameraController;
  private particles: ParticleManager;
  private background: BackgroundController;
  private audio: AudioManager;
  private storage: Storage;
  private score: ScoreSystem;
  private levels: LevelManager;

  private state: GameState = 'MENU';
  private elapsed = 0;
  private hudTimer = 0;
  private lastHud: HudData | null = null;
  private landedPlatforms = new Set<Platform>();
  private destroyed = false;

  private onVisibilityChange = (): void => {
    if (document.hidden && this.state === 'PLAYING') {
      this.pause();
    }
  };

  private onGameKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
      if (this.state === 'PLAYING') this.pause();
      else if (this.state === 'PAUSED') this.resume();
    } else if (e.key.toLowerCase() === 'r') {
      if (this.state === 'PLAYING' || this.state === 'PAUSED' || this.state === 'GAME_OVER') {
        this.restart();
      }
    }
  };

  constructor(canvas: HTMLCanvasElement, private callbacks: GameCallbacks) {
    this.storage = new Storage(STORAGE_KEY);
    const save = this.storage.get();
    this.audio = new AudioManager(save.soundEnabled, save.musicEnabled);
    this.levels = new LevelManager(LEVELS);

    this.app = new pc.Application(canvas, {
      graphicsDeviceOptions: { antialias: true, alpha: false },
    });
    this.app.graphicsDevice.maxPixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    this.app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
    this.app.setCanvasResolution(pc.RESOLUTION_AUTO);
    this.app.scene.ambientLight = new pc.Color(0.45, 0.45, 0.55);

    const sun = new pc.Entity('sun');
    sun.addComponent('light', {
      type: 'directional',
      intensity: 1.15,
      color: new pc.Color(1, 0.98, 0.92),
      castShadows: false,
    });
    sun.setEulerAngles(-50, -35, 0);
    this.app.root.addChild(sun);

    const level = this.levels.current;
    this.background = new BackgroundController(this.app, (level.goal.y + level.startY) / 2);
    this.background.setTheme(level.theme);
    this.camera = new CameraController(this.app);
    this.player = new Player(this.app);
    this.controller = new PlayerController(canvas);
    this.platforms = new PlatformManager(this.app);
    this.collectibles = new CollectibleManager(this.app);
    this.particles = new ParticleManager(this.app);
    this.score = new ScoreSystem();

    this.loadLevel(this.levels.currentIdValue);
    this.app.on('update', (dt: number) => this.update(dt));
    this.app.start();

    document.addEventListener('visibilitychange', this.onVisibilityChange);
    window.addEventListener('keydown', this.onGameKeyDown);
  }

  private update(dt: number): void {
    if (this.destroyed) return;
    this.elapsed += dt;
    this.particles.update(dt);

    if (this.state === 'PLAYING' || this.state === 'MENU') {
      const axis = this.state === 'PLAYING' ? this.controller.getAxis() : 0;
      this.player.update(dt, axis, this.wrapHalfWidth());
      this.platforms.update(this.elapsed);
      this.collidePlayer();
      this.collectibles.update(this.elapsed, dt);
      if (this.state === 'PLAYING') {
        this.collectTokens();
        this.score.update(this.player.y);
        this.checkGoalMiss();
        this.checkDeath();
        this.emitHud(dt);
      }
    }

    this.camera.update(dt, this.player.x, this.player.y);
  }

  private collidePlayer(): void {
    if (this.player.vy >= 0) return;
    const cfg = PLAYER_CONFIG;
    const bottom = this.player.y - cfg.bottomOffset;
    const prevBottom = this.player.prevY - cfg.bottomOffset;
    for (const platform of this.platforms.active) {
      const top = platform.topY;
      if (prevBottom >= top - 0.001 && bottom <= top + 0.001) {
        if (Math.abs(this.player.x - platform.x) <= platform.halfWidth + 0.22) {
          this.onLand(platform);
          return;
        }
      }
    }
  }

  private onLand(platform: Platform): void {
    const cfg = PLAYER_CONFIG;
    this.player.entity.setPosition(this.player.x, platform.topY + cfg.bottomOffset, 0);
    this.player.squash();

    if (platform.isGoal) {
      this.completeLevel(platform);
      return;
    }

    const type = platform.def.type;
    let force = cfg.jumpForce;
    if (type === 'bouncy') {
      force = cfg.enhancedJumpForce;
    } else if (type === 'sixtyseven') {
      force = cfg.jumpForce * 1.15;
    }
    this.player.vy = force;

    if (type === 'moving') {
      this.player.vx += platform.vx * 0.85;
    }

    if (this.state !== 'PLAYING') return;

    if (!this.landedPlatforms.has(platform)) {
      this.landedPlatforms.add(platform);
      this.score.addPlatform();
    }
    this.particles.burst('land', this.player.x, platform.topY);
    this.particles.burst('jump', this.player.x, platform.topY + 0.2);
    this.audio.playLand();

    if (type === 'fragile') {
      this.platforms.break(platform);
      this.particles.burst('break', platform.x, platform.topY);
    }

    if (type === 'sixtyseven') {
      this.trigger67(platform);
    }
  }

  private trigger67(platform: Platform): void {
    this.score.addBonus(SCORE_CONFIG.special67Bonus);
    this.particles.burst('special67', platform.x, platform.topY + 0.5);
    this.audio.playSpecial67();
    this.camera.shake(0.25, 0.3);
    this.callbacks.onSpecial67();
    this.emitHudNow();
  }

  private collectTokens(): void {
    const collected = this.collectibles.tryCollect(this.player.x, this.player.y);
    if (collected.length === 0) return;
    for (const c of collected) {
      this.score.addToken();
      this.particles.burst('collect', c.x, c.y);
    }
    this.audio.playCollect();
    this.emitHudNow();
  }

  private checkDeath(): void {
    const deathY = this.camera.y - this.camera.halfHeight - DEATH_MARGIN;
    if (this.player.y < deathY) {
      this.die();
    }
  }

  private checkGoalMiss(): void {
    const goal = this.levels.current.goal;
    if (this.player.y > goal.y + 12) {
      this.completeLevel(this.platforms.active.find((p) => p.isGoal) ?? null);
    }
  }

  private die(): void {
    this.setState('GAME_OVER');
    this.audio.playDeath();
    this.particles.burst('death', this.player.x, this.player.y);
    this.camera.shake(0.4, 0.4);
    const level = this.levels.currentIdValue;
    const score = this.score.score;
    const prevBest = this.storage.getBest(level);
    const isNewBest = this.storage.recordBest(level, score);
    this.callbacks.onGameOver({
      level,
      score,
      tokens: this.score.tokenCount,
      best: Math.max(prevBest, score),
      isNewBest,
    });
  }

  private completeLevel(goal: Platform | null): void {
    this.setState('LEVEL_COMPLETE');
    this.audio.playVictory();
    this.camera.shake(0.3, 0.5);
    const level = this.levels.currentIdValue;
    const score = this.score.score;
    const tokens = this.score.tokenCount;
    this.storage.recordBest(level, score);
    this.storage.unlockLevel(level + 1);
    this.storage.addTokens(tokens);
    const gy = goal ? goal.topY : this.levels.current.goal.y;
    this.particles.burst('confetti', this.levels.current.goal.x, gy + 0.6);
    this.callbacks.onLevelComplete({
      level,
      score,
      tokens,
      totalTokens: this.storage.get().totalTokens,
      nextLevel: this.levels.nextId(),
    });
  }

  private emitHud(dt: number): void {
    this.hudTimer -= dt;
    if (this.hudTimer > 0) return;
    this.emitHudNow();
    this.hudTimer = 0.15;
  }

  private emitHudNow(): void {
    const data: HudData = {
      level: this.levels.currentIdValue,
      tokens: this.score.tokenCount,
      score: this.score.score,
      best: this.storage.getBest(this.levels.currentIdValue),
    };
    if (
      this.lastHud &&
      this.lastHud.score === data.score &&
      this.lastHud.tokens === data.tokens &&
      this.lastHud.level === data.level
    ) {
      return;
    }
    this.lastHud = data;
    this.callbacks.onHudUpdate(data);
  }

  private wrapHalfWidth(): number {
    const device = this.app.graphicsDevice;
    const aspect = device.height > 0 ? device.width / device.height : 0.5;
    return this.camera.halfHeight * aspect + 0.4;
  }

  private loadLevel(id: number): void {
    const level = this.levels.load(id);
    this.background.setTheme(level.theme);
    this.platforms.build(level.platforms, level.goal);
    this.collectibles.build(level.collectibles);
    this.score.reset(level.startY);
    this.player.reset(level.startX, level.startY);
    this.camera.reset(this.player.y);
    this.landedPlatforms.clear();
    this.elapsed = 0;
    this.lastHud = null;
  }

  private setState(state: GameState): void {
    if (this.state === state) return;
    this.state = state;
    this.callbacks.onStateChange(state);
  }

  play(levelId?: number): void {
    if (levelId !== undefined) {
      this.levels.load(levelId);
    }
    this.loadLevel(this.levels.currentIdValue);
    this.controller.setEnabled(true);
    this.audio.unlock();
    this.setState('PLAYING');
  }

  restart(): void {
    this.play(this.levels.currentIdValue);
  }

  nextLevel(): void {
    const next = this.levels.nextId();
    if (next !== null) {
      this.play(next);
    } else {
      this.goMenu();
    }
  }

  goMenu(): void {
    this.controller.setEnabled(false);
    this.loadLevel(this.levels.currentIdValue);
    this.setState('MENU');
  }

  pause(): void {
    if (this.state === 'PLAYING') {
      this.setState('PAUSED');
    }
  }

  resume(): void {
    if (this.state === 'PAUSED') {
      this.setState('PLAYING');
    }
  }

  toggleSound(): boolean {
    const value = !this.storage.get().soundEnabled;
    this.storage.setSoundEnabled(value);
    this.audio.setSoundEnabled(value);
    return value;
  }

  toggleMusic(): boolean {
    const value = !this.storage.get().musicEnabled;
    this.storage.setMusicEnabled(value);
    this.audio.setMusicEnabled(value);
    return value;
  }

  getSaveData() {
    return this.storage.get();
  }

  destroy(): void {
    this.destroyed = true;
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    window.removeEventListener('keydown', this.onGameKeyDown);
    this.controller.destroy();
    this.audio.destroy();
    this.app.destroy();
  }
}
