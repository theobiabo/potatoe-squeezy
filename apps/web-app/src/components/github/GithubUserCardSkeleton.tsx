import { Skeleton } from "@/components/ui/skeleton";

export function GithubUserCardSkeleton() {
  return (
    <div className="rounded-[24px] border border-[#2b2933] bg-[#0f0d16] p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <Skeleton className="h-24 w-24 rounded-[18px]" />
        <div className="w-full space-y-3">
          <div>
            <Skeleton className="mx-auto h-8 w-48" />
            <div className="mt-2 flex items-center justify-center gap-2">
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
