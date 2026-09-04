## Purpose

Allow players to move the character horizontally by tilting the device left and right, as the primary mobile control, with graceful fallback to touch or keyboard.

## ADDED Requirements

### Requirement: Device tilt controls horizontal movement

The game SHALL map the device tilt angle `gamma` (left/right, in portrait) to the player's horizontal movement axis, clamped to `[-1, 1]`, when the tilt control is active.

#### Scenario: Tilt produces horizontal axis
- **WHEN** the tilt control is active and the device is tilted to the right
- **THEN** the player's horizontal movement axis MUST be positive (moving right), proportionally to the tilt angle

#### Scenario: Tilt beyond vertical range
- **WHEN** the device is tilted more than the configured maximum angle
- **THEN** the movement axis MUST be clamped to the maximum value (−1 or +1)

#### Scenario: Device level (neutral)
- **WHEN** the device is held level within the deadzone around the calibrated center
- **THEN** the movement axis MUST be 0 (no horizontal input)

### Requirement: Calibration of neutral position

The game SHALL calibrate the neutral (zero-input) tilt angle at the start of each level, so the player's default holding position produces no movement.

#### Scenario: Auto-calibration at level start
- **WHEN** a level starts and the tilt control is active
- **THEN** the game samples the device orientation and centers the input mapping around the detected angle

#### Scenario: Calibration hint shown
- **WHEN** a level starts with the tilt control
- **THEN** the game shows a brief on-screen hint asking the player to keep the device level

### Requirement: iOS permission flow

On iOS 13+ the game SHALL request permissions for device orientation before enabling tilt control, triggered by a user gesture.

#### Scenario: Permission granted
- **WHEN** the player initiates a game (e.g., presses PLAY) on a device that requires orientation permission
- **THEN** the game requests permission, and if granted, tilt control is enabled for the session

#### Scenario: Permission denied or unavailable
- **WHEN** the orientation permission is denied, or the device has no orientation sensor
- **THEN** the game continues with touch drag control as the active mobile input, without blocking gameplay

### Requirement: Input source priority and fallback

The horizontal input MUST resolve from a single axis with priority: keyboard (desktop) > tilt (when active) > touch drag (fallback). If tilt is not active, drag MUST remain functional.

#### Scenario: Tilt active overrules drag
- **WHEN** the tilt control is active and the player also touches the screen
- **THEN** the movement axis mirrors the tilt, and the drag is ignored

#### Scenario: Fallback to drag
- **WHEN** tilt is inactive (no sensor, permission denied, or control mode set to Touch)
- **THEN** touching and dragging horizontally moves the player

### Requirement: Control mode setting

The game SHALL expose a control mode setting (Tilt or Touch) and persist it across sessions.

#### Scenario: Setting toggled
- **WHEN** the player changes the control mode in the settings
- **THEN** the new mode takes effect immediately and is persisted in local storage

### Requirement: Filtered and responsive tilt signal

The tilt input MUST be filtered to remove sensor jitter without adding perceptible input lag, and MUST respond immediately to sustained tilt.

#### Scenario: Steady tilt sustains movement
- **WHEN** the device is kept tilted at a constant angle beyond the deadzone
- **THEN** the player reaches and keeps the corresponding target speed within a short time (fraction of a second)

### Requirement: Desktop keyboard control unaffected

Desktop keyboard controls (A/D, arrow keys) MUST keep working regardless of tilt availability.

#### Scenario: Desktop input
- **WHEN** the game is played on a desktop without an orientation sensor
- **THEN** the keyboard controls remain the active input method
