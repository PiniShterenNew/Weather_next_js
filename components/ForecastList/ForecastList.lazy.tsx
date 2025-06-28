'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '../ui/skeleton';

// טעינה עצלה של הקומפוננטה המקורית
const ForecastList = dynamic(() => import('./ForecastList').then((module_) => module_.default), {
  loading: () => (
    <div className="w-full mt-6 space-y-2">
      <Skeleton className="h-6 w-32 mb-3" />
      {Array.from({length: 5}).map((_, index) => (
        <div key={index} className="flex items-center justify-between p-2">
          <Skeleton className="h-4 w-24" />
          <div className="flex items-center gap-6">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-8 opacity-60" />
          </div>
        </div>
      ))}
    </div>
  ),
  ssr: false, // אין צורך בטעינת קוד בצד השרת
});

export default ForecastList;
