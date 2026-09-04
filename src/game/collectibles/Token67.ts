import * as pc from 'playcanvas';
import { coinFaceTexture } from '../systems/TextureFactory';

export class Token67 {
  readonly entity: pc.Entity;
  private spin: pc.Entity;
  private baseY: number;
  private phase: number;
  private collected = false;

  constructor(app: pc.Application, x: number, y: number) {
    this.baseY = y;
    this.phase = Math.random() * Math.PI * 2;

    this.entity = new pc.Entity('token67');
    this.entity.setLocalPosition(x, y, 0);

    this.spin = new pc.Entity('spin');
    this.entity.addChild(this.spin);

    const goldMat = new pc.StandardMaterial();
    goldMat.diffuse = new pc.Color().fromString('#f4b400');
    goldMat.emissive = new pc.Color().fromString('#ffd700');
    goldMat.emissiveIntensity = 0.75;
    goldMat.update();

    const coin = new pc.Entity('coin');
    coin.addComponent('render', { type: 'cylinder' });
    coin.setLocalScale(0.62, 0.14, 0.62);
    coin.render!.material = goldMat;
    this.spin.addChild(coin);

    const faceMat = new pc.StandardMaterial();
    faceMat.diffuseMap = coinFaceTexture(app.graphicsDevice);
    faceMat.emissiveMap = faceMat.diffuseMap;
    faceMat.emissive = new pc.Color(1, 1, 1);
    faceMat.emissiveIntensity = 0.5;
    faceMat.cull = pc.CULLFACE_NONE;
    faceMat.update();

    const face = new pc.Entity('face');
    face.addComponent('render', { type: 'box' });
    face.setLocalScale(0.42, 0.42, 0.24);
    face.render!.material = faceMat;
    this.spin.addChild(face);

    app.root.addChild(this.entity);
  }

  get x(): number {
    return this.entity.getPosition().x;
  }

  get y(): number {
    return this.entity.getPosition().y;
  }

  update(time: number, dt: number): void {
    if (this.collected) return;
    this.spin.rotate(0, 90 * dt, 0);
    const bob = Math.sin(time * 2 + this.phase) * 0.15;
    this.entity.setLocalPosition(this.entity.getPosition().x, this.baseY + bob, 0);
  }

  collect(): void {
    this.collected = true;
    this.entity.enabled = false;
  }

  isCollected(): boolean {
    return this.collected;
  }
}
