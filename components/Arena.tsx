
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
  
  // High-frequency input tracking
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
        vx: (Math.random() - 0.5) * 16, 
        vy: (Math.random() - 0.5) * 16,
        life: 1, maxLife: 1, color, size: Math.random() * 4 + 1, type
      });
    }
  };

  const drawBeyblade = (ctx: CanvasRenderingContext2D, blade: Blade) => {
    const { x, y, rotation, color, glowColor, type, isTurbo } = blade;
    const data = BEY_DATA[type];
    ctx.save();
    ctx.translate(x, y);
    
    // Bottom Plate / Tip
    ctx.beginPath();
    ctx.arc(0, 0, blade.radius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();

    // Turbo Aura
    if (isTurbo) {
        ctx.shadowBlur = 40;
        ctx.shadowColor = '#fbbf24';
        if (frameRef.current % 3 === 0) {
            createParticles(blade.x, blade.y, '#fcd34d', 1, 'TURBO');
        }
    }

    ctx.rotate(rotation);

    // 1. Metal Forge Disc (Base)
    ctx.beginPath();
    const diskPoints = 16;
    for (let i = 0; i < diskPoints; i++) {
        const angle = (i * 2 * Math.PI) / diskPoints;
        const r = blade.radius * (i % 2 === 0 ? 0.95 : 0.85);
        ctx.lineTo(r * Math.cos(angle), r * Math.sin(angle));
    }
    ctx.closePath();
    const diskGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, blade.radius);
    diskGrad.addColorStop(0, '#f8fafc');
    diskGrad.addColorStop(0.5, '#94a3b8');
    diskGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = diskGrad;
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 2. Specialized Layer Geometry (Real Designs)
    ctx.beginPath();
    if (type === 'Z_ACHILLES') {
        // Red Core with Two Massive Swords
        ctx.fillStyle = data.color;
        ctx.beginPath();
        ctx.arc(0, 0, blade.radius * 0.75, 0, Math.PI * 2);
        ctx.fill();
        for(let j=0; j<2; j++) {
            ctx.rotate(Math.PI);
            ctx.beginPath();
            ctx.moveTo(10, -5);
            ctx.lineTo(blade.radius + 5, -20);
            ctx.lineTo(blade.radius + 15, 0);
            ctx.lineTo(blade.radius + 5, 20);
            ctx.lineTo(10, 5);
            ctx.fillStyle = data.secondary;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.stroke();
        }
    } else if (type === 'WINNING_VALKYRIE') {
        // Three Distinct Blue Feathers
        for(let j=0; j<3; j++) {
            ctx.rotate((2*Math.PI)/3);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(blade.radius + 10, -40, blade.radius + 30, 40, 0, 0);
            ctx.fillStyle = data.color;
            ctx.fill();
            ctx.strokeStyle = data.secondary;
            ctx.lineWidth = 5;
            ctx.stroke();
        }
    } else if (type === 'BLOODY_LONGINUS') {
        // Dual White Swirling Dragons
        for(let j=0; j<2; j++) {
            ctx.rotate(Math.PI);
            ctx.beginPath();
            ctx.moveTo(-10, -10);
            ctx.quadraticCurveTo(blade.radius + 15, -60, blade.radius + 10, 20);
            ctx.fillStyle = data.color;
            ctx.fill();
            ctx.strokeStyle = data.secondary;
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    } else if (type === 'EMPEROR_FORNEUS') {
        // Green Fins with Orange Tips
        for(let i=0; i<12; i++) {
          ctx.rotate(Math.PI/6);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(blade.radius, -10);
          ctx.lineTo(blade.radius + 5, 0);
          ctx.lineTo(blade.radius, 10);
          ctx.fillStyle = i % 2 === 0 ? data.color : data.secondary;
          ctx.fill();
        }
    } else if (type === 'DEAD_PHOENIX') {
        // Massive Red Ring (Outer Armor)
        ctx.beginPath();
        ctx.arc(0, 0, blade.radius, 0, Math.PI * 2);
        ctx.lineWidth = 12;
        ctx.strokeStyle = data.color;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, blade.radius * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = data.secondary;
        ctx.fill();
    }

    // 3. Central Core (The Chip)
    ctx.rotate(-rotation);
    ctx.beginPath();
    ctx.arc(0, 0, blade.radius * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Orbitron';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(data.symbol, 0, 0);

    ctx.restore();
  };

  const handleLaunch = () => {
    if (isLaunched || battleOver) return;
    sounds.playLaunch();
    launchTimeRef.current = frameRef.current;
    playerRef.current.vx = (joystickVector.x || 0) * 15;
    playerRef.current.vy = -35;
    rivalRef.current.vx = (Math.random() - 0.5) * 25;
    rivalRef.current.vy = 35;
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

    // Stadium Glow
    const stadiumGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, ARENA_RADIUS);
    stadiumGrad.addColorStop(0, theme.floor);
    stadiumGrad.addColorStop(0.8, '#020617');
    stadiumGrad.addColorStop(1, theme.border);
    
    ctx.beginPath();
    ctx.arc(0, 0, ARENA_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = stadiumGrad;
    ctx.fill();
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 20;
    ctx.stroke();

    if (isLaunched) {
      const p = playerRef.current;
      const r = rivalRef.current;
      const elapsed = frameRef.current - launchTimeRef.current;

      // AI Strategy
      const dx = p.x - r.x;
      const dy = p.y - r.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      let aiForce = 0.6;
      if (difficulty === 'GOD_TIER') aiForce = 1.2;
      
      r.vx += (dx / dist) * aiForce;
      r.vy += (dy / dist) * aiForce;

      // PLAYER CONTROL: Dual Keyboard + Joystick
      let moveX = joystickVector.x;
      let moveY = joystickVector.y;

      if (keysRef.current['w'] || keysRef.current['arrowup']) moveY = -1;
      if (keysRef.current['s'] || keysRef.current['arrowdown']) moveY = 1;
      if (keysRef.current['a'] || keysRef.current['arrowleft']) moveX = -1;
      if (keysRef.current['d'] || keysRef.current['arrowright']) moveX = 1;

      // Heavy force application for "Perfect Control"
      const steerStrength = 1.5; 
      p.vx += moveX * steerStrength;
      p.vy += moveY * steerStrength;

      if (specialTriggered && p.energy >= 100) {
          sounds.playSpecial();
          p.energy = 0;
          p.vx += (dx / dist) * 70;
          p.vy += (dy / dist) * 70;
          createParticles(p.x, p.y, p.color, 80, 'STORM');
      }

      updatePhysics(p);
      updatePhysics(r);
      resolveArenaBoundary(p, arenaStyle, elapsed);
      resolveArenaBoundary(r, arenaStyle, elapsed);

      const collision = resolveCollision(p, r);
      if (collision.collided) {
          const impact = Math.sqrt(Math.pow(p.vx - r.vx, 2) + Math.pow(p.vy - r.vy, 2));
          sounds.playImpact(impact);
          createParticles((p.x + r.x)/2, (p.y + r.y)/2, '#fff', Math.floor(impact * 3));
          p.energy = Math.min(100, p.energy + impact * 1.2);
          r.energy = Math.min(100, r.energy + impact * 1.2);
          
          if (collision.burst) {
            setBattleOver(true);
            sounds.playLoss();
            onGameOver(p.health <= 0 ? 'Rival' : 'Aiger', { 
                damageDealt: 100, damageTaken: 100, collisions: 30, specialsUsed: 1, maxSpeed: 50, isBurst: true 
            });
          }
      }

      onUpdateStats({...p}, {...r});
    }

    // Render Particles
    particlesRef.current.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.02;
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
        className="max-w-full max-h-full touch-none shadow-[0_0_200px_rgba(0,0,0,0.9)] rounded-full border-8 border-slate-900" 
      />
      {!isLaunched && !battleOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none rounded-full backdrop-blur-sm">
              <div className="text-center animate-in zoom-in duration-500">
                <h2 className="text-8xl font-black font-orbitron text-white italic tracking-tighter drop-shadow-[0_0_30px_#fff] mb-4">3... 2... 1...</h2>
                <div className="inline-block bg-red-600 px-10 py-3 skew-x-[-15deg] shadow-2xl">
                    <p className="text-white font-black text-3xl tracking-[0.5em] uppercase skew-x-[15deg]">Go Shoot!</p>
                </div>
                <div className="mt-8 flex gap-6 justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 border-2 border-white/20 rounded flex items-center justify-center text-white/40 font-bold">W</div>
                    <span className="text-[10px] text-white/30 uppercase tracking-widest font-black">STEER</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 border-2 border-white/20 rounded flex items-center justify-center text-white/40 font-bold">SPACE</div>
                    <span className="text-[10px] text-white/30 uppercase tracking-widest font-black">SPECIAL</span>
                  </div>
                </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Arena;
