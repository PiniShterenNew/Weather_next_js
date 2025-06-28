'use client';

import { useWeatherStore } from '@/stores/useWeatherStore';
import WeatherCard from '@/components/WeatherCard/WeatherCard';
import dynamic from 'next/dynamic';
import DotsIndicator from '@/components/WeatherCarousel/DotsIndicator';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocale, useTranslations } from 'next-intl';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getDirection } from '@/lib/intl';
import { AppLocale } from '@/types/i18n';
import { useEffect, useRef } from 'react';
import WeatherEmpty from '../WeatherCard/WeatherEmpty';
import useIsClient from '@/hooks/useIsClient';

// טעינה עצלה של ForecastList
const ForecastList = dynamic(
  () => import('@/components/ForecastList/ForecastList.lazy'),
  { ssr: false, loading: () => <div className="w-full h-64 animate-pulse bg-muted rounded-xl" /> }, // מקום שמור פשוט לטעינה
);

export default function WeatherCarousel() {
  const isClient = useIsClient();

  const t = useTranslations();
  const locale = useLocale();
  const direction = getDirection(locale as AppLocale);
  const cities = useWeatherStore((s) => s.cities);
  const index = useWeatherStore((s) => s.currentIndex);
  const next = useWeatherStore((s) => s.nextCity);
  const previous = useWeatherStore((s) => s.prevCity);

  const scrollRef = useRef<HTMLDivElement>(null);

  const current = cities[index] ?? cities.at(-1);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [current?.id]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        previous();
      } else if (event.key === 'ArrowRight') {
        next();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [previous, next]);

  if (!isClient) return null;

  if (!current) return <WeatherEmpty />;

  return (
    <div className="relative w-full max-w-xl mx-auto space-y-4" aria-live="polite" data-testid="weather-carousel">
      <div className="flex items-center justify-between">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label={direction === 'rtl' ? t('next') : t('prev')}
              size="icon"
              variant="ghost"
              onClick={previous}
              data-testid={direction === 'rtl' ? 'prev-button' : 'next-button'}
            >
              {direction === 'rtl' ? (
                <ChevronRight role="presentation" />
              ) : (
                <ChevronLeft role="presentation" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{direction === 'rtl' ? t('next') : t('prev')}</TooltipContent>
        </Tooltip>

        <div ref={scrollRef} className="flex-1 p-5 rounded-xl bg-card text-card-foreground overflow-y-auto scrollbar-none shadow-md space-y-4 w-full max-w-md mx-auto border border-border max-h-[85vh]">
          <WeatherCard city={current} />
          <ForecastList unit={current.unit} forecast={current.forecast} />
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label={direction === 'rtl' ? t('prev') : t('next')}
              size="icon"
              variant="ghost"
              onClick={next}
              data-testid={direction === 'rtl' ? 'next-button' : 'prev-button'}
            >
              {direction === 'rtl' ? (
                <ChevronLeft role="presentation" />
              ) : (
                <ChevronRight role="presentation" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{direction === 'rtl' ? t('prev') : t('next')}</TooltipContent>
        </Tooltip>
      </div>

      <DotsIndicator length={cities.length} currentIndex={index} />
    </div>
  );
}
