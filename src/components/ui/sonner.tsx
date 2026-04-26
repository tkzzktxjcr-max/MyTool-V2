"use client";

import { Toaster as SonnerToaster } from "sonner";

export const Sonner = () => {
  return (
    <SonnerToaster
      position="top-center"
      theme="dark"
      toastOptions={{
        classNames: {
          toast: "bg-[hsl(222,47%,11%)] border border-white/10 text-white shadow-xl",
          title: "text-white font-semibold",
          description: "text-white/70",
          actionButton: "bg-secondary text-white",
          cancelButton: "bg-muted text-muted-foreground",
          success: "border-secondary/30",
          error: "border-destructive/30",
          warning: "border-[hsl(38,92%,50%)]/30",
        },
      }}
    />
  );
};