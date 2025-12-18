
import React from 'react';
import { Play, Trophy, Settings, GraduationCap } from 'lucide-react';

interface MenuProps {
  onStart: () => void;
  onTutorial: () => void;
}

const Menu: React.FC<MenuProps> = ({ onStart, onTutorial }) => {
  return (
    <div className="z-10 flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="relative">
        <div className="absolute -inset-4 bg-blue-500/20 blur-3xl rounded-full animate-pulse"></div>
        <h1 className="text-7xl font-black font-orbitron text-white tracking-tighter drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]">
          ORBITAL<br/>BLADES
        </h1>
        <p className="text-blue-400 font-bold tracking-widest mt-2 uppercase text-sm">Zenon Tournament Edition</p>
      </div>

      <div className="flex flex-col space-y-4 w-64">
        <button 
          onClick={onStart}
          className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-sm skew-x-[-12deg] transition-all overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
          <span className="flex items-center justify-center gap-2 skew-x-[12deg]">
            <Play fill="currentColor" size={20} />
            ENTER TOURNAMENT
          </span>
        </button>

        <button 
          onClick={onTutorial}
          className="group relative px-8 py-3 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold rounded-sm skew-x-[-12deg] transition-all border border-cyan-500/30"
        >
          <span className="flex items-center justify-center gap-2 skew-x-[12deg]">
            <GraduationCap size={18} />
            TRAINING SESSIONS
          </span>
        </button>

        <button className="px-8 py-3 border border-blue-500/30 text-blue-300 font-bold rounded-sm skew-x-[-12deg] hover:bg-blue-500/10 transition-colors">
          <span className="flex items-center justify-center gap-2 skew-x-[12deg]">
            <Trophy size={18} />
            HALL OF FAME
          </span>
        </button>

        <button className="px-8 py-3 border border-slate-700 text-slate-400 font-bold rounded-sm skew-x-[-12deg] hover:bg-slate-800 transition-colors">
          <span className="flex items-center justify-center gap-2 skew-x-[12deg]">
            <Settings size={18} />
            CONFIGURATION
          </span>
        </button>
      </div>

      <div className="text-slate-500 text-xs mt-12 animate-bounce">
        TAP TO LAUNCH YOUR BLADE
      </div>
    </div>
  );
};

export default Menu;
