import type { ControlMode } from '../GameConfig';
import { TiltController } from './TiltController';

export class PlayerController {
  private left = false;
  private right = false;
  private dragging = false;
  private dragStartX = 0;
  private dragCurrentX = 0;
  private enabled = false;
  private tiltEnabled = false;
  private controlMode: ControlMode;
  private tilt = new TiltController();

  private onKeyDown = (e: KeyboardEvent): void => {
    const key = e.key.toLowerCase();
    if (key === 'a' || key === 'arrowleft') {
      this.left = true;
      if (key === 'arrowleft') e.preventDefault();
    }
    if (key === 'd' || key === 'arrowright') {
      this.right = true;
      if (key === 'arrowright') e.preventDefault();
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    const key = e.key.toLowerCase();
    if (key === 'a' || key === 'arrowleft') this.left = false;
    if (key === 'd' || key === 'arrowright') this.right = false;
  };

  private onPointerDown = (e: PointerEvent): void => {
    this.dragging = true;
    this.dragStartX = e.clientX;
    this.dragCurrentX = e.clientX;
  };

  private onPointerMove = (e: PointerEvent): void => {
    if (this.dragging) {
      this.dragCurrentX = e.clientX;
    }
  };

  private onPointerUp = (): void => {
    this.dragging = false;
  };

  private onTouchMove = (e: TouchEvent): void => {
    e.preventDefault();
  };

  constructor(private canvas: HTMLCanvasElement, controlMode: ControlMode, invertTilt: boolean) {
    this.controlMode = controlMode;
    this.tilt.setInvert(invertTilt);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    canvas.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);
    canvas.addEventListener('touchmove', this.onTouchMove, { passive: false });
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.dragging = false;
      this.left = false;
      this.right = false;
      this.setTiltEnabled(false);
    }
  }

  setControlMode(mode: ControlMode): void {
    this.controlMode = mode;
    if (mode !== 'tilt') {
      this.setTiltEnabled(false);
    }
  }

  setInvertTilt(invert: boolean): void {
    this.tilt.setInvert(invert);
  }

  setTiltEnabled(enabled: boolean): void {
    this.tiltEnabled = enabled && this.controlMode === 'tilt';
    if (this.tiltEnabled) {
      this.tilt.start();
      this.checkSensorAvailable();
    } else {
      this.tilt.stop();
      this.tilt.reset();
    }
  }

  private checkSensorAvailable(): void {
    window.setTimeout(() => {
      if (this.tiltEnabled && this.tilt.eventCountValue === 0) {
        this.setTiltEnabled(false);
        this.dragging = false;
      }
    }, 2500);
  }

  getAxis(): number {
    if (!this.enabled) return 0;
    let key = 0;
    if (this.left) key -= 1;
    if (this.right) key += 1;
    if (key !== 0) return key;
    if (this.tiltEnabled) {
      return this.tilt.axis;
    }
    if (this.dragging) {
      const dx = this.dragCurrentX - this.dragStartX;
      return Math.max(-1, Math.min(1, dx / 50));
    }
    return 0;
  }

  destroy(): void {
    this.setTiltEnabled(false);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
    this.canvas.removeEventListener('touchmove', this.onTouchMove);
  }
}
