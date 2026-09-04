import { TILT_CONFIG } from '../GameConfig';

export interface TiltMappingConfig {
  deadzoneDeg: number;
  maxTiltDeg: number;
}

export function tiltToAxis(gamma: number, calibration: number, cfg: TiltMappingConfig): number {
  const raw = gamma - calibration;
  const deadzone = cfg.deadzoneDeg;
  const abs = Math.abs(raw);
  if (abs <= deadzone) return 0;
  const t = Math.min((abs - deadzone) / Math.max(cfg.maxTiltDeg - deadzone, 0.001), 1);
  const curve = Math.pow(t, 1.6);
  return raw > 0 ? curve : -curve;
}

const DEBUG_KEY = '__debugTilt';

function readDebugGamma(): number | null {
  if (typeof window !== 'undefined') {
    const live = (window as unknown as Record<string, unknown>)[DEBUG_KEY];
    if (typeof live === 'number') return live;
    const param = new URLSearchParams(window.location.search).get('tilt');
    if (param !== null && param !== '') {
      const value = Number(param);
      if (Number.isFinite(value)) return value;
    }
  }
  return null;
}

export class TiltController {
  private active = false;
  private filtered = 0;
  private calibration = 0;
  private calibrationSum = 0;
  private eventCount = 0;
  private lastEventAt = -Infinity;
  private debugTimer: number | null = null;
  private debugMode = false;
  private invert = true;

  private onDeviceOrientation = (e: DeviceOrientationEvent): void => {
    this.ingest(e.gamma);
  };

  private ingest(gamma: number | null | undefined): void {
    if (typeof gamma !== 'number' || Number.isNaN(gamma) || !Number.isFinite(gamma)) return;
    this.eventCount++;
    this.lastEventAt = performance.now();

    if (this.eventCount === 1) {
      this.filtered = gamma;
    }
    this.filtered += (gamma - this.filtered) * TILT_CONFIG.smoothingAlpha;

    if (!this.debugMode && this.eventCount <= TILT_CONFIG.calibrationEventCount) {
      this.calibrationSum += gamma;
      this.calibration = this.calibrationSum / this.eventCount;
    }
  }

  start(): void {
    if (this.active) return;
    this.reset();
    this.active = true;
    if (typeof window !== 'undefined') {
      window.addEventListener('deviceorientation', this.onDeviceOrientation);
      this.startDebugSimulation();
    }
  }

  stop(): void {
    if (!this.active) return;
    this.active = false;
    if (typeof window !== 'undefined') {
      window.removeEventListener('deviceorientation', this.onDeviceOrientation);
    }
    this.stopDebugSimulation();
  }

  reset(): void {
    this.filtered = 0;
    this.calibration = 0;
    this.calibrationSum = 0;
    this.eventCount = 0;
    this.lastEventAt = -Infinity;
  }

  get axis(): number {
    if (!this.active) return 0;
    if (performance.now() - this.lastEventAt > TILT_CONFIG.staleAfterMs) return 0;
    const value = tiltToAxis(this.filtered, this.calibration, TILT_CONFIG);
    return this.invert ? -value : value;
  }

  setInvert(invert: boolean): void {
    this.invert = invert;
  }

  get eventCountValue(): number {
    return this.eventCount;
  }

  injectGamma(gamma: number): void {
    this.ingest(gamma);
  }

  private startDebugSimulation(): void {
    this.stopDebugSimulation();
    const initial = readDebugGamma();
    if (initial === null) return;
    this.debugMode = true;
    this.debugTimer = window.setInterval(() => {
      const value: unknown = (window as unknown as Record<string, unknown>)[DEBUG_KEY];
      const gamma = typeof value === 'number' ? value : initial;
      this.ingest(gamma);
    }, 16);
  }

  private stopDebugSimulation(): void {
    if (this.debugTimer !== null) {
      window.clearInterval(this.debugTimer);
      this.debugTimer = null;
    }
  }
}
