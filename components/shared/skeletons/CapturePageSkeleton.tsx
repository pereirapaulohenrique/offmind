import { Skeleton } from '@/components/ui/skeleton';

export function CapturePageSkeleton() {
  return (
    <div className="flex h-full flex-col">
      {/* Header skeleton */}
      <div className="border-b border-border px-6 py-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-3 flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
          {/* Input skeleton */}
          <Skeleton className="h-[52px] w-full rounded-lg" />
        </div>
      </div>

      {/* Items skeleton */}
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-3xl space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
