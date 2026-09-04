## Why

El juego es mobile-first y el control táctil (drag) funciona, pero ocupa la mano sobre la pantalla y no se siente como un juego móvil nativo. Rotar el móvil para moverse es el control esperado en un game-feel de vertical jumper (Doodle Jump-style), libera los pulgares y hace que el movimiento sea más inmediato. Hoy un jogador en iPhone puede quedarse sin gyro o sin drag; el tilt añade una alternativa real sin duplicar complejidad: el juego ya consume un único eje genérico `getAxis() → [-1, 1]`.

## What Changes

- Nuevo `TiltController`: escucha `DeviceOrientationEvent` y convierte el ángulo `gamma` (izquierda-derecha en portrait) en un eje `[-1, 1]`.
- Prioridad de input: teclado (desktop) → tilt (móvil, si sensor disponible y permiso concedido) → drag táctil como fallback.
- Flujo de permiso iOS 13+: `DeviceOrientationEvent.requestPermission()` solicitado en el click de PLAY; si se deniega, fallback automático a drag.
- Calibración automática al iniciar cada nivel: promedia los primeros eventos y neutraliza el sesgo de cómo sostiene el móvil el usuario; hint visual "mantén el móvil recto" los primeros segundos.
- Curva de control: deadzone (±3°), sensibilidad configurable y respuesta suave (cuadrática cerca del centro) para precisión.
- Filtro anti-jitter de baja latencia (EMA) antes de convertir a eje.
- Ajustes en el Main Menu: toggle de modo de control "Tilt / Touch" persistido en `localStorage` (extiende `SaveData` existente).
- Sobreescritura de debug para desarrollo/test (p.ej. parámetro URL) ya que el gyro no es testeable headless.
- **BREAKING**: en móvil el drag deja de ser el control por defecto (pasa a ser fallback); el modo touch sigue disponible vía ajustes.

## Capabilities

### New Capabilities
- `tilt-control`: Control por inclinación del dispositivo como fuente de input horizontal del personaje: sensor, permiso, calibración, curva, filtrado, fallback y ajustes.

### Modified Capabilities

## Impact

- `src/game/player/PlayerController.ts`: orquestación de fuentes (nuevo `TiltController` integrado, prioridad, fallback).
- Nuevo `src/game/player/TiltController.ts`: sensor + permiso + calibración + mapping gamma→axis.
- `src/game/GameConfig.ts`: constantes de tilt (deadzone, sensibilidad, filtro, rango).
- `src/game/systems/Storage.ts`: `SaveData.controlMode` (`'tilt' | 'touch'`).
- `src/ui/MainMenu.tsx` + `src/ui/ui.css`: toggle de control, hint de calibración.
- `src/game/Game.ts`: `play()` solicita permiso iOS; activar/desactivar tilt según estado y ajustes.
- Sin dependencias nuevas: `DeviceOrientationEvent` es Web API nativa. Requiere HTTPS en producción (localhost OK).
