import * as React from "react";
import { motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors", {
  variants: {
    variant: {
      default: "bg-primary/20 text-primary border border-primary/30",
      secondary: "bg-secondary/20 text-secondary border border-secondary/30",
      destructive: "bg-destructive/20 text-destructive border border-destructive/30",
      outline: "border border-white/10 text-foreground bg-white/5",
      accent: "bg-accent/20 text-accent border border-accent/30",
    },
  },
  defaultVariants: { variant: "default" },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };