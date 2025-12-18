
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
    color: '#ef4444', glow: '#fca5a5', secondary: '#cbd5e1', move: 'Z-Buster', symbol: '⚔️'
  },
  WINNING_VALKYRIE: {
    stats: { attack: 10, defense: 5, stamina: 4, burstResistance: 6, weight: 1.1 },
    color: '#2563eb', glow: '#60a5fa', secondary: '#f59e0b', move: 'Rush Shoot', symbol: '🦅'
  },
  DEAD_PHOENIX: {
    stats: { attack: 7, defense: 10, stamina: 9, burstResistance: 10, weight: 1.6 },
    color: '#991b1b', glow: '#f87171', secondary: '#450a0a', move: 'Dead Stinger', symbol: '🔥'
  },
  BLOODY_LONGINUS: {
    stats: { attack: 11, defense: 4, stamina: 3, burstResistance: 5, weight: 1.4 },
    color: '#f8fafc', glow: '#cbd5e1', secondary: '#3b82f6', move: 'Nightmare Boost', symbol: '🐉'
  },
  EMPEROR_FORNEUS: {
    stats: { attack: 6, defense: 9, stamina: 7, burstResistance: 9, weight: 1.5 },
    color: '#10b981', glow: '#6ee7b7', secondary: '#ea580c', move: 'Emperor Guard', symbol: '🦈'
  }
};

export const STORY_CHAPTERS: StoryChapter[] = [
  { 
    id: 1, 
    title: "The Training Grounds", 
    rivalName: "Kenji", 
    rivalBey: "EMPEROR_FORNEUS",
    dialogue: [
      { speaker: "Kenji", text: "Aiger! The Zenon Tournament starts today. Are you really going in with that old Achilles?", side: "right", portrait: "🌪️" },
      { speaker: "Aiger", text: "It's not old, it's TURBO! Achilles and I have a bond you'll never understand!", side: "left", portrait: "👦" },
      { speaker: "Kenji", text: "Fine. Let's see if your 'bond' can break through my Emperor Forneus's defense!", side: "right", portrait: "🌪️" }
    ],
    arena: 'CLASSIC'
  },
  { 
    id: 2, 
    title: "White Dragon's Challenge", 
    rivalName: "Lui Shirosagi", 
    rivalBey: "BLOODY_LONGINUS",
    dialogue: [
      { speaker: "Lui", text: "Hah! You think you're a blader because you won a few matches?", side: "right", portrait: "🧊" },
      { speaker: "Aiger", text: "I'm the one who's going to take you down, Lui!", side: "left", portrait: "👦" },
      { speaker: "Lui", text: "Longinus will grind your Achilles into dust. GO SHOOT!", side: "right", portrait: "🧊" }
    ],
    arena: 'CYBER_HEX'
  },
  { 
    id: 3, 
    title: "Clash of the Legends", 
    rivalName: "Valt Aoi", 
    rivalBey: "WINNING_VALKYRIE",
    dialogue: [
      { speaker: "Valt", text: "Aiger! I can feel your Turbo energy from across the stadium!", side: "right", portrait: "⚡" },
      { speaker: "Aiger", text: "Valt! I've been waiting for this. I'm finally going to win the title!", side: "left", portrait: "👦" },
      { speaker: "Valt", text: "The title is earned through resonance! Let's show them our best battle yet!", side: "right", portrait: "⚡" }
    ],
    arena: 'CLASSIC'
  },
  { 
    id: 4, 
    title: "Resonance of Despair", 
    rivalName: "Lord Vex", 
    rivalBey: "DEAD_PHOENIX",
    dialogue: [
      { speaker: "Lord Vex", text: "Behold the Dead Phoenix. It doesn't just spin; it consumes.", side: "right", portrait: "💀" },
      { speaker: "Aiger", text: "Lord Vex! Stop this madness! Beyblade is about heart, not destruction!", side: "left", portrait: "👦" },
      { speaker: "Lord Vex", text: "Heart is a weakness. Despair is eternal. Achilles ends here!", side: "right", portrait: "💀" }
    ],
    arena: 'MAGMA_OCTA'
  }
];

export const ARENA_THEMES = {
  CLASSIC: { name: 'ZENON STADIUM: ALPHA', floor: '#0f172a', border: '#334155', accent: '#3b82f6' },
  CYBER_HEX: { name: 'ZENON STADIUM: NEON GRID', floor: '#020617', border: '#06b6d4', accent: '#22d3ee' },
  MAGMA_OCTA: { name: 'ZENON STADIUM: INFERNO', floor: '#1c0a0a', border: '#991b1b', accent: '#ef4444' }
};
