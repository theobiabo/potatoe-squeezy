import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const skeletonLines = ["h-4 w-24", "h-3 w-20", "h-10 w-full"] as const;

export function GithubUserCardSkeleton() {
  return (
    <Card className="h-full gap-0 bg-surface-raised">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="size-12 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            {skeletonLines.slice(0, 2).map((className) => (
              <Skeleton key={className} className={className} />
            ))}
          </div>
        </div>
        <Skeleton className={`mt-4 ${skeletonLines[2]}`} />
      </CardContent>
      <CardFooter className="px-4 pb-4">
        <Skeleton className="h-8 w-full" />
      </CardFooter>
    </Card>
  );
}
