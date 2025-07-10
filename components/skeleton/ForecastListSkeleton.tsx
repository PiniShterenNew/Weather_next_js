import { Skeleton } from "../ui/skeleton";

const ForecastListSkeleton = () => {
    return (
        <div className="w-full mt-6 space-y-2">
            <Skeleton className="h-6 w-32 mb-3" />
            <div className="grid grid-cols-5 gap-10">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center flex-col justify-center p-2 gap-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-16" />
                        <div className="flex gap-2">
                            <Skeleton className="h-4 w-8 opacity-60" />
                            <Skeleton className="h-4 w-8" />
                        </div>
                    </div>
                ))}
            </div>
        </div>

    )
}

export default ForecastListSkeleton;