## Context

See proposal.md - Why. The game already funnels ALL horizontal input through `PlayerController.getAxis() → [-1, 1]` (`src/game/player/PlayerController.ts`), consumed by `Player.update(dt, axis, halfWidth)`. Tilt only needs to become another source for that axis. `SaveData` (`src/game/systems/Storage.ts`) already persists sound/music settings; the new control mode fits there. `Game.play()` is a user-gesture entry point, ideal for the iOS permission request.

## Goals / Non-Goals

**Goals:**
- Tilt (gamma, portrait) as primary mobile input with immediate, jitter-free feel.
- One single axis resolution: keyboard > tilt > drag; drag never breaks.
- Auto-calibration per level + control-mode toggle persisted.
- Testable mapping function (pure) and a dev override for headless testing.

**Non-Goals:**
- Landscape orientation support or sensor remapping (beta/pitch).
- Accelerometer-based motion (only deviceorientation).
- Vibration/haptic feedback, analog throttle curves beyond one.
- Any change to player physics constants (acceleration/damping stay as-is).

## Decisions

**1. Tilt lives in its own class (`TiltController`), orchestrated by `PlayerController`.**
`PlayerController` keeps a list of "active sources" and resolves the axis by priority. Alternative (mixing sensor code into PlayerController) rejected: PlayerController would grow beyond input orchestration and become hard to test.

**2. Mapping formula: `axis = sign(d) * clamp(|d| / maxTilt, 0, 1)^1.6` where `d = filteredGamma - calibration`, with deadzone applied first.**
Quadratic-ish curve gives fine control near center. Alternatives: pure linear (too twitchy at center), expo curve (same shape, less readable). Constants centralized in `GameConfig.ts` (`TILT_CONFIG`: `deadzoneDeg: 3`, `maxTiltDeg: 22`, `smoothing: 0.15` EMA factor, `filterHz`).

**3. Low-latency EMA filter applied to gamma before mapping.**
`filtered = filtered + (raw - filtered) * alpha` with `alpha ≈ 0.15–0.2` (~60 Hz sensor). Raw rejected: jittery. Heavy filter rejected: laggy, "feels like floating".

**4. Calibration: sample first ~40 valid events (or ~0.7 s) at level start, average them, subtract from gamma.**
Auto over manual button: zero extra friction. If calibration fails (no events within timeout), tilt stays inactive and drag is used.

**5. iOS permission: `DeviceOrientationEvent.requestPermission?.()` awaited in `Game.play()` (already a gesture), once per session, result cached.**
If API missing (Android/desktop) → enable tilt directly. If denied → tilt inactive, drag fallback. Permission state exposed to `PlayerController.setTiltEnabled(bool)`.

**6. Priority merge in `PlayerController.getAxis()`:**
```
keyboard (A/D/arrows)  → ±1 if pressed
tilt                   → mapped axis if tiltEnabled && |axis| > 0 (or always, overrules drag)
drag                   → only when neither keyboard nor tilt active
```
Touch drag kept as fallback (proposal marks it non-default).

**7. Control mode setting in `SaveData.controlMode: 'tilt' | 'touch'`; toggle in MainMenu footer.**
If mode = touch → tilt disabled even if sensor present. Default: `tilt`. Stored via existing `Storage` update path; no migration needed (default applied when missing).

**8. Dev override for headless/debug: `?tilt=<deg>` URL param or `window.__debugTilt` injecting raw gamma.**
Justification: sensor can't run in CI/headless; the pure mapping function gets unit tests, the override allows end-to-end manual checks.

## Risks / Trade-offs

- [Gyro jitter on low-end devices feels "vibrating"] → EMA filter + deadzone; keep alpha tunable in one config place.
- [Calibration mismatch if user holds phone at strong angle at level start] → average of first events plus on-screen hint ("mantén el móvil recto"); user can tilt-correct naturally; restart recalibrates.
- [iOS permission denied → player might expect tilt] → seamless fallback to drag + control toggle allows switching.
- [HTTPS required for deviceorientation on deployed builds] → already required by production plan; localhost unaffected in dev.
- [Latency from filter] → alpha tuned for < 100 ms perceived lag; verify on real device during tuning task.

## Migration Plan

1. Add `TiltController` + config + storage field (defaults keep current behavior intact).
2. Wire into `PlayerController` and `Game.play()` permission flow.
3. Add settings toggle + calibration hint UI.
4. Tune deadzone/sensitivity/filter on real mobile devices.
Rollback: control mode toggle → touch, or remove tilt source; drag path remains untouched.

## Open Questions

- Final feel numbers (deadzone, maxTilt, alpha) — to be tuned on real hardware; constants isolated in `GameConfig.ts` so no spec/task changes are needed.
- Whether to also map `beta` in a future landscape mode — explicitly out of scope now.
