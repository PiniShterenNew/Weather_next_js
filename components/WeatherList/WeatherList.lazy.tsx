'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const WeatherListComponent = dynamic(() => import('./WeatherList').then((module) => module.default), {
  loading: () => (
    <div className="relative w-full max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-none mx-auto space-y-4">
      <div className="w-full flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="w-full p-4 bg-card rounded-xl flex flex-col gap-3 border border-border shadow-md animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-start justify-center gap-2">
                <Skeleton className="w-20 h-4" />
                <Skeleton className="w-16 h-3" />
              </div>
              <div className="text-right">
                <Skeleton className="w-12 h-8 mb-1" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-center gap-3">
                <Skeleton className="w-8 h-8" />
                <Skeleton className="w-12 h-3" />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="w-24 h-4" />
              <Skeleton className="w-24 h-4" />
              <Skeleton className="w-24 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
  ssr: false,
});

export default WeatherListComponent;