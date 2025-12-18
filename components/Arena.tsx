
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
  const keysRef = useRef<Record<string, boolean>>({});

  const pData = BEY_DATA[playerBey] || BEY_DATA['Z_ACHILLES'];
  const rData = BEY_DATA[rivalBey] || BEY_DATA['EMPEROR_FORNEUS'];

  const playerRef = useRef<Blade>({
    id: 'player', name: 'AIGER', type: playerBey,
    x: 0, y: 180, vx: 0, vy: 0, radius: BLADE_RADIUS,
    rotation: 0, rotationSpeed: 0, health: 100, maxHealth: 100,
    energy: 0, maxEnergy: 100, color: pData.color, glowColor: pData.glow,
    isPlayer: true, isTurbo: false, stats: pData.stats
  });

  const rivalRef = useRef<Blade>({
    id: 'rival', name: 'RIVAL', type: rivalBey,
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
        vx: (Math.random() - 0.5) * 12, 
        vy: (Math.random() - 0.5) * 12,
        life: 1, maxLife: 1, color, size: 4, type // Fixed size for pixel look
      });
    }
  };

  const drawPixelShape = (ctx: CanvasRenderingContext2D, points: number[][], color: string) => {
    ctx.fillStyle = color;
    points.forEach(([px, py, w, h]) => {
      ctx.fillRect(px, py, w, h);
    });
  };

  const drawBeyblade = (ctx: CanvasRenderingContext2D, blade: Blade) => {
    const { x, y, rotation, type, isTurbo } = blade;
    const data = BEY_DATA[type];
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    
    // Pixel Aura
    if (isTurbo) {
        ctx.fillStyle = '#fbbf24';
        for(let i=0; i<4; i++) {
          const px = (Math.random() - 0.5) * 100;
          const py = (Math.random() - 0.5) * 100;
          ctx.fillRect(px, py, 4, 4);
        }
    }

    ctx.rotate(rotation);

    // 1. Metal Forge Disc (Pixelated)
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-35, -35, 70, 70);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-30, -30, 60, 60);

    // 2. Real Layer Geometry (Pixel Art Style)
    if (type === 'Z_ACHILLES') {
        ctx.fillStyle = data.color;
        ctx.fillRect(-25, -25, 50, 50);
        // Swords
        ctx.fillStyle = data.secondary;
        ctx.fillRect(20, -10, 25, 20); // Sword 1
        ctx.fillRect(-45, -10, 25, 20); // Sword 2
    } else if (type === 'WINNING_VALKYRIE') {
        ctx.fillStyle = data.color;
        ctx.fillRect(-30, -30, 60, 60);
        // Wings
        ctx.fillStyle = data.secondary;
        ctx.fillRect(25, -35, 15, 30);
        ctx.fillRect(-40, 5, 15, 30);
        ctx.fillRect(-15, -40, 30, 15);
    } else if (type === 'BLOODY_LONGINUS') {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-32, -32, 64, 64);
        ctx.fillStyle = data.secondary;
        ctx.fillRect(0, -40, 10, 80);
        ctx.fillRect(-40, 0, 80, 10);
    } else if (type === 'EMPEROR_FORNEUS') {
        ctx.fillStyle = data.color;
        ctx.fillRect(-38, -38, 76, 76);
        ctx.fillStyle = data.secondary;
        ctx.fillRect(-20, -20, 40, 40);
    } else if (type === 'DEAD_PHOENIX') {
        ctx.fillStyle = data.color;
        ctx.fillRect(-42, -42, 84, 84);
        ctx.fillStyle = '#000';
        ctx.fillRect(-25, -25, 50, 50);
    }

    // 3. Central God Chip
    ctx.rotate(-rotation);
    ctx.fillStyle = '#000';
    ctx.fillRect(-12, -12, 24, 24);
    ctx.fillStyle = '#fff';
    ctx.font = '16px Orbitron';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(data.symbol, 0, 0);

    ctx.restore();
  };

  const update = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || battleOver) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    frameRef.current++;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const theme = ARENA_THEMES[arenaStyle] || ARENA_THEMES.CLASSIC;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Render Retro Arena
    ctx.fillStyle = theme.floor;
    ctx.beginPath();
    ctx.arc(0, 0, ARENA_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 10;
    ctx.stroke();

    if (isLaunched) {
      const p = playerRef.current;
      const r = rivalRef.current;
      const elapsed = frameRef.current - launchTimeRef.current;

      // AI Logic
      const dx = p.x - r.x;
      const dy = p.y - r.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      let aiForce = 0.7;
      if (difficulty === 'GOD_TIER') aiForce = 1.4;
      r.vx += (dx / dist) * aiForce;
      r.vy += (dy / dist) * aiForce;

      // PLAYER CONTROL: (Enhanced for "Perfect Control")
      let moveX = joystickVector.x;
      let moveY = joystickVector.y;
      if (keysRef.current['w'] || keysRef.current['arrowup']) moveY = -1;
      if (keysRef.current['s'] || keysRef.current['arrowdown']) moveY = 1;
      if (keysRef.current['a'] || keysRef.current['arrowleft']) moveX = -1;
      if (keysRef.current['d'] || keysRef.current['arrowright']) moveX = 1;

      // Massive Steering Impulse to fix "Can't Control"
      const steerStrength = 2.2; 
      p.vx += moveX * steerStrength;
      p.vy += moveY * steerStrength;

      if (specialTriggered && p.energy >= 100) {
          sounds.playSpecial();
          p.energy = 0;
          p.vx += (dx / dist) * 80;
          p.vy += (dy / dist) * 80;
          createParticles(p.x, p.y, p.color, 40, 'STORM');
      }

      updatePhysics(p);
      updatePhysics(r);
      resolveArenaBoundary(p, arenaStyle, elapsed);
      resolveArenaBoundary(r, arenaStyle, elapsed);

      const collision = resolveCollision(p, r);
      if (collision.collided) {
          const impact = Math.sqrt(Math.pow(p.vx - r.vx, 2) + Math.pow(p.vy - r.vy, 2));
          sounds.playImpact(impact);
          createParticles((p.x + r.x)/2, (p.y + r.y)/2, '#fff', 10);
          p.energy = Math.min(100, p.energy + impact * 1.5);
          r.energy = Math.min(100, r.energy + impact * 1.5);
          
          if (collision.burst) {
            setBattleOver(true);
            sounds.playLoss();
            onGameOver(p.health <= 0 ? 'RIVAL' : 'AIGER', { 
                damageDealt: 100, damageTaken: 100, collisions: 20, specialsUsed: 1, maxSpeed: 60, isBurst: true 
            });
          }
      }
      onUpdateStats({...p}, {...r});
    }

    // Render Particles as Pixel Blocks
    particlesRef.current.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.05;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 6, 6);
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
        onClick={() => !isLaunched && setIsLaunched(true)}
        className="max-w-full max-h-full touch-none bg-[#000]" 
      />
      {!isLaunched && !battleOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 pointer-events-none">
              <div className="text-center">
                <h2 className="text-4xl text-white mb-4 animate-pulse">3... 2... 1...</h2>
                <div className="bg-red-600 px-8 py-4 border-4 border-white">
                    <p className="text-white text-2xl uppercase">Go Shoot!</p>
                </div>
                <p className="text-gray-400 text-xs mt-8">[ WASD TO STEER / CLICK TO LAUNCH ]</p>
              </div>
          </div>
      )}
    </div>
  );
};

export default Arena;
