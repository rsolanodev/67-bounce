import * as pc from 'playcanvas';
import { softCircleTexture } from './TextureFactory';

export type ParticleEffect = 'land' | 'jump' | 'collect' | 'special67' | 'break' | 'death' | 'confetti';

interface EffectConfig {
  lifetime: number;
  rate: number;
  velocity: number;
  radius: number;
  color: [number, number, number];
  blend: number;
}

const EFFECTS: Record<ParticleEffect, EffectConfig> = {
  land: { lifetime: 0.45, rate: 0.012, velocity: 3, radius: 0.3, color: [1, 0.95, 0.82], blend: pc.BLEND_NORMAL },
  jump: { lifetime: 0.3, rate: 0.015, velocity: 2.4, radius: 0.22, color: [0.55, 0.9, 1], blend: pc.BLEND_ADDITIVE },
  collect: { lifetime: 0.5, rate: 0.01, velocity: 4, radius: 0.18, color: [1, 0.85, 0.2], blend: pc.BLEND_ADDITIVE },
  special67: { lifetime: 0.8, rate: 0.008, velocity: 6, radius: 0.4, color: [1, 0.85, 0.2], blend: pc.BLEND_ADDITIVE },
  break: { lifetime: 0.4, rate: 0.012, velocity: 3, radius: 0.35, color: [0.85, 0.6, 1], blend: pc.BLEND_NORMAL },
  death: { lifetime: 0.6, rate: 0.01, velocity: 5, radius: 0.4, color: [1, 0.35, 0.35], blend: pc.BLEND_ADDITIVE },
  confetti: { lifetime: 1.6, rate: 0.012, velocity: 5, radius: 0.5, color: [1, 0.9, 0.3], blend: pc.BLEND_NORMAL },
};

class ParticlePool {
  private entity: pc.Entity;
  private ps: pc.ParticleSystemComponent;
  private remaining = 0;

  constructor(app: pc.Application, tex: pc.Texture, cfg: EffectConfig) {
    this.entity = new pc.Entity('fx');
    this.entity.addComponent('particlesystem', {
      numParticles: Math.ceil(cfg.lifetime / cfg.rate) + 10,
      lifetime: cfg.lifetime,
      rate: cfg.rate,
      loop: false,
      autoPlay: false,
      emitterShape: pc.EMITTERSHAPE_SPHERE,
      emitterRadius: cfg.radius,
      initialVelocity: cfg.velocity,
      colorMap: tex,
      blendType: cfg.blend,
      depthWrite: false,
      sort: pc.PARTICLESORT_NONE,
      orientation: pc.PARTICLEORIENTATION_SCREEN,
      intensity: 1,
    });
    this.ps = this.entity.particlesystem!;
    const [r, g, b] = cfg.color;
    this.ps.colorGraph = new pc.CurveSet([
      [0, r, 1, r],
      [0, g, 1, g],
      [0, b, 1, b],
    ]);
    this.ps.alphaGraph = new pc.Curve([0, 1, 0.55, 0.9, 1, 0]);
    this.entity.enabled = false;
    app.root.addChild(this.entity);
  }

  burst(x: number, y: number, duration: number): void {
    this.entity.setPosition(x, y, 0);
    this.entity.enabled = true;
    this.ps.rate = 0.012;
    this.ps.reset();
    this.ps.play();
    this.remaining = duration;
  }

  update(dt: number): void {
    if (!this.entity.enabled) return;
    this.remaining -= dt;
    if (this.remaining <= 0) {
      this.ps.stop();
      this.entity.enabled = false;
    }
  }
}

export class ParticleManager {
  private pools = new Map<ParticleEffect, ParticlePool>();
  private tex: pc.Texture;

  constructor(private app: pc.Application) {
    this.tex = softCircleTexture(app.graphicsDevice);
  }

  private pool(effect: ParticleEffect): ParticlePool {
    let pool = this.pools.get(effect);
    if (!pool) {
      pool = new ParticlePool(this.app, this.tex, EFFECTS[effect]);
      this.pools.set(effect, pool);
    }
    return pool;
  }

  burst(effect: ParticleEffect, x: number, y: number): void {
    const cfg = EFFECTS[effect];
    this.pool(effect).burst(x, y, Math.min(0.25, cfg.lifetime * 0.5));
  }

  update(dt: number): void {
    for (const pool of this.pools.values()) {
      pool.update(dt);
    }
  }
}
