interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
}

export function PauseMenu({ onResume, onRestart, onMenu }: PauseMenuProps) {
  return (
    <div className="overlay">
      <div className="panel">
        <h2 className="title-gameover">PAUSED</h2>
        <button className="btn btn-primary" onClick={onResume}>
          RESUME
        </button>
        <button className="btn btn-secondary" onClick={onRestart}>
          RESTART
        </button>
        <button className="btn btn-ghost" onClick={onMenu}>
          MENU
        </button>
      </div>
    </div>
  );
}
