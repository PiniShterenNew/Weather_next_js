import { Skeleton } from "../ui/skeleton";

const WeatherListSkeleton = () => {
    return (
        <div className="relative w-full max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-none mx-auto space-y-4">
            <div className="w-full flex flex-col gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className="group relative w-full rounded-2xl flex flex-col gap-4 overflow-hidden min-h-touch-target-comfortable shadow-lg border border-white/20 dark:border-gray-700/50"
                    >
                        {/* Gradient background layer */}
                        <div className="absolute inset-0 opacity-30 dark:opacity-20 bg-gradient-to-br from-blue-400 to-purple-500" />
                        
                        {/* White/Dark overlay */}
                        <div className="absolute inset-0 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90" />
                        
                        {/* Main content with padding */}
                        <div className="relative p-5 flex flex-col gap-3">
                            {/* Header: City name and country */}
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col gap-0.5">
                                    <Skeleton className="w-24 h-5" />
                                    <Skeleton className="w-16 h-3" />
                                </div>
                                
                                {/* Weather Icon */}
                                <div className="flex-shrink-0">
                                    <Skeleton className="w-9 h-9 rounded-full" />
                                </div>
                            </div>

                            {/* Temperature - Large and prominent */}
                            <div className="flex items-baseline gap-2">
                                <Skeleton className="w-20 h-12" />
                                <Skeleton className="w-6 h-8" />
                            </div>

                            {/* Condition description */}
                            <Skeleton className="w-32 h-4" />

                            {/* Metrics row */}
                            <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                                <div className="flex items-center gap-1.5">
                                    <Skeleton className="w-4 h-4 rounded" />
                                    <Skeleton className="w-8 h-3" />
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Skeleton className="w-4 h-4 rounded" />
                                    <Skeleton className="w-8 h-3" />
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Skeleton className="w-4 h-4 rounded" />
                                    <Skeleton className="w-8 h-3" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default WeatherListSkeleton;
