
import React, { useState, useEffect, useRef } from 'react';
// Removed unused Palette import
import { ChevronRight, Cpu, Target } from 'lucide-react';
import { AIDifficulty, BeyName } from '../types';
// Removed non-existent COLOR_PRESETS export which caused a build error
import { BEY_DATA } from '../constants';

interface CustomizeScreenProps {
  currentBey: BeyName;
  difficulty: AIDifficulty;
  onBeyChange: (bey: BeyName) => void;
  onDifficultyChange: (difficulty: AIDifficulty) => void;
  onConfirm: () => void;
}

const CustomizeScreen: React.FC<CustomizeScreenProps> = ({ currentBey, difficulty, onBeyChange, onDifficultyChange, onConfirm }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    let frameId: number;
    const animate = () => {
      setRotation(prev => (prev + 0.1) % (Math.PI * 2));
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
    const radius = 100;
    const data = BEY_DATA[currentBey] || BEY_DATA['Z_ACHILLES'];

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);

    // Render Preview Bey
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.8, 0, Math.PI * 2);
    ctx.fillStyle = data.color;
    ctx.shadowBlur = 20;
    ctx.shadowColor = data.glow;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.rotate(-rotation);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px Orbitron';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(data.symbol, 0, 0);

    ctx.restore();
  }, [rotation, currentBey]);

  return (
    <div className="z-10 flex flex-col lg:flex-row gap-8 items-center max-w-7xl w-full h-full px-4 py-8 overflow-y-auto bg-slate-950/60 backdrop-blur-xl">
      
      <div className="w-full lg:w-2/5 flex flex-col items-center bg-slate-900/40 p-10 rounded-[40px] border border-white/5">
        <h2 className="text-3xl font-black font-orbitron text-white italic mb-10 self-start">
          <span className="text-red-500">TURBO</span> LAB
        </h2>
        <canvas ref={canvasRef} width={400} height={400} className="w-full max-w-[320px] aspect-square" />
        <div className="mt-10 text-center">
           <h3 className="text-4xl font-black font-orbitron text-white italic uppercase">{BEY_DATA[currentBey]?.move}</h3>
           <p className="text-red-500 font-bold tracking-widest uppercase text-xs mt-2">Turbo Awakening Ready</p>
        </div>
      </div>

      <div className="w-full lg:w-3/5 space-y-10">
        <section>
          <div className="flex items-center gap-2 mb-4">
             <Cpu size={18} className="text-blue-500" />
             <h4 className="text-xs font-black font-orbitron text-slate-400 uppercase tracking-widest">Select Your Beyblade</h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {(Object.keys(BEY_DATA) as BeyName[]).map(bey => (
              <button 
                key={bey} 
                onClick={() => onBeyChange(bey)}
                className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${currentBey === bey ? 'border-red-500 bg-red-500/10' : 'border-slate-800 bg-slate-900/60'}`}
              >
                <div className="text-4xl">{BEY_DATA[bey].symbol}</div>
                <div className="text-[10px] font-black font-orbitron text-white uppercase">{bey.replace('_', ' ')}</div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
             <Target size={18} className="text-red-500" />
             <h4 className="text-xs font-black font-orbitron text-slate-400 uppercase tracking-widest">AI Difficulty</h4>
          </div>
          <div className="flex gap-3">
            {(['ROOKIE', 'ACE', 'ZENON', 'GOD_TIER'] as AIDifficulty[]).map(d => (
              <button 
                key={d} 
                onClick={() => onDifficultyChange(d)}
                className={`flex-1 py-4 rounded-2xl border-2 transition-all font-black text-[10px] tracking-widest ${difficulty === d ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-slate-800 bg-slate-900/60 text-slate-500'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </section>

        <button 
          onClick={onConfirm}
          className="w-full py-8 bg-red-600 hover:bg-red-500 text-white font-black font-orbitron text-3xl italic rounded-[30px] shadow-2xl flex items-center justify-center gap-4 transition-transform hover:scale-105"
        >
          GO SHOOT!
          <ChevronRight size={32} />
        </button>
      </div>
    </div>
  );
};

export default CustomizeScreen;
