
import { Blade, Point, ArenaStyle } from '../types';
import { ARENA_RADIUS, WALL_BOUNCE, COLLISION_ELASTICITY, FRICTION, ARENA_THEMES, ARCHETYPE_STATS } from '../constants';

/**
 * Calculates mass-based circle collision and updates velocities
 */
export const resolveCollision = (b1: Blade, b2: Blade): boolean => {
  const dx = b2.x - b1.x;
  const dy = b2.y - b1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const minDistance = b1.radius + b2.radius;

  if (distance < minDistance) {
    const nx = dx / distance;
    const ny = dy / distance;
    
    // Relative velocity
    const rvx = b2.vx - b1.vx;
    const rvy = b2.vy - b1.vy;
    const velAlongNormal = rvx * nx + rvy * ny;

    // Do not resolve if velocities are separating
    if (velAlongNormal > 0) return true;

    const m1 = ARCHETYPE_STATS[b1.archetype].mass;
    const m2 = ARCHETYPE_STATS[b2.archetype].mass;
    
    const e = COLLISION_ELASTICITY;
    const j = -(1 + e) * velAlongNormal;
    const impulse = j / (1 / m1 + 1 / m2);

    const impulseX = impulse * nx;
    const impulseY = impulse * ny;

    b1.vx -= impulseX / m1;
    b1.vy -= impulseY / m1;
    b2.vx += impulseX / m2;
    b2.vy += impulseY / m2;

    // Positional correction to prevent sticking
    const percent = 0.4; // constant for positional correction
    const slop = 0.01; // constant for positional correction
    const overlap = Math.max(0, minDistance - distance - slop);
    const correction = (overlap / (1 / m1 + 1 / m2)) * percent;
    const cx = correction * nx;
    const cy = correction * ny;

    b1.x -= cx / m1;
    b1.y -= cy / m1;
    b2.x += cx / m2;
    b2.y += cy / m2;

    return true;
  }
  return false;
};

/**
 * Handles boundary collisions with different arena shapes
 */
export const resolveArenaBoundary = (blade: Blade, center: Point, style: ArenaStyle) => {
  const theme = ARENA_THEMES[style];
  const dx = blade.x - center.x;
  const dy = blade.y - center.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (theme.sides === 0) {
    if (dist + blade.radius > ARENA_RADIUS) {
      const nx = dx / dist;
      const ny = dy / dist;
      const dot = blade.vx * nx + blade.vy * ny;
      if (dot > 0) {
        blade.vx -= 2 * dot * nx * WALL_BOUNCE;
        blade.vy -= 2 * dot * ny * WALL_BOUNCE;
      }
      const overlap = dist + blade.radius - ARENA_RADIUS;
      blade.x -= nx * overlap;
      blade.y -= ny * overlap;
    }
  } else {
    const angle = Math.atan2(dy, dx);
    const n = theme.sides;
    const r_in = ARENA_RADIUS * Math.cos(Math.PI / n);
    const current_limit = r_in / Math.cos(((angle + Math.PI / n) % (2 * Math.PI / n)) - Math.PI / n);

    if (dist + blade.radius > current_limit) {
      const sideIndex = Math.floor(((angle + Math.PI / n) + Math.PI * 2) / (Math.PI * 2 / n)) % n;
      const normalAngle = sideIndex * (Math.PI * 2 / n);
      const nx = Math.cos(normalAngle);
      const ny = Math.sin(normalAngle);

      const dot = blade.vx * nx + blade.vy * ny;
      if (dot > 0) {
        blade.vx -= 2 * dot * nx * WALL_BOUNCE;
        blade.vy -= 2 * dot * ny * WALL_BOUNCE;
      }
      const overlap = dist + blade.radius - current_limit;
      blade.x -= nx * overlap;
      blade.y -= ny * overlap;
    }
  }
};

export const updatePhysics = (blade: Blade) => {
  const stats = ARCHETYPE_STATS[blade.archetype];
  blade.vx *= FRICTION;
  blade.vy *= FRICTION;
  blade.x += blade.vx;
  blade.y += blade.vy;
  const speed = Math.sqrt(blade.vx * blade.vx + blade.vy * blade.vy);
  // Rotation speed tied to current movement velocity
  blade.rotationSpeed = Math.min(0.5, 0.08 + speed * 0.03);
  blade.rotation += blade.rotationSpeed;
};
