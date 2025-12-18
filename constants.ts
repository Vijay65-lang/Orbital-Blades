
import { ArenaStyle, BeyName, BeyStats, StoryChapter } from './types';

export const ARENA_RADIUS = 350;
export const BLADE_RADIUS = 38; 
export const FRICTION = 0.992; 
export const WALL_BOUNCE = 0.8;
export const COLLISION_ELASTICITY = 0.98;
export const ENERGY_GAIN = 0.8;

export const BEY_DATA: Record<BeyName, { stats: BeyStats, color: string, glow: string, move: string, symbol: string, secondary: string }> = {
  Z_ACHILLES: {
    stats: { attack: 9, defense: 7, stamina: 6, burstResistance: 7, weight: 1.3 },
    color: '#D32F2F', glow: '#FF5252', secondary: '#BDBDBD', move: 'Z-BUSTER', symbol: '⚔️'
  },
  WINNING_VALKYRIE: {
    stats: { attack: 10, defense: 5, stamina: 4, burstResistance: 6, weight: 1.1 },
    color: '#1976D2', glow: '#448AFF', secondary: '#FFC107', move: 'RUSH SHOOT', symbol: '🦅'
  },
  DEAD_PHOENIX: {
    stats: { attack: 8, defense: 10, stamina: 9, burstResistance: 10, weight: 1.6 },
    color: '#880E4F', glow: '#E91E63', secondary: '#212121', move: 'DEAD STINGER', symbol: '🔥'
  },
  BLOODY_LONGINUS: {
    stats: { attack: 11, defense: 4, stamina: 3, burstResistance: 5, weight: 1.4 },
    color: '#ECEFF1', glow: '#CFD8DC', secondary: '#2979FF', move: 'LONGINUS SPIRAL', symbol: '🐉'
  },
  EMPEROR_FORNEUS: {
    stats: { attack: 6, defense: 9, stamina: 7, burstResistance: 9, weight: 1.5 },
    color: '#2E7D32', glow: '#66BB6A', secondary: '#F57C00', move: 'EMPEROR GUARD', symbol: '🦈'
  }
};

export const STORY_CHAPTERS: StoryChapter[] = [
  { 
    id: 1, 
    title: "THE ZENON OPEN", 
    rivalName: "KENJI", 
    rivalBey: "EMPEROR_FORNEUS",
    dialogue: [
      { speaker: "KENJI", text: "Aiger! Ready to lose your title in the first round?", side: "right", portrait: "🦈" },
      { speaker: "AIGER", text: "Achilles and I have trained for this! We won't stop until the top!", side: "left", portrait: "👦" },
      { speaker: "KENJI", text: "Forneus is a fortress! Let's see you try to break it!", side: "right", portrait: "🦈" }
    ],
    arena: 'CLASSIC'
  },
  { 
    id: 2, 
    title: "WHITE DRAGON AWAKENS", 
    rivalName: "LUI SHIROSAGI", 
    rivalBey: "BLOODY_LONGINUS",
    dialogue: [
      { speaker: "LUI", text: "A Turbo Bey? It's just a toy compared to Longinus!", side: "right", portrait: "🧊" },
      { speaker: "AIGER", text: "I'll show you the power of Turbo Awakening!", side: "left", portrait: "👦" },
      { speaker: "LUI", text: "Show me your despair! GO SHOOT!", side: "right", portrait: "🧊" }
    ],
    arena: 'CYBER_HEX'
  },
  { 
    id: 3, 
    title: "THE LEGENDARY CLASH", 
    rivalName: "VALT AOI", 
    rivalBey: "WINNING_VALKYRIE",
    dialogue: [
      { speaker: "VALT", text: "Whoa Aiger! Your resonance is burning up the stadium!", side: "right", portrait: "⚡" },
      { speaker: "AIGER", text: "Valt! I'm finally ready to take that belt!", side: "left", portrait: "👦" },
      { speaker: "VALT", text: "Then don't hold back! Valkyrie, RUSH SHOOT!", side: "right", portrait: "⚡" }
    ],
    arena: 'CLASSIC'
  },
  { 
    id: 4, 
    title: "FINAL: LORD VEX", 
    rivalName: "LORD VEX", 
    rivalBey: "DEAD_PHOENIX",
    dialogue: [
      { speaker: "LORD VEX", text: "I am the end of all bladers. Dead Phoenix will consume your spirit.", side: "right", portrait: "💀" },
      { speaker: "AIGER", text: "I won't let you destroy Beyblade! Achilles, SUPER Z-BUSTER!!", side: "left", portrait: "👦" },
      { speaker: "LORD VEX", text: "Eternal darkness awaits you. Witness true destruction!", side: "right", portrait: "💀" }
    ],
    arena: 'MAGMA_OCTA'
  }
];

export const ARENA_THEMES = {
  CLASSIC: { name: 'ZENON STADIUM', floor: '#0f172a', border: '#475569', accent: '#3b82f6' },
  CYBER_HEX: { name: 'VIRTUAL GRID', floor: '#020617', border: '#06b6d4', accent: '#22d3ee' },
  MAGMA_OCTA: { name: 'HELL CORE', floor: '#1c0a0a', border: '#991b1b', accent: '#ef4444' }
};
