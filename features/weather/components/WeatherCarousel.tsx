'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useWeatherStore } from '@/store/useWeatherStore';
import { useWeatherLocale } from '@/hooks/useWeatherLocale';
import type { CityWeather } from '@/types/weather';
import WeatherCardContent from '@/features/weather/components/card/WeatherCardContent';
import WeatherCardSkeleton from '@/features/weather/components/card/WeatherCardSkeleton';

interface SlideProps {
  city: CityWeather;
}

function Slide({ city }: SlideProps) {
  const { locale, cityLocale } = useWeatherLocale(city);
  if (!cityLocale) {
    return <WeatherCardSkeleton />;
  }
  return (
    <div
      className="snap-center shrink-0 w-full h-full max-w-full overflow-x-hidden"
      role="group"
      aria-roledescription="slide"
      aria-label={`${city.name[locale]} weather`}
      style={{ height: '100%' }}
    >
      <div
        className="select-none rounded-3xl border border-white/20 bg-white/80 shadow-sm backdrop-blur-xl dark:border-gray-700/30 dark:bg-gray-900/80 h-full w-full max-w-full overflow-x-hidden"
        style={{ height: '100%', width: '100%' }}
      >
        <WeatherCardContent cityWeather={city} cityLocale={city} locale={locale} />
      </div>
    </div>
  );
}

export default function WeatherCarousel() {
  const listRef = useRef<HTMLDivElement | null>(null);
  const slidesRef = useRef<Array<HTMLDivElement | null>>([]);
  const cities = useWeatherStore((s) => s.cities);
  const currentIndex = useWeatherStore((s) => s.currentIndex);
  const setCurrentIndex = useWeatherStore((s) => s.setCurrentIndex);

  // Build looped slides: [clone(last), ...cities..., clone(first)]
  const loopedSlides = useMemo(() => {
    if (cities.length === 0) return [];
    const first = cities[0];
    const last = cities[cities.length - 1];
    return [
      { key: `clone-${last.id}`, city: last, isClone: true, cloneOf: cities.length - 1 },
      ...cities.map((c, idx) => ({ key: c.id, city: c, isClone: false, cloneOf: idx })),
      { key: `clone-${first.id}`, city: first, isClone: true, cloneOf: 0 },
    ];
  }, [cities]);

  // Ensure we start on the "real" currentIndex (offset by 1 due to leading clone)
  useEffect(() => {
    const container = listRef.current;
    const target = slidesRef.current[currentIndex + 1];
    if (!container || !target) return;
    target.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
  }, [loopedSlides.length]); // on mount/changes

  // Scroll to currentIndex when it changes programmatically
  useEffect(() => {
    const container = listRef.current;
    const target = slidesRef.current[currentIndex + 1];
    if (!container || !target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [currentIndex]);

  // Mouse drag-to-scroll support
  useEffect(() => {
    const container = listRef.current;
    if (!container) return;
    let isDown = false;
    let startX = 0;
    let scrollStart = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDown = true;
      container.classList.add('cursor-grabbing');
      startX = e.clientX;
      scrollStart = container.scrollLeft;
      e.preventDefault();
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      container.scrollLeft = scrollStart - dx;
    };
    const endDrag = () => {
      if (!isDown) return;
      isDown = false;
      container.classList.remove('cursor-grabbing');
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', endDrag);
    return () => {
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', endDrag);
    };
  }, []);

  // Observe slide visibility to update current index when user scrolls
  useEffect(() => {
    const container = listRef.current;
    if (!container) return;

    const options: IntersectionObserverInit = {
      root: container,
      rootMargin: '0px',
      threshold: 0.6, // consider selected when 60% of slide is visible
    };

    const handler = (entries: IntersectionObserverEntry[]) => {
      let bestLoopIndex = -1;
      let bestRatio = 0;
      for (const entry of entries) {
        const target = entry.target as HTMLElement;
        const idxAttr = target.getAttribute('data-loop-index');
        if (idxAttr == null) continue;
        const loopIdx = Number(idxAttr);
        if (entry.intersectionRatio > bestRatio) {
          bestRatio = entry.intersectionRatio;
          bestLoopIndex = loopIdx;
        }
      }
      if (bestLoopIndex >= 0) {
        const n = cities.length;
        // Map loop index to real index
        // loop indices: 0 = clone(last), 1..n = real 0..n-1, n+1 = clone(first)
        const realIndex =
          bestLoopIndex === 0
            ? n - 1
            : bestLoopIndex === n + 1
            ? 0
            : bestLoopIndex - 1;
        if (realIndex !== currentIndex) {
          setCurrentIndex(realIndex);
        }
      }
    };

    const observer = new IntersectionObserver(handler, options);
    slidesRef.current.forEach((el) => el && observer.observe(el));

    return () => observer.disconnect();
  }, [loopedSlides, cities.length, currentIndex, setCurrentIndex]);

  // Infinite loop jump handling: when clones are fully in view, jump to corresponding real slide without animation
  useEffect(() => {
    const container = listRef.current;
    if (!container) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const n = cities.length;
        if (n === 0) return;
        // If first loop index (0) is significantly in view, jump to last real (n)
        const firstClone = slidesRef.current[0];
        const lastClone = slidesRef.current[n + 1];
        if (!firstClone || !lastClone) return;
        const firstRect = firstClone.getBoundingClientRect();
        const lastRect = lastClone.getBoundingClientRect();
        const rootRect = container.getBoundingClientRect();
        const visibleWidth = (rect: DOMRect) =>
          Math.max(0, Math.min(rect.right, rootRect.right) - Math.max(rect.left, rootRect.left));
        const firstVisible = visibleWidth(firstRect) / rootRect.width;
        const lastVisible = visibleWidth(lastRect) / rootRect.width;

        if (firstVisible > 0.9) {
          // Jump to last real slide (index n)
          const target = slidesRef.current[n];
          target?.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
        } else if (lastVisible > 0.9) {
          // Jump to first real slide (index 1)
          const target = slidesRef.current[1];
          target?.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
        }
      });
    };
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [loopedSlides, cities.length]);

  // Keyboard support
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!listRef.current) return;
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      const dir = document?.documentElement?.dir || 'ltr';
      const isRtl = dir === 'rtl';
      const goPrev = () => setCurrentIndex(Math.max(0, currentIndex - 1));
      const goNext = () =>
        setCurrentIndex(Math.min(cities.length - 1, currentIndex + 1));
      if (e.key === 'ArrowLeft') {
        isRtl ? goNext() : goPrev();
      } else {
        isRtl ? goPrev() : goNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentIndex, cities.length, setCurrentIndex]);

  if (cities.length === 0) {
    return <WeatherCardSkeleton />;
  }

  return (
    <div
      className="h-full"
      role="region"
      aria-roledescription="carousel"
      aria-label="Weather carousel"
    >
      <div
        ref={listRef}
        className="flex h-full w-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide cursor-grab"
        style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth' }}
      >
        {loopedSlides.map(({ key, city }, idx) => (
          <div
            key={key}
            ref={(el) => (slidesRef.current[idx] = el)}
            data-loop-index={idx}
            className="min-w-full h-full flex items-stretch"
            style={{ height: '100%' }}
          >
            <Slide city={city} />
          </div>
        ))}
      </div>
    </div>
  );
}



