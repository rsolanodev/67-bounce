import * as pc from 'playcanvas';
import { PLAYER_CONFIG } from '../GameConfig';

type PrimType = 'box' | 'sphere' | 'cylinder' | 'capsule';

function approach(current: number, target: number, maxDelta: number): number {
  if (current < target) return Math.min(target, current + maxDelta);
  if (current > target) return Math.max(target, current - maxDelta);
  return target;
}

export class Player {
  readonly entity: pc.Entity;
  private model: pc.Entity;
  private sx = 1;
  private sy = 1;

  vx = 0;
  vy = 0;
  prevY = 0;
  facing = 1;

  constructor(app: pc.Application) {
    this.entity = new pc.Entity('player');
    this.model = this.buildModel();
    this.entity.addChild(this.model);
    this.entity.setPosition(0, 1, 0);
    app.root.addChild(this.entity);
  }

  get x(): number {
    return this.entity.getPosition().x;
  }

  get y(): number {
    return this.entity.getPosition().y;
  }

  private prim(type: PrimType, color: string, opts?: { emissive?: number; sx?: number; sy?: number; sz?: number }): pc.Entity {
    const e = new pc.Entity();
    e.addComponent('render', { type });
    const mat = new pc.StandardMaterial();
    mat.diffuse = new pc.Color().fromString(color);
    if (opts?.emissive) {
      mat.emissive = new pc.Color().fromString(color);
      mat.emissiveIntensity = opts.emissive;
    }
    mat.update();
    e.render!.material = mat;
    e.setLocalScale(opts?.sx ?? 1, opts?.sy ?? 1, opts?.sz ?? 1);
    return e;
  }

  private buildModel(): pc.Entity {
    const model = new pc.Entity('model');

    const body = this.prim('sphere', '#3ecf7e', { emissive: 0.08, sx: 0.84, sy: 0.8, sz: 0.84 });
    model.addChild(body);

    const belly = this.prim('sphere', '#d3f6dd', { sx: 0.55, sy: 0.46, sz: 0.42 });
    belly.setLocalPosition(0, -0.08, 0.28);
    model.addChild(belly);

    const eyeL = this.prim('sphere', '#ffffff', { emissive: 0.9, sx: 0.3, sy: 0.3, sz: 0.22 });
    eyeL.setLocalPosition(-0.17, 0.13, 0.4);
    model.addChild(eyeL);

    const eyeR = this.prim('sphere', '#ffffff', { emissive: 0.9, sx: 0.3, sy: 0.3, sz: 0.22 });
    eyeR.setLocalPosition(0.17, 0.13, 0.4);
    model.addChild(eyeR);

    const pupilL = this.prim('sphere', '#101018', { sx: 0.14, sy: 0.16, sz: 0.1 });
    pupilL.setLocalPosition(-0.16, 0.12, 0.55);
    model.addChild(pupilL);

    const pupilR = this.prim('sphere', '#101018', { sx: 0.14, sy: 0.16, sz: 0.1 });
    pupilR.setLocalPosition(0.16, 0.12, 0.55);
    model.addChild(pupilR);

    const mouth = this.prim('sphere', '#1c2430', { sx: 0.26, sy: 0.12, sz: 0.1 });
    mouth.setLocalPosition(0, -0.2, 0.48);
    model.addChild(mouth);

    const cheekL = this.prim('sphere', '#ff9db3', { sx: 0.18, sy: 0.14, sz: 0.1 });
    cheekL.setLocalPosition(-0.3, -0.08, 0.36);
    model.addChild(cheekL);

    const cheekR = this.prim('sphere', '#ff9db3', { sx: 0.18, sy: 0.14, sz: 0.1 });
    cheekR.setLocalPosition(0.3, -0.08, 0.36);
    model.addChild(cheekR);

    const antenna = this.prim('cylinder', '#2f9e63', { sx: 0.05, sy: 0.42, sz: 0.05 });
    antenna.setLocalPosition(0.12, 0.62, 0);
    antenna.setLocalEulerAngles(0, 0, -18);
    model.addChild(antenna);

    const bulb = this.prim('sphere', '#ffd700', { emissive: 1.1, sx: 0.16, sy: 0.16, sz: 0.16 });
    bulb.setLocalPosition(0.24, 0.78, 0);
    model.addChild(bulb);

    return model;
  }

  reset(x: number, y: number): void {
    this.entity.setPosition(x, y, 0);
    this.vx = 0;
    this.vy = 0;
    this.prevY = y;
    this.sx = 1;
    this.sy = 1;
    this.applyScale();
  }

  update(dt: number, axis: number, halfWidth: number): void {
    const cfg = PLAYER_CONFIG;
    const target = axis * cfg.moveSpeed;
    if (axis !== 0) {
      this.vx = approach(this.vx, target, cfg.acceleration * dt);
    } else {
      this.vx = approach(this.vx, 0, cfg.horizontalDamping * dt);
    }

    this.prevY = this.y;
    this.vy += cfg.gravity * dt;
    if (this.vy < cfg.maxFallSpeed) {
      this.vy = cfg.maxFallSpeed;
    }

    const x = this.x + this.vx * dt;
    const y = this.y + this.vy * dt;
    this.entity.setPosition(x, y, 0);

    if (x > halfWidth) this.entity.setPosition(-halfWidth, y, 0);
    if (x < -halfWidth) this.entity.setPosition(halfWidth, y, 0);

    if (this.vx > 0.2) this.facing = 1;
    else if (this.vx < -0.2) this.facing = -1;

    const lean = Math.max(-0.4, Math.min(0.4, this.vx * 0.06)) * this.facing;
    this.model.setLocalEulerAngles(0, 0, -lean);

    this.sx += (1 - this.sx) * Math.min(1, 10 * dt);
    this.sy += (1 - this.sy) * Math.min(1, 10 * dt);
    this.applyScale();
  }

  squash(): void {
    this.sx = 1.32;
    this.sy = 0.68;
  }

  private applyScale(): void {
    this.model.setLocalScale(this.sx, this.sy, 1);
  }
}
