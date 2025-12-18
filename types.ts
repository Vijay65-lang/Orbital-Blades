
// types.ts: Define core interfaces and types for the Beyblade battle system
export type BeyName = 'Z_ACHILLES' | 'WINNING_VALKYRIE' | 'BLOODY_LONGINUS' | 'EMPEROR_FORNEUS' | 'DEAD_PHOENIX';
export type AIDifficulty = 'ROOKIE' | 'ACE' | 'ZENON' | 'GOD_TIER';
export type ArenaStyle = 'CLASSIC' | 'HAZARD' | 'STORM' | 'VOICE';

export interface Point {
  x: number;
  y: number;
}

export interface BeyStats {
  weight: number;
  burstResistance: number;
  attack: number;
  defense: number;
  stamina?: number;
}

export interface Blade {
  id: string;
  name: string;
  type: BeyName;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  rotationSpeed: number;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  color: string;
  glowColor: string;
  isPlayer: boolean;
  isTurbo: boolean;
  stats: BeyStats;
  trail?: Point[];
  energyFullTimer?: number; // Added for overload mechanic
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'SPARK' | 'STORM' | 'IMPACT';
}

export interface ReplayFrame {
  px: number;
  py: number;
  pr: number;
  pSpecial: boolean;
  pHealth: number;
  rx: number;
  ry: number;
  rr: number;
  rSpecial: boolean;
  rHealth: number;
}

export interface BattleStats {
  damageDealt: number;
  damageTaken: number;
  collisions: number;
  specialsUsed: number;
  maxSpeed: number;
  isBurst: boolean;
  replayData?: ReplayFrame[];
}

export type AppState = 'IDLE' | 'STORY' | 'CUSTOMIZE' | 'BATTLE' | 'RESULT' | 'TUTORIAL';

export interface StoryChapter {
  id: number;
  title: string;
  rivalName: string;
  rivalBey: BeyName;
  dialogue: { speaker: string, text: string, side: 'left' | 'right', portrait?: string }[];
  arena: string;
}
