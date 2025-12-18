
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Blade, Particle, Point, ArenaStyle, BattleStats, AIDifficulty, ReplayFrame, BladeArchetype, BitbeastType } from '../types';
import { updatePhysics, resolveCollision, resolveArenaBoundary } from '../engine/physics';
import { sounds } from '../utils/sounds';
import { 
  ARENA_RADIUS, 
  BLADE_RADIUS, 
  DAMAGE_FACTOR, 
  ENERGY_GAIN,
  ARENA_THEMES,
  ARCHETYPE_STATS,
  BITBEAST_INFO
} from '../constants';

interface ArenaProps {
  playerConfig: {
    color: string;
    glowColor: string;
    stylePattern: 'DRAGON' | 'PHOENIX' | 'TIGER' | 'TURTLE';
    arenaStyle: ArenaStyle;
    archetype: BladeArchetype;
    bitbeast: BitbeastType;
  };
  difficulty: AIDifficulty;
  joystickVector: { x: number, y: number };
  onGameOver: (winner: string, stats: { player: BattleStats, rival: BattleStats }) => void;
  onUpdateStats: (player: Blade, rival: Blade) => void;
}

const TRAIL_LENGTH = 25;

const Arena: React.FC<ArenaProps> = ({ playerConfig, difficulty, joystickVector, onGameOver, onUpdateStats }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const [isLaunched, setIsLaunched] = useState(false);
  const keysPressed = useRef<Set<string>>(new Set());
  const specialActiveRef = useRef<number>(0); 
  const rivalSpecialActiveRef = useRef<number>(0);
  const shakeRef = useRef<number>(0);
  const frameRef = useRef<number>(0);

  const [summonText, setSummonText] = useState<string | null>(null);

  const playerTrailRef = useRef<{x: number, y: number, alpha: number}[]>([]);
  const rivalTrailRef = useRef<{x: number, y: number, alpha: number}[]>([]);
  const replayFramesRef = useRef<ReplayFrame[]>([]);
  
  const playerRef = useRef<Blade>({
    id: 'player',
    name: 'KENJI',
    x: 0,
    y: 150,
    vx: 0,
    vy: 0,
    radius: BLADE_RADIUS,
    rotation: 0,
    rotationSpeed: 0,
    health: 100,
    maxHealth: 100,
    energy: 0,
    maxEnergy: 100,
    color: playerConfig.color,
    glowColor: playerConfig.glowColor,
    archetype: playerConfig.archetype,
    bitbeast: playerConfig.bitbeast,
    isPlayer: true
  });

  const rivalRef = useRef<Blade>({
    id: 'rival',
    name: 'VEX',
    x: 0,
    y: -150,
    vx: 0,
    vy: 0,
    radius: BLADE_RADIUS,
    rotation: 0,
    rotationSpeed: 0,
    health: 100,
    maxHealth: 100,
    energy: 0,
    maxEnergy: 100,
    color: '#ef4444',
    glowColor: '#f87171',
    archetype: difficulty === 'ZENON' ? 'STRIKER' : 'GUARDIAN',
    bitbeast: 'DRIGER',
    isPlayer: false
  });

  const statsRef = useRef({
    player: { damageDealt: 0, damageTaken: 0, collisions: 0, specialsUsed: 0, maxSpeed: 0 },
    rival: { damageDealt: 0, damageTaken: 0, collisions: 0, specialsUsed: 0, maxSpeed: 0 }
  });

  const launchBlade = (e?: any) => {
    if (isLaunched) return;
    sounds.playLaunch();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    let mouseX = 0, mouseY = 0;
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    if (clientX !== undefined) {
      mouseX = clientX - rect.left - canvas.width / 2;
      mouseY = clientY - rect.top - canvas.height / 2;
    } else {
      mouseX = (Math.random() - 0.5) * 200;
      mouseY = (Math.random() - 0.5) * 200;
    }
    
    const speed = 18;
    const angle = Math.atan2(mouseY - playerRef.current.y, mouseX - playerRef.current.x);
    playerRef.current.vx = Math.cos(angle) * speed;
    playerRef.current.vy = Math.sin(angle) * speed;
    
    const aiSpeed = difficulty === 'ROOKIE' ? 12 : 16;
    rivalRef.current.vx = (Math.random() - 0.5) * aiSpeed;
    rivalRef.current.vy = (Math.random() - 0.5) * aiSpeed;
    setIsLaunched(true);
  };

  const triggerSpecial = (isPlayer: boolean) => {
    const blade = isPlayer ? playerRef.current : rivalRef.current;
    const target = isPlayer ? rivalRef.current : playerRef.current;
    const activeRef = isPlayer ? specialActiveRef : rivalSpecialActiveRef;

    if (blade.energy >= 100) {
      sounds.playSpecial();
      blade.energy = 0;
      activeRef.current = Date.now() + 2500; 
      shakeRef.current = 30;
      
      const beastInfo = BITBEAST_INFO[blade.bitbeast];
      if (isPlayer) {
        setSummonText(`${beastInfo.name}: ${beastInfo.move}!`);
        setTimeout(() => setSummonText(null), 2000);
        statsRef.current.player.specialsUsed++;
      } else {
        statsRef.current.rival.specialsUsed++;
      }
      
      const dx = target.x - blade.x;
      const dy = target.y - blade.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      blade.vx += (dx / (dist || 1)) * 45;
      blade.vy += (dy / (dist || 1)) * 45;
      
      createBeastSummon(blade.x, blade.y, beastInfo.color, beastInfo.symbol);
      createImpactParticles(blade.x, blade.y, beastInfo.color, 120, 'STORM');
    }
  };

  const createBeastSummon = (x: number, y: number, color: string, symbol: string) => {
    particlesRef.current.push({
      x, y, vx: 0, vy: -1, life: 1, maxLife: 1.5, color, size: 40, type: 'BEAST', angle: 0, symbol
    });
  };

  const createImpactParticles = (x: number, y: number, color: string, count: number, type: 'IMPACT' | 'SPARK' | 'EMBER' | 'FLASH' | 'STORM' = 'IMPACT', velocity?: {x: number, y: number}) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      let speed = Math.random() * 10 + 2;
      let life = Math.random() * 0.5 + 0.3;
      let size = Math.random() * 4 + 1;

      if (type === 'SPARK') { speed *= 1.5; size = Math.random() * 2 + 1; }
      if (type === 'STORM') { speed *= 2; size = Math.random() * 6 + 2; life *= 1.5; }

      particlesRef.current.push({
        x, y, 
        vx: (Math.cos(angle) * speed) + (velocity ? velocity.x * 0.4 : 0), 
        vy: (Math.sin(angle) * speed) + (velocity ? velocity.y * 0.4 : 0),
        life: life, maxLife: life, color, size, type
      });
    }
  };

  const drawBlade = (ctx: CanvasRenderingContext2D, blade: Blade, specialActive: number) => {
    const isSpecial = Date.now() < specialActive;
    const stats = ARCHETYPE_STATS[blade.archetype];
    const beast = BITBEAST_INFO[blade.bitbeast];
    
    ctx.save();
    ctx.translate(blade.x, blade.y);
    
    const speed = Math.sqrt(blade.vx * blade.vx + blade.vy * blade.vy);
    if (speed > 15) {
      ctx.globalAlpha = 0.3;
      ctx.drawImage(ctx.canvas, blade.x - speed, blade.y, blade.radius*2, blade.radius*2);
      ctx.globalAlpha = 1.0;
    }

    ctx.rotate(blade.rotation);
    
    ctx.beginPath();
    ctx.arc(0, 0, blade.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    const diskSides = 6;
    for(let i=0; i<diskSides; i++){
        const a = i * (Math.PI*2/diskSides);
        const r = blade.radius * 0.85;
        const px = r * Math.cos(a);
        const py = r * Math.sin(a);
        if(i===0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    const metalGrad = ctx.createLinearGradient(-20, -20, 20, 20);
    metalGrad.addColorStop(0, '#94a3b8');
    metalGrad.addColorStop(0.5, '#f1f5f9');
    metalGrad.addColorStop(1, '#475569');
    ctx.fillStyle = metalGrad;
    ctx.fill();
    ctx.stroke();

    const sides = stats.shapeSides;
    ctx.beginPath();
    if (sides === 0) {
      ctx.arc(0, 0, blade.radius * 0.7, 0, Math.PI * 2);
    } else {
      for (let i = 0; i < sides * 2; i++) {
        const angle = (i * Math.PI) / sides;
        const r = (i % 2 === 0) ? blade.radius * 0.7 : blade.radius * 0.55;
        const px = r * Math.cos(angle);
        const py = r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
    }
    ctx.fillStyle = blade.color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, blade.radius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.strokeStyle = beast.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '14px Orbitron';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(beast.symbol, 0, 0);

    if (isSpecial) {
      ctx.beginPath();
      ctx.arc(0, 0, blade.radius * 2, 0, Math.PI * 2);
      const aura = ctx.createRadialGradient(0, 0, blade.radius, 0, 0, blade.radius * 2.5);
      aura.addColorStop(0, `${beast.color}88`);
      aura.addColorStop(1, 'transparent');
      ctx.fillStyle = aura;
      ctx.fill();
    }

    ctx.restore();
  };

  const update = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    frameRef.current++;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    if (shakeRef.current > 0) {
      ctx.translate((Math.random() - 0.5) * shakeRef.current, (Math.random() - 0.5) * shakeRef.current);
      shakeRef.current *= 0.92;
    }
    ctx.translate(canvas.width / 2, canvas.height / 2);
    drawArena(ctx);

    const p = playerRef.current;
    const r = rivalRef.current;

    if (isLaunched) {
      playerTrailRef.current.push({x: p.x, y: p.y, alpha: 1.0});
      if (playerTrailRef.current.length > TRAIL_LENGTH) playerTrailRef.current.shift();
      rivalTrailRef.current.push({x: r.x, y: r.y, alpha: 1.0});
      if (rivalTrailRef.current.length > TRAIL_LENGTH) rivalTrailRef.current.shift();

      const dist = Math.sqrt(Math.pow(p.x - r.x, 2) + Math.pow(p.y - r.y, 2));
      let aiForce = difficulty === 'ZENON' ? 0.35 : 0.15;
      const dx = (p.x + p.vx * 10) - r.x;
      const dy = (p.y + p.vy * 10) - r.y;
      const mag = Math.sqrt(dx*dx + dy*dy);
      r.vx += (dx / (mag || 1)) * aiForce;
      r.vy += (dy / (mag || 1)) * aiForce;

      if (r.energy >= 100 && dist < 200) triggerSpecial(false);

      const steerForce = 0.3;
      let dxIn = joystickVector.x;
      let dyIn = joystickVector.y;
      if (keysPressed.current.has('w')) dyIn -= 1;
      if (keysPressed.current.has('s')) dyIn += 1;
      if (keysPressed.current.has('a')) dxIn -= 1;
      if (keysPressed.current.has('d')) dxIn += 1;
      const inMag = Math.sqrt(dxIn*dxIn + dyIn*dyIn);
      if (inMag > 0.1) {
        p.vx += (dxIn / inMag) * steerForce;
        p.vy += (dyIn / inMag) * steerForce;
      }
      if (keysPressed.current.has(' ')) triggerSpecial(true);

      updatePhysics(p); updatePhysics(r);
      resolveArenaBoundary(p, { x: 0, y: 0 }, playerConfig.arenaStyle);
      resolveArenaBoundary(r, { x: 0, y: 0 }, playerConfig.arenaStyle);

      if (resolveCollision(p, r)) {
        const impact = Math.sqrt(Math.pow(p.vx-r.vx,2) + Math.pow(p.vy-r.vy,2));
        sounds.playImpact(impact);
        p.health -= impact * DAMAGE_FACTOR;
        r.health -= impact * DAMAGE_FACTOR;
        p.energy = Math.min(100, p.energy + impact * ENERGY_GAIN);
        r.energy = Math.min(100, r.energy + impact * ENERGY_GAIN);
        createImpactParticles((p.x+r.x)/2, (p.y+r.y)/2, '#fff', impact, 'SPARK');
      }

      if (p.health <= 0 || r.health <= 0) {
        onGameOver(p.health > r.health ? 'KENJI' : 'VEX', { player: { ...statsRef.current.player }, rival: { ...statsRef.current.rival } });
      }
      onUpdateStats({...p}, {...r});
    }

    // Particle Handling
    particlesRef.current.forEach(pt => {
      pt.x += pt.vx; pt.y += pt.vy; pt.life -= 0.02;
      const safeLife = Math.max(0, Math.min(1, pt.life));
      ctx.globalAlpha = safeLife;
      if (pt.type === 'BEAST') {
        ctx.font = `${pt.size}px Orbitron`;
        ctx.fillStyle = pt.color;
        ctx.fillText(pt.symbol || '?', pt.x, pt.y);
      } else {
        ctx.fillStyle = pt.color;
        ctx.beginPath(); 
        // FIX: Ensure radius is never negative by using safeLife which is clamped [0, 1]
        ctx.arc(pt.x, pt.y, Math.max(0, pt.size * safeLife), 0, Math.PI*2); 
        ctx.fill();
      }
    });
    particlesRef.current = particlesRef.current.filter(pt => pt.life > 0);
    ctx.globalAlpha = 1.0;

    drawBlade(ctx, p, specialActiveRef.current);
    drawBlade(ctx, r, rivalSpecialActiveRef.current);
    ctx.restore();
    requestRef.current = requestAnimationFrame(update);
  }, [isLaunched, difficulty, joystickVector, playerConfig.arenaStyle]);

  const drawArena = (ctx: CanvasRenderingContext2D) => {
    const theme = ARENA_THEMES[playerConfig.arenaStyle];
    ctx.beginPath();
    if (theme.sides === 0) ctx.arc(0, 0, ARENA_RADIUS, 0, Math.PI * 2);
    else {
      for (let i = 0; i < theme.sides; i++) {
        const a = (i * Math.PI * 2) / theme.sides - Math.PI / theme.sides;
        const px = ARENA_RADIUS * Math.cos(a);
        const py = ARENA_RADIUS * Math.sin(a);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
    }
    ctx.fillStyle = theme.floorColor; ctx.fill();
    ctx.strokeStyle = theme.borderColor; ctx.lineWidth = 10; ctx.stroke();
  };

  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => keysPressed.current.add(e.key.toLowerCase());
    const handleUp = (e: KeyboardEvent) => keysPressed.current.delete(e.key.toLowerCase());
    window.addEventListener('keydown', handleDown); window.addEventListener('keyup', handleUp);
    requestRef.current = requestAnimationFrame(update);
    return () => { window.removeEventListener('keydown', handleDown); window.removeEventListener('keyup', handleUp); cancelAnimationFrame(requestRef.current); };
  }, [update]);

  return (
    <div className="relative overflow-hidden w-full max-w-[800px] aspect-square">
      <canvas ref={canvasRef} width={800} height={800} onMouseDown={launchBlade} className="w-full h-full cursor-crosshair" />
      {summonText && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-bounce">
          <h2 className="text-4xl font-black font-orbitron text-white italic tracking-tighter drop-shadow-[0_0_20px_#fff]">
            {summonText}
          </h2>
        </div>
      )}
      {!isLaunched && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none">
          <div className="text-center p-8 border-2 border-blue-500/30 rounded-xl animate-in zoom-in">
            <h3 className="text-5xl font-black font-orbitron text-blue-400 italic mb-4 animate-pulse">3... 2... 1...</h3>
            <p className="text-white font-bold tracking-[0.5em] text-xl">LET IT RIP!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Arena;
