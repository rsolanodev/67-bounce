import * as pc from 'playcanvas';
import { CAMERA_CONFIG } from '../GameConfig';

export class CameraController {
  private entity: pc.Entity;
  x = 0;
  y = 0;
  private shakeTime = 0;
  private shakeAmp = 0;

  constructor(app: pc.Application) {
    this.entity = new pc.Entity('camera');
    this.entity.addComponent('camera', {
      fov: CAMERA_CONFIG.fov,
      nearClip: 0.1,
      farClip: 600,
      clearColor: new pc.Color(0.03, 0.04, 0.1),
    });
    this.entity.setPosition(0, 0, CAMERA_CONFIG.distance);
    app.root.addChild(this.entity);
  }

  get halfHeight(): number {
    return Math.tan((CAMERA_CONFIG.fov * Math.PI) / 360) * CAMERA_CONFIG.distance;
  }

  reset(playerY: number): void {
    this.x = 0;
    this.y = playerY - this.halfHeight * CAMERA_CONFIG.bottomRatio;
    this.shakeTime = 0;
    this.apply();
  }

  update(dt: number, playerX: number, playerY: number): void {
    const targetY = playerY - this.halfHeight * CAMERA_CONFIG.bottomRatio;
    if (targetY > this.y) {
      const k = 1 - Math.exp(-CAMERA_CONFIG.followSmoothing * dt);
      this.y += (targetY - this.y) * k;
    }
    const targetX = Math.max(
      -CAMERA_CONFIG.maxXFollow,
      Math.min(CAMERA_CONFIG.maxXFollow, playerX * CAMERA_CONFIG.xFollow),
    );
    const kx = 1 - Math.exp(-CAMERA_CONFIG.horizontalSmoothing * dt);
    this.x += (targetX - this.x) * kx;
    if (this.shakeTime > 0) {
      this.shakeTime = Math.max(0, this.shakeTime - dt);
    }
    this.apply();
  }

  shake(amplitude: number, duration: number): void {
    this.shakeAmp = amplitude;
    this.shakeTime = duration;
  }

  private apply(): void {
    let ox = 0;
    let oy = 0;
    if (this.shakeTime > 0) {
      const falloff = this.shakeTime / 0.3;
      ox = (Math.random() - 0.5) * this.shakeAmp * falloff;
      oy = (Math.random() - 0.5) * this.shakeAmp * falloff;
    }
    this.entity.setPosition(this.x + ox, this.y + oy, CAMERA_CONFIG.distance);
    this.entity.lookAt(this.x + ox, this.y + oy, 0);
  }
}
