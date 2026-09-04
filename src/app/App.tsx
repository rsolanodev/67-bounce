import { useEffect, useRef, useState } from 'react';
import { Game } from '../game/Game';
import type { GameResult, GameState, HudData, LevelCompleteData } from '../game/state/GameState';
import type { SaveData } from '../game/systems/Storage';
import { MainMenu } from '../ui/MainMenu';
import { HUD } from '../ui/HUD';
import { PauseMenu } from '../ui/PauseMenu';
import { GameOver } from '../ui/GameOver';
import { LevelComplete } from '../ui/LevelComplete';

interface MenuState {
  unlockedLevel: number;
  totalTokens: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  controlMode: 'tilt' | 'touch';
  invertTilt: boolean;
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [state, setState] = useState<GameState>('MENU');
  const [hud, setHud] = useState<HudData>({ level: 1, tokens: 0, score: 0, best: 0 });
  const [result, setResult] = useState<GameResult | null>(null);
  const [complete, setComplete] = useState<LevelCompleteData | null>(null);
  const [showSpecial67, setShowSpecial67] = useState(false);
  const [menu, setMenu] = useState<MenuState>({
    unlockedLevel: 1,
    totalTokens: 0,
    soundEnabled: true,
    musicEnabled: true,
    controlMode: 'tilt',
    invertTilt: true,
  });
  const [showCalibrationHint, setShowCalibrationHint] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const game = new Game(canvas, {
      onStateChange: (s) => setState(s),
      onHudUpdate: (h) => setHud(h),
      onGameOver: (r) => setResult(r),
      onLevelComplete: (d) => {
        setComplete(d);
        setMenu(menuFromSave(game.getSaveData()));
      },
      onSpecial67: () => {
        setShowSpecial67(true);
        window.setTimeout(() => setShowSpecial67(false), 1600);
      },
      onTiltHint: () => {
        setShowCalibrationHint(true);
        window.setTimeout(() => setShowCalibrationHint(false), 1800);
      },
    });
    gameRef.current = game;
    setMenu(menuFromSave(game.getSaveData()));
    return () => {
      game.destroy();
      gameRef.current = null;
    };
  }, []);

  const syncMenu = (): void => {
    const game = gameRef.current;
    if (game) setMenu(menuFromSave(game.getSaveData()));
  };

  return (
    <div className="game-root">
      <canvas ref={canvasRef} className="game-canvas" />
      {state === 'MENU' && (
        <MainMenu
          menu={menu}
          onPlay={() => gameRef.current?.play()}
          onSelectLevel={(id) => gameRef.current?.play(id)}
          onToggleSound={() => {
            gameRef.current?.toggleSound();
            syncMenu();
          }}
          onToggleMusic={() => {
            gameRef.current?.toggleMusic();
            syncMenu();
          }}
          onToggleControl={() => {
            gameRef.current?.toggleControlMode();
            syncMenu();
          }}
          onToggleInvert={() => {
            gameRef.current?.toggleInvertTilt();
            syncMenu();
          }}
        />
      )}
      {state === 'PLAYING' && <HUD hud={hud} onPause={() => gameRef.current?.pause()} />}
      {state === 'PAUSED' && (
        <PauseMenu
          onResume={() => gameRef.current?.resume()}
          onRestart={() => gameRef.current?.restart()}
          onMenu={() => gameRef.current?.goMenu()}
        />
      )}
      {state === 'GAME_OVER' && result && (
        <GameOver result={result} onRetry={() => gameRef.current?.restart()} onMenu={() => gameRef.current?.goMenu()} />
      )}
      {state === 'LEVEL_COMPLETE' && complete && (
        <LevelComplete
          data={complete}
          onNext={() => gameRef.current?.nextLevel()}
          onMenu={() => gameRef.current?.goMenu()}
        />
      )}
      {showSpecial67 && <div className="special67-pop">67!!!</div>}
      {showCalibrationHint && <div className="calibration-hint">Mantén el móvil recto</div>}
    </div>
  );
}

function menuFromSave(save: SaveData): MenuState {
  return {
    unlockedLevel: save.unlockedLevel,
    totalTokens: save.totalTokens,
    soundEnabled: save.soundEnabled,
    musicEnabled: save.musicEnabled,
    controlMode: save.controlMode,
    invertTilt: save.invertTilt,
  };
}
