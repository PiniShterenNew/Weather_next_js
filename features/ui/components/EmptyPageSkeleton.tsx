
import { Skeleton } from "@/components/ui/skeleton";

const EmptyPageSkeleton = () => {
    return (
        <div className="flex flex-col items-center justify-center gap-6 p-6 w-full max-w-full mx-auto">
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
                <div className="text-center space-y-3">
                    <Skeleton className="w-48 h-16 mx-auto" />
                    <Skeleton className="w-64 h-10 mx-auto" />
                </div>
                <Skeleton className="w-32 h-10 rounded-lg" />
            </div>
            <div className="w-full mt-4">
                <div className="flex-1">
                    <Skeleton className="w-48 h-6 mx-auto mb-3" />
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <Skeleton key={index} className="w-full h-10 rounded-lg" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EmptyPageSkeleton;
