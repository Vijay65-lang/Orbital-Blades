
import React, { useState, useRef, useEffect } from 'react';
import { Shield, Zap, Keyboard, Target, Smartphone, AlertTriangle, Power } from 'lucide-react';
import { sounds } from '../utils/sounds';

interface Stats {
  health: number;
  energy: number;
}

interface UIOverlayProps {
  player: Stats;
  rival: Stats;
  onJoystickMove: (vector: { x: number, y: number }) => void;
  onSpecialPress?: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ player, rival, onJoystickMove, onSpecialPress }) => {
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const joystickRef = useRef<HTMLDivElement>(null);

  const handleJoystick = (clientX: number, clientY: number) => {
    if (!joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const maxDist = rect.width / 2;
    const distance = Math.min(maxDist, Math.sqrt(dx * dx + dy * dy));
    const angle = Math.atan2(dy, dx);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    
    setJoystickPos({ x, y });
    onJoystickMove({ x: x / maxDist, y: y / maxDist });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (joystickActive && e.touches.length > 0) {
      handleJoystick(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (joystickActive) {
      handleJoystick(e.clientX, e.clientY);
    }
  };

  const startJoystick = (clientX: number, clientY: number) => {
    setJoystickActive(true);
    sounds.vibrate(15);
    handleJoystick(clientX, clientY);
  };

  const stopJoystick = () => {
    setJoystickActive(false);
    setJoystickPos({ x: 0, y: 0 });
    onJoystickMove({ x: 0, y: 0 });
  };

  useEffect(() => {
    const handleGlobalUp = () => stopJoystick();
    window.addEventListener('mouseup', handleGlobalUp);
    window.addEventListener('touchend', handleGlobalUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalUp);
      window.removeEventListener('touchend', handleGlobalUp);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none p-4 md:p-10 flex flex-col justify-between overflow-hidden select-none z-30">
      
      {/* Top: Rival Status */}
      <div className="flex justify-between items-start w-full">
        <div className="hidden lg:flex p-4 bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-2xl items-center gap-3 text-slate-300 text-xs font-black italic">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>OS LINK: OPTIMAL | WASD STEER | SPACE SPECIAL</span>
        </div>
        
        <div className="w-full max-w-[280px] bg-slate-950/90 p-5 border-r-8 border-red-500 rounded-bl-3xl shadow-2xl backdrop-blur-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-red-500 font-black font-orbitron text-sm italic tracking-widest uppercase">LORD VEX</span>
            <span className="text-[10px] text-red-600 font-black uppercase italic flex items-center gap-1">
              <Shield size={12} /> ARMOR
            </span>
          </div>
          <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden mb-3">
            <div 
              className="h-full bg-gradient-to-r from-red-700 to-red-400 transition-all duration-300 shadow-[0_0_10px_red]" 
              style={{ width: `${rival.health}%` }}
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="text-[8px] text-slate-500 font-black uppercase">BURST SYNC</div>
            <div className="h-1.5 flex-1 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${rival.energy >= 100 ? 'bg-orange-500 animate-pulse shadow-[0_0_15px_orange]' : 'bg-red-400'}`} 
                  style={{ width: `${rival.energy}%` }} 
                />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex flex-row justify-between items-end w-full gap-6 pointer-events-none">
        
        {/* Player Stats */}
        <div className="w-full max-w-[340px] bg-slate-950/90 p-6 border-l-8 border-blue-500 rounded-tr-3xl shadow-2xl backdrop-blur-xl pointer-events-auto border border-blue-500/10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-blue-400 font-black font-orbitron text-xl italic uppercase tracking-tighter">KENJI</span>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
               <span className="text-[10px] text-blue-500 font-black uppercase italic">NEURAL LINK ACTIVE</span>
            </div>
          </div>
          
          <div className="h-4 bg-slate-900 rounded-full overflow-hidden mb-4 border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-blue-700 via-blue-400 to-blue-200 transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.6)]" 
              style={{ width: `${player.health}%` }}
            />
          </div>
          
          <div className="flex items-center gap-4">
             <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <Zap size={18} className={`${player.energy >= 100 ? 'text-yellow-400 animate-pulse' : 'text-blue-300'}`} />
             </div>
             
             <div className="h-4 flex-1 bg-slate-900 rounded-full overflow-hidden relative border border-white/5 p-0.5">
               <div 
                  className={`h-full transition-all duration-300 rounded-full ${player.energy >= 100 ? 'bg-yellow-400 shadow-[0_0_30px_#facc15]' : 'bg-blue-600'}`}
                  style={{ width: `${player.energy}%` }}
               />
               {player.energy >= 100 && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
             </div>
          </div>
          
          {player.energy >= 100 && (
            <button 
              onClick={onSpecialPress}
              className="mt-4 w-full py-3 bg-yellow-400 text-black font-black text-xs animate-bounce tracking-[0.3em] uppercase italic rounded-xl border-4 border-white shadow-[0_0_30px_#facc15] pointer-events-auto flex items-center justify-center gap-3 active:scale-95 transition-transform"
            >
              <Power size={14} /> SPIRIT BURST READY <Power size={14} />
            </button>
          )}
        </div>

        {/* Joystick */}
        <div className="pointer-events-auto flex items-center justify-center p-4">
          <div 
            ref={joystickRef}
            onMouseDown={(e) => startJoystick(e.clientX, e.clientY)}
            onTouchStart={(e) => startJoystick(e.touches[0].clientX, e.touches[0].clientY)}
            onMouseMove={onMouseMove}
            onTouchMove={onTouchMove}
            className="w-32 h-32 md:w-44 md:h-44 bg-slate-900/40 rounded-full border-4 border-white/5 flex items-center justify-center relative touch-none select-none backdrop-blur-2xl shadow-2xl ring-8 ring-blue-500/5 transition-all"
          >
             <div className="absolute inset-8 rounded-full border-2 border-dashed border-blue-400/10 animate-[spin_20s_linear_infinite]"></div>
             <div 
               className="w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-blue-400 via-blue-600 to-blue-900 rounded-full shadow-[0_15px_30px_rgba(0,0,0,0.6)] flex items-center justify-center transition-transform duration-75 active:scale-90 ring-4 ring-white/10"
               style={{ transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)` }}
             >
               <Target size={28} className="text-white opacity-90" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UIOverlay;
