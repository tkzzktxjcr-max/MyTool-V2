import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  loading?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "primary" | "glass";
  size?: "default" | "sm" | "lg" | "icon";
}

const variantClasses = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  outline: "border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-white/[0.08]",
  primary: "bg-gradient-to-r from-primary to-accent text-white hover:opacity-90",
  glass: "glass-card glass-card-hover",
};

const sizeClasses = {
  default: "h-11 px-5 py-2",
  sm: "h-9 px-3",
  lg: "h-12 px-8",
  icon: "h-11 w-11",
};

function buttonVariants({ variant = "default", size = "default", className }: { variant?: ButtonProps['variant']; size?: ButtonProps['size']; className?: string } = {}) {
  return cn(
    "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant || 'default'],
    sizeClasses[size || 'default'],
    className
  );
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <span className="mr-2 h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };