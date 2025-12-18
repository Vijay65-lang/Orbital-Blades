
import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Home, Swords, Zap, Activity, TrendingUp, PlayCircle, SkipBack } from 'lucide-react';
import { BattleStats, ReplayFrame } from '../types';
import { ARENA_RADIUS, BLADE_RADIUS } from '../constants';

interface ResultScreenProps {
  winner: string | null;
  report: { player: BattleStats, rival: BattleStats } | null;
  onRestart: () => void;
  onHome: () => void;
}

const StatRow = ({ label, playerVal, rivalVal, icon: Icon, color }: { label: string, playerVal: string | number, rivalVal: string | number, icon: any, color: string }) => (
  <div className="grid grid-cols-3 gap-4 py-3 border-b border-slate-800/50 items-center">
    <div className="text-left text-blue-400 font-bold text-lg">{playerVal}</div>
    <div className="flex flex-col items-center">
      <Icon size={16} className={`mb-1 ${color}`} />
      <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{label}</span>
    </div>
    <div className="text-right text-red-500 font-bold text-lg">{rivalVal}</div>
  </div>
);

const ResultScreen: React.FC<ResultScreenProps> = ({ winner, report, onRestart, onHome }) => {
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayFrameIndex, setReplayFrameIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isPlayerWin = winner === 'KENJI';

  useEffect(() => {
    if (!isReplaying || !report?.player?.replayData || report.player.replayData.length === 0) {
      if (isReplaying) setIsReplaying(false);
      return;
    }

    const data = report.player.replayData;
    const interval = setInterval(() => {
      setReplayFrameIndex(prev => {
        if (prev >= data.length - 1) {
          clearInterval(interval);
          setTimeout(() => setIsReplaying(false), 2000);
          return prev;
        }
        return prev + 1;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [isReplaying, report]);

  useEffect(() => {
    if (!isReplaying || !canvasRef.current || !report?.player?.replayData) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const frame = report.player.replayData[replayFrameIndex];
    if (!frame) return; // FIX: Prevent Uncaught TypeError: Cannot read properties of undefined (reading 'px')

    ctx.clearRect(0, 0, 400, 400);
    ctx.save();
    ctx.translate(200, 200);
    
    // Arena
    ctx.beginPath();
    ctx.arc(0, 0, 150, 0, Math.PI * 2);
    ctx.strokeStyle = '#334155';
    ctx.stroke();

    const drawReplayBlade = (x: number, y: number, r: number, color: string, special: boolean, health: number) => {
      const rx = (x / 800) * 400; 
      const ry = (y / 800) * 400;
      ctx.save();
      ctx.translate(rx, ry);
      ctx.rotate(r);
      if (special) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#fff';
      }
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.stroke();
      
      ctx.restore();
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(rx - 10, ry - 15, 20, 2);
      ctx.fillStyle = health > 50 ? '#22c55e' : '#ef4444';
      ctx.fillRect(rx - 10, ry - 15, Math.max(0, 20 * (health / 100)), 2);
    };

    drawReplayBlade(frame.px, frame.py, frame.pr, '#3b82f6', frame.pSpecial, frame.pHealth);
    drawReplayBlade(frame.rx, frame.ry, frame.rr, '#ef4444', frame.rSpecial, frame.rHealth);

    ctx.restore();
  }, [replayFrameIndex, isReplaying, report]);

  if (isReplaying) {
    return (
      <div className="z-30 absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-8 animate-in fade-in">
        <h2 className="text-3xl font-orbitron text-blue-400 mb-8 italic">MATCH REPLAY</h2>
        <canvas ref={canvasRef} width={400} height={400} className="bg-slate-900 rounded-full border-4 border-slate-800 shadow-2xl mb-8" />
        <div className="w-full max-w-md h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
           <div 
             className="h-full bg-blue-500 transition-all" 
             style={{ width: `${(replayFrameIndex / (report?.player?.replayData?.length || 1)) * 100}%` }} 
           />
        </div>
        <button onClick={() => setIsReplaying(false)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <SkipBack size={20} /> EXIT REPLAY
        </button>
      </div>
    );
  }

  return (
    <div className="z-20 absolute inset-0 bg-slate-950/95 flex items-center justify-center animate-in fade-in duration-700 overflow-y-auto">
      <div className="text-center space-y-8 p-12 max-w-2xl w-full">
        <div className="relative">
           {isPlayerWin && <div className="absolute -inset-10 bg-blue-500/20 blur-3xl rounded-full animate-pulse"></div>}
           <h2 className={`text-7xl font-black font-orbitron mb-2 tracking-tighter italic ${isPlayerWin ? 'text-blue-400' : 'text-red-500'}`}>
            {isPlayerWin ? 'VICTORY' : 'DEFEATED'}
           </h2>
           <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">CHAMPION: {winner}</p>
        </div>

        {report && (
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-xl backdrop-blur-sm">
            <div className="grid grid-cols-3 gap-4 mb-6 border-b border-slate-700 pb-4">
              <div className="text-left font-orbitron text-xs text-blue-300 uppercase italic">KENJI</div>
              <div className="text-center font-orbitron text-xs text-slate-500 uppercase tracking-widest">BATTLE REPORT</div>
              <div className="text-right font-orbitron text-xs text-red-400 uppercase italic">LORD VEX</div>
            </div>
            <div className="space-y-1">
              <StatRow label="Damage Dealt" playerVal={Math.floor(report.player.damageDealt)} rivalVal={Math.floor(report.rival.damageDealt)} icon={Swords} color="text-orange-500" />
              <StatRow label="Impacts" playerVal={report.player.collisions} rivalVal={report.rival.collisions} icon={Activity} color="text-green-500" />
              <StatRow label="Spirit Bursts" playerVal={report.player.specialsUsed} rivalVal={report.rival.specialsUsed} icon={Zap} color="text-yellow-400" />
              <StatRow label="Peak Velocity" playerVal={report.player.maxSpeed.toFixed(1)} rivalVal={report.rival.maxSpeed.toFixed(1)} icon={TrendingUp} color="text-cyan-400" />
            </div>
            <button 
              onClick={() => { setReplayFrameIndex(0); setIsReplaying(true); }}
              className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-slate-800 hover:bg-slate-700 text-blue-400 font-bold rounded transition-colors border border-blue-500/20"
            >
              <PlayCircle size={18} /> WATCH ANALYTIC REPLAY (2X)
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4">
          <button onClick={onRestart} className={`flex-1 flex items-center justify-center gap-2 px-8 py-5 ${isPlayerWin ? 'bg-blue-600 hover:bg-blue-500' : 'bg-slate-700 hover:bg-slate-600'} text-white font-black rounded-sm transition-all transform hover:scale-105 skew-x-[-6deg]`}>
            <RotateCcw size={20} className="skew-x-[6deg]" /> <span className="skew-x-[6deg] uppercase">RE-ENGAGE</span>
          </button>
          <button onClick={onHome} className="flex-1 flex items-center justify-center gap-2 px-8 py-5 border border-slate-700 text-slate-400 font-bold rounded-sm hover:bg-slate-800 transition-all skew-x-[-6deg]">
            <Home size={20} className="skew-x-[6deg]" /> <span className="skew-x-[6deg] uppercase">BASE CAMP</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;
