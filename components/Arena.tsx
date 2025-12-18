
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
  mobileSpecialTrigger?: boolean;
}

const TRAIL_LENGTH = 20;

const Arena: React.FC<ArenaProps> = ({ playerConfig, difficulty, joystickVector, onGameOver, onUpdateStats, mobileSpecialTrigger }) => {
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
    
    const speed = 20;
    const angle = Math.atan2(mouseY - playerRef.current.y, mouseX - playerRef.current.x);
    playerRef.current.vx = Math.cos(angle) * speed;
    playerRef.current.vy = Math.sin(angle) * speed;
    
    const aiSpeed = difficulty === 'ROOKIE' ? 12 : 18;
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
      activeRef.current = Date.now() + 3000; 
      shakeRef.current = 40;
      
      const beastInfo = BITBEAST_INFO[blade.bitbeast];
      if (isPlayer) {
        setSummonText(`${beastInfo.name}: ${beastInfo.move}!`);
        setTimeout(() => setSummonText(null), 2500);
        statsRef.current.player.specialsUsed++;
      } else {
        statsRef.current.rival.specialsUsed++;
      }
      
      // Homing Rush
      const dx = target.x - blade.x;
      const dy = target.y - blade.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      blade.vx += (dx / (dist || 1)) * 50;
      blade.vy += (dy / (dist || 1)) * 50;
      
      // Special Visuals
      createBeastSummon(blade.x, blade.y, beastInfo.color, beastInfo.symbol);
      createImpactParticles(blade.x, blade.y, beastInfo.color, 150, 'STORM');
      
      // Unique Effects based on Bitbeast
      if (beastInfo.effect === 'TORNADO') {
         for(let i=0; i<30; i++) {
            particlesRef.current.push({
               x: blade.x, y: blade.y, vx: (Math.random()-0.5)*15, vy: (Math.random()-0.5)*15,
               life: 1.5, maxLife: 1.5, color: '#fff', size: 10, type: 'STORM'
            });
         }
      } else if (beastInfo.effect === 'FLAME') {
         for(let i=0; i<60; i++) {
           createImpactParticles(blade.x, blade.y, '#ef4444', 1, 'EMBER');
         }
      }
    }
  };

  const createBeastSummon = (x: number, y: number, color: string, symbol: string) => {
    particlesRef.current.push({
      x, y, vx: 0, vy: -0.5, life: 1, maxLife: 2, color, size: 60, type: 'BEAST', angle: 0, symbol
    });
  };

  const createImpactParticles = (x: number, y: number, color: string, count: number, type: 'IMPACT' | 'SPARK' | 'EMBER' | 'FLASH' | 'STORM' = 'IMPACT', velocity?: {x: number, y: number}) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      let speed = Math.random() * 12 + 3;
      let life = Math.random() * 0.7 + 0.3;
      let size = Math.random() * 5 + 1;

      if (type === 'SPARK') { speed *= 1.8; size = Math.random() * 2 + 1; }
      if (type === 'STORM') { speed *= 2.5; size = Math.random() * 8 + 3; life *= 1.8; }

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

    // Dynamic Trail Particles
    if (frameRef.current % 3 === 0) {
      particlesRef.current.push({
        x: blade.x + (Math.random()-0.5)*10,
        y: blade.y + (Math.random()-0.5)*10,
        vx: -blade.vx * 0.1, vy: -blade.vy * 0.1,
        life: 0.5, maxLife: 0.5, color: blade.glowColor, size: 4, type: 'TRAIL'
      });
    }

    ctx.rotate(blade.rotation);
    
    // LAYER 1: BASE PLATE (Depth simulation)
    ctx.beginPath();
    ctx.arc(0, 0, blade.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.stroke();

    // LAYER 2: METAL WEIGHT DISK (Gradients for metallic look)
    ctx.beginPath();
    const diskSides = 8;
    for(let i=0; i<diskSides; i++){
        const a = i * (Math.PI*2/diskSides);
        const r = blade.radius * 0.88;
        const px = r * Math.cos(a);
        const py = r * Math.sin(a);
        if(i===0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    const metalGrad = ctx.createLinearGradient(-blade.radius, -blade.radius, blade.radius, blade.radius);
    metalGrad.addColorStop(0, '#94a3b8');
    metalGrad.addColorStop(0.4, '#f1f5f9');
    metalGrad.addColorStop(0.6, '#cbd5e1');
    metalGrad.addColorStop(1, '#475569');
    ctx.fillStyle = metalGrad;
    ctx.fill();
    ctx.stroke();

    // LAYER 3: ATTACK RING (Shape based on archetype)
    const sides = stats.shapeSides;
    ctx.beginPath();
    if (sides === 0) {
      ctx.arc(0, 0, blade.radius * 0.75, 0, Math.PI * 2);
    } else {
      for (let i = 0; i < sides * 2; i++) {
        const angle = (i * Math.PI) / sides;
        const r = (i % 2 === 0) ? blade.radius * 0.78 : blade.radius * 0.6;
        const px = r * Math.cos(angle);
        const py = r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
    }
    ctx.fillStyle = blade.color;
    ctx.shadowBlur = isSpecial ? 40 : 15;
    ctx.shadowColor = isSpecial ? '#fff' : blade.glowColor;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // LAYER 4: CENTER SPIRIT CHIP
    ctx.beginPath();
    ctx.arc(0, 0, blade.radius * 0.32, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.strokeStyle = beast.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.rotate(-blade.rotation); // Keep symbol upright
    ctx.font = 'bold 16px Orbitron';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(beast.symbol, 0, 1);
    ctx.restore();

    // Special Burst Visuals (Ring)
    if (isSpecial) {
      ctx.beginPath();
      ctx.arc(0, 0, blade.radius * 2.2, 0, Math.PI * 2);
      const aura = ctx.createRadialGradient(0, 0, blade.radius, 0, 0, blade.radius * 2.5);
      aura.addColorStop(0, `${beast.color}dd`);
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
      shakeRef.current *= 0.94;
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

      // AI Decision Logic
      const dist = Math.sqrt(Math.pow(p.x - r.x, 2) + Math.pow(p.y - r.y, 2));
      let aiForce = difficulty === 'ZENON' ? 0.4 : 0.2;
      const dx = (p.x + p.vx * 15) - r.x;
      const dy = (p.y + p.vy * 15) - r.y;
      const mag = Math.sqrt(dx*dx + dy*dy);
      r.vx += (dx / (mag || 1)) * aiForce;
      r.vy += (dy / (mag || 1)) * aiForce;

      if (r.energy >= 100 && dist < 250) triggerSpecial(false);

      // Player Controls
      const steerForce = 0.4;
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
      if (keysPressed.current.has(' ') || mobileSpecialTrigger) triggerSpecial(true);

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

    // Particle Handling with bounds check
    particlesRef.current.forEach(pt => {
      pt.x += pt.vx; pt.y += pt.vy; pt.life -= 0.015;
      const safeLife = Math.max(0, pt.life);
      ctx.globalAlpha = safeLife;
      if (pt.type === 'BEAST') {
        ctx.font = `bold ${pt.size}px Orbitron`;
        ctx.fillStyle = pt.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = pt.color;
        ctx.fillText(pt.symbol || '?', pt.x, pt.y);
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = pt.color;
        ctx.beginPath(); 
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
  }, [isLaunched, difficulty, joystickVector, playerConfig.arenaStyle, mobileSpecialTrigger]);

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
    ctx.strokeStyle = theme.borderColor; ctx.lineWidth = 15; ctx.stroke();
    
    // Stadium Markings
    ctx.beginPath();
    ctx.arc(0, 0, ARENA_RADIUS * 0.4, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => keysPressed.current.add(e.key.toLowerCase());
    const handleUp = (e: KeyboardEvent) => keysPressed.current.delete(e.key.toLowerCase());
    window.addEventListener('keydown', handleDown); window.addEventListener('keyup', handleUp);
    requestRef.current = requestAnimationFrame(update);
    return () => { window.removeEventListener('keydown', handleDown); window.removeEventListener('keyup', handleUp); cancelAnimationFrame(requestRef.current); };
  }, [update]);

  return (
    <div className="relative overflow-hidden w-screen h-screen flex items-center justify-center bg-slate-950">
      <div className="relative aspect-square max-h-screen p-4">
        <canvas ref={canvasRef} width={800} height={800} onMouseDown={launchBlade} className="w-full h-full max-h-[85vh] cursor-crosshair rounded-full shadow-2xl" />
      </div>
      {summonText && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
          <div className="bg-white/10 backdrop-blur-md px-12 py-6 rounded-3xl border border-white/20 animate-in zoom-in slide-in-from-bottom-8">
            <h2 className="text-6xl font-black font-orbitron text-white italic tracking-tighter drop-shadow-[0_0_30px_#fff]">
              {summonText}
            </h2>
          </div>
        </div>
      )}
      {!isLaunched && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xl pointer-events-none z-40">
          <div className="text-center p-12 bg-slate-900/40 rounded-[60px] border border-blue-500/20 animate-in zoom-in shadow-2xl">
            <h3 className="text-7xl font-black font-orbitron text-blue-500 italic mb-6 animate-pulse tracking-tighter">BATTLE PHASE</h3>
            <p className="text-white/80 font-black tracking-[0.6em] text-2xl uppercase italic">Tap to Release Blade</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Arena;
