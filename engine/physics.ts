
import { Blade, Point, ArenaStyle } from '../types';
import { ARENA_RADIUS, WALL_BOUNCE, COLLISION_ELASTICITY, FRICTION, BEY_DATA } from '../constants';

export const resolveCollision = (b1: Blade, b2: Blade): { collided: boolean, burst: boolean } => {
  const dx = b2.x - b1.x;
  const dy = b2.y - b1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const minDistance = b1.radius + b2.radius;

  if (distance < minDistance) {
    const nx = dx / distance;
    const ny = dy / distance;
    const rvx = b2.vx - b1.vx;
    const rvy = b2.vy - b1.vy;
    const velAlongNormal = rvx * nx + rvy * ny;

    if (velAlongNormal > 0) return { collided: true, burst: false };

    const m1 = b1.stats.weight * (b1.isTurbo ? 1.3 : 1.0);
    const m2 = b2.stats.weight * (b2.isTurbo ? 1.3 : 1.0);
    
    const e = COLLISION_ELASTICITY;
    const j = -(1 + e) * velAlongNormal;
    const impulse = j / (1 / m1 + 1 / m2);

    const impulseX = impulse * nx;
    const impulseY = impulse * ny;

    b1.vx -= (impulseX / m1);
    b1.vy -= (impulseY / m1);
    b2.vx += (impulseX / m2);
    b2.vy += (impulseY / m2);

    const impactForce = Math.abs(impulse);
    let burstOccurred = false;
    
    const b1Damage = impactForce * (1.8 / b1.stats.burstResistance);
    const b2Damage = impactForce * (1.8 / b2.stats.burstResistance);

    b1.health -= b1Damage;
    b2.health -= b2Damage;

    if (b1.health <= 0 || b2.health <= 0) burstOccurred = true;

    const overlap = minDistance - distance;
    const correction = (overlap / (1 / m1 + 1 / m2)) * 0.5;
    b1.x -= (correction * nx) / m1;
    b1.y -= (correction * ny) / m1;
    b2.x += (correction * nx) / m2;
    b2.y += (correction * ny) / m2;

    return { collided: true, burst: burstOccurred };
  }
  return { collided: false, burst: false };
};

export const updatePhysics = (blade: Blade) => {
  blade.vx *= FRICTION;
  blade.vy *= FRICTION;
  blade.x += blade.vx;
  blade.y += blade.vy;
  
  const speed = Math.sqrt(blade.vx * blade.vx + blade.vy * blade.vy);
  blade.rotationSpeed = 0.15 + (speed * 0.12);
  blade.rotation += blade.rotationSpeed;

  if (blade.health < 40 && !blade.isTurbo) {
    blade.isTurbo = true;
  }
};

export const resolveArenaBoundary = (blade: Blade, style: ArenaStyle, framesElapsed: number) => {
    const dx = blade.x;
    const dy = blade.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist + blade.radius > ARENA_RADIUS) {
        const nx = dx / dist;
        const ny = dy / dist;
        const dot = blade.vx * nx + blade.vy * ny;
        if (dot > 0) {
            blade.vx -= 2 * dot * nx * WALL_BOUNCE;
            blade.vy -= 2 * dot * ny * WALL_BOUNCE;
            
            // Only apply wall damage after the launch phase (1 second) to prevent instant bursting
            if (framesElapsed > 60) {
              blade.health -= 0.08; 
            }
        }
        const overlap = dist + blade.radius - ARENA_RADIUS;
        blade.x -= nx * overlap;
        blade.y -= ny * overlap;
    }
};
