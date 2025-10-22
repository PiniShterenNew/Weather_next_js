import { Skeleton } from "../ui/skeleton";

const ForecastListSkeleton = () => {
    return (
        <div className="w-full mt-6 space-y-2">
            <Skeleton className="h-6 w-32 mb-3" />
            <div className="flex flex-col gap-3">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                        {/* Date, icon, and temperatures row */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-4 flex-1">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-10 w-10 rounded-full" />
                            </div>
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-6 w-12" />
                                <Skeleton className="h-5 w-10" />
                            </div>
                        </div>
                        
                        {/* Additional info row */}
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-12" />
                            <Skeleton className="h-3 w-14" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ForecastListSkeleton;