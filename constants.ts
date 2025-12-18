
import { ArenaStyle, BeyName, BeyStats, StoryChapter } from './types';

export const ARENA_RADIUS = 350;
export const BLADE_RADIUS = 38; 
export const FRICTION = 0.995; 
export const WALL_BOUNCE = 0.75;
export const COLLISION_ELASTICITY = 0.98;
export const ENERGY_GAIN = 0.6;

export const BEY_DATA: Record<BeyName, { stats: BeyStats, color: string, glow: string, move: string, symbol: string, secondary: string }> = {
  Z_ACHILLES: {
    stats: { attack: 9, defense: 7, stamina: 6, burstResistance: 7, weight: 1.3 },
    color: '#ef4444', glow: '#fca5a5', secondary: '#94a3b8', move: 'Z-Buster', symbol: '⚔️'
  },
  WINNING_VALKYRIE: {
    stats: { attack: 10, defense: 5, stamina: 4, burstResistance: 6, weight: 1.1 },
    color: '#2563eb', glow: '#60a5fa', secondary: '#f59e0b', move: 'Rush Shoot', symbol: '🦅'
  },
  DEAD_PHOENIX: {
    stats: { attack: 7, defense: 10, stamina: 9, burstResistance: 10, weight: 1.6 },
    color: '#991b1b', glow: '#f87171', secondary: '#ca8a04', move: 'Dead Stinger', symbol: '🔥'
  },
  BLOODY_LONGINUS: {
    stats: { attack: 11, defense: 4, stamina: 3, burstResistance: 5, weight: 1.4 },
    color: '#f8fafc', glow: '#cbd5e1', secondary: '#3b82f6', move: 'Nightmare Boost', symbol: '🐉'
  },
  EMPEROR_FORNEUS: {
    stats: { attack: 6, defense: 9, stamina: 7, burstResistance: 9, weight: 1.5 },
    color: '#ea580c', glow: '#fb923c', secondary: '#059669', move: 'Emperor Guard', symbol: '🦈'
  }
};

export const STORY_CHAPTERS: StoryChapter[] = [
  { 
    id: 1, 
    title: "A New Rivalry", 
    rivalName: "Kenji", 
    rivalBey: "EMPEROR_FORNEUS",
    dialogue: [
      { speaker: "Kenji", text: "Hey Aiger! I've been training for the Zenon Tournament too!", side: "right" },
      { speaker: "Aiger", text: "Kenji? I won't lose to anyone! Achilles is ready!", side: "left" },
      { speaker: "Kenji", text: "We'll see about that. My Forneus is an iron wall!", side: "right" }
    ],
    arena: 'CLASSIC'
  },
  { 
    id: 2, 
    title: "The Frozen Dragon", 
    rivalName: "Lui Shirosagi", 
    rivalBey: "BLOODY_LONGINUS",
    dialogue: [
      { speaker: "Lui", text: "So you're the one they call the Turbo Blader?", side: "right" },
      { speaker: "Aiger", text: "Lui Shirosagi! I've been waiting for this match!", side: "left" },
      { speaker: "Lui", text: "Don't make me laugh. Longinus will tear you apart!", side: "right" }
    ],
    arena: 'CYBER_HEX'
  },
  { 
    id: 3, 
    title: "Resonance Test", 
    rivalName: "Valt Aoi", 
    rivalBey: "WINNING_VALKYRIE",
    dialogue: [
      { speaker: "Valt", text: "Whoa, Aiger! Your spirit is burning bright today!", side: "right" },
      { speaker: "Aiger", text: "Valt! Watch me take Achilles to the top!", side: "left" },
      { speaker: "Valt", text: "Let's go then! Go Shoot!", side: "right" }
    ],
    arena: 'CLASSIC'
  },
  { 
    id: 4, 
    title: "Shadow of the Emperor", 
    rivalName: "Lord Vex", 
    rivalBey: "DEAD_PHOENIX",
    dialogue: [
      { speaker: "Lord Vex", text: "I am the darkness that consumes all light...", side: "right" },
      { speaker: "Aiger", text: "Lord Vex! I won't let your Dead Phoenix destroy this tournament!", side: "left" },
      { speaker: "Lord Vex", text: "Destruction is the ultimate form of resonance. Witness your end!", side: "right" }
    ],
    arena: 'MAGMA_OCTA'
  }
];

export const ARENA_THEMES = {
  CLASSIC: { name: 'BEY-STADIUM: ALPHA', floor: '#0f172a', border: '#334155', accent: '#3b82f6' },
  CYBER_HEX: { name: 'BEY-STADIUM: NEON GRID', floor: '#020617', border: '#06b6d4', accent: '#22d3ee' },
  MAGMA_OCTA: { name: 'BEY-STADIUM: INFERNO CORE', floor: '#1c0a0a', border: '#991b1b', accent: '#ef4444' }
};
