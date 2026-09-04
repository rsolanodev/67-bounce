import * as pc from 'playcanvas';
import type { PlatformDefinition, PlatformType } from '../levels/LevelDefinition';
import { signTexture } from '../systems/TextureFactory';

const COLORS: Record<PlatformType, { main: string; top: string }> = {
  normal: { main: '#5a8dff', top: '#cfe0ff' },
  moving: { main: '#ff9f4d', top: '#ffe3c4' },
  bouncy: { main: '#7ce05a', top: '#e2ffd2' },
  fragile: { main: '#d98fff', top: '#f3e0ff' },
  sixtyseven: { main: '#ffd700', top: '#fff3b0' },
};

export class Platform {
  readonly entity: pc.Entity;
  readonly def: PlatformDefinition;
  readonly isGoal: boolean;
  state: 'active' | 'broken' = 'active';
  topY: number;
  halfWidth: number;
  baseX: number;
  private amplitude: number;
  private speed: number;
  private phase: number;
  private sign?: pc.Entity;

  constructor(app: pc.Application, def: PlatformDefinition, isGoal: boolean) {
    this.def = def;
    this.isGoal = isGoal;
    this.topY = def.y;
    this.halfWidth = def.width / 2;
    this.baseX = def.x;
    this.amplitude = def.moving?.amplitude ?? 0;
    this.speed = def.moving?.speed ?? 0;
    this.phase = def.moving?.phase ?? 0;

    this.entity = new pc.Entity(`platform-${def.type}`);
    this.entity.setLocalPosition(def.x, def.y - 0.16, 0);

    const colors = isGoal
      ? { main: '#ffd700', top: '#fff3b0' }
      : COLORS[def.type] ?? COLORS.normal;

    const bodyMat = new pc.StandardMaterial();
    bodyMat.diffuse = new pc.Color().fromString(colors.main);
    bodyMat.emissive = new pc.Color().fromString(colors.main);
    bodyMat.emissiveIntensity = isGoal || def.type === 'sixtyseven' ? 0.35 : 0.06;
    bodyMat.update();

    const body = new pc.Entity('body');
    body.addComponent('render', { type: 'box' });
    body.setLocalScale(def.width, 0.32, 0.9);
    body.render!.material = bodyMat;
    this.entity.addChild(body);

    const topMat = new pc.StandardMaterial();
    topMat.diffuse = new pc.Color().fromString(colors.top);
    topMat.emissive = new pc.Color().fromString(colors.top);
    topMat.emissiveIntensity = 0.15;
    topMat.update();

    const top = new pc.Entity('top');
    top.addComponent('render', { type: 'box' });
    top.setLocalPosition(0, 0.12, 0);
    top.setLocalScale(def.width, 0.1, 0.94);
    top.render!.material = topMat;
    this.entity.addChild(top);

    if (def.type === 'sixtyseven' || isGoal) {
      const signMat = new pc.StandardMaterial();
      signMat.useLighting = false;
      signMat.diffuseMap = signTexture(app.graphicsDevice, isGoal ? '67' : '67');
      signMat.opacityMap = signMat.diffuseMap;
      signMat.opacityMapChannel = 'a';
      signMat.blendType = pc.BLEND_NORMAL;
      signMat.cull = pc.CULLFACE_NONE;
      signMat.update();
      this.sign = new pc.Entity('sign');
      this.sign.addComponent('render', { type: 'box' });
      this.sign.setLocalPosition(0, isGoal ? 1.35 : 0.95, -0.7);
      this.sign.setLocalScale(isGoal ? 2.2 : 1.5, isGoal ? 1.1 : 0.75, 0.01);
      this.sign.render!.material = signMat;
      this.entity.addChild(this.sign);
    }

    app.root.addChild(this.entity);
  }

  get x(): number {
    return this.entity.getPosition().x;
  }

  get vx(): number {
    if (!this.def.moving) return 0;
    return this.amplitude * this.speed * Math.cos(this.phase);
  }

  update(time: number): void {
    if (this.state !== 'active' || !this.def.moving) return;
    const offset = Math.sin(time * this.speed + this.phase) * this.amplitude;
    this.entity.setLocalPosition(this.baseX + offset, this.topY - 0.16, 0);
  }

  break(): void {
    this.state = 'broken';
    this.entity.enabled = false;
  }
}
