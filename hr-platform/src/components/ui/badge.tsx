import React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "success" | "warning";
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const base =
      "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
    const variants: Record<string, string> = {
      default: "bg-primary text-primary-foreground",
      secondary: "bg-muted text-muted-foreground",
      destructive: "bg-destructive text-destructive-foreground",
      success: "bg-emerald-600 text-white dark:bg-emerald-500",
      warning: "bg-amber-500 text-black",
    };
    return (
      <span
        ref={ref}
        className={cn(base, variants[variant], className)}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export default Badge;
