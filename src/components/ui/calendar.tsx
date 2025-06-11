import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(
    props.month || new Date()
  );
  const [direction, setDirection] = React.useState<"left" | "right">("right");

  const handleMonthChange = (newMonth: Date) => {
    setDirection(newMonth > currentMonth ? "right" : "left");
    setCurrentMonth(newMonth);
    props.onMonthChange?.(newMonth);
  };

  const variants = {
    enter: (direction: "left" | "right") => ({
      x: direction === "right" ? 40 : -40,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: "left" | "right") => ({
      x: direction === "right" ? -40 : 40,
      opacity: 0,
    }),
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentMonth.toString()}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <DayPicker
            {...props}
            month={currentMonth}
            onMonthChange={handleMonthChange}
            showOutsideDays={showOutsideDays}
            classNames={{
              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4 w-full",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-base font-semibold text-app-dark",
              nav: "space-x-1 flex items-center",
              nav_button: cn(
                buttonVariants({ variant: "outline" }),
                "h-7 w-7 p-0 transition-all duration-300",
                "text-app-dark border-none",
                "hover:bg-[#ffd166] hover:text-white",
                "active:bg-[#ffd166] active:text-white",
                "data-[active=true]:bg-[#ffd166] data-[active=true]:text-white"
              ),
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse",
              head_row: "flex",
              head_cell:
                "text-app-gray w-9 h-9 flex items-center justify-center text-[0.75rem] font-medium",
              row: "flex w-full mt-2 gap-1",
              cell:
                "w-9 h-9 p-0 relative text-center transition-all duration-200 ease-in-out",
              day: cn(
                buttonVariants({ variant: "ghost" }),
                "w-9 h-9 p-0 font-normal text-app-dark rounded-full",
                "hover:bg-app-light hover:text-app-dark transition-colors"
              ),
              day_selected:
                "bg-[#F6861F] text-white font-medium rounded-full transition-colors",
              day_today:
                "bg-[#ffd166] text-app-dark font-semibold rounded-full shadow-sm",
              day_outside:
                "text-app-gray opacity-30 hover:bg-transparent hover:text-app-gray aria-selected:bg-[#ffd166]/40 aria-selected:text-app-gray aria-selected:opacity-30",
              day_disabled: "text-muted-foreground opacity-50",
              day_range_middle:
                "bg-app-light text-app-dark rounded-full transition-colors",
              day_range_end: "day-range-end",
              day_hidden: "invisible",
              ...classNames,
            }}
            components={{
              IconLeft: () => (
                <ChevronLeft className="h-4 w-4 text-inherit" />
              ),
              IconRight: () => (
                <ChevronRight className="h-4 w-4 text-inherit" />
              ),
            }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

Calendar.displayName = "Calendar";
