
import React, { useState } from 'react';
import { ChevronRight, MousePointer2, Move, Zap, Target, ShieldCheck } from 'lucide-react';

interface TutorialStep {
  title: string;
  description: string;
  icon: any;
  visual: React.ReactNode;
}

const TutorialScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [stepIndex, setStepIndex] = useState(0);

  const steps: TutorialStep[] = [
    {
      title: "THE LAUNCH PHASE",
      description: "Victory begins with the launch. Use your mouse or tap the arena to aim and release your blade. The faster you swipe, the more initial momentum you gain!",
      icon: MousePointer2,
      visual: (
        <div className="relative w-48 h-48 flex items-center justify-center">
          <div className="absolute inset-0 border-2 border-dashed border-blue-500/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
          <div className="w-12 h-12 bg-blue-500 rounded-full shadow-[0_0_20px_#3b82f6] animate-bounce"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
             <MousePointer2 className="text-white animate-pulse" />
             <div className="w-1 h-12 bg-gradient-to-t from-blue-500 to-transparent"></div>
          </div>
        </div>
      )
    },
    {
      title: "PRECISION STEERING",
      description: "Once in the arena, stay in control. Use WASD or the Virtual Joystick to steer your blade. Outmaneuver your opponent to avoid damage and set up your next strike.",
      icon: Move,
      visual: (
        <div className="grid grid-cols-3 gap-2">
          <div className="w-12 h-12 border-2 border-slate-700 flex items-center justify-center text-slate-500 font-black">Q</div>
          <div className="w-12 h-12 border-2 border-blue-500 bg-blue-500/20 flex items-center justify-center text-blue-400 font-black animate-pulse">W</div>
          <div className="w-12 h-12 border-2 border-slate-700 flex items-center justify-center text-slate-500 font-black">E</div>
          <div className="w-12 h-12 border-2 border-blue-500 bg-blue-500/20 flex items-center justify-center text-blue-400 font-black animate-pulse">A</div>
          <div className="w-12 h-12 border-2 border-blue-500 bg-blue-500/20 flex items-center justify-center text-blue-400 font-black animate-pulse">S</div>
          <div className="w-12 h-12 border-2 border-blue-500 bg-blue-500/20 flex items-center justify-center text-blue-400 font-black animate-pulse">D</div>
        </div>
      )
    },
    {
      title: "ENERGY RESONANCE",
      description: "Colliding with your rival generates Tornado Energy. Watch the Energy Flux bar on your UI. High-speed impacts generate more energy. Keep the pressure on!",
      icon: Zap,
      visual: (
        <div className="w-64 space-y-4">
          <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-blue-500/30">
            <div className="h-full bg-blue-400 w-3/4 animate-pulse shadow-[0_0_10px_#60a5fa]"></div>
          </div>
          <div className="flex justify-around">
            <div className="w-10 h-10 bg-blue-500 rounded-full animate-ping"></div>
            <div className="w-10 h-10 bg-red-500 rounded-full animate-ping delay-300"></div>
          </div>
        </div>
      )
    },
    {
      title: "THE SPIRIT STORM",
      description: "When your energy hits 100%, tap SPACE or the Energy Bar to unleash your Spirit Storm! You'll dash toward the rival with massive force, dealing critical damage.",
      icon: Target,
      visual: (
        <div className="relative group cursor-pointer">
          <div className="absolute -inset-4 bg-yellow-400/20 blur-xl rounded-full animate-pulse"></div>
          <div className="px-8 py-4 bg-yellow-500 text-black font-black font-orbitron skew-x-[-12deg] shadow-[0_0_30px_#eab308]">
            SPIRIT BURST READY
          </div>
        </div>
      )
    },
    {
      title: "VICTORY CONDITIONS",
      description: "Reduce your rival's Chassis Integrity (Health) to zero to win. Be careful! Wall collisions drain your energy and health too. Stay in the center to maintain dominance.",
      icon: ShieldCheck,
      visual: (
        <div className="flex items-end gap-2 h-32">
          <div className="w-8 bg-red-500 h-1/4 animate-bounce"></div>
          <div className="w-8 bg-blue-500 h-full"></div>
          <div className="text-white font-orbitron text-4xl italic ml-4 animate-pulse">K.O.</div>
        </div>
      )
    }
  ];

  const currentStep = steps[stepIndex];

  const nextStep = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="z-10 w-full max-w-4xl px-8 flex flex-col items-center">
      <div className="mb-8 flex items-center gap-4">
        <div className="p-3 bg-blue-600 rounded-lg skew-x-[-12deg]">
          <currentStep.icon size={32} className="text-white skew-x-[12deg]" />
        </div>
        <h2 className="text-4xl font-black font-orbitron text-white italic tracking-tighter">
          {currentStep.title}
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center bg-slate-900/60 p-12 rounded-3xl border border-blue-500/20 backdrop-blur-xl min-h-[400px]">
        <div className="flex justify-center items-center">
          {currentStep.visual}
        </div>
        
        <div className="space-y-6">
          <p className="text-xl text-slate-300 font-medium leading-relaxed italic">
            "{currentStep.description}"
          </p>
          
          <div className="flex items-center gap-2">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 flex-1 transition-all duration-300 rounded-full ${i === stepIndex ? 'bg-blue-400' : i < stepIndex ? 'bg-blue-800' : 'bg-slate-800'}`}
              />
            ))}
          </div>

          <button 
            onClick={nextStep}
            className="w-full group relative px-8 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-sm skew-x-[-12deg] transition-all overflow-hidden flex items-center justify-center gap-3"
          >
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
            <span className="flex items-center justify-center gap-2 skew-x-[12deg]">
              {stepIndex === steps.length - 1 ? 'BEGIN MISSION' : 'NEXT PROTOCOL'}
              <ChevronRight size={20} />
            </span>
          </button>
        </div>
      </div>

      <button 
        onClick={onComplete}
        className="mt-8 text-slate-500 hover:text-white transition-colors text-xs font-black uppercase tracking-[0.3em]"
      >
        Skip Training
      </button>
    </div>
  );
};

export default TutorialScreen;
