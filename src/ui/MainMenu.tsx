import { useState } from 'react';
import { LEVELS } from '../game/levels/levels';

interface MainMenuProps {
  menu: {
    unlockedLevel: number;
    totalTokens: number;
    soundEnabled: boolean;
    musicEnabled: boolean;
    controlMode: 'tilt' | 'touch';
    invertTilt: boolean;
  };
  onPlay: () => void;
  onSelectLevel: (id: number) => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onToggleControl: () => void;
  onToggleInvert: () => void;
}

export function MainMenu({ menu, onPlay, onSelectLevel, onToggleSound, onToggleMusic, onToggleControl, onToggleInvert }: MainMenuProps) {
  const [showLevels, setShowLevels] = useState(false);

  return (
    <div className="overlay menu-overlay">
      <div className="menu-content">
        <div className="logo">
          <div className="logo-67">67</div>
          <div className="logo-bounce">BOUNCE</div>
        </div>
        <button className="btn btn-primary" onClick={onPlay}>
          PLAY
        </button>
        <button className="btn btn-secondary" onClick={() => setShowLevels((v) => !v)}>
          LEVELS
        </button>
        {showLevels && (
          <div className="level-select">
            {LEVELS.map((level) => {
              const locked = level.id > menu.unlockedLevel;
              return (
                <button
                  key={level.id}
                  className={`level-btn ${locked ? 'locked' : ''}`}
                  disabled={locked}
                  onClick={() => onSelectLevel(level.id)}
                >
                  {locked ? '🔒' : String(level.id).padStart(2, '0')}
                </button>
              );
            })}
          </div>
        )}
        <div className="menu-footer">
          <span className="coin-total">
            <span className="coin-mini">67</span>
            {menu.totalTokens}
          </span>
          <div className="menu-toggles">
            <button
              className={`ctl-toggle ${menu.controlMode === 'tilt' ? 'on' : ''}`}
              onClick={onToggleControl}
              aria-label="Toggle control mode"
              title={`Control: ${menu.controlMode === 'tilt' ? 'Tilt (inclinar)' : 'Touch (deslizar)'}`}
            >
              {menu.controlMode === 'tilt' ? '📱 TILT' : '👆 TOUCH'}
            </button>
            <button
              className={`ctl-toggle ${menu.invertTilt ? 'on' : ''}`}
              onClick={onToggleInvert}
              aria-label="Toggle tilt inversion"
              title={`Invertir inclinación: ${menu.invertTilt ? 'ON' : 'OFF'}`}
            >
              ⇄ INVERT
            </button>
            <button onClick={onToggleSound} aria-label="Toggle sound">
              {menu.soundEnabled ? '🔊' : '🔇'}
            </button>
            <button onClick={onToggleMusic} aria-label="Toggle music">
              {menu.musicEnabled ? '🎵' : '🔕'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
