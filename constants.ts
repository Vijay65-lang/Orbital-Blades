
import { ArenaStyle, BladeArchetype, BitbeastType } from './types';

export const ARENA_RADIUS = 300;
export const BLADE_RADIUS = 28; // Slightly larger for realistic detail
export const FRICTION = 0.994; // Realistic spin decay
export const WALL_BOUNCE = 0.7;
export const COLLISION_ELASTICITY = 0.95;
export const DAMAGE_FACTOR = 0.12;
export const ENERGY_GAIN = 0.22;

export interface ArchetypeProperties {
  mass: number;
  speedMult: number;
  recoilMult: number;
  damageMult: number;
  energyMult: number;
  shapeSides: number;
  description: string;
}

export const ARCHETYPE_STATS: Record<BladeArchetype, ArchetypeProperties> = {
  STRIKER: {
    mass: 0.9,
    speedMult: 1.3,
    recoilMult: 1.5,
    damageMult: 1.6,
    energyMult: 1.2,
    shapeSides: 3,
    description: "Attack Type: High RPM and aggressive contact points."
  },
  GUARDIAN: {
    mass: 1.8,
    speedMult: 0.6,
    recoilMult: 0.3,
    damageMult: 0.7,
    energyMult: 0.8,
    shapeSides: 8,
    description: "Defense Type: Heavy metal weight disk for maximum stability."
  },
  SPEEDSTER: {
    mass: 0.7,
    speedMult: 1.5,
    recoilMult: 1.2,
    damageMult: 0.9,
    energyMult: 1.4,
    shapeSides: 5,
    description: "Endurance Type: Low friction tip for sustained spinning."
  },
  PHANTOM: {
    mass: 1.1,
    speedMult: 1.0,
    recoilMult: 1.0,
    damageMult: 1.2,
    energyMult: 1.1,
    shapeSides: 0,
    description: "Balance Type: Versatile performance in all stadium areas."
  }
};

export interface BitbeastData {
  name: string;
  move: string;
  color: string;
  symbol: string;
}

export const BITBEAST_INFO: Record<BitbeastType, BitbeastData> = {
  DRAGOON: { name: 'Storm Dragon', move: 'Phantom Hurricane', color: '#60a5fa', symbol: '🐉' },
  DRANZER: { name: 'Flame Phoenix', move: 'Spiral Flare', color: '#fb7185', symbol: '🦅' },
  DRACIEL: { name: 'Fortress Turtle', move: 'Great Shield', color: '#4ade80', symbol: '🐢' },
  DRIGER: { name: 'White Tiger', move: 'Lightning Slash', color: '#facc15', symbol: '🐯' }
};

export interface ArenaTheme {
  id: ArenaStyle;
  name: string;
  sides: number;
  floorColor: string;
  borderColor: string;
  gridColor: string;
  accentColor: string;
}

export const ARENA_THEMES: Record<ArenaStyle, ArenaTheme> = {
  CLASSIC: {
    id: 'CLASSIC',
    name: 'BEY-STADIUM: ALPHA',
    sides: 0,
    floorColor: '#0f172a',
    borderColor: '#334155',
    gridColor: 'rgba(51, 65, 85, 0.4)',
    accentColor: '#3b82f6'
  },
  CYBER_HEX: {
    id: 'CYBER_HEX',
    name: 'DIGITAL GRID: OMEGA',
    sides: 6,
    floorColor: '#020617',
    borderColor: '#06b6d4',
    gridColor: 'rgba(6, 182, 212, 0.1)',
    accentColor: '#22d3ee'
  },
  MAGMA_OCTA: {
    id: 'MAGMA_OCTA',
    name: 'INFERNO CALDERA',
    sides: 8,
    floorColor: '#1c0a0a',
    borderColor: '#991b1b',
    gridColor: 'rgba(153, 27, 27, 0.1)',
    accentColor: '#ef4444'
  }
};
