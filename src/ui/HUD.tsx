import type { HudData } from '../game/state/GameState';

interface HUDProps {
  hud: HudData;
  onPause: () => void;
}

export function HUD({ hud, onPause }: HUDProps) {
  return (
    <div className="hud">
      <div className="hud-left">
        <span className="coin-mini">67</span>
        <span key={hud.tokens} className="hud-tokens pop">
          {hud.tokens}
        </span>
      </div>
      <div className="hud-center">LV {String(hud.level).padStart(2, '0')}</div>
      <div className="hud-right">
        <span className="hud-score">{hud.score.toLocaleString()}</span>
        <button className="btn-icon" onClick={onPause} aria-label="Pause">
          ⏸
        </button>
      </div>
    </div>
  );
}
