import { type ReactNode } from "react";
import clsx from "clsx";

const sizeMap = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "",
} as const;

interface ContainerProps {
  size?: keyof typeof sizeMap;
  padding?: boolean;
  className?: string;
  children: ReactNode;
}

export function Container({
  size = "xl",
  padding = true,
  className,
  children,
}: ContainerProps) {
  return (
    <div
      className={clsx(
        "mx-auto w-full",
        sizeMap[size],
        padding && "px-4 md:px-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
