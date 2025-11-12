'use client';

import type { PointerEvent as ReactPointerEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { animate, motion, PanInfo, useDragControls, useMotionValue, useTransform } from 'framer-motion';

import { hapticSwipe } from '@/lib/haptics';
import { useWeatherStore } from '@/store/useWeatherStore';

import CityInfo from './CityInfo';

const SWIPE_THRESHOLD = 80;
const SWIPE_VELOCITY_THRESHOLD = 400;
const ANIMATION_DURATION = 0.15;
const HORIZONTAL_INTENT_THRESHOLD = 12;

const SwipeableWeatherCard = () => {
  const cities = useWeatherStore((state) => state.cities);
  const currentIndex = useWeatherStore((state) => state.currentIndex);
  const nextCity = useWeatherStore((state) => state.nextCity);
  const prevCity = useWeatherStore((state) => state.prevCity);

  const [direction, setDirection] = useState(0);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-150, 0, 150], [0.7, 1, 0.7]);
  const scale = useTransform(x, [-150, 0, 150], [0.95, 1, 0.95]);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const pointerStateRef = useRef<{
    id: number;
    x: number;
    y: number;
    hasStarted: boolean;
  } | null>(null);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (cities.length <= 1) {
      return;
    }

    const target = event.target as HTMLElement;

    // Don't interfere with buttons, inputs, or selects
    if (
      target.closest('button') ||
      target.closest('[role="button"]') ||
      target.closest('input') ||
      target.closest('select')
    ) {
      return;
    }

    if (event.pointerType === 'mouse') {
      if (target.closest('[data-drag-handle]')) {
        dragControls.start(event);
      }
      return;
    }

    // For touch, allow swipe detection even on scrollable areas
    // We'll determine direction in handlePointerMove
    pointerStateRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      hasStarted: false,
    };

    containerRef.current?.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = pointerStateRef.current;
    if (!state || state.id !== event.pointerId || state.hasStarted) {
      return;
    }

    const deltaX = event.clientX - state.x;
    const deltaY = event.clientY - state.y;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > HORIZONTAL_INTENT_THRESHOLD) {
      pointerStateRef.current = { ...state, hasStarted: true };
      dragControls.start(event);
    } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > HORIZONTAL_INTENT_THRESHOLD) {
      pointerStateRef.current = null;
      containerRef.current?.releasePointerCapture(event.pointerId);
    }
  };

  const resetPointerState = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerStateRef.current?.id === event.pointerId) {
      pointerStateRef.current = null;
    containerRef.current?.releasePointerCapture(event.pointerId);
    }
  };

  useEffect(() => {
    const handleKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (cities.length <= 1) {
        return;
      }

      if (keyboardEvent.key === 'ArrowLeft' || keyboardEvent.key === 'ArrowRight') {
        keyboardEvent.preventDefault();
        if (keyboardEvent.key === 'ArrowLeft') {
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

  useEffect(() => {
    if (direction !== 0) {
      animate(x, 0, {
        duration: ANIMATION_DURATION,
        ease: 'easeOut',
      });
      setDirection(0);
    }
  }, [currentIndex, direction, x]);

  if (cities.length === 0) {
    return <CityInfo />;
  }

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    const swipeDistance = Math.abs(offset.x);
    const swipeVelocity = Math.abs(velocity.x);

    if (swipeDistance > SWIPE_THRESHOLD || swipeVelocity > SWIPE_VELOCITY_THRESHOLD) {
      if (offset.x > 0) {
        hapticSwipe();
        setDirection(1);
        nextCity();
      } else {
        hapticSwipe();
        setDirection(-1);
        prevCity();
      }
    } else {
      animate(x, 0, {
        duration: ANIMATION_DURATION,
        ease: 'easeOut',
      });
    }
  };

  return (
    <motion.div
      ref={containerRef}
      className="select-none rounded-3xl border border-white/20 bg-white/80 shadow-sm backdrop-blur-xl dark:border-gray-700/30 dark:bg-gray-900/80"
      role="region"
      aria-label="Weather information"
      aria-live="polite"
      onPointerDown={handlePointerDown}
      drag={cities.length > 1 ? 'x' : false}
      dragListener={false}
      dragControls={dragControls}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      onPointerMove={handlePointerMove}
      onPointerUp={resetPointerState}
      onPointerCancel={resetPointerState}
      style={{
        x,
        opacity,
        scale,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'pan-x',
        height: '100%',
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
};

export default SwipeableWeatherCard;


