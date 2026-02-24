"use client";

import { Input as HeroUIInput } from "@heroui/react";
import { Search, X } from "lucide-react";
import { type ReactNode } from "react";
import clsx from "clsx";

const variantClassNames = {
  default: {
    inputWrapper:
      "border border-default-200 bg-default-50 hover:bg-default-100 transition-colors shadow-none",
    input: "text-sm",
    label: "text-xs uppercase tracking-widest font-bold text-default-500",
  },
  underline: {
    inputWrapper:
      "border-b border-default-400 bg-transparent rounded-none px-0 shadow-none hover:border-foreground transition-colors",
    input: "text-sm",
    label: "text-xs uppercase tracking-widest font-bold text-default-500",
  },
  search: {
    inputWrapper:
      "border border-default-200 bg-default-50 hover:bg-default-100 transition-colors shadow-none",
    input: "text-sm",
    label: "text-xs uppercase tracking-widest font-bold text-default-500",
  },
} as const;

interface DSInputProps {
  variant?: keyof typeof variantClassNames;
  label?: string;
  helperText?: string;
  error?: string;
  icon?: ReactNode;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  className?: string;
  type?: string;
  name?: string;
  required?: boolean;
  size?: "sm" | "md" | "lg";
}

export function DSInput({
  variant = "default",
  label,
  helperText,
  error,
  icon,
  placeholder,
  value,
  onChange,
  onClear,
  className,
  type = "text",
  size = "md",
  ...rest
}: DSInputProps) {
  const isSearch = variant === "search";

  return (
    <HeroUIInput
      className={clsx(className)}
      classNames={variantClassNames[variant]}
      description={helperText}
      endContent={
        isSearch && value ? (
          <button
            className="p-1 hover:bg-default-200 transition-colors"
            onClick={onClear}
          >
            <X size={14} />
          </button>
        ) : undefined
      }
      errorMessage={error}
      isInvalid={!!error}
      label={label}
      placeholder={placeholder}
      radius="none"
      size={size}
      startContent={
        isSearch ? <Search className="text-default-400" size={16} /> : icon
      }
      type={type}
      value={value}
      onChange={onChange}
      {...rest}
    />
  );
}
