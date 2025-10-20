import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function WeatherCardSkeleton() {
  return (
    <Card className="relative p-6 md:p-8 animate-pulse">
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-12 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-16 w-16 rounded-full" />
      </div>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
        
        <Skeleton className="h-4 w-32 mx-auto" />
        
        <div className="grid grid-cols-4 gap-2 mt-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-8 w-8 mx-auto rounded-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
