'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const CityInfoComponent = dynamic(() => import('./CityInfo').then((module) => module.default), {
  loading: () => (
    <div className="w-full bg-card rounded-xl p-6 shadow-md border border-border">
      {/* Header buttons */}
      <div className="w-full flex items-start justify-between mb-6">
        <Skeleton className="w-10 h-10 rounded-md" />
        <Skeleton className="w-10 h-10 rounded-md" />
      </div>

      {/* Main weather info */}
      <div className="w-full flex flex-row items-start justify-around mb-10">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center gap-10">
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="w-32 h-20" />
              <Skeleton className="w-40 h-6" />
              <Skeleton className="w-24 h-4" />
            </div>
            <Skeleton className="w-24 h-24 rounded-full" />
          </div>
        </div>
        <div className="flex flex-col items-center justify-between">
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center">
              <Skeleton className="w-32 h-6 mb-2" />
              <Skeleton className="w-20 h-4" />
            </div>
            <Skeleton className="w-24 h-4 mt-2" />
          </div>
        </div>
      </div>

      {/* Weather details grid */}
      <div className="grid grid-cols-6 gap-4 w-full mb-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex flex-col items-center justify-center gap-1">
            <div className="flex flex-row items-center justify-center gap-2">
              <Skeleton className="w-12 h-4" />
              <Skeleton className="w-5 h-5 rounded" />
            </div>
            <Skeleton className="w-16 h-3" />
          </div>
        ))}
      </div>

      {/* Sunrise/Sunset */}
      <div className="grid grid-cols-2 gap-4 w-full mb-6">
        <div className="flex items-center justify-center gap-2 p-3 bg-muted/30 rounded-lg">
          <div className="flex flex-col items-center">
            <Skeleton className="w-20 h-5 mb-1" />
            <Skeleton className="w-12 h-3" />
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 p-3 bg-muted/30 rounded-lg">
          <div className="flex flex-col items-center">
            <Skeleton className="w-20 h-5 mb-1" />
            <Skeleton className="w-12 h-3" />
          </div>
        </div>
      </div>

      {/* Forecast skeleton */}
      <Skeleton className="w-full h-64 rounded-xl" />
    </div>
  ),
  ssr: false,
});

export default CityInfoComponent;