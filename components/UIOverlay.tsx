
import React, { useState, useRef } from 'react';
import { Zap, Shield } from 'lucide-react';

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
  return (
    <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between z-30 font-orbitron">
      
      {/* GBA Style Rival HUD */}
      <div className="flex justify-end p-2">
        <div className="bg-black border-4 border-red-600 p-2 w-64 shadow-[8px_8px_0_rgba(0,0,0,0.5)]">
           <div className="flex justify-between text-[10px] text-red-500 mb-1">
             <span>RIVAL HP</span>
             <span>{Math.ceil(rival.health)}%</span>
           </div>
           <div className="h-4 bg-gray-900 p-1">
             <div className="h-full bg-red-600" style={{ width: `${Math.max(0, rival.health)}%` }}></div>
           </div>
        </div>
      </div>

      {/* GBA Style Player HUD */}
      <div className="flex justify-between items-end p-2 gap-4">
        <div className="bg-black border-4 border-blue-600 p-4 w-80 shadow-[8px_8px_0_rgba(0,0,0,0.5)] pointer-events-auto">
            <div className="flex justify-between text-[12px] text-blue-400 mb-2">
              <span>AIGER HP</span>
              <span>{Math.ceil(player.health)}%</span>
            </div>
            <div className="h-6 bg-gray-900 p-1 mb-3">
               <div className={`h-full ${player.health < 40 ? 'bg-yellow-400 animate-pulse' : 'bg-blue-500'}`} style={{ width: `${Math.max(0, player.health)}%` }}></div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-yellow-500">ENG:</span>
              <div className="flex-1 h-3 bg-gray-900 p-0.5">
                 <div className="h-full bg-yellow-500" style={{ width: `${player.energy}%` }}></div>
              </div>
            </div>

            {player.energy >= 100 && (
                <button 
                  onClick={onSpecialPress}
                  className="mt-4 w-full py-2 bg-yellow-500 text-black text-[10px] font-black hover:bg-white transition-colors border-2 border-black"
                >
                  SPECIAL Z-BUSTER!
                </button>
            )}
        </div>

        {/* Mini Retro Joystick for Mobile */}
        <div className="w-24 h-24 bg-gray-800 rounded-full border-4 border-white/20 relative pointer-events-auto sm:hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-20">🎮</div>
        </div>
      </div>
    </div>
  );
};

export default UIOverlay;
