import clsx from "clsx";

const variantStyles = {
  text: "h-4 w-full",
  title: "h-8 w-3/4",
  image: "aspect-[3/4] w-full",
  card: "",
  avatar: "h-10 w-10 rounded-full",
} as const;

interface DSSkeletonProps {
  variant?: keyof typeof variantStyles;
  lines?: number;
  className?: string;
}

export function DSSkeleton({
  variant = "text",
  lines = 1,
  className,
}: DSSkeletonProps) {
  if (variant === "card") {
    return (
      <div className={clsx("w-full", className)}>
        <div className="aspect-[3/4] w-full bg-default-200 animate-pulse" />
        <div className="p-4 space-y-2">
          <div className="h-3 w-1/3 bg-default-200 animate-pulse" />
          <div className="h-4 w-full bg-default-200 animate-pulse" />
          <div className="h-3 w-1/2 bg-default-200 animate-pulse" />
        </div>
      </div>
    );
  }

  if (variant === "text" && lines > 1) {
    return (
      <div className={clsx("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              "h-4 bg-default-200 animate-pulse",
              i === lines - 1 ? "w-3/4" : "w-full",
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "bg-default-200 animate-pulse",
        variantStyles[variant],
        className,
      )}
    />
  );
}
