
import { Skeleton } from "../ui/skeleton";

const CityInfoSkeleton = () => {
    return (
        <div className="h-full overflow-y-auto overflow-x-hidden scroll-smooth scrollbar-hide animate-fade-in transition-all duration-300 opacity-100">
            <div className="flex flex-col gap-4 p-4 md:p-6 xl:p-8 pb-6 md:pb-8 xl:pb-10">
                {/* Header */}
                <div className="flex-shrink-0">
                    <div className="pt-2 px-2">
                        <div className="min-h-[50px]">
                            <div className="flex justify-between items-center mb-4">
                                <Skeleton className="h-6 w-32" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-8 w-8 rounded-md" />
                                    <Skeleton className="h-8 w-8 rounded-md" />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-4 py-2">
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-12 h-12 rounded-full" />
                                <Skeleton className="h-4 w-20" />
                            </div>

                            <div className="text-center">
                                <Skeleton className="h-16 w-32 mx-auto mb-2" />
                                <Skeleton className="h-5 w-24 mx-auto" />
                                <Skeleton className="h-4 w-20 mx-auto mt-3" />
                            </div>

                            <Skeleton className="h-4 w-16" />

                            <div className="flex items-center gap-4">
                                <Skeleton className="h-12 w-16 rounded-xl" />
                                <Skeleton className="h-12 w-16 rounded-xl" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Weather Details */}
                <div className="w-full">
                    <div className="grid grid-cols-2 gap-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="text-center p-4 rounded-2xl bg-muted/30 flex flex-col gap-2 items-center">
                                <Skeleton className="w-5 h-5 rounded" />
                                <Skeleton className="w-12 h-6" />
                                <Skeleton className="w-16 h-3" />
                            </div>
                        ))}
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-white/20 to-transparent my-4"></div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-4 rounded-2xl bg-muted/30 flex flex-col gap-2 items-center">
                            <Skeleton className="w-5 h-5 rounded" />
                            <Skeleton className="w-12 h-6" />
                            <Skeleton className="w-16 h-3" />
                        </div>
                        <div className="text-center p-4 rounded-2xl bg-muted/30 flex flex-col gap-2 items-center">
                            <Skeleton className="w-5 h-5 rounded" />
                            <Skeleton className="w-12 h-6" />
                            <Skeleton className="w-16 h-3" />
                        </div>
                    </div>
                </div>

                {/* Content below - Responsive layout */}
                <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-6 gap-4">
                    {/* Left Column - Hourly Forecast */}
                    <div className="flex flex-col gap-4">
                        {/* Hourly Forecast - Mobile skeleton */}
                        <div className="lg:hidden">
                            <Skeleton className="h-6 w-32 mb-3" />
                            <Skeleton className="h-32 w-full rounded-2xl" />
                        </div>
                        
                        {/* Hourly Forecast - Desktop skeleton */}
                        <div className="hidden lg:block">
                            <Skeleton className="h-6 w-32 mb-3" />
                            <div className="flex flex-col gap-3">
                                {Array.from({ length: 8 }).map((_, index) => (
                                    <div key={index} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-4 flex-1">
                                                <Skeleton className="h-4 w-16" />
                                                <Skeleton className="h-10 w-10 rounded-full" />
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Skeleton className="h-6 w-12" />
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

                        {/* Last Updated */}
                        <div className="text-center">
                            <Skeleton className="h-3 w-32 mx-auto" />
                        </div>
                    </div>

                    {/* Right Column - Daily Forecast */}
                    <div className="flex flex-col gap-4">
                        <div className="w-full space-y-2">
                            <Skeleton className="h-6 w-32 mb-3" />
                            <div className="flex flex-col gap-3">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <div key={index} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
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
    )
}

export default CityInfoSkeleton;
