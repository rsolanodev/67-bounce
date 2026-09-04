export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'LEVEL_COMPLETE';

export interface HudData {
  level: number;
  tokens: number;
  score: number;
  best: number;
}

export interface GameResult {
  level: number;
  score: number;
  tokens: number;
  best: number;
  isNewBest: boolean;
}

export interface LevelCompleteData {
  level: number;
  score: number;
  tokens: number;
  totalTokens: number;
  nextLevel: number | null;
}

export interface GameCallbacks {
  onStateChange: (state: GameState) => void;
  onHudUpdate: (hud: HudData) => void;
  onGameOver: (result: GameResult) => void;
  onLevelComplete: (data: LevelCompleteData) => void;
  onSpecial67: () => void;
}
