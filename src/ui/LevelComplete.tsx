import { useState } from 'react';
import type { LevelCompleteData } from '../game/state/GameState';

interface LevelCompleteProps {
  data: LevelCompleteData;
  onNext: () => void;
  onMenu: () => void;
}

export function LevelComplete({ data, onNext, onMenu }: LevelCompleteProps) {
  const [copied, setCopied] = useState(false);

  const share = async (): Promise<void> => {
    const text = `I just completed Level ${data.level} in 67 Bounce with ${data.tokens} 67 Tokens! 🧠🔥`;
    try {
      if (navigator.share) {
        await navigator.share({ title: '67 Bounce', text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // share cancelled or unavailable
    }
  };

  return (
    <div className="overlay">
      <div className="panel">
        <h2 className="title-level">LEVEL {data.level}!</h2>
        <div className="big-67">67</div>
        <div className="title-sub">YOU DID IT!</div>
        <div className="stat">
          <span className="stat-label">67 TOKENS</span>
          <span className="stat-value">
            <span className="coin-mini">67</span>
            {data.tokens}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">SCORE</span>
          <span className="stat-value">{data.score.toLocaleString()}</span>
        </div>
        {data.nextLevel !== null ? (
          <button className="btn btn-primary" onClick={onNext}>
            NEXT LEVEL
          </button>
        ) : (
          <button className="btn btn-primary" onClick={onMenu}>
            FINISHED!
          </button>
        )}
        <button className="btn btn-secondary" onClick={share}>
          SHARE
        </button>
        {copied && <div className="copied-toast">Copied to clipboard!</div>}
        <button className="btn btn-ghost" onClick={onMenu}>
          MENU
        </button>
      </div>
    </div>
  );
}
