
import { Skeleton } from "../ui/skeleton";

const CityInfoSkeleton = () => {
    return (
        <div className="w-full bg-card rounded-xl p-6 shadow-md border border-border">
            {/* Header buttons */}
            <div className="w-full flex items-start justify-between mb-6">
                <Skeleton className="w-10 h-10 rounded-md" />
                <Skeleton className="w-10 h-10 rounded-md" />
            </div>

            {/* Main weather info */}
            <div className="w-full flex flex-col items-center gap-6 mb-10">
                <Skeleton className="w-24 h-24 rounded-full" />
                <div className="flex flex-col items-center gap-2">
                    <Skeleton className="w-32 h-20" />
                    <Skeleton className="w-40 h-6" />
                    <Skeleton className="w-24 h-4" />
                </div>
            </div>

            {/* Weather details grid */}
            <div className="grid grid-cols-2 gap-3 w-full mb-6">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="flex flex-col items-center justify-center gap-2 p-3 bg-muted/30 rounded-lg">
                        <Skeleton className="w-5 h-5 rounded" />
                        <Skeleton className="w-16 h-5" />
                        <Skeleton className="w-12 h-3" />
                    </div>
                ))}
            </div>

            {/* Forecast skeleton - vertical stack instead of horizontal scroll */}
            <div className="space-y-3">
                <Skeleton className="w-24 h-4" />
                <div className="grid grid-cols-3 gap-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="p-3 bg-muted/30 rounded-lg">
                            <Skeleton className="w-full h-16" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default CityInfoSkeleton;
