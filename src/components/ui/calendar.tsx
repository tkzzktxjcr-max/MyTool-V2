import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<"div">;

const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-3", className)}
      {...props}
    />
  )
);
Calendar.displayName = "Calendar";

export { Calendar };