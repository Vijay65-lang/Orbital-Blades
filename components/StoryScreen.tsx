
import React, { useState, useEffect } from 'react';

interface StoryScreenProps {
  onComplete: () => void;
}

const STORY_TEXTS = [
  "In the year 20XX, the Zenon Tournament began...",
  "The cosmic Blue Orb has landed in the Grand Stadium.",
  "Rivals from across the galaxy have gathered to claim its power.",
  "You are Kenji, a rookie blader with the spirit of the Azure Dragon.",
  "Your opponent? The cold-blooded Lord Vex and his Frost Wolf.",
  "Enter the workshop to tune your blade!"
];

const StoryScreen: React.FC<StoryScreenProps> = ({ onComplete }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (index < STORY_TEXTS.length - 1) {
        setIndex(index + 1);
      } else {
        onComplete();
      }
    }, 2800);
    return () => clearTimeout(timer);
  }, [index, onComplete]);

  return (
    <div className="z-10 max-w-2xl px-8 text-center">
      <div key={index} className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <h2 className="text-3xl font-orbitron text-blue-400 mb-6 uppercase tracking-tighter italic">
          Episode {index + 1}: The Convergence
        </h2>
        <p className="text-2xl text-white font-medium leading-relaxed drop-shadow-lg">
          {STORY_TEXTS[index]}
        </p>
      </div>
      
      <div className="mt-12 flex justify-center space-x-2">
        {STORY_TEXTS.map((_, i) => (
          <div 
            key={i} 
            className={`h-1 w-8 transition-colors duration-500 ${i <= index ? 'bg-blue-500' : 'bg-slate-800'}`}
          />
        ))}
      </div>

      <button 
        onClick={onComplete}
        className="mt-12 text-slate-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
      >
        Skip Intro
      </button>
    </div>
  );
};

export default StoryScreen;
