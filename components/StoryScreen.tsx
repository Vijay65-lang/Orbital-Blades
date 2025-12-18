
import React, { useState } from 'react';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 p-4 md:p-10 font-rajdhani overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950"></div>
      
      <div className="max-w-6xl w-full flex flex-col items-center relative z-10">
        
        {/* Chapter Header */}
        <div className="mb-12 text-center animate-in slide-in-from-top duration-1000">
            <h2 className="text-blue-500 font-black font-orbitron text-xs tracking-[0.8em] uppercase mb-3 opacity-70">
                ZENON TOURNAMENT: PHASE {chapter.id}
            </h2>
            <h1 className="text-5xl md:text-7xl font-black font-orbitron text-white italic tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                {chapter.title.toUpperCase()}
            </h1>
        </div>

        {/* Cinematic Stage */}
        <div className="relative w-full aspect-[21/9] bg-slate-900/50 border-y-2 border-white/10 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] flex items-end justify-between p-12">
          
          {/* Character Left (Aiger) */}
          <div className={`transition-all duration-700 flex flex-col items-center transform ${currentLine.side === 'left' ? 'scale-110 opacity-100 translate-y-0' : 'scale-90 opacity-30 translate-y-8'}`}>
              <div className="w-40 h-40 md:w-64 md:h-64 bg-blue-600 rounded-full flex items-center justify-center text-8xl shadow-[0_0_50px_rgba(59,130,246,0.5)] border-4 border-white mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-full"></div>
                👦
              </div>
              <div className="bg-blue-600 px-8 py-2 text-white font-black font-orbitron text-xl italic skew-x-[-15deg] shadow-xl">AIGER</div>
          </div>

          {/* Character Right (Rival) */}
          <div className={`transition-all duration-700 flex flex-col items-center transform ${currentLine.side === 'right' ? 'scale-110 opacity-100 translate-y-0' : 'scale-90 opacity-30 translate-y-8'}`}>
              <div className={`w-40 h-40 md:w-64 md:h-64 ${chapter.rivalName === 'Lord Vex' ? 'bg-red-950 border-red-600 shadow-[0_0_50px_rgba(153,27,27,0.7)]' : 'bg-slate-800 border-slate-600'} rounded-full flex items-center justify-center text-8xl border-4 mb-6 relative`}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-full"></div>
                {currentLine.portrait || '👤'}
              </div>
              <div className="bg-slate-800 px-8 py-2 text-white font-black font-orbitron text-xl italic skew-x-[-15deg] uppercase shadow-xl">{chapter.rivalName}</div>
          </div>

          {/* Dialogue Interface */}
          <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-center pointer-events-none">
             <div className="bg-slate-900/90 border-t-4 border-blue-500 p-8 rounded-xl shadow-2xl pointer-events-auto max-w-4xl w-full transform transition-all animate-in slide-in-from-bottom duration-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-blue-500 animate-pulse"></div>
                  <span className="text-blue-400 font-black font-orbitron text-sm tracking-widest uppercase">{currentLine.speaker}</span>
                </div>
                <p className="text-white text-2xl md:text-3xl font-medium leading-relaxed italic border-l-4 border-white/10 pl-6">
                  "{currentLine.text}"
                </p>
                
                <div className="flex justify-between items-center mt-10">
                    <button onClick={onComplete} className="text-slate-500 hover:text-white flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] transition-colors group">
                        <FastForward size={18} className="group-hover:translate-x-1 transition-transform" /> SKIP SCENE
                    </button>
                    <button 
                        onClick={handleNext}
                        className="flex items-center gap-4 bg-blue-600 hover:bg-white hover:text-blue-600 text-white px-12 py-4 rounded-sm skew-x-[-12deg] transition-all transform hover:scale-105 shadow-2xl"
                    >
                        <span className="skew-x-[12deg] font-black font-orbitron text-lg">
                            {lineIndex === chapter.dialogue.length - 1 ? 'LET IT RIP!' : 'CONTINUE'}
                        </span>
                        <ChevronRight className="skew-x-[12deg]" size={24} />
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
