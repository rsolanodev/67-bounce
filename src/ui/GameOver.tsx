import type { GameResult } from '../game/state/GameState';

interface GameOverProps {
  result: GameResult;
  onRetry: () => void;
  onMenu: () => void;
}

export function GameOver({ result, onRetry, onMenu }: GameOverProps) {
  return (
    <div className="overlay">
      <div className="panel">
        <h2 className="title-gameover">GAME OVER</h2>
        {result.isNewBest && <div className="newbest">NEW BEST!</div>}
        <div className="stat">
          <span className="stat-label">SCORE</span>
          <span className="stat-value">{result.score.toLocaleString()}</span>
        </div>
        <div className="stat">
          <span className="stat-label">67 TOKENS</span>
          <span className="stat-value">
            <span className="coin-mini">67</span>
            {result.tokens}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">BEST</span>
          <span className="stat-value">{result.best.toLocaleString()}</span>
        </div>
        <button className="btn btn-primary" onClick={onRetry}>
          TRY AGAIN
        </button>
        <button className="btn btn-ghost" onClick={onMenu}>
          MENU
        </button>
      </div>
    </div>
  );
}
