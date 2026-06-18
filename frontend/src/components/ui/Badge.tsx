import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: string;
}

/** A soft, tinted chip. Pass a hex `color` for category-colored badges. */
export function Badge({ className, color, style, children, ...props }: BadgeProps) {
  const tinted = color
    ? {
        color,
        backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
        borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
        ...style,
      }
    : style;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        !color && "border-border bg-muted-bg text-muted",
        className,
      )}
      style={tinted}
      {...props}
    >
      {children}
    </span>
  );
}
