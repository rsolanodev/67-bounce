export type PlatformType = 'normal' | 'moving' | 'bouncy' | 'fragile' | 'sixtyseven';

export interface PlatformDefinition {
  x: number;
  y: number;
  width: number;
  type: PlatformType;
  moving?: {
    amplitude: number;
    speed: number;
    phase: number;
  };
}

export interface CollectibleDefinition {
  x: number;
  y: number;
}

export interface GoalDefinition {
  x: number;
  y: number;
  width: number;
}

export interface LevelDefinition {
  id: number;
  name: string;
  theme: string;
  startX: number;
  startY: number;
  platforms: PlatformDefinition[];
  collectibles: CollectibleDefinition[];
  goal: GoalDefinition;
}
