import * as pc from 'playcanvas';
import { gradientTexture, moonTexture, signTexture, starsTexture } from './TextureFactory';

export interface Theme {
  top: string;
  bottom: string;
}

export const THEMES: Record<string, Theme> = {
  space: { top: '#0b1026', bottom: '#3b1e6e' },
  twilight: { top: '#2b1a5e', bottom: '#e2603f' },
  sky: { top: '#0f2f7a', bottom: '#5fc4ff' },
  clouds: { top: '#0e7490', bottom: '#ffe9b3' },
  sixtyseven: { top: '#0e0e24', bottom: '#5b2edb' },
};

const BG_WIDTH = 120;
const BG_HEIGHT = 150;

export class BackgroundController {
  private gradientMat: pc.StandardMaterial;
  private gradientTex: pc.Texture | null = null;

  constructor(private app: pc.Application, midY: number) {
    const device = app.graphicsDevice;

    const gradientEntity = new pc.Entity('bg-gradient');
    gradientEntity.addComponent('render', { type: 'box' });
    gradientEntity.setLocalPosition(0, midY, -40);
    gradientEntity.setLocalScale(BG_WIDTH, BG_HEIGHT, 0.01);
    this.gradientMat = new pc.StandardMaterial();
    this.gradientMat.useLighting = false;
    this.gradientMat.update();
    gradientEntity.render!.material = this.gradientMat;
    app.root.addChild(gradientEntity);

    const starsMat = new pc.StandardMaterial();
    starsMat.useLighting = false;
    starsMat.diffuseMap = starsTexture(device);
    starsMat.opacity = 1;
    starsMat.update();
    const starsEntity = new pc.Entity('bg-stars');
    starsEntity.addComponent('render', { type: 'box' });
    starsEntity.setLocalPosition(0, midY, -39);
    starsEntity.setLocalScale(BG_WIDTH, BG_HEIGHT, 0.01);
    starsEntity.render!.material = starsMat;
    app.root.addChild(starsEntity);

    const moonMat = new pc.StandardMaterial();
    moonMat.useLighting = false;
    moonMat.diffuseMap = moonTexture(device);
    moonMat.opacityMap = moonMat.diffuseMap;
    moonMat.opacityMapChannel = 'a';
    moonMat.blendType = pc.BLEND_NORMAL;
    moonMat.cull = pc.CULLFACE_NONE;
    moonMat.update();
    const moonEntity = new pc.Entity('bg-moon');
    moonEntity.addComponent('render', { type: 'box' });
    moonEntity.setLocalPosition(8, midY + 40, -38);
    moonEntity.setLocalScale(8, 8, 0.01);
    moonEntity.render!.material = moonMat;
    app.root.addChild(moonEntity);

    const signDefs: Array<[number, number, number]> = [
      [-9, midY + 16, -4],
      [9, midY - 8, 5],
      [-7, midY - 34, -8],
      [7, midY + 52, 3],
    ];
    for (const [x, y, tilt] of signDefs) {
      const signMat = new pc.StandardMaterial();
      signMat.useLighting = false;
      signMat.diffuseMap = signTexture(device, '67');
      signMat.opacityMap = signMat.diffuseMap;
      signMat.opacityMapChannel = 'a';
      signMat.blendType = pc.BLEND_NORMAL;
      signMat.cull = pc.CULLFACE_NONE;
      signMat.update();
      const sign = new pc.Entity('bg-sign');
      sign.addComponent('render', { type: 'box' });
      sign.setLocalPosition(x, y, -37);
      sign.setLocalScale(3.2, 1.6, 0.01);
      sign.setLocalEulerAngles(0, 0, tilt);
      sign.render!.material = signMat;
      app.root.addChild(sign);
    }
  }

  setTheme(theme: string): void {
    const t = THEMES[theme] ?? THEMES.space;
    if (this.gradientTex) {
      this.gradientTex.destroy();
    }
    this.gradientTex = gradientTexture(this.app.graphicsDevice, t.top, t.bottom);
    this.gradientMat.diffuseMap = this.gradientTex;
    this.gradientMat.update();
  }
}
