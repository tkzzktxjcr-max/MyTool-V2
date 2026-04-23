import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <motion.input
      type={type}
      whileFocus={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={cn(
        "flex h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/30 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      style={{ background: 'rgba(255,255,255,0.03)' }}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };