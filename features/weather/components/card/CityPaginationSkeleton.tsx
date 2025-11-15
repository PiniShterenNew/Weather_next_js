'use client';

interface CityPaginationSkeletonProps {
  count?: number;
}

export default function CityPaginationSkeleton({ count = 4 }: CityPaginationSkeletonProps) {
  return (
    <div
      className="flex flex-shrink-0 items-center justify-center gap-2 py-1"
      aria-hidden="true"
      data-testid="city-pagination-skeleton"
    >
      {Array.from({ length: count }).map((_, index) => (
        <span
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          className="h-2 w-2 rounded-full bg-white/60 shadow-sm dark:bg-white/30 animate-pulse"
          style={{ animationDelay: `${index * 120}ms` }}
        />
      ))}
    </div>
  );
}

