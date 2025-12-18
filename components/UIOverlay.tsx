
import React, { useState, useRef, useEffect } from 'react';
import { Shield, Zap, Keyboard, Target, Smartphone, AlertTriangle } from 'lucide-react';
import { sounds } from '../utils/sounds';

interface Stats {
  health: number;
  energy: number;
}

interface UIOverlayProps {
  player: Stats;
  rival: Stats;
  onJoystickMove: (vector: { x: number, y: number }) => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ player, rival, onJoystickMove }) => {
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
    sounds.vibrate(10);
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
    <div className="absolute inset-0 pointer-events-none p-2 md:p-6 flex flex-col justify-between overflow-hidden select-none">
      
      {/* Top: Rival HUD */}
      <div className="flex justify-between items-start w-full">
        <div className="hidden md:flex p-2 bg-slate-900/60 border border-white/5 rounded-lg items-center gap-2 text-slate-400 text-[10px] font-bold">
          <Keyboard size={12} />
          <span>WASD: STEER | SPACE: BURST</span>
        </div>
        
        <div className="w-full max-w-[240px] md:max-w-xs bg-slate-950/90 p-3 border-r-4 border-red-500 rounded-bl-xl shadow-2xl backdrop-blur-xl border border-red-500/20">
          <div className="flex justify-between items-center mb-1">
            <span className="text-red-400 font-black font-orbitron text-xs italic tracking-widest">LORD VEX</span>
            <div className="flex items-center gap-1 text-[8px] text-red-500 font-bold uppercase italic">
              <Shield size={10} /> Armor
            </div>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-gradient-to-r from-red-700 to-red-400 transition-all duration-300" 
              style={{ width: `${rival.health}%` }}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="text-[7px] text-slate-500 font-black uppercase">BURST SYNC</div>
            <div className="h-1.5 flex-1 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${rival.energy >= 100 ? 'bg-orange-500 animate-pulse' : 'bg-red-400'}`} 
                  style={{ width: `${rival.energy}%` }} 
                />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Player HUD & Joystick */}
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end w-full gap-4 md:gap-6 pointer-events-none pb-4 md:pb-0">
        
        {/* Player Stats Card */}
        <div className="w-full max-w-[280px] md:max-w-[320px] bg-slate-950/90 p-4 border-l-4 border-blue-500 rounded-tr-xl shadow-2xl backdrop-blur-xl self-start md:self-auto pointer-events-auto transition-transform hover:scale-105 border border-blue-500/20">
          <div className="flex justify-between items-center mb-1">
            <span className="text-blue-400 font-black font-orbitron text-sm italic uppercase tracking-tighter">KENJI</span>
            <span className="text-[9px] text-blue-500 font-bold uppercase italic flex items-center gap-1">
               <Smartphone size={10} /> LINK ACTIVE
            </span>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden mb-3">
            <div 
              className="h-full bg-gradient-to-r from-blue-700 to-blue-400 transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
              style={{ width: `${player.health}%` }}
            />
          </div>
          
          <div className="flex items-center gap-3 h-8">
             <div className="flex items-center gap-1">
                <Zap size={14} className={`${player.energy >= 100 ? 'text-yellow-400 animate-pulse' : 'text-blue-300'}`} />
                <span className="text-[9px] text-blue-300 font-black uppercase tracking-widest">TORNADO CORE</span>
             </div>
             
             <div className="h-3 flex-1 bg-slate-900 rounded-full overflow-hidden relative border border-white/5">
               <div 
                  className={`h-full transition-all duration-300 ${player.energy >= 100 ? 'bg-yellow-400 shadow-[0_0_20px_#facc15]' : 'bg-blue-500'}`}
                  style={{ width: `${player.energy}%` }}
               />
               {player.energy >= 100 && <div className="absolute inset-0 bg-white/10 animate-pulse" />}
             </div>
          </div>
          {player.energy >= 100 && (
            <div className="mt-2 text-center text-yellow-400 font-black text-[9px] animate-bounce tracking-[0.2em] uppercase italic bg-yellow-400/10 py-1 rounded border border-yellow-400/30 flex items-center justify-center gap-2">
              <AlertTriangle size={12} /> SPIRIT STORM: READY <AlertTriangle size={12} />
            </div>
          )}
        </div>

        {/* Joystick Control */}
        <div className="pointer-events-auto flex items-center justify-center">
          <div 
            ref={joystickRef}
            onMouseDown={(e) => startJoystick(e.clientX, e.clientY)}
            onTouchStart={(e) => startJoystick(e.touches[0].clientX, e.touches[0].clientY)}
            onMouseMove={onMouseMove}
            onTouchMove={onTouchMove}
            className="w-24 h-24 md:w-32 md:h-32 bg-slate-900/30 rounded-full border-2 border-white/10 flex items-center justify-center relative touch-none select-none backdrop-blur-md shadow-2xl ring-4 ring-blue-500/5 active:ring-blue-500/20 transition-all"
          >
             <div className="absolute inset-4 rounded-full border border-blue-400/10"></div>
             <div 
               className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-blue-800 rounded-full shadow-2xl flex items-center justify-center transition-transform duration-75 active:scale-90 ring-2 ring-white/20"
               style={{ transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)` }}
             >
               <Target size={20} className="text-white opacity-80" />
             </div>
             <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[7px] text-blue-400/40 font-black tracking-[0.2em] uppercase whitespace-nowrap">
               HAPTIC NAVIGATION
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UIOverlay;
