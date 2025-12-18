
import React, { useState, useRef, useEffect } from 'react';
import { Zap, Shield, Target } from 'lucide-react';

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
  const joystickRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging || !joystickRef.current) return;
    
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as any).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as any).clientY;
    
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = rect.width / 2;
    
    const limitedDist = Math.min(dist, maxDist);
    const angle = Math.atan2(dy, dx);
    
    const nx = Math.cos(angle) * (limitedDist / maxDist);
    const ny = Math.sin(angle) * (limitedDist / maxDist);
    
    setKnobPos({ x: Math.cos(angle) * limitedDist, y: Math.sin(angle) * limitedDist });
    onJoystickMove({ x: nx, y: ny });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setKnobPos({ x: 0, y: 0 });
    onJoystickMove({ x: 0, y: 0 });
  };

  return (
    <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between z-30 font-orbitron">
      
      {/* RIVAL HUD: Top Right */}
      <div className="flex justify-end p-2">
        <div className="bg-black/80 border-4 border-red-600 p-4 w-72 shadow-[8px_8px_0_rgba(0,0,0,0.5)]">
           <div className="flex justify-between text-[10px] text-red-500 mb-1 font-black">
             <span>RIVAL HP</span>
             <span>{Math.max(0, Math.ceil(rival.health))}%</span>
           </div>
           <div className="h-5 bg-gray-900 p-1 mb-2">
             <div 
                className="h-full bg-red-600 transition-all duration-300" 
                style={{ width: `${Math.max(0, rival.health)}%` }}
             ></div>
           </div>

           {/* Opponent Energy Bar (Strategic info) */}
           <div className="flex items-center gap-2">
              <span className="text-[8px] text-red-400 font-bold">RIVAL ENG:</span>
              <div className="flex-1 h-2 bg-gray-900 p-0.5">
                 <div className="h-full bg-red-400" style={{ width: `${rival.energy}%` }}></div>
              </div>
            </div>
        </div>
      </div>

      {/* PLAYER HUD: Bottom Left */}
      <div className="flex justify-between items-end p-2 gap-4">
        <div className="bg-black/80 border-4 border-blue-600 p-4 w-80 shadow-[8px_8px_0_rgba(0,0,0,0.5)] pointer-events-auto">
            <div className="flex justify-between text-[12px] text-blue-400 mb-2 font-black">
              <span>AIGER HP (CHASSIS)</span>
              <span>{Math.max(0, Math.ceil(player.health))}%</span>
            </div>
            <div className="h-7 bg-gray-900 p-1 mb-3 border border-blue-500/30">
               <div 
                  className={`h-full transition-all duration-300 ${player.health < 30 ? 'bg-yellow-400 animate-pulse shadow-[0_0_15px_#facc15]' : 'bg-blue-500 shadow-[0_0_10px_#3b82f6]'}`} 
                  style={{ width: `${Math.max(0, player.health)}%` }}
               ></div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-yellow-500 font-black">TURBO ENG:</span>
              <div className="flex-1 h-3 bg-gray-900 p-0.5 relative">
                 <div 
                    className={`h-full transition-all ${player.energy >= 100 ? 'bg-yellow-400 shadow-[0_0_15px_#facc15]' : 'bg-yellow-600'}`} 
                    style={{ width: `${player.energy}%` }}
                 ></div>
                 {player.energy >= 100 && (
                    <div className="absolute inset-0 border border-white animate-pulse"></div>
                 )}
              </div>
            </div>

            {player.energy >= 100 && (
                <button 
                  onClick={onSpecialPress}
                  className="mt-4 w-full py-3 bg-yellow-500 text-black text-[12px] font-black hover:bg-white transition-all border-2 border-black animate-bounce shadow-[0_0_20px_#facc15]"
                >
                  SPIRIT BURST: Z-BUSTER!
                </button>
            )}
        </div>

        {/* VIRTUAL JOYSTICK: Bottom Right */}
        <div 
            ref={joystickRef}
            className="w-32 h-32 bg-slate-900/40 rounded-full border-4 border-white/20 relative pointer-events-auto flex items-center justify-center backdrop-blur-sm shadow-2xl"
            onMouseDown={() => setIsDragging(true)}
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
            onTouchStart={() => setIsDragging(true)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div 
                className="w-12 h-12 bg-white/10 rounded-full border-2 border-white/40 absolute transition-transform"
                style={{ transform: `translate(${knobPos.x}px, ${knobPos.y}px)` }}
            >
                <div className="absolute inset-0 flex items-center justify-center text-white/20">
                    <Target size={16} />
                </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <div className="w-1 h-full bg-white"></div>
                <div className="h-1 w-full bg-white absolute"></div>
            </div>
        </div>
      </div>

      {/* Energy Overload Warning */}
      {player.energy >= 100 && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 text-center">
            <div className="text-yellow-500 text-[10px] font-black animate-pulse uppercase tracking-[0.2em]">
               ENERGY OVERLOAD! RELEASE NOW!
            </div>
        </div>
      )}
    </div>
  );
};

export default UIOverlay;
