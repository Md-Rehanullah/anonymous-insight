import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const PostCardSkeleton = () => {
  return (
    <Card className="p-6 shadow-card">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-20 ml-4" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-5 w-24 mt-2" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </Card>
  );
};

export default PostCardSkeleton;
