import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      <Skeleton className="mb-6 h-8 w-48" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-60 lg:col-span-1" />
        <Skeleton className="h-60 lg:col-span-1" />
        <Skeleton className="h-60 lg:col-span-1" />
      </div>
      <Skeleton className="mt-6 h-96 w-full" />
    </div>
  );
}
