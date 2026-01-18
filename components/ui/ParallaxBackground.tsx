'use client';

import { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface FloatingItem {
  emoji: string;
  x: string;
  y: string;
  depth: number; // Higher = moves faster = appears closer
  rotation: number;
  scale: number;
  blur: number;
  delay: number;
}

/**
 * ParallaxBackground - Interactive mouse parallax effect
 * Features: 3D depth layers, spring physics, independent floating animations
 */
export default function ParallaxBackground() {
  // Track mouse position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Apply spring physics for smooth, inertia-based movement
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate movement relative to center of screen
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      // Normalize to -1 to 1 range
      const normalizedX = (e.clientX - centerX) / centerX;
      const normalizedY = (e.clientY - centerY) / centerY;

      mouseX.set(normalizedX);
      mouseY.set(normalizedY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Floating items with different depths for parallax effect
  const floatingItems: FloatingItem[] = [
    // Close layer (depth 3 - fastest movement)
    { emoji: '🥦', x: '15%', y: '20%', depth: 3, rotation: -15, scale: 1.2, blur: 1, delay: 0 },
    { emoji: '🪙', x: '85%', y: '25%', depth: 3, rotation: 20, scale: 1.1, blur: 1, delay: 1.5 },

    // Middle layer (depth 2)
    { emoji: '📸', x: '25%', y: '60%', depth: 2, rotation: 10, scale: 1, blur: 1.5, delay: 0.8 },
    { emoji: '🍳', x: '75%', y: '70%', depth: 2, rotation: -10, scale: 0.9, blur: 1.5, delay: 2.2 },
    { emoji: '✨', x: '50%', y: '45%', depth: 2, rotation: 0, scale: 0.8, blur: 1.5, delay: 1.2 },

    // Far layer (depth 1 - slowest movement)
    { emoji: '🥕', x: '10%', y: '80%', depth: 1, rotation: 15, scale: 0.7, blur: 2, delay: 0.5 },
    { emoji: '🥦', x: '90%', y: '85%', depth: 1, rotation: -20, scale: 0.6, blur: 2, delay: 1.8 },
    { emoji: '✨', x: '65%', y: '15%', depth: 1, rotation: 5, scale: 0.65, blur: 2, delay: 2.5 },
  ];

  // Create all transforms upfront (must call hooks at the top level, not in loops)
  const moveX0 = useTransform(smoothMouseX, [-1, 1], [-90, 90]);
  const moveY0 = useTransform(smoothMouseY, [-1, 1], [-60, 60]);
  const moveX1 = useTransform(smoothMouseX, [-1, 1], [-90, 90]);
  const moveY1 = useTransform(smoothMouseY, [-1, 1], [-60, 60]);
  const moveX2 = useTransform(smoothMouseX, [-1, 1], [-60, 60]);
  const moveY2 = useTransform(smoothMouseY, [-1, 1], [-40, 40]);
  const moveX3 = useTransform(smoothMouseX, [-1, 1], [-60, 60]);
  const moveY3 = useTransform(smoothMouseY, [-1, 1], [-40, 40]);
  const moveX4 = useTransform(smoothMouseX, [-1, 1], [-60, 60]);
  const moveY4 = useTransform(smoothMouseY, [-1, 1], [-40, 40]);
  const moveX5 = useTransform(smoothMouseX, [-1, 1], [-30, 30]);
  const moveY5 = useTransform(smoothMouseY, [-1, 1], [-20, 20]);
  const moveX6 = useTransform(smoothMouseX, [-1, 1], [-30, 30]);
  const moveY6 = useTransform(smoothMouseY, [-1, 1], [-20, 20]);
  const moveX7 = useTransform(smoothMouseX, [-1, 1], [-30, 30]);
  const moveY7 = useTransform(smoothMouseY, [-1, 1], [-20, 20]);

  const transforms = [
    { moveX: moveX0, moveY: moveY0 },
    { moveX: moveX1, moveY: moveY1 },
    { moveX: moveX2, moveY: moveY2 },
    { moveX: moveX3, moveY: moveY3 },
    { moveX: moveX4, moveY: moveY4 },
    { moveX: moveX5, moveY: moveY5 },
    { moveX: moveX6, moveY: moveY6 },
    { moveX: moveX7, moveY: moveY7 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {floatingItems.map((item, index) => {
        const { moveX, moveY } = transforms[index];

        return (
          <motion.div
            key={`${item.emoji}-${index}`}
            className="absolute text-5xl opacity-20"
            style={{
              left: item.x,
              top: item.y,
              x: moveX,
              y: moveY,
              filter: `blur(${item.blur}px)`,
              scale: item.scale,
            }}
            animate={{
              // Independent floating animation
              y: [-10, 10, -10],
              rotate: [item.rotation - 5, item.rotation + 5, item.rotation - 5],
              scale: [item.scale, item.scale * 1.1, item.scale],
            }}
            transition={{
              duration: 4 + item.depth,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: item.delay,
            }}
          >
            {item.emoji}
          </motion.div>
        );
      })}
    </div>
  );
}

