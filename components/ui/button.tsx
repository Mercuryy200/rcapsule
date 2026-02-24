"use client";

import { Button as HeroUIButton } from "@heroui/react";
import { Loader2 } from "lucide-react";
import { type ReactNode, forwardRef } from "react";
import clsx from "clsx";

const variantStyles = {
  primary: "bg-foreground text-background hover:opacity-90",
  secondary:
    "bg-default-100 text-foreground border border-default-200 hover:bg-default-200",
  ghost: "bg-transparent text-foreground hover:bg-default-100",
  outline:
    "border-2 border-foreground text-foreground bg-transparent hover:bg-foreground hover:text-background",
} as const;

const sizeStyles = {
  sm: "h-10 px-6 text-xs",
  md: "h-12 px-8 text-sm",
  lg: "h-14 px-10 text-base",
} as const;

interface DSButtonProps {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  className?: string;
  children: ReactNode;
  href?: string;
  as?: any;
  target?: string;
  rel?: string;
  disabled?: boolean;
  onPress?: () => void;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

export const DSButton = forwardRef<HTMLButtonElement, DSButtonProps>(
  function DSButton(
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      fullWidth = false,
      icon,
      iconPosition = "right",
      className,
      children,
      disabled,
      ...rest
    },
    ref,
  ) {
    return (
      <HeroUIButton
        ref={ref}
        className={clsx(
          "uppercase tracking-widest font-bold transition-all",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          (disabled || isLoading) && "opacity-50 pointer-events-none",
          className,
        )}
        isDisabled={disabled || isLoading}
        radius="none"
        {...rest}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {icon && iconPosition === "left" && (
              <span className="mr-2">{icon}</span>
            )}
            {children}
            {icon && iconPosition === "right" && (
              <span className="ml-2">{icon}</span>
            )}
          </>
        )}
      </HeroUIButton>
    );
  },
);
