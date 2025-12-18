
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Blade, Particle, ArenaStyle, BattleStats, AIDifficulty, BeyName, ReplayFrame } from '../types';
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
  const replayDataRef = useRef<ReplayFrame[]>([]);
  const frameRef = useRef(0);
  const requestRef = useRef<number>(0);
  const launchTimeRef = useRef(0);
  const keysRef = useRef<Record<string, boolean>>({});
  
  const statsTracker = useRef({
    damageDealt: 0,
    damageTaken: 0,
    collisions: 0,
    specialsUsed: 0,
    maxSpeed: 0
  });

  const pData = BEY_DATA[playerBey] || BEY_DATA['Z_ACHILLES'];
  const rData = BEY_DATA[rivalBey] || BEY_DATA['EMPEROR_FORNEUS'];

  const playerRef = useRef<Blade>({
    id: 'player', name: 'AIGER', type: playerBey,
    x: 0, y: 180, vx: 0, vy: 0, radius: BLADE_RADIUS,
    rotation: 0, rotationSpeed: 0.8, health: 100, maxHealth: 100,
    energy: 0, maxEnergy: 100, color: pData.color, glowColor: pData.glow,
    isPlayer: true, isTurbo: false, stats: pData.stats, trail: [], energyFullTimer: 0
  });

  const rivalRef = useRef<Blade>({
    id: 'rival', name: 'RIVAL', type: rivalBey,
    x: 0, y: -180, vx: 0, vy: 0, radius: BLADE_RADIUS,
    rotation: 0, rotationSpeed: 0.8, health: 100, maxHealth: 100,
    energy: 0, maxEnergy: 100, color: rData.color, glowColor: rData.glow,
    isPlayer: false, isTurbo: false, stats: rData.stats, trail: []
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
        life: 1, maxLife: 1, color, size: 4, type
      });
    }
  };

  const drawBeyblade = (ctx: CanvasRenderingContext2D, blade: Blade) => {
    const { x, y, rotation, type, isTurbo, color, trail } = blade;
    
    // 1. Blade Trail rendering
    if (trail && trail.length > 1) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(trail[0].x, trail[0].y);
      for (let i = 1; i < trail.length; i++) {
        ctx.lineTo(trail[i].x, trail[i].y);
      }
      ctx.lineWidth = 20;
      ctx.lineCap = 'round';
      ctx.globalAlpha = 0.2;
      ctx.strokeStyle = color;
      ctx.stroke();
      ctx.restore();
    }

    const data = BEY_DATA[type];
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    
    if (isTurbo) {
        ctx.fillStyle = '#fbbf24';
        for(let i=0; i<4; i++) {
          const px = (Math.random() - 0.5) * 100;
          const py = (Math.random() - 0.5) * 100;
          ctx.fillRect(px, py, 4, 4);
        }
    }

    ctx.rotate(rotation);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-35, -35, 70, 70);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-30, -30, 60, 60);

    if (type === 'Z_ACHILLES') {
        ctx.fillStyle = data.color;
        ctx.fillRect(-25, -25, 50, 50);
        ctx.fillStyle = data.secondary;
        ctx.fillRect(20, -10, 25, 20);
        ctx.fillRect(-45, -10, 25, 20);
    } else if (type === 'WINNING_VALKYRIE') {
        ctx.fillStyle = data.color;
        ctx.fillRect(-30, -30, 60, 60);
        ctx.fillStyle = data.secondary;
        ctx.fillRect(25, -35, 15, 30);
        ctx.fillRect(-40, 5, 15, 30);
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

      // Update Replay Data Buffer
      replayDataRef.current.push({
        px: p.x, py: p.y, pr: p.rotation, pSpecial: false, pHealth: p.health,
        rx: r.x, ry: r.y, rr: r.rotation, rSpecial: false, rHealth: r.health
      });

      // IMPROVED AI LOGIC
      const dx = p.x - r.x;
      const dy = p.y - r.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      let aiForce = 0.45;
      if (difficulty === 'GOD_TIER') {
        // Predictive Targeting: Lead the player's movement
        const targetX = p.x + p.vx * 15;
        const targetY = p.y + p.vy * 15;
        const angleToTarget = Math.atan2(targetY - r.y, targetX - r.x);
        r.vx += Math.cos(angleToTarget) * 1.5;
        r.vy += Math.sin(angleToTarget) * 1.5;

        // Auto Special if close and charged
        if (r.energy >= 100 && dist < 120) {
          r.energy = 0;
          r.vx += Math.cos(angleToTarget) * 45;
          r.vy += Math.sin(angleToTarget) * 45;
          createParticles(r.x, r.y, r.color, 40, 'STORM');
        }
      } else if (difficulty === 'ZENON') {
        // Aggressive Chase
        r.vx += (dx / dist) * 1.0;
        r.vy += (dy / dist) * 1.0;
      } else if (difficulty === 'ACE') {
        r.vx += (dx / dist) * aiForce;
        r.vy += (dy / dist) * aiForce;
      } else {
        // ROOKIE: Slow and sloppy
        r.vx += (dx / dist) * 0.25;
        r.vy += (dy / dist) * 0.25;
      }

      // PLAYER CONTROL (Improved for Joystick + WASD)
      let moveX = joystickVector.x;
      let moveY = joystickVector.y;
      
      if (keysRef.current['w'] || keysRef.current['arrowup']) moveY = -1;
      if (keysRef.current['s'] || keysRef.current['arrowdown']) moveY = 1;
      if (keysRef.current['a'] || keysRef.current['arrowleft']) moveX = -1;
      if (keysRef.current['d'] || keysRef.current['arrowright']) moveX = 1;

      const steerStrength = 2.5; 
      p.vx += moveX * steerStrength;
      p.vy += moveY * steerStrength;

      // ENERGY OVERLOAD MECHANIC: Holding full energy for too long hurts
      if (p.energy >= 100) {
        p.energyFullTimer = (p.energyFullTimer || 0) + 1/60;
        if (p.energyFullTimer > 5) {
          p.health -= 0.05; // Minor damage tick
          createParticles(p.x, p.y, '#fbbf24', 1, 'SPARK');
        }
      } else {
        p.energyFullTimer = 0;
      }

      if (specialTriggered && p.energy >= 100) {
          sounds.playSpecial();
          p.energy = 0;
          p.energyFullTimer = 0;
          statsTracker.current.specialsUsed++;
          const angle = Math.atan2(r.y - p.y, r.x - p.x);
          p.vx += Math.cos(angle) * 80;
          p.vy += Math.sin(angle) * 80;
          createParticles(p.x, p.y, p.color, 40, 'STORM');
      }

      updatePhysics(p);
      updatePhysics(r);
      resolveArenaBoundary(p, arenaStyle, elapsed);
      resolveArenaBoundary(r, arenaStyle, elapsed);

      // TRACK TRAILS (Last 12 frames)
      p.trail = [...(p.trail || []), {x: p.x, y: p.y}].slice(-12);
      r.trail = [...(r.trail || []), {x: r.x, y: r.y}].slice(-12);

      const collision = resolveCollision(p, r);
      if (collision.collided) {
          statsTracker.current.collisions++;
          const impact = Math.sqrt(Math.pow(p.vx - r.vx, 2) + Math.pow(p.vy - r.vy, 2));
          sounds.playImpact(impact);
          createParticles((p.x + r.x)/2, (p.y + r.y)/2, '#fff', 15);
          
          p.energy = Math.min(100, p.energy + impact * 2.5);
          r.energy = Math.min(100, r.energy + impact * 2.0);
          
          if (collision.burst || p.health <= 0 || r.health <= 0) {
            setBattleOver(true);
            const winnerName = r.health <= 0 ? 'AIGER' : 'RIVAL';
            if (winnerName === 'RIVAL') sounds.playLoss();
            
            // Fix: Ensure comprehensive stats report is passed to avoid blank results screen
            onGameOver(winnerName, {
              damageTaken: Math.max(0, 100 - p.health),
              damageDealt: Math.max(0, 100 - r.health),
              collisions: statsTracker.current.collisions,
              specialsUsed: statsTracker.current.specialsUsed,
              maxSpeed: statsTracker.current.maxSpeed || 50,
              isBurst: true,
              replayData: replayDataRef.current
            });
            return;
          }
      }
      onUpdateStats({...p}, {...r});
    }

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
        onClick={() => {
          if (!isLaunched) {
            setIsLaunched(true);
            launchTimeRef.current = frameRef.current;
            sounds.playLaunch();
          }
        }}
        className="max-w-full max-h-full touch-none bg-[#000]" 
      />
      {!isLaunched && !battleOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 pointer-events-none">
              <div className="text-center">
                <h2 className="text-4xl text-white mb-4 animate-pulse italic">READY...</h2>
                <div className="bg-red-600 px-8 py-4 border-4 border-white transform skew-x-[-12deg]">
                    <p className="text-white text-3xl uppercase font-black">GO SHOOT!</p>
                </div>
                <p className="text-gray-400 text-xs mt-8">[ WASD TO STEER / CLICK TO START ]</p>
              </div>
          </div>
      )}
    </div>
  );
};

export default Arena;
