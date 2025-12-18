
import { ArenaStyle, BladeArchetype, BitbeastType } from './types';

export const ARENA_RADIUS = 300;
export const BLADE_RADIUS = 32; // Optimized for detail
export const FRICTION = 0.992; 
export const WALL_BOUNCE = 0.75;
export const COLLISION_ELASTICITY = 0.98;
export const DAMAGE_FACTOR = 0.15;
export const ENERGY_GAIN = 0.25;

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
    mass: 0.85,
    speedMult: 1.4,
    recoilMult: 1.6,
    damageMult: 1.8,
    energyMult: 1.3,
    shapeSides: 3,
    description: "Attack: Sharp edges designed for maximum impact force."
  },
  GUARDIAN: {
    mass: 2.0,
    speedMult: 0.5,
    recoilMult: 0.2,
    damageMult: 0.6,
    energyMult: 0.7,
    shapeSides: 8,
    description: "Defense: High-density weight disk for ironclad stability."
  },
  SPEEDSTER: {
    mass: 0.7,
    speedMult: 1.7,
    recoilMult: 1.1,
    damageMult: 0.8,
    energyMult: 1.5,
    shapeSides: 5,
    description: "Endurance: Low-friction bearings for infinite spin time."
  },
  PHANTOM: {
    mass: 1.2,
    speedMult: 1.0,
    recoilMult: 1.0,
    damageMult: 1.3,
    energyMult: 1.1,
    shapeSides: 0,
    description: "Balance: Adapts to any battle condition effortlessly."
  }
};

export const COLOR_PRESETS = [
  { name: 'Saphire', color: '#3b82f6', glow: '#60a5fa' },
  { name: 'Ruby', color: '#ef4444', glow: '#f87171' },
  { name: 'Emerald', color: '#10b981', glow: '#34d399' },
  { name: 'Amber', color: '#f59e0b', glow: '#fbbf24' },
  { name: 'Amethyst', color: '#8b5cf6', glow: '#a78bfa' },
  { name: 'Obsidian', color: '#1e293b', glow: '#64748b' }
];

export const STYLE_PATTERNS = ['DRAGON', 'PHOENIX', 'TIGER', 'TURTLE'] as const;

export interface BitbeastData {
  name: string;
  move: string;
  color: string;
  symbol: string;
  effect: 'TORNADO' | 'FLAME' | 'SHIELD' | 'SLASH';
}

export const BITBEAST_INFO: Record<BitbeastType, BitbeastData> = {
  DRAGOON: { name: 'Storm Dragoon', move: 'Galaxy Storm', color: '#60a5fa', symbol: '🐉', effect: 'TORNADO' },
  DRANZER: { name: 'Flame Dranzer', move: 'Spiral Flare', color: '#fb7185', symbol: '🦅', effect: 'FLAME' },
  DRACIEL: { name: 'Fortress Draciel', move: 'Great Shield', color: '#4ade80', symbol: '🐢', effect: 'SHIELD' },
  DRIGER: { name: 'White Tiger Driger', move: 'Lightning Slash', color: '#facc15', symbol: '🐯', effect: 'SLASH' }
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
    name: 'NEON GRID OMEGA',
    sides: 6,
    floorColor: '#020617',
    borderColor: '#06b6d4',
    gridColor: 'rgba(6, 182, 212, 0.1)',
    accentColor: '#22d3ee'
  },
  MAGMA_OCTA: {
    id: 'MAGMA_OCTA',
    name: 'INFERNO CORE',
    sides: 8,
    floorColor: '#1c0a0a',
    borderColor: '#991b1b',
    gridColor: 'rgba(153, 27, 27, 0.1)',
    accentColor: '#ef4444'
  }
};
