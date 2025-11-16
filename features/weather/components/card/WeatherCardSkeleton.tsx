'use client';

import { Skeleton } from '@/components/ui/skeleton';

export const WeatherCardSkeleton = () => (
  <div className="animate-fade-in h-full overflow-y-auto overflow-x-hidden scrollbar-hide opacity-100">
    <div className="flex flex-col gap-4 pb-6 pl-4 pr-4 pt-4 md:pb-8 md:pl-6 md:pr-6 md:pt-6 xl:pb-10 xl:pl-8 xl:pr-8 xl:pt-8">
      <div className="flex-shrink-0">
        <div className="px-2 pt-2">
          <div className="min-h-[50px]">
            <div className="mb-4 flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 py-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>

            <div className="text-center">
              <Skeleton className="mx-auto mb-2 h-16 w-32" />
              <Skeleton className="mx-auto h-5 w-24" />
              <Skeleton className="mx-auto mt-3 h-4 w-20" />
            </div>

            <Skeleton className="h-4 w-16" />

            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-16 rounded-xl" />
              <Skeleton className="h-12 w-16 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={`metric-${index}`} className="flex flex-col items-center gap-2 rounded-2xl bg-muted/30 p-4 text-center">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>

        <div className="my-4 h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-white/20" />

        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={`metric-large-${index}`} className="flex flex-col items-center gap-2 rounded-2xl bg-muted/30 p-4 text-center">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-6">
        <div className="flex flex-col gap-4">
          <div className="lg:hidden">
            <Skeleton className="mb-3 h-6 w-32" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>

          <div className="hidden lg:block">
            <Skeleton className="mb-3 h-6 w-32" />
            <div className="flex flex-col gap-3">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={`hourly-${index}`}
                  className="rounded-2xl border border-gray-200/50 bg-white/90 p-4 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/90"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex flex-1 items-center gap-4">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                    <Skeleton className="h-6 w-12" />
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-14" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Skeleton className="mx-auto h-3 w-32" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <Skeleton className="mb-3 h-6 w-32" />
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`daily-${index}`}
                  className="rounded-2xl border border-gray-200/50 bg-white/90 p-4 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/90"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex flex-1 items-center gap-4">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-6 w-12" />
                      <Skeleton className="h-5 w-10" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-14" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default WeatherCardSkeleton;


