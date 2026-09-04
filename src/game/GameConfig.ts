export const PLAYER_CONFIG = {
  moveSpeed: 5.2,
  acceleration: 32,
  horizontalDamping: 14,
  gravity: -20,
  jumpForce: 9.5,
  enhancedJumpForce: 13,
  maxFallSpeed: -14,
  radius: 0.32,
  bottomOffset: 0.42,
};

export const CAMERA_CONFIG = {
  fov: 60,
  distance: 20,
  followSmoothing: 5,
  horizontalSmoothing: 4,
  bottomRatio: 0.38,
  xFollow: 0.3,
  maxXFollow: 1.6,
};

export const SCORE_CONFIG = {
  heightPerUnit: 10,
  tokenValue: 100,
  platformValue: 25,
  special67Bonus: 500,
};

export const TILT_CONFIG = {
  deadzoneDeg: 3,
  maxTiltDeg: 22,
  smoothingAlpha: 0.18,
  calibrationEventCount: 40,
  calibrationTimeout: 2000,
  staleAfterMs: 500,
};

export const CONTROL_DEFAULT: ControlMode = 'tilt';

export type ControlMode = 'tilt' | 'touch';

export const DEATH_MARGIN = 2.5;

export const STORAGE_KEY = 'sixtyseven-bounce-save';
