
import React, { useState, useEffect } from 'react';
import { STORY_CHAPTERS } from '../constants';
import { ChevronRight, FastForward } from 'lucide-react';

interface StoryScreenProps {
  chapterIndex: number;
  onComplete: () => void;
}

const StoryScreen: React.FC<StoryScreenProps> = ({ chapterIndex, onComplete }) => {
  const [lineIndex, setLineIndex] = useState(0);
  const chapter = STORY_CHAPTERS[chapterIndex] || STORY_CHAPTERS[0];
  const currentLine = chapter.dialogue[lineIndex];

  const handleNext = () => {
    if (lineIndex < chapter.dialogue.length - 1) {
      setLineIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const getPortrait = (speaker: string) => {
    if (speaker === "Aiger") return "👦";
    if (speaker === "Kenji") return "🌪️";
    if (speaker === "Lui") return "🧊";
    if (speaker === "Valt") return "⚡";
    if (speaker === "Lord Vex") return "💀";
    return "👤";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 md:p-10 font-rajdhani">
      <div className="max-w-5xl w-full flex flex-col items-center">
        
        {/* Chapter Title Banner */}
        <div className="mb-8 text-center animate-in slide-in-from-top duration-700">
            <h2 className="text-blue-500 font-black font-orbitron text-xs tracking-[0.5em] uppercase mb-2">
                ZENON TOURNAMENT ARC
            </h2>
            <h1 className="text-4xl md:text-6xl font-black font-orbitron text-white italic tracking-tighter">
                CHAPTER {chapter.id}: {chapter.title}
            </h1>
        </div>

        <div className="relative w-full aspect-[21/9] bg-slate-900 border-b-8 border-blue-600 rounded-xl overflow-hidden shadow-2xl flex items-end justify-between p-8 group">
          
          {/* Background Illustration Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
          
          {/* Character Left (Aiger usually) */}
          <div className={`transition-all duration-500 flex flex-col items-center ${currentLine.side === 'left' ? 'scale-110 opacity-100 translate-y-0' : 'scale-90 opacity-40 translate-y-4'}`}>
              <div className="w-32 h-32 md:w-48 md:h-48 bg-blue-600 rounded-full flex items-center justify-center text-7xl shadow-[0_0_30px_#3b82f6] border-4 border-white mb-4">
                {getPortrait("Aiger")}
              </div>
              <div className="bg-blue-600 px-4 py-1 text-white font-black font-orbitron text-sm italic skew-x-[-12deg]">AIGER</div>
          </div>

          {/* Character Right (Rival) */}
          <div className={`transition-all duration-500 flex flex-col items-center ${currentLine.side === 'right' ? 'scale-110 opacity-100 translate-y-0' : 'scale-90 opacity-40 translate-y-4'}`}>
              <div className={`w-32 h-32 md:w-48 md:h-48 ${chapter.rivalName === 'Lord Vex' ? 'bg-red-950 border-red-600 shadow-[0_0_30px_#991b1b]' : 'bg-slate-800 border-slate-600'} rounded-full flex items-center justify-center text-7xl border-4 mb-4`}>
                {getPortrait(chapter.rivalName)}
              </div>
              <div className="bg-slate-800 px-4 py-1 text-white font-black font-orbitron text-sm italic skew-x-[-12deg] uppercase">{chapter.rivalName}</div>
          </div>

          {/* Dialogue Box Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black to-transparent pointer-events-none">
             <div className="bg-slate-900/95 border-l-8 border-blue-500 p-6 rounded-tr-3xl shadow-2xl pointer-events-auto transform transition-all animate-in slide-in-from-bottom duration-300">
                <div className="text-blue-400 font-bold text-xs mb-2 tracking-widest uppercase">{currentLine.speaker}</div>
                <p className="text-white text-xl md:text-2xl font-medium leading-relaxed italic">
                  "{currentLine.text}"
                </p>
                <div className="flex justify-between items-center mt-6">
                    <button onClick={onComplete} className="text-slate-500 hover:text-white flex items-center gap-1 text-xs font-black uppercase tracking-widest transition-colors">
                        <FastForward size={14} /> SKIP SCENE
                    </button>
                    <button 
                        onClick={handleNext}
                        className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-sm skew-x-[-12deg] transition-all transform hover:scale-105"
                    >
                        <span className="skew-x-[12deg] font-black font-orbitron text-sm">
                            {lineIndex === chapter.dialogue.length - 1 ? 'BATTLE START' : 'NEXT'}
                        </span>
                        <ChevronRight className="skew-x-[12deg]" size={16} />
                    </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryScreen;
