
import React, { useState } from 'react';
import { STORY_CHAPTERS } from '../constants';

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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black p-4">
      {/* Pixel Character Portraits */}
      <div className="flex justify-between w-full max-w-4xl mb-12">
          <div className={`w-32 h-32 bg-blue-900 border-4 border-white flex items-center justify-center text-6xl transition-opacity ${currentLine.side === 'left' ? 'opacity-100' : 'opacity-30'}`}>
              👦
          </div>
          <div className={`w-32 h-32 bg-red-900 border-4 border-white flex items-center justify-center text-6xl transition-opacity ${currentLine.side === 'right' ? 'opacity-100' : 'opacity-30'}`}>
              {currentLine.portrait || '👤'}
          </div>
      </div>

      {/* Retro Dialogue Box */}
      <div className="w-full max-w-4xl bg-[#1a1a1a] border-8 border-[#f0f0f0] p-6 shadow-[12px_12px_0_#000]">
        <div className="text-yellow-500 text-xs mb-4 tracking-tighter uppercase font-bold">
           [{currentLine.speaker}]
        </div>
        <p className="text-white text-lg leading-relaxed mb-8">
          {currentLine.text}
        </p>
        
        <div className="flex justify-between items-center">
            <button onClick={onComplete} className="text-gray-600 text-[10px] hover:text-white uppercase">Skip (START)</button>
            <button 
                onClick={handleNext}
                className="bg-white text-black px-6 py-2 text-[12px] font-bold hover:bg-yellow-400 transition-colors"
            >
                NEXT (A)
            </button>
        </div>
      </div>
    </div>
  );
};

export default StoryScreen;
