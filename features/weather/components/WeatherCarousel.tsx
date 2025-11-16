'use client';

import { useEffect, useCallback, useId, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import useEmblaCarousel from 'embla-carousel-react';

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

  const isValidCity =
    !!city &&
    !!city.id &&
    !!city.name &&
    !!cityLocale &&
    !!city.name[locale];

  if (!isValidCity) {
    return <WeatherCardSkeleton />;
  }

  return (
    <div
      className="shrink-0 w-full h-full max-w-full overflow-x-hidden"
      role="group"
      aria-roledescription="slide"
      aria-label={`${city.name[locale]} weather`}
      style={{ height: '100%' }}
    >
      <div
        className="select-none rounded-3xl border border-white/20 bg-white/80 shadow-sm backdrop-blur-xl dark:border-gray-700/30 dark:bg-gray-900/80 h-full w-full max-w-full overflow-x-hidden"
        style={{ height: '100%', width: '100%' }}
      >
        <WeatherCardContent cityWeather={city} cityLocale={cityLocale} locale={locale} />
      </div>
    </div>
  );
}

// Wrapper to ensure component always has valid props for React DevTools
function WeatherCarouselInternal() {
  const t = useTranslations();

  // Canonical state from store – single source of truth
  const cities = useWeatherStore((s) => s.cities);
  const currentIndex = useWeatherStore((s) => s.currentIndex);
  const setCurrentIndex = useWeatherStore((s) => s.setCurrentIndex);
  const direction = useWeatherStore((s) => s.direction);

  const isRtl = direction === 'rtl';
  const carouselId = useId();
  const isProgrammaticScrollRef = useRef(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Normalize cities and index – no undefined/null in downstream logic
  const safeCities = Array.isArray(cities)
    ? cities.filter((city) => city && city.id)
    : [];

  const hasCities = safeCities.length > 0;
  const safeCurrentIndex =
    hasCities && typeof currentIndex === 'number'
      ? Math.min(Math.max(currentIndex, 0), safeCities.length - 1)
      : 0;

  // Hardening: Embla תמיד מקבל אובייקט ואוסף תוספים תקף
  const emblaOptions = {
    loop: isMounted && safeCities.length > 1,
    direction: (isRtl ? 'rtl' : 'ltr') as 'rtl' | 'ltr',
    align: 'center' as const,
    dragFree: false,
  };

  const emblaPlugins: never[] = [];

  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions, emblaPlugins);

  // Initialize Embla to correct index when ready (reset when Embla reinitializes)
  const hasInitializedRef = useRef(false);
  const lastEmblaKeyRef = useRef<string>('');
  
  useEffect(() => {
    if (!emblaApi || !isMounted || !hasCities) return;
    
    const currentKey = `embla-${isRtl ? 'rtl' : 'ltr'}`;
    // Reset initialization flag if Embla was recreated (RTL changed)
    if (lastEmblaKeyRef.current !== currentKey) {
      hasInitializedRef.current = false;
      lastEmblaKeyRef.current = currentKey;
    }
    
    if (hasInitializedRef.current) return;
    
    // Wait for Embla to be fully ready
    const initializeIndex = () => {
      if (!emblaApi) return;
      const selectedIndex = emblaApi.selectedScrollSnap();
      if (selectedIndex !== safeCurrentIndex) {
        isProgrammaticScrollRef.current = true;
        emblaApi.scrollTo(safeCurrentIndex, false); // Instant scroll on init
        setTimeout(() => {
          isProgrammaticScrollRef.current = false;
          hasInitializedRef.current = true;
        }, 50);
      } else {
        hasInitializedRef.current = true;
      }
    };

    // Embla might need a tick to be ready
    const timeout = setTimeout(initializeIndex, 0);
    return () => clearTimeout(timeout);
  }, [emblaApi, isMounted, safeCurrentIndex, isRtl, safeCities.length, hasCities]); // Include isRtl to detect direction changes

  // Sync Embla with Zustand store when currentIndex changes programmatically (after init)
  useEffect(() => {
    if (!emblaApi || !isMounted || !hasCities) return;
    
    const selectedIndex = emblaApi.selectedScrollSnap();
    // Only scroll if index actually changed and it's not from user interaction
    if (selectedIndex !== safeCurrentIndex && !isProgrammaticScrollRef.current) {
      isProgrammaticScrollRef.current = true;
      emblaApi.scrollTo(safeCurrentIndex);
      // Reset flag after scroll animation completes
      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 300);
    }
  }, [safeCurrentIndex, emblaApi, isMounted, safeCities.length, hasCities]);

  // Mirror Embla slide selection into Zustand store (user-initiated scrolls only)
  useEffect(() => {
    if (!emblaApi || !isMounted || safeCities.length === 0) return;

    const onSelect = () => {
      // Skip if this is a programmatic scroll to avoid loops
      if (isProgrammaticScrollRef.current || !emblaApi) return;
      
      const selectedIndex = emblaApi.selectedScrollSnap();
      // Only update if different to prevent unnecessary updates
      if (selectedIndex !== safeCurrentIndex) {
        setCurrentIndex(selectedIndex);
      }
    };

    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect); // Also handle reInit events
    
    return () => {
      if (emblaApi) {
        emblaApi.off('select', onSelect);
        emblaApi.off('reInit', onSelect);
      }
    };
  }, [emblaApi, setCurrentIndex, isMounted, safeCities.length, safeCurrentIndex]);

  // Keyboard support
  useEffect(() => {
    if (!emblaApi || !isMounted) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      const dir = document?.documentElement?.dir || 'ltr';
      const isRtlKey = dir === 'rtl';
      if (e.key === 'ArrowLeft') {
        isRtlKey ? emblaApi.scrollNext() : emblaApi.scrollPrev();
      } else {
        isRtlKey ? emblaApi.scrollPrev() : emblaApi.scrollNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [emblaApi, isMounted]);

  const goPrev = useCallback(() => {
    if (!emblaApi || !isMounted) return;
    emblaApi.scrollPrev();
  }, [emblaApi, isMounted]);

  const goNext = useCallback(() => {
    if (!emblaApi || !isMounted) return;
    emblaApi.scrollNext();
  }, [emblaApi, isMounted]);

  if (!hasCities) {
    return <WeatherCardSkeleton />;
  }

  return (
    <div className="relative h-full" role="region" aria-roledescription="carousel" aria-label="Weather carousel">
      {safeCities.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-between px-4">
          <button
            type="button"
            onClick={isRtl ? goNext : goPrev}
            aria-label={isRtl ? t('next') : t('prev')}
            aria-controls={carouselId}
            disabled={safeCities.length <= 1}
            className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/80 text-gray-900 shadow-sm backdrop-blur focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:opacity-40 dark:border-white/10 dark:bg-gray-900/70 dark:text-white"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={isRtl ? goPrev : goNext}
            aria-label={isRtl ? t('prev') : t('next')}
            aria-controls={carouselId}
            disabled={safeCities.length <= 1}
            className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/80 text-gray-900 shadow-sm backdrop-blur focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:opacity-40 dark:border-white/10 dark:bg-gray-900/70 dark:text-white"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
      {/* Embla viewport - dir attribute must be here, not on parent */}
      <div
        ref={emblaRef}
        key={`embla-${isRtl ? 'rtl' : 'ltr'}`}
        className="overflow-hidden h-full w-full"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="flex h-full">
          {safeCities
            .filter((city) => city && city.id && city.name) // Filter out invalid cities
            .map((city) => (
              <div
                key={city.id}
                className="flex-[0_0_100%] h-full flex items-stretch min-w-0"
                style={{ height: '100%' }}
              >
                <Slide city={city} />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// Export with wrapper to ensure component always has valid props for React DevTools
export default function WeatherCarousel() {
  return <WeatherCarouselInternal />;
}



