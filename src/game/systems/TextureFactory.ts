import * as pc from 'playcanvas';

export type CanvasDraw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

export function makeCanvasTexture(device: pc.GraphicsDevice, width: number, height: number, draw: CanvasDraw): pc.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    draw(ctx, width, height);
  }
  const tex = new pc.Texture(device);
  tex.setSource(canvas);
  tex.minFilter = pc.FILTER_LINEAR;
  tex.magFilter = pc.FILTER_LINEAR;
  tex.addressU = pc.ADDRESS_CLAMP_TO_EDGE;
  tex.addressV = pc.ADDRESS_CLAMP_TO_EDGE;
  tex.upload();
  return tex;
}

export function softCircleTexture(device: pc.GraphicsDevice): pc.Texture {
  return makeCanvasTexture(device, 64, 64, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.5, 'rgba(255,255,255,0.85)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });
}

export function gradientTexture(device: pc.GraphicsDevice, top: string, bottom: string): pc.Texture {
  return makeCanvasTexture(device, 8, 512, (ctx, _w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, top);
    g.addColorStop(1, bottom);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 8, h);
  });
}

export function starsTexture(device: pc.GraphicsDevice): pc.Texture {
  return makeCanvasTexture(device, 512, 2048, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    let seed = 1337;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < 220; i++) {
      const x = rand() * w;
      const y = rand() * h;
      const r = 0.6 + rand() * 1.6;
      const a = 0.25 + rand() * 0.75;
      ctx.fillStyle = `rgba(255,255,255,${a.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

export function moonTexture(device: pc.GraphicsDevice): pc.Texture {
  return makeCanvasTexture(device, 256, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h / 2;
    const r = w / 2 - 6;
    const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
    g.addColorStop(0, '#fff7e0');
    g.addColorStop(1, '#f2cf8e');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(160,120,60,0.35)';
    const craters: Array<[number, number, number]> = [
      [cx - r * 0.35, cy - r * 0.2, r * 0.16],
      [cx + r * 0.25, cy + r * 0.15, r * 0.22],
      [cx + r * 0.05, cy - r * 0.45, r * 0.1],
      [cx - r * 0.1, cy + r * 0.4, r * 0.12],
    ];
    for (const [x, y, cr] of craters) {
      ctx.beginPath();
      ctx.arc(x, y, cr, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

export function signTexture(device: pc.GraphicsDevice, text: string, sub?: string): pc.Texture {
  return makeCanvasTexture(device, 512, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(12,12,28,0.85)';
    const radius = 32;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(w - radius, 0);
    ctx.quadraticCurveTo(w, 0, w, radius);
    ctx.lineTo(w, h - radius);
    ctx.quadraticCurveTo(w, h, w - radius, h);
    ctx.lineTo(radius, h);
    ctx.quadraticCurveTo(0, h, 0, h - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 10;
    ctx.stroke();
    ctx.fillStyle = '#ffd700';
    ctx.font = '900 130px "Arial Black", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 30;
    ctx.fillText(text, w / 2, sub ? h / 2 - 34 : h / 2);
    if (sub) {
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 44px Arial, sans-serif';
      ctx.fillText(sub, w / 2, h / 2 + 62);
    }
  });
}

export function coinFaceTexture(device: pc.GraphicsDevice): pc.Texture {
  return makeCanvasTexture(device, 128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#b8860b';
    ctx.fillRect(0, 0, w, h);
    const g = ctx.createRadialGradient(w / 2, h / 2, 8, w / 2, h / 2, w / 2);
    g.addColorStop(0, '#ffe14d');
    g.addColorStop(0.8, '#f4b400');
    g.addColorStop(1, '#b8860b');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#8a6508';
    ctx.lineWidth = 10;
    ctx.strokeRect(4, 4, w - 8, h - 8);
    ctx.fillStyle = '#7a4d00';
    ctx.font = '900 72px "Arial Black", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('67', w / 2, h / 2 + 4);
  });
}

export function goalBannerTexture(device: pc.GraphicsDevice): pc.Texture {
  return makeCanvasTexture(device, 256, 128, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(10,10,30,0.9)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ffd700';
    ctx.font = '900 96px "Arial Black", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 26;
    ctx.fillText('GOAL', w / 2, h / 2);
  });
}
