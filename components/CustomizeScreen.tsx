
import React from 'react';
import { Palette, Zap, Sparkles, ChevronRight, Map, ShieldAlert, Cpu, Target } from 'lucide-react';
import { ArenaStyle, AIDifficulty, BladeArchetype, BitbeastType } from '../types';
import { ARENA_THEMES, ARCHETYPE_STATS, BITBEAST_INFO } from '../constants';

interface CustomizeConfig {
  color: string;
  glowColor: string;
  stylePattern: 'DRAGON' | 'PHOENIX' | 'TIGER' | 'TURTLE';
  arenaStyle: ArenaStyle;
  archetype: BladeArchetype;
  bitbeast: BitbeastType;
}

interface CustomizeScreenProps {
  config: CustomizeConfig;
  difficulty: AIDifficulty;
  onChange: (config: CustomizeConfig) => void;
  onDifficultyChange: (difficulty: AIDifficulty) => void;
  onConfirm: () => void;
}

const COLORS = [
  { name: 'Azure', val: '#3b82f6' },
  { name: 'Crimson', val: '#ef4444' },
  { name: 'Emerald', val: '#10b981' },
  { name: 'Amber', val: '#f59e0b' },
  { name: 'Royal', val: '#8b5cf6' },
];

const ARCHETYPES: BladeArchetype[] = ['STRIKER', 'GUARDIAN', 'SPEEDSTER', 'PHANTOM'];
const BITBEASTS: BitbeastType[] = ['DRAGOON', 'DRANZER', 'DRACIEL', 'DRIGER'];
const ARENAS: ArenaStyle[] = ['CLASSIC', 'CYBER_HEX', 'MAGMA_OCTA'];

const CustomizeScreen: React.FC<CustomizeScreenProps> = ({ config, difficulty, onChange, onDifficultyChange, onConfirm }) => {
  return (
    <div className="z-10 flex flex-col md:flex-row gap-8 items-center max-w-6xl w-full px-8 overflow-y-auto max-h-screen py-8 pb-32">
      
      {/* 3D-ish Preview */}
      <div className="flex-1 bg-slate-900/80 border border-blue-500/20 p-12 rounded-3xl backdrop-blur-xl relative overflow-hidden flex flex-col items-center">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
        <h2 className="text-2xl font-black font-orbitron text-blue-400 mb-12 tracking-widest italic">BLADE WORKSHOP</h2>
        
        <div className="relative w-56 h-56 group cursor-pointer hover:scale-110 transition-transform">
           <div className="absolute inset-0 border-4 border-white/10 rounded-full animate-spin-slow" />
           <div 
             className="absolute inset-4 rounded-full shadow-[0_0_60px_#3b82f6] flex items-center justify-center text-5xl"
             style={{ backgroundColor: config.color, color: '#fff' }}
           >
             {BITBEAST_INFO[config.bitbeast].symbol}
           </div>
           <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 px-4 py-1 text-[10px] font-black font-orbitron skew-x-[-12deg]">
             {config.bitbeast} V2
           </div>
        </div>

        <div className="mt-16 text-center space-y-2">
           <h3 className="text-3xl font-black font-orbitron text-white italic uppercase tracking-tighter">
             {BITBEAST_INFO[config.bitbeast].name}
           </h3>
           <p className="text-blue-400 font-bold text-xs uppercase tracking-[0.2em]">SPECIAL: {BITBEAST_INFO[config.bitbeast].move}</p>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="flex-1 space-y-8 w-full">
        
        {/* Bitbeast Selector */}
        <div className="space-y-3">
          <h4 className="text-xs font-black font-orbitron text-slate-500 uppercase tracking-widest">Select Bitbeast</h4>
          <div className="grid grid-cols-4 gap-2">
            {BITBEASTS.map(b => (
              <button 
                key={b} 
                onClick={() => onChange({ ...config, bitbeast: b, color: BITBEAST_INFO[b].color })}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center ${config.bitbeast === b ? 'border-blue-500 bg-blue-500/20' : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'}`}
              >
                <span className="text-2xl mb-1">{BITBEAST_INFO[b].symbol}</span>
                <span className="text-[8px] font-black font-orbitron uppercase">{b}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Archetype Selector */}
        <div className="space-y-3">
          <h4 className="text-xs font-black font-orbitron text-slate-500 uppercase tracking-widest">Blade Archetype</h4>
          <div className="grid grid-cols-2 gap-2">
            {ARCHETYPES.map(a => (
              <button 
                key={a} 
                onClick={() => onChange({ ...config, archetype: a })}
                className={`py-3 px-4 rounded-lg border-2 transition-all text-left ${config.archetype === a ? 'border-purple-500 bg-purple-500/20' : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'}`}
              >
                <div className="text-[10px] font-black font-orbitron text-white">{a}</div>
                <div className="text-[7px] text-slate-500 font-bold leading-tight">{ARCHETYPE_STATS[a].description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <button 
          onClick={onConfirm}
          className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black font-orbitron skew-x-[-12deg] transition-all flex items-center justify-center gap-4 text-xl shadow-[0_10px_30px_rgba(37,99,235,0.4)]"
        >
          <span className="skew-x-[12deg]">LET IT RIP!</span>
          <ChevronRight size={24} className="skew-x-[12deg]" />
        </button>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default CustomizeScreen;
