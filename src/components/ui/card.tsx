"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ==========================================
// CARD - Version améliorée
// ==========================================

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    hover?: boolean;
    gradient?: boolean;
  }
>(({ className, hover = false, gradient = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border border-border bg-card p-5 shadow-sm",
      hover && "card-hover cursor-pointer",
      gradient && "bg-gradient-to-br from-card to-muted/50",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

// ==========================================
// BADGE - Version améliorée
// ==========================================

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "primary" | "secondary" | "accent" | "destructive" | "outline";
    size?: "sm" | "md" | "lg";
  }
>(({ className, variant = "default", size = "md", ...props }, ref) => {
  const variants = {
    default: "bg-muted text-muted-foreground",
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    accent: "bg-accent text-accent-foreground",
    destructive: "bg-destructive text-destructive-foreground",
    outline: "border border-border bg-transparent",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full font-medium transition-colors",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});
Badge.displayName = "Badge";

// ==========================================
// BUTTON - Version améliorée
// ==========================================

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "primary" | "secondary" | "accent" | "destructive" | "outline" | "ghost" | "link";
    size?: "sm" | "md" | "lg" | "icon";
    loading?: boolean;
  }
>(({ className, variant = "default", size = "md", loading = false, disabled, children, ...props }, ref) => {
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25",
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg shadow-secondary/25",
    accent: "bg-accent text-accent-foreground hover:bg-accent/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-border bg-transparent hover:bg-muted",
    ghost: "hover:bg-muted",
    link: "text-primary underline-offset-4 hover:underline",
  };

  const sizes = {
    sm: "h-9 rounded-lg px-3 text-sm",
    md: "h-10 rounded-xl px-4 text-sm",
    lg: "h-12 rounded-xl px-6 text-base",
    icon: "h-10 w-10 rounded-xl",
  };

  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-all disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
});
Button.displayName = "Button";

// ==========================================
// STAT CARD - Composant spécifique
// ==========================================

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "primary" | "secondary" | "accent" | "destructive";
  className?: string;
}

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = "primary",
  className,
}: StatCardProps) => {
  const colors = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-accent/10 text-accent-foreground",
    destructive: "bg-destructive/10 text-destructive",
  };

  return (
    <Card hover className={className}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={cn("rounded-xl p-3", colors[color])}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  StatCard,
};