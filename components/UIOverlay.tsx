
import React, { useState, useRef, useEffect } from 'react';
import { Zap, Shield, Target } from 'lucide-react';
import { sounds } from '../utils/sounds';

interface Stats {
  health: number;
  energy: number;
  isTurbo?: boolean;
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

  return (
    <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between overflow-hidden select-none z-30">
      
      {/* Rival HUD */}
      <div className="w-full max-w-md self-end flex items-center gap-4">
        <div className="bg-slate-900/90 p-3 border-r-8 border-red-600 flex-1 rounded-bl-3xl shadow-2xl">
           <div className="flex justify-between items-center mb-1">
             <span className="text-red-500 font-black font-orbitron text-xs">CHALLENGER</span>
             <Shield size={12} className="text-red-500" />
           </div>
           <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden border border-red-900/50">
             <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${Math.max(0, rival.health)}%` }}></div>
           </div>
        </div>
        <div className="w-16 h-16 bg-slate-800 border-2 border-red-600 rounded-full flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(220,38,38,0.5)]">
           💀
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-end w-full gap-4">
        {/* Player HUD */}
        <div className="flex items-center gap-4 w-full max-w-md">
          <div className="w-20 h-20 bg-blue-600 border-4 border-white rounded-full flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(59,130,246,0.8)] relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
             👦
          </div>
          <div className="bg-slate-900/90 p-5 border-l-8 border-blue-600 flex-1 rounded-tr-3xl pointer-events-auto shadow-2xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-blue-400 font-black font-orbitron italic">AIGER AKABANE</span>
              {player.health < 40 && <span className="text-yellow-400 text-xs animate-pulse font-black font-orbitron tracking-tighter">TURBO!</span>}
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden mb-3 border border-blue-900/50">
               <div className={`h-full transition-all duration-300 ${player.health < 40 ? 'bg-yellow-400 shadow-[0_0_10px_#eab308]' : 'bg-blue-600'}`} style={{ width: `${Math.max(0, player.health)}%` }}></div>
            </div>
            <div className="flex items-center gap-3">
              <Zap size={16} className={player.energy >= 100 ? 'text-yellow-400 animate-bounce' : 'text-blue-400'} />
              <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-blue-900/50">
                 <div className="h-full bg-blue-400 transition-all" style={{ width: `${player.energy}%` }}></div>
              </div>
            </div>
            {player.energy >= 100 && (
                <button 
                  onClick={onSpecialPress}
                  className="mt-4 w-full py-4 bg-yellow-500 text-black font-black font-orbitron text-sm italic animate-pulse rounded-lg shadow-[0_0_30px_#eab308] border-b-4 border-yellow-700 hover:scale-105 transition-transform"
                >
                  UNLEASH SPIRIT!
                </button>
            )}
          </div>
        </div>

        {/* Mobile Joystick */}
        <div 
          ref={joystickRef}
          className="w-36 h-36 bg-slate-900/60 rounded-full border-4 border-white/20 flex items-center justify-center relative touch-none pointer-events-auto backdrop-blur-md"
          onTouchStart={(e) => { setJoystickActive(true); handleJoystick(e.touches[0].clientX, e.touches[0].clientY); }}
          onTouchMove={(e) => { if (joystickActive) handleJoystick(e.touches[0].clientX, e.touches[0].clientY); }}
          onTouchEnd={() => { setJoystickActive(false); setJoystickPos({ x: 0, y: 0 }); onJoystickMove({ x: 0, y: 0 }); }}
        >
          <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-ping pointer-events-none"></div>
          <div 
            className="w-14 h-14 bg-blue-600 rounded-full shadow-[0_0_25px_#2563eb] border-2 border-white/30"
            style={{ transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)` }}
          />
        </div>
      </div>
    </div>
  );
};

export default UIOverlay;
