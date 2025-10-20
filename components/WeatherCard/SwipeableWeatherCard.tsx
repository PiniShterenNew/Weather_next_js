'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, PanInfo, useMotionValue, useTransform, animate, useDragControls } from 'framer-motion';
import { useWeatherStore } from '@/store/useWeatherStore';
import CityInfo from './CityInfo';

const SWIPE_THRESHOLD = 100; // pixels
const SWIPE_VELOCITY_THRESHOLD = 500; // pixels per second
const ANIMATION_DURATION = 0.18; // 180ms

/**
 * Gesture conflict prevention:
 * - Drag restricted to header area only (via dragControls)
 * - Forecast scroll area stops event propagation
 * - This ensures smooth scroll within forecast without triggering city swipe
 * 
 * Testing checklist:
 * - [ ] Scroll forecast without triggering city swipe (iOS/Android)
 * - [ ] Swipe city from header area works
 * - [ ] No visible scrollbar in any theme
 * - [ ] All text readable in dark mode
 * - [ ] FPS remains >55 during animations
 * - [ ] Keyboard navigation still works
 */
export default function SwipeableWeatherCard() {
  const cities = useWeatherStore((s) => s.cities);
  const currentIndex = useWeatherStore((s) => s.currentIndex);
  const nextCity = useWeatherStore((s) => s.nextCity);
  const prevCity = useWeatherStore((s) => s.prevCity);
  
  const [direction, setDirection] = useState(0);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  // Handle pointer down to prevent drag conflicts with scrollable content
  const handlePointerDown = (e: React.PointerEvent | React.TouchEvent) => {
    // Only start drag if we have multiple cities
    if (cities.length <= 1) return;
    
    const target = e.target as HTMLElement;
    
    // Don't allow drag from buttons and interactive elements
    if (target.closest('button') || target.closest('[role="button"]') || target.closest('input') || target.closest('select')) {
      return;
    }
    
    // On mobile (touch), allow drag from anywhere
    // On desktop, only from header area
    const isTouchEvent = 'touches' in e;
    if (isTouchEvent || target.closest('[data-drag-handle]')) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dragControls.start(e as any);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (cities.length <= 1) return;
      
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        if (e.key === 'ArrowLeft') {
          setDirection(-1);
          prevCity();
        } else {
          setDirection(1);
          nextCity();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cities.length, nextCity, prevCity]);

  // Reset x position when city index changes
  useEffect(() => {
    if (direction !== 0) {
      animate(x, 0, {
        duration: ANIMATION_DURATION,
        ease: 'easeOut',
      });
      setDirection(0);
    }
  }, [currentIndex, x, direction]);

  if (cities.length === 0) {
    return <CityInfo />;
  }

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    
    // Determine if swipe threshold was exceeded
    const swipeDistance = Math.abs(offset.x);
    const swipeVelocity = Math.abs(velocity.x);
    
    if (
      swipeDistance > SWIPE_THRESHOLD ||
      swipeVelocity > SWIPE_VELOCITY_THRESHOLD
    ) {
      if (offset.x > 0) {
        // Swiped right -> go to previous city
        setDirection(-1);
        prevCity();
      } else {
        // Swiped left -> go to next city
        setDirection(1);
        nextCity();
      }
    } else {
      // Snap back to original position
      animate(x, 0, {
        duration: ANIMATION_DURATION,
        ease: 'easeOut',
      });
    }
  };

  return (
    <motion.div 
      ref={containerRef}
      className="w-full h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-sm border border-white/20 dark:border-gray-700/30 overflow-hidden select-none"
      role="region"
      aria-label="Weather information"
      aria-live="polite"
      onPointerDown={handlePointerDown}
      onTouchStart={handlePointerDown}
      drag={cities.length > 1 ? 'x' : false}
      dragListener={false}
      dragControls={dragControls}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      style={{ 
        x, 
        opacity,
        userSelect: 'none', 
        WebkitUserSelect: 'none',
        touchAction: 'manipulation' 
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
    >
      <CityInfo />
    </motion.div>
  );
}

