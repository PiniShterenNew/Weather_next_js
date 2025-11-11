
import { Skeleton } from "../ui/skeleton";

const CityInfoSkeleton = () => {
    return (
        <div className="h-full overflow-y-auto overflow-x-hidden scroll-smooth scrollbar-hide animate-fade-in transition-all duration-300 opacity-100">
            {/* Mobile Layout - Vertical */}
            <div className="flex flex-col gap-4 p-4 md:p-6 xl:p-8 pb-2 md:pb-3 xl:pb-4 lg:hidden">
                {/* Header */}
                <div className="flex-shrink-0">
                    <div className="pt-2 px-2">
                        <div className="min-h-[50px]">
                            <div className="flex justify-between items-center mb-4">
                                <Skeleton className="h-6 w-32" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-8 w-8 rounded-md" />
                                    <Skeleton className="h-8 w-8 rounded-md" />
                                    <Skeleton className="h-8 w-8 rounded-md" />
                                </div>
                            </div>
                        </div>

                        {/* Mobile Layout */}
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
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="text-center p-4 rounded-2xl bg-muted/30 flex flex-col gap-2 items-center">
                                <Skeleton className="w-5 h-5 rounded" />
                                <Skeleton className="w-12 h-6" />
                                <Skeleton className="w-16 h-3" />
                            </div>
                        ))}
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 mt-3 lg:max-w-md lg:mx-auto">
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

                {/* Forecasts */}
                <div className="flex flex-col gap-4">
                    <div className="bg-blue-50/30 dark:bg-blue-950/20 rounded-2xl p-4 border border-blue-200/30 dark:border-blue-800/30">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                            <Skeleton className="h-6 w-32" />
                        </div>
                        <Skeleton className="h-32 w-full rounded-2xl" />
                    </div>

                    <div className="bg-gray-50/30 dark:bg-gray-800/20 rounded-2xl p-4 border border-gray-200/30 dark:border-gray-700/30">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-1 h-6 bg-gray-500 rounded-full"></div>
                            <Skeleton className="h-6 w-32" />
                        </div>
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

                    <div className="text-center">
                        <Skeleton className="h-3 w-32 mx-auto" />
                    </div>
                </div>
            </div>

            {/* Desktop Layout - Two Column Grid */}
            <div className="hidden lg:grid lg:grid-cols-[1fr_1.5fr] lg:gap-8 lg:items-start lg:w-full lg:max-w-6xl lg:mx-auto lg:p-6">
                {/* Left Column - City Info */}
                <div className="flex flex-col gap-4">
                    {/* City Header */}
                    <div className="pt-2 px-2">
                        <div className="min-h-[50px]">
                            <div className="flex justify-between items-center mb-4">
                                <Skeleton className="h-6 w-32" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-8 w-8 rounded-md" />
                                    <Skeleton className="h-8 w-8 rounded-md" />
                                    <Skeleton className="h-8 w-8 rounded-md" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Weather Icon, Country, Time */}
                    <div className="flex items-center gap-6">
                        <Skeleton className="w-20 h-20 rounded-full" />
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    </div>

                    {/* Sunrise/Sunset */}
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

                    {/* Last Updated */}
                    <div className="text-center">
                        <Skeleton className="h-3 w-32 mx-auto" />
                    </div>
                </div>

                {/* Right Column - Temperature and Weather Data */}
                <div className="flex flex-col gap-4">
                    {/* Temperature Section */}
                    <div className="text-center">
                        <Skeleton className="h-32 w-48 mx-auto mb-2" />
                        <Skeleton className="h-6 w-32 mx-auto mb-2" />
                        <Skeleton className="h-5 w-28 mx-auto" />
                        <div className="flex items-center gap-4 mt-4 justify-center">
                            <Skeleton className="h-12 w-16 rounded-xl" />
                            <Skeleton className="h-12 w-16 rounded-xl" />
                        </div>
                    </div>

                    {/* Weather Details - 3-column grid */}
                    <div className="w-full">
                        <div className="grid grid-cols-3 gap-4">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div key={index} className="text-center p-4 rounded-2xl bg-muted/30 flex flex-col gap-2 items-center">
                                    <Skeleton className="w-5 h-5 rounded" />
                                    <Skeleton className="w-12 h-6" />
                                    <Skeleton className="w-16 h-3" />
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-3 max-w-md mx-auto">
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

                    {/* Forecasts */}
                    <div className="flex flex-col gap-4">
                        <div className="bg-blue-50/30 dark:bg-blue-950/20 rounded-2xl p-4 border border-blue-200/30 dark:border-blue-800/30">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                                <Skeleton className="h-6 w-32" />
                            </div>
                            <Skeleton className="h-32 w-full rounded-2xl" />
                        </div>

                        <div className="bg-gray-50/30 dark:bg-gray-800/20 rounded-2xl p-4 border border-gray-200/30 dark:border-gray-700/30">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-1 h-6 bg-gray-500 rounded-full"></div>
                                <Skeleton className="h-6 w-32" />
                            </div>
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
