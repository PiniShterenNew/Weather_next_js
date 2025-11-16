'use client';

import { useEffect, useState } from 'react';
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
	// Canonical state from store – single source of truth
	const cities = useWeatherStore((s) => s.cities);
	const currentIndex = useWeatherStore((s) => s.currentIndex);
	const setCurrentIndex = useWeatherStore((s) => s.setCurrentIndex);
	const direction = useWeatherStore((s) => s.direction);

	const isRtl = direction === 'rtl';
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

	const emblaOptions = {
		loop: isMounted && safeCities.length > 1,
		direction: (isRtl ? 'rtl' : 'ltr') as 'rtl' | 'ltr',
		align: 'center' as const,
		dragFree: false,
	};

	const emblaPlugins: never[] = [];
	const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions, emblaPlugins);

	// On Embla init/reInit: ensure visual index equals store index without timers
	useEffect(() => {
		if (!emblaApi || !isMounted || !hasCities) return;
		const onInit = () => {
			const selected = emblaApi.selectedScrollSnap();
			if (selected !== safeCurrentIndex) {
				emblaApi.scrollTo(safeCurrentIndex, false);
			}
		};
		emblaApi.on('init', onInit);
		emblaApi.on('reInit', onInit);
		return () => {
			emblaApi.off('init', onInit);
			emblaApi.off('reInit', onInit);
		};
	}, [emblaApi, isMounted, hasCities, safeCurrentIndex]);

	// Programmatic navigation: when store index changes externally, scroll if needed (idempotent)
	useEffect(() => {
		if (!emblaApi || !isMounted || !hasCities) return;
		const selected = emblaApi.selectedScrollSnap();
		if (selected !== safeCurrentIndex) {
			emblaApi.scrollTo(safeCurrentIndex);
		}
	}, [emblaApi, isMounted, hasCities, safeCurrentIndex]);

	// User interaction: mirror Embla selection into store ONLY when selection settles
	// to avoid unnecessary re-renders and keep drag performance smooth.
	useEffect(() => {
		if (!emblaApi || !isMounted || safeCities.length === 0) return;
		const onSelect = () => {
			const selected = emblaApi.selectedScrollSnap();
			if (selected !== safeCurrentIndex) {
				setCurrentIndex(selected);
			}
		};
		emblaApi.on('settle', onSelect);
		return () => {
			emblaApi.off('settle', onSelect);
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

	if (!hasCities) {
		return <WeatherCardSkeleton />;
	}

	return (
		<div
			className="relative h-full min-h-[320px]"
			role="region"
			aria-roledescription="carousel"
			aria-label="Weather carousel"
		>
			{/* Embla viewport - dir attribute must be here, not on parent */}
			<div
				ref={emblaRef}
				key={`embla-${isRtl ? 'rtl' : 'ltr'}`}
				className="overflow-hidden h-full w-full"
				dir={isRtl ? 'rtl' : 'ltr'}
			>
				<div className="flex h-full">
					{safeCities
						.filter((city) => city && city.id && city.name)
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



