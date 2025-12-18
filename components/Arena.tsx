
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Blade, Particle, ArenaStyle, BattleStats, AIDifficulty, BeyName } from '../types';
import { updatePhysics, resolveCollision, resolveArenaBoundary } from '../engine/physics';
import { sounds } from '../utils/sounds';
import { ARENA_RADIUS, BLADE_RADIUS, BEY_DATA, ARENA_THEMES } from '../constants';

interface ArenaProps {
  playerBey: BeyName;
  rivalBey: BeyName;
  difficulty: AIDifficulty;
  arenaStyle: ArenaStyle;
  joystickVector: { x: number, y: number };
  onGameOver: (winner: string, stats: BattleStats) => void;
  onUpdateStats: (player: Blade, rival: Blade) => void;
  specialTriggered: boolean;
}

const Arena: React.FC<ArenaProps> = ({ playerBey, rivalBey, difficulty, arenaStyle, joystickVector, onGameOver, onUpdateStats, specialTriggered }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLaunched, setIsLaunched] = useState(false);
  const [battleOver, setBattleOver] = useState(false);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef(0);
  const requestRef = useRef<number>(0);
  const launchTimeRef = useRef(0);
  
  // Keyboard State for Control
  const keysRef = useRef<Record<string, boolean>>({});

  const pData = BEY_DATA[playerBey] || BEY_DATA['Z_ACHILLES'];
  const rData = BEY_DATA[rivalBey] || BEY_DATA['EMPEROR_FORNEUS'];

  const playerRef = useRef<Blade>({
    id: 'player', name: 'Aiger', type: playerBey,
    x: 0, y: 180, vx: 0, vy: 0, radius: BLADE_RADIUS,
    rotation: 0, rotationSpeed: 0, health: 100, maxHealth: 100,
    energy: 0, maxEnergy: 100, color: pData.color, glowColor: pData.glow,
    isPlayer: true, isTurbo: false, stats: pData.stats
  });

  const rivalRef = useRef<Blade>({
    id: 'rival', name: 'Rival', type: rivalBey,
    x: 0, y: -180, vx: 0, vy: 0, radius: BLADE_RADIUS,
    rotation: 0, rotationSpeed: 0, health: 100, maxHealth: 100,
    energy: 0, maxEnergy: 100, color: rData.color, glowColor: rData.glow,
    isPlayer: false, isTurbo: false, stats: rData.stats
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const createParticles = (x: number, y: number, color: string, count: number, type: any = 'SPARK') => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x, y, 
        vx: (Math.random() - 0.5) * 14, 
        vy: (Math.random() - 0.5) * 14,
        life: 1, maxLife: 1, color, size: Math.random() * 3 + 1, type
      });
    }
  };

  const drawBeyblade = (ctx: CanvasRenderingContext2D, blade: Blade) => {
    const { x, y, rotation, color, glowColor, type, isTurbo } = blade;
    const data = BEY_DATA[type];
    ctx.save();
    ctx.translate(x, y);
    
    // Shadow for depth
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowOffsetY = 10;

    // Turbo Glow Effect
    if (isTurbo) {
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#fbbf24';
        if (frameRef.current % 4 === 0) {
            createParticles(blade.x, blade.y, '#fcd34d', 1, 'TURBO');
        }
    }

    ctx.rotate(rotation);

    // 1. Metal Forge Disc
    ctx.beginPath();
    for (let i = 0; i < 12; i++) {
        const angle = (i * 2 * Math.PI) / 12;
        const r = blade.radius * (i % 2 === 0 ? 0.98 : 0.85);
        ctx.lineTo(r * Math.cos(angle), r * Math.sin(angle));
    }
    ctx.closePath();
    const diskGrad = ctx.createLinearGradient(-30, -30, 30, 30);
    diskGrad.addColorStop(0, '#94a3b8');
    diskGrad.addColorStop(0.5, '#f8fafc');
    diskGrad.addColorStop(1, '#475569');
    ctx.fillStyle = diskGrad;
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 2. Real Energy Layer Geometry
    ctx.beginPath();
    if (type === 'Z_ACHILLES') {
        for(let j=0; j<2; j++) {
            ctx.rotate(Math.PI);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(blade.radius, -18);
            ctx.lineTo(blade.radius + 12, 0);
            ctx.lineTo(blade.radius, 18);
            ctx.fillStyle = data.secondary;
            ctx.fill();
            ctx.fillStyle = data.color;
            ctx.fillRect(8, -6, blade.radius - 5, 12);
        }
    } else if (type === 'WINNING_VALKYRIE') {
        for(let j=0; j<3; j++) {
            ctx.rotate((2*Math.PI)/3);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(blade.radius + 15, -30, blade.radius + 25, 30, 0, 0);
            ctx.fillStyle = data.color;
            ctx.fill();
            ctx.strokeStyle = data.secondary;
            ctx.lineWidth = 4;
            ctx.stroke();
        }
    } else if (type === 'BLOODY_LONGINUS') {
        for(let j=0; j<2; j++) {
            ctx.rotate(Math.PI);
            ctx.beginPath();
            ctx.moveTo(-10, -10);
            ctx.quadraticCurveTo(blade.radius + 10, -50, blade.radius + 5, 10);
            ctx.fillStyle = data.color;
            ctx.fill();
            ctx.strokeStyle = data.secondary;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    } else if (type === 'EMPEROR_FORNEUS') {
        ctx.beginPath();
        for(let i=0; i<16; i++) {
          ctx.rotate(Math.PI/8);
          ctx.lineTo(blade.radius, 0);
          ctx.lineTo(blade.radius-8, 8);
        }
        ctx.fillStyle = data.color;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, blade.radius * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = data.secondary;
        ctx.fill();
    } else if (type === 'DEAD_PHOENIX') {
        ctx.beginPath();
        ctx.arc(0, 0, blade.radius, 0, Math.PI * 2);
        ctx.strokeStyle = data.color;
        ctx.lineWidth = 10;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, blade.radius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = data.secondary;
        ctx.fill();
    }

    // 3. Central God Chip
    ctx.rotate(-rotation);
    ctx.beginPath();
    ctx.arc(0, 0, blade.radius * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Orbitron';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(data.symbol, 0, 0);

    ctx.restore();
  };

  const handleLaunch = () => {
    if (isLaunched || battleOver) return;
    sounds.playLaunch();
    launchTimeRef.current = frameRef.current;
    playerRef.current.vx = (joystickVector.x || 0) * 12;
    playerRef.current.vy = -30;
    rivalRef.current.vx = (Math.random() - 0.5) * 20;
    rivalRef.current.vy = 30;
    setIsLaunched(true);
  };

  const update = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || battleOver) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    frameRef.current++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const theme = ARENA_THEMES[arenaStyle] || ARENA_THEMES.CLASSIC;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Render Stadium
    ctx.beginPath();
    ctx.arc(0, 0, ARENA_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = theme.floor;
    ctx.fill();
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 15;
    ctx.stroke();

    if (isLaunched) {
      const p = playerRef.current;
      const r = rivalRef.current;
      const elapsed = frameRef.current - launchTimeRef.current;

      // AI Logic
      const dx = p.x - r.x;
      const dy = p.y - r.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      let aiForce = 0.5;
      if (difficulty === 'GOD_TIER') aiForce = 1.1;
      
      r.vx += (dx / dist) * aiForce;
      r.vy += (dy / dist) * aiForce;

      // Input Processing (Joystick + Keyboard)
      let moveX = joystickVector.x;
      let moveY = joystickVector.y;

      if (keysRef.current['w'] || keysRef.current['arrowup']) moveY = -1;
      if (keysRef.current['s'] || keysRef.current['arrowdown']) moveY = 1;
      if (keysRef.current['a'] || keysRef.current['arrowleft']) moveX = -1;
      if (keysRef.current['d'] || keysRef.current['arrowright']) moveX = 1;

      const steerForce = 1.1; // Increased steer force for better control
      p.vx += moveX * steerForce;
      p.vy += moveY * steerForce;

      if (specialTriggered && p.energy >= 100) {
          sounds.playSpecial();
          p.energy = 0;
          p.vx += (dx / dist) * 60;
          p.vy += (dy / dist) * 60;
          createParticles(p.x, p.y, p.color, 60, 'STORM');
      }

      updatePhysics(p);
      updatePhysics(r);
      resolveArenaBoundary(p, arenaStyle, elapsed);
      resolveArenaBoundary(r, arenaStyle, elapsed);

      const collision = resolveCollision(p, r);
      if (collision.collided) {
          const impact = Math.sqrt(Math.pow(p.vx - r.vx, 2) + Math.pow(p.vy - r.vy, 2));
          sounds.playImpact(impact);
          createParticles((p.x + r.x)/2, (p.y + r.y)/2, '#fff', Math.floor(impact * 2.5));
          p.energy = Math.min(100, p.energy + impact * 1.0);
          r.energy = Math.min(100, r.energy + impact * 1.0);
          
          if (collision.burst) {
            setBattleOver(true);
            sounds.playLoss();
            onGameOver(p.health <= 0 ? 'Rival' : 'Aiger', { 
                damageDealt: 100, damageTaken: 100, collisions: 30, specialsUsed: 1, maxSpeed: 45, isBurst: true 
            });
          }
      }

      onUpdateStats({...p}, {...r});
    }

    particlesRef.current.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.025;
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);
    ctx.globalAlpha = 1.0;

    drawBeyblade(ctx, playerRef.current);
    drawBeyblade(ctx, rivalRef.current);

    ctx.restore();
    requestRef.current = window.requestAnimationFrame(update);
  }, [isLaunched, battleOver, joystickVector, arenaStyle, specialTriggered, onGameOver, onUpdateStats, difficulty]);

  useEffect(() => {
    requestRef.current = window.requestAnimationFrame(update);
    return () => window.cancelAnimationFrame(requestRef.current);
  }, [update]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <canvas 
        ref={canvasRef} 
        width={800} height={800} 
        onClick={handleLaunch}
        className="max-w-full max-h-full touch-none shadow-[0_0_150px_rgba(0,0,0,0.6)] rounded-full border-8 border-slate-900" 
      />
      {!isLaunched && !battleOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none rounded-full">
              <div className="text-center animate-bounce">
                <h2 className="text-7xl font-black font-orbitron text-white italic tracking-tighter drop-shadow-[0_0_25px_#fff]">3... 2... 1...</h2>
                <p className="text-red-500 font-black text-2xl tracking-[1em] uppercase mt-4 drop-shadow-md">Go Shoot!</p>
                <p className="text-slate-400 font-bold text-xs mt-6 tracking-widest">[ USE WASD OR JOYSTICK ]</p>
              </div>
          </div>
      )}
    </div>
  );
};

export default Arena;
