## 1. Tilt core

- [ ] 1.1 Add `TILT_CONFIG` (deadzoneDeg, maxTiltDeg, smoothingAlpha, calibrationEventCount, calibrationTimeout) and `CONTROL` default mode to `src/game/GameConfig.ts`
- [ ] 1.2 Create `src/game/player/TiltController.ts` with: pure `tiltToAxis(gamma, calibration, config)` mapping function (deadzone + clamped quadratic curve), EMA filter state, calibration sampler (first `calibrationEventCount` events averaged within timeout), and activate/deactivate lifecycle
- [ ] 1.3 Wire `deviceorientation` listener on window in `TiltController.start()` and detach in `stop()`; ignore `event.absolut`-like signals and NaN values; fall back to `null` axis when no recent events

## 2. Input resolution

- [ ] 2.1 Integrate `TiltController` in `PlayerController`: resolve axis with priority keyboard > tilt > drag; drag only applies when tilt inactive
- [ ] 2.2 Add `setTiltEnabled(enabled)` and `setControlMode(mode)` API; disable drag → remains fallback; keyboard unaffected (keys override tilt)
- [ ] 2.3 Reset tilt state on `setEnabled(false)` and on level restart (recalibration)

## 3. Permission and settings

- [ ] 3.1 In `Game.play()`, before enabling tilt: check `DeviceOrientationEvent.requestPermission`; if present, await it (with gesture already active), cache result once per session; enable tilt on granted, display a one-time hint on denied
- [ ] 3.2 Extend `SaveData` with `controlMode: 'tilt' | 'touch'` (default `tilt`) in `src/game/systems/Storage.ts` including migration-safe read
- [ ] 3.3 Add control mode toggle in MainMenu (footer area next to sound/music) and persist via existing Storage update path

## 4. Game feel and UX

- [ ] 4.1 Add calibration hint overlay (e.g., "Mantén el móvil recto") shown for first ~1.5s of each level when tilt is active, dismissed automatically
- [ ] 4.2 Ensure `update()` loop keeps reading axis each frame while tilt active; verify no React state involved (axis stays in game loop)

## 5. Testing and tuning

- [x] 5.1 Unit test the pure `tiltToAxis`: neutral→0, deadzone≤0, maxTilt→±1, asymmetry/quadratic curve monotonicity
- [x] 5.2 Add dev override (`?tilt=` URL param and/or `window.__debugTilt`) that injects a synthetic gamma so gameplay can be verified headless/desktop
- [x] 5.3 Extend the headless logic test (jsdom + NullGraphicsDevice) to simulate the tilt source and assert the axis affects player movement
- [ ] 5.4 Manual tuning pass on real mobile device: deadzone, maxTiltDeg, smoothingAlpha; document final values in GameConfig
- [ ] 5.5 Verify keyboard priority over tilt and drag fallback (permission denied path) manually on iOS Safari
