"use client";

import React, { useEffect, useRef, useState } from 'react';

interface Point {
  x: number;
  y: number;
}

type MicrobeType = 'good' | 'bad' | 'bonus' | 'slow' | 'life';

interface Microbe {
  pos: Point;
  vel: Point;
  radius: number;
  color: string;
  type: MicrobeType;
  createdAt: number;
}

interface GameCanvasProps {
  onScore: () => void;
  onGameOver: () => void;
  isPaused: boolean;
  onShake: () => void;
  lives: number;
  onLifeChange: (lives: number) => void;
}

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 800;
const INITIAL_SPEED = 3;
const MICROBE_RADIUS = 8;

export const GameCanvas: React.FC<GameCanvasProps> = ({ onScore, onGameOver, isPaused, onShake, lives, onLifeChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<Point>({ x: -100, y: -100 });
  const microbesRef = useRef<Microbe[]>([]);
  const speedMultiplierRef = useRef(1);
  const scoreInternalRef = useRef(0);
  const nextBonusScoreRef = useRef(10);
  const powerUpEndTimeRef = useRef(0);
  const slowEndTimeRef = useRef(0);
  const livesRef = useRef(lives);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);

  // Initialize game objects
  const initMicrobes = () => {
    microbesRef.current = [createMicrobe('good')]; // One good one
    speedMultiplierRef.current = 1;
    scoreInternalRef.current = 0;
    nextBonusScoreRef.current = 10;
    powerUpEndTimeRef.current = 0;
    slowEndTimeRef.current = 0;
  };

  const createMicrobe = (type: MicrobeType): Microbe => {
    const angle = Math.random() * Math.PI * 2;
    const speed = INITIAL_SPEED * speedMultiplierRef.current;

    // Random position not too close to the mouse
    let pos: Point;
    const padding = 100;
    do {
      pos = {
        x: MICROBE_RADIUS + Math.random() * (CANVAS_WIDTH - MICROBE_RADIUS * 2),
        y: MICROBE_RADIUS + Math.random() * (CANVAS_HEIGHT - MICROBE_RADIUS * 2)
      };
    } while (getDistance(pos, mouseRef.current) < padding);

    let color = '#4ade80'; // good
    if (type === 'bad') color = '#f87171';
    if (type === 'bonus') color = '#fbbf24'; // yellow
    if (type === 'slow') color = '#60a5fa'; // blue
    if (type === 'life') color = '#c084fc'; // purple

    return {
      pos,
      vel: {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed
      },
      radius: MICROBE_RADIUS,
      color,
      type,
      createdAt: Date.now()
    };
  };

  const getDistance = (p1: Point, p2: Point) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  };

  const update = () => {
    if (isPaused) return;

    const currentTime = Date.now();
    const isPoweredUp = currentTime < powerUpEndTimeRef.current;
    const isSlowed = currentTime < slowEndTimeRef.current;
    const microbes = microbesRef.current;

    // Check for bonus spawn
    if (scoreInternalRef.current >= nextBonusScoreRef.current) {
      if (nextBonusScoreRef.current % 20 === 0) {
        microbes.push(createMicrobe('bonus'));
      } else {
        const type = Math.random() > 0.5 ? 'slow' : 'life';
        microbes.push(createMicrobe(type));
      }
      nextBonusScoreRef.current += 10;
    }

    for (let i = 0; i < microbes.length; i++) {
      const m = microbes[i];

      // Handle bonus expiration
      if ((m.type === 'bonus' || m.type === 'slow' || m.type === 'life') && currentTime - m.createdAt > 5000) {
        microbes.splice(i, 1);
        i--;
        continue;
      }

      // Move
      const slowMultiplier = isSlowed ? 0.5 : 1;
      m.pos.x += m.vel.x * slowMultiplier;
      m.pos.y += m.vel.y * slowMultiplier;

      // Bounce
      if (m.pos.x - m.radius < 0 || m.pos.x + m.radius > CANVAS_WIDTH) {
        m.vel.x *= -1;
        m.pos.x = Math.max(m.radius, Math.min(CANVAS_WIDTH - m.radius, m.pos.x));
      }
      if (m.pos.y - m.radius < 0 || m.pos.y + m.radius > CANVAS_HEIGHT) {
        m.vel.y *= -1;
        m.pos.y = Math.max(m.radius, Math.min(CANVAS_HEIGHT - m.radius, m.pos.y));
      }

      // Mouse Collision
      const dist = getDistance(m.pos, mouseRef.current);
      const interactionRadius = isPoweredUp ? 30 : 10;
      if (dist < m.radius + interactionRadius) {
        if (m.type === 'bad') {
          if (isPoweredUp) {
            // Delete bad microbe
            microbes.splice(i, 1);
            i--;
            onShake();
            continue;
          } else if (livesRef.current > 0) {
            // Use a life
            onLifeChange(livesRef.current - 1);
            microbes.splice(i, 1);
            i--;
            onShake();
            continue;
          } else {
            onGameOver();
            return;
          }
        } else {
          // Caught good or bonus microbe
          onScore();
          onShake();
          scoreInternalRef.current++;

          if (m.type === 'bonus') {
            powerUpEndTimeRef.current = Date.now() + 5000;
          } else if (m.type === 'slow') {
            slowEndTimeRef.current = Date.now() + 5000;
          } else if (m.type === 'life') {
            onLifeChange(lives + 1);
          }

          if (m.type !== 'good') {
            // Bonus types just disappear
            microbes.splice(i, 1);
            i--;
          } else {
            // Speed up everything
            speedMultiplierRef.current *= 1.005;
            microbes.forEach(obj => {
              obj.vel.x *= 1.005;
              obj.vel.y *= 1.005;
            });

            // Replace microbe and add bad one
            microbes[i] = createMicrobe('good');
            microbes.push(createMicrobe('bad'));
          }
        }
      }
    }
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    const currentTime = Date.now();
    const isSlowed = currentTime < slowEndTimeRef.current;
    
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Apply slow motion overlay
    if (isSlowed) {
      ctx.fillStyle = 'rgba(96, 165, 250, 0.1)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // Draw grid background (subtle)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= CANVAS_WIDTH; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= CANVAS_HEIGHT; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // Draw Microbes
    microbesRef.current.forEach(m => {
      ctx.save();

      // Glow effect
      ctx.shadowBlur = 15;
      ctx.shadowColor = m.color;

      ctx.fillStyle = m.color;
      ctx.beginPath();
      ctx.arc(m.pos.x, m.pos.y, m.radius, 0, Math.PI * 2);
      ctx.fill();

      // Inner highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(m.pos.x - m.radius * 0.3, m.pos.y - m.radius * 0.3, m.radius * 0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    // Draw Crosshair
    const m = mouseRef.current;
    const isPoweredUp = currentTime < powerUpEndTimeRef.current;
    const crosshairSize = isPoweredUp ? 60 : 20;
    const crosshairLineSize = isPoweredUp ? 90 : 30;
    const crosshairInnerLine = isPoweredUp ? 30 : 10;
    
    ctx.strokeStyle = isPoweredUp ? '#fbbf24' : '#6366f1';
    ctx.lineWidth = isPoweredUp ? 4 : 2;
    ctx.beginPath();
    // Circle
    ctx.arc(m.x, m.y, crosshairSize, 0, Math.PI * 2);
    if (isPoweredUp) {
      ctx.save();
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#fbbf24';
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.stroke();
    }
    // Cross lines
    ctx.beginPath();
    ctx.moveTo(m.x - crosshairLineSize, m.y); ctx.lineTo(m.x - crosshairInnerLine, m.y);
    ctx.moveTo(m.x + crosshairInnerLine, m.y); ctx.lineTo(m.x + crosshairLineSize, m.y);
    ctx.moveTo(m.x, m.y - crosshairLineSize); ctx.lineTo(m.x, m.y - crosshairInnerLine);
    ctx.moveTo(m.x, m.y + crosshairInnerLine); ctx.lineTo(m.x, m.y + crosshairLineSize);
    ctx.stroke();
  };

  const loop = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      update();
      draw(ctx);
    }
    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    initMicrobes();
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPaused]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  return (
    <div className="relative group cursor-none">
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onMouseMove={handleMouseMove}
        className="relative bg-slate-950 rounded-xl border border-white/10 shadow-2xl"
      />
    </div>
  );
};
