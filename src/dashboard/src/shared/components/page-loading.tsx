import { Skeleton } from '@gh/ui';

export function PageLoadingSkeleton({ withSidebar = true }: { withSidebar?: boolean }) {
  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4">
      <Skeleton className="h-14 w-full rounded-2xl" />
      {withSidebar ? (
        <div className="flex gap-4">
          <Skeleton className="hidden h-[28rem] w-64 rounded-2xl md:block" />
          <Skeleton className="h-[28rem] flex-1 rounded-2xl" />
        </div>
      ) : (
        <Skeleton className="h-[28rem] w-full rounded-2xl" />
      )}
    </div>
  );
}
