
import React, { useState, useEffect, useRef } from 'react';
import { Palette, Zap, Sparkles, ChevronRight, Map, ShieldAlert, Cpu, Target, Box } from 'lucide-react';
import { ArenaStyle, AIDifficulty, BladeArchetype, BitbeastType } from '../types';
import { ARENA_THEMES, ARCHETYPE_STATS, BITBEAST_INFO, COLOR_PRESETS, STYLE_PATTERNS } from '../constants';

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

const CustomizeScreen: React.FC<CustomizeScreenProps> = ({ config, difficulty, onChange, onDifficultyChange, onConfirm }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    let frameId: number;
    const animate = () => {
      setRotation(prev => (prev + 0.15) % (Math.PI * 2));
      frameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = 80;

    ctx.save();
    ctx.translate(cx, cy);
    
    // Shadow
    ctx.beginPath();
    ctx.ellipse(0, radius, radius * 0.8, radius * 0.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fill();

    ctx.rotate(rotation);

    // 1. Blade Base (Outer)
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.stroke();

    // 2. Metal Weight Disk
    ctx.beginPath();
    const diskSides = 6;
    for(let i=0; i<diskSides; i++){
        const a = i * (Math.PI*2/diskSides);
        const r = radius * 0.85;
        const px = r * Math.cos(a);
        const py = r * Math.sin(a);
        if(i===0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    const grad = ctx.createLinearGradient(-radius, -radius, radius, radius);
    grad.addColorStop(0, '#94a3b8');
    grad.addColorStop(0.5, '#f1f5f9');
    grad.addColorStop(1, '#475569');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.stroke();

    // 3. Attack Ring
    const stats = ARCHETYPE_STATS[config.archetype];
    const sides = stats.shapeSides;
    ctx.beginPath();
    if (sides === 0) {
      ctx.arc(0, 0, radius * 0.7, 0, Math.PI * 2);
    } else {
      for (let i = 0; i < sides * 2; i++) {
        const angle = (i * Math.PI) / sides;
        const r = (i % 2 === 0) ? radius * 0.75 : radius * 0.6;
        const px = r * Math.cos(angle);
        const py = r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
    }
    ctx.fillStyle = config.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = config.glowColor;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 4. Center Bit Chip
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = BITBEAST_INFO[config.bitbeast].color;
    ctx.stroke();

    ctx.font = '36px Orbitron';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.rotate(-rotation); // Counter-rotate text
    ctx.fillText(BITBEAST_INFO[config.bitbeast].symbol, 0, 0);

    ctx.restore();
  }, [rotation, config]);

  return (
    <div className="z-10 flex flex-col lg:flex-row gap-8 items-center max-w-7xl w-full h-full px-4 lg:px-12 py-12 overflow-y-auto bg-slate-950/40 backdrop-blur-md">
      
      {/* 3D-ish Preview Panel */}
      <div className="lg:sticky lg:top-0 w-full lg:w-2/5 flex flex-col items-center bg-slate-900/60 p-8 rounded-[40px] border border-white/5 shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 via-transparent to-transparent rounded-[40px]" />
        
        <h2 className="text-3xl font-black font-orbitron text-white italic tracking-tighter mb-8 self-start">
          <span className="text-blue-500">ZENON</span> CHASSIS V.4
        </h2>

        <div className="relative w-full aspect-square max-w-[320px] flex items-center justify-center">
          <canvas ref={canvasRef} width={400} height={400} className="w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent pointer-events-none" />
        </div>

        <div className="mt-8 text-center w-full">
           <div className="inline-block px-4 py-1 bg-blue-600/20 text-blue-400 text-[10px] font-black font-orbitron rounded-full mb-4 border border-blue-500/20">
             SYNC STATUS: 98% RESONANT
           </div>
           <h3 className="text-4xl font-black font-orbitron text-white italic tracking-tighter uppercase mb-1">
             {BITBEAST_INFO[config.bitbeast].name}
           </h3>
           <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">ULTIMATE: {BITBEAST_INFO[config.bitbeast].move}</p>
           
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5 text-left">
                 <div className="text-[10px] text-slate-500 font-black uppercase mb-1">Archetype</div>
                 <div className="text-sm font-bold text-white">{config.archetype}</div>
              </div>
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5 text-left">
                 <div className="text-[10px] text-slate-500 font-black uppercase mb-1">Spirit Origin</div>
                 <div className="text-sm font-bold text-white">{config.bitbeast}</div>
              </div>
           </div>
        </div>
      </div>

      {/* Configuration Controls Panel */}
      <div className="w-full lg:w-3/5 space-y-10 pb-20">
        
        {/* Color Palette */}
        <section>
          <div className="flex items-center gap-2 mb-4">
             <Palette size={18} className="text-blue-500" />
             <h4 className="text-xs font-black font-orbitron text-slate-400 uppercase tracking-widest">Chassis Colorization</h4>
          </div>
          <div className="flex flex-wrap gap-4">
            {COLOR_PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => onChange({ ...config, color: p.color, glowColor: p.glow })}
                className={`w-12 h-12 rounded-2xl transition-all p-1 border-2 ${config.color === p.color ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                style={{ backgroundColor: p.color }}
              >
                <div className="w-full h-full rounded-xl" style={{ backgroundColor: p.glow }} />
              </button>
            ))}
          </div>
        </section>

        {/* Bitbeast Selector */}
        <section>
          <div className="flex items-center gap-2 mb-4">
             <Sparkles size={18} className="text-yellow-400" />
             <h4 className="text-xs font-black font-orbitron text-slate-400 uppercase tracking-widest">Spirit Fragment</h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['DRAGOON', 'DRANZER', 'DRACIEL', 'DRIGER'] as BitbeastType[]).map(b => (
              <button 
                key={b} 
                onClick={() => onChange({ ...config, bitbeast: b })}
                className={`group p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${config.bitbeast === b ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'}`}
              >
                <div className="text-4xl group-hover:scale-125 transition-transform">{BITBEAST_INFO[b].symbol}</div>
                <div className="text-[10px] font-black font-orbitron text-white">{b}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Archetype Selector */}
        <section>
          <div className="flex items-center gap-2 mb-4">
             <Cpu size={18} className="text-purple-400" />
             <h4 className="text-xs font-black font-orbitron text-slate-400 uppercase tracking-widest">Performance Profile</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(['STRIKER', 'GUARDIAN', 'SPEEDSTER', 'PHANTOM'] as BladeArchetype[]).map(a => (
              <button 
                key={a} 
                onClick={() => onChange({ ...config, archetype: a })}
                className={`p-5 rounded-3xl border-2 transition-all text-left relative overflow-hidden ${config.archetype === a ? 'border-purple-500 bg-purple-500/10' : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'}`}
              >
                <div className="text-lg font-black font-orbitron text-white italic mb-1 uppercase tracking-tighter">{a}</div>
                <div className="text-[11px] text-slate-400 font-bold leading-relaxed">{ARCHETYPE_STATS[a].description}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Arena Style Selector */}
        <section>
          <div className="flex items-center gap-2 mb-4">
             <Map size={18} className="text-emerald-400" />
             <h4 className="text-xs font-black font-orbitron text-slate-400 uppercase tracking-widest">Arena Topology</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['CLASSIC', 'CYBER_HEX', 'MAGMA_OCTA'] as ArenaStyle[]).map(s => (
              <button 
                key={s} 
                onClick={() => onChange({ ...config, arenaStyle: s })}
                className={`py-4 rounded-2xl border-2 transition-all font-black font-orbitron text-[10px] uppercase tracking-widest ${config.arenaStyle === s ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-800 bg-slate-900/40 text-slate-500 hover:border-slate-700'}`}
              >
                {ARENA_THEMES[s].name.replace('BEY-STADIUM: ', '')}
              </button>
            ))}
          </div>
        </section>

        {/* Start Game Action */}
        <div className="pt-6">
          <button 
            onClick={onConfirm}
            className="w-full group py-8 bg-blue-600 hover:bg-blue-500 text-white font-black font-orbitron text-3xl italic tracking-tighter transition-all flex items-center justify-center gap-6 rounded-[30px] shadow-[0_20px_60px_rgba(37,99,235,0.4)] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            LET IT RIP!
            <ChevronRight size={32} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default CustomizeScreen;
