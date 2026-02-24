import { Chip } from "@heroui/react";
import { type ReactNode } from "react";
import clsx from "clsx";

const variantMap = {
  default: { base: "bg-default-100 text-foreground", content: "" },
  success: { base: "bg-success/10 text-success", content: "" },
  warning: { base: "bg-warning/10 text-warning", content: "" },
  danger: { base: "bg-danger/10 text-danger", content: "" },
  outline: {
    base: "border border-default-300 bg-transparent text-foreground",
    content: "",
  },
} as const;

interface DSBadgeProps {
  variant?: keyof typeof variantMap;
  size?: "sm" | "md";
  className?: string;
  children: ReactNode;
}

export function DSBadge({
  variant = "default",
  size = "sm",
  className,
  children,
}: DSBadgeProps) {
  return (
    <Chip
      classNames={{
        base: clsx(
          "rounded-none uppercase tracking-widest font-bold",
          variantMap[variant].base,
          size === "sm" ? "h-5 text-[9px]" : "h-6 text-[10px]",
          className,
        ),
        content: "px-2",
      }}
      size="sm"
      variant="flat"
    >
      {children}
    </Chip>
  );
}
