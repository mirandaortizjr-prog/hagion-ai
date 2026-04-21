import { cn } from "@/lib/utils";

interface ShimmerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/** Premium skeleton placeholder with a moving shimmer sweep. */
export const Shimmer = ({ className, ...props }: ShimmerProps) => (
  <div className={cn("skeleton-shimmer", className)} {...props} />
);

/** Pre-built card skeleton useful for feeds. */
export const ShimmerCard = ({ className }: { className?: string }) => (
  <div className={cn("glass rounded-2xl p-4 space-y-3", className)}>
    <div className="flex items-center gap-3">
      <Shimmer className="w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Shimmer className="h-3 w-1/3" />
        <Shimmer className="h-2.5 w-1/4" />
      </div>
    </div>
    <Shimmer className="h-3 w-full" />
    <Shimmer className="h-3 w-5/6" />
    <Shimmer className="h-40 w-full rounded-xl" />
  </div>
);

export default Shimmer;
