
export type GameStatus = 'MENU' | 'STORY' | 'CUSTOMIZE' | 'BATTLE' | 'RESULT' | 'TUTORIAL';
export type ArenaStyle = 'CLASSIC' | 'CYBER_HEX' | 'MAGMA_OCTA';
export type AIDifficulty = 'ROOKIE' | 'ACE' | 'ZENON';
export type BladeArchetype = 'STRIKER' | 'GUARDIAN' | 'SPEEDSTER' | 'PHANTOM';

export type BitbeastType = 'DRAGOON' | 'DRANZER' | 'DRACIEL' | 'DRIGER';

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
  // Added symbol property to Particle interface
  symbol?: string;
  type?: 'IMPACT' | 'STORM' | 'FLASH' | 'EMBER' | 'SPARK' | 'TRAIL' | 'BEAST';
  angle?: number;
}

export interface ReplayFrame {
  px: number;
  py: number;
  pr: number;
  rx: number;
  ry: number;
  rr: number;
  pSpecial: boolean;
  rSpecial: boolean;
  pHealth: number;
  rHealth: number;
}

export interface BattleStats {
  damageDealt: number;
  damageTaken: number;
  collisions: number;
  specialsUsed: number;
  maxSpeed: number;
  replayData?: ReplayFrame[];
}

export interface Blade {
  id: string;
  name: string;
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
  archetype: BladeArchetype;
  bitbeast: BitbeastType;
  stylePattern?: 'DRAGON' | 'PHOENIX' | 'TIGER' | 'TURTLE';
}

export interface GameState {
  status: GameStatus;
  player: Blade;
  rival: Blade;
  winnerId: string | null;
  round: number;
}