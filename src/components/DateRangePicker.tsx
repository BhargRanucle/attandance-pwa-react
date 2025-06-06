
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onDateChange: (start: Date | null, end: Date | null) => void;
  className?: string;
}

const DateRangePicker = ({
  startDate,
  endDate,
  onDateChange,
  className = "",
}: DateRangePickerProps) => {
  const [isStartCalendarOpen, setIsStartCalendarOpen] = useState(false);
  const [isEndCalendarOpen, setIsEndCalendarOpen] = useState(false);

  const handleStartDateSelect = (date: Date | undefined) => {
    if (date) {
      // Ensure start date is not after end date
      const newStartDate = date > endDate ? endDate : date;
      onDateChange(newStartDate, endDate);
      setIsStartCalendarOpen(false);
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (date) {
      // Ensure end date is not before start date
      const newEndDate = date < startDate ? startDate : date;
      onDateChange(startDate, newEndDate);
      setIsEndCalendarOpen(false);
    }
  };

  return (
    // <div className="items-center">
    //   <div className="">
    //     <Popover open={isStartCalendarOpen} onOpenChange={setIsStartCalendarOpen}>
    //       <PopoverTrigger asChild>
    //         <Button
    //           variant="outline"
    //           className={cn(
    //             "w-full justify-start text-left font-normal",
    //             !startDate && "text-muted-foreground"
    //           )}
    //         >
    //           <CalendarIcon className="mr-2 h-4 w-4" />
    //           {startDate ? format(startDate, "PPP") : "Pick a date"}
    //         </Button>
    //       </PopoverTrigger>
    //       <PopoverContent className="w-auto p-0" align="center">
    //         <Calendar
    //           mode="single"
    //           selected={startDate}
    //           onSelect={handleStartDateSelect}
    //           initialFocus
    //         />
    //       </PopoverContent>
    //     </Popover>
    //   </div>
    //   <div className="mt-2">
    //     <Popover open={isEndCalendarOpen} onOpenChange={setIsEndCalendarOpen}>
    //       <PopoverTrigger asChild>
    //         <Button
    //           variant="outline"
    //           className={cn(
    //             "w-full justify-start text-left font-normal",
    //             !endDate && "text-muted-foreground"
    //           )}
    //         >
    //           <CalendarIcon className="mr-2 h-4 w-4" />
    //           {endDate ? format(endDate, "PPP") : "Pick a date"}
    //         </Button>
    //       </PopoverTrigger>
    //       <PopoverContent className="w-auto p-0" align="center">
    //         <Calendar
    //           mode="single"
    //           selected={endDate}
    //           onSelect={handleEndDateSelect}
    //           initialFocus
    //         />
    //       </PopoverContent>
    //     </Popover>
    //   </div>
    // </div>

    <div className={cn("relative", className)}>
      <div className="grid grid-cols-6 gap-2 items-center">
        <div className="col-span-3">
          <Popover open={isStartCalendarOpen} onOpenChange={setIsStartCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-center text-white bg-gradient-to-b from-app-blue to-app-purple-dark border-none",
                  !startDate && "text-white"
                )}
              >
                <CalendarIcon className="mr-0 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={handleStartDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="col-span-3">
          <Popover open={isEndCalendarOpen} onOpenChange={setIsEndCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-center text-white bg-gradient-to-b from-app-blue to-app-purple-dark border-none",
                  !endDate && "text-white"
                )}
              >
                <CalendarIcon className="mr-0 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={handleEndDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>


  );
};

export default DateRangePicker;
