import * as React from "react";
import { cn } from "../../lib/utils";

const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-primary/15 text-primary border-primary/25",
    secondary: "bg-secondary text-secondary-foreground border-border",
    destructive: "bg-destructive/15 text-destructive border-destructive/25",
    outline: "border-border text-foreground",
    teal: "bg-teal-500/10 text-teal-400 border-teal-500/25",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/25",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/25",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    violet: "bg-violet-500/10 text-violet-400 border-violet-500/25",
  };
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        variants[variant] || variants.default,
        className
      )}
      {...props}
    />
  );
});
Badge.displayName = "Badge";

export { Badge };
