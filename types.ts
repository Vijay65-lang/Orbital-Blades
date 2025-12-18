
export type GameStatus = 'MENU' | 'STORY' | 'CUSTOMIZE' | 'BATTLE' | 'RESULT' | 'TUTORIAL';
export type ArenaStyle = 'CLASSIC' | 'CYBER_HEX' | 'MAGMA_OCTA';
export type AIDifficulty = 'ROOKIE' | 'ACE' | 'ZENON' | 'GOD_TIER';

export type BeyName = 'Z_ACHILLES' | 'WINNING_VALKYRIE' | 'DEAD_PHOENIX' | 'BLOODY_LONGINUS' | 'EMPEROR_FORNEUS';

export interface Point {
  x: number;
  y: number;
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
  symbol?: string;
  type?: 'IMPACT' | 'STORM' | 'FLASH' | 'EMBER' | 'SPARK' | 'TRAIL' | 'BEAST' | 'TURBO' | 'PIECE';
  angle?: number;
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

export interface BeyStats {
  attack: number;
  defense: number;
  stamina: number;
  burstResistance: number;
  weight: number;
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
}

export interface DialogueLine {
  speaker: string;
  text: string;
  side: 'left' | 'right';
  portrait?: string;
}

export interface StoryChapter {
  id: number;
  title: string;
  rivalName: string;
  rivalBey: BeyName;
  dialogue: DialogueLine[];
  arena: ArenaStyle;
}
