"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { es } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={es}
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-white font-sans", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 relative",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-semibold text-slate-800",
        nav: "flex items-center justify-between absolute w-full z-10 px-1",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-slate-100 text-slate-700 hover:text-slate-900 cursor-pointer"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-slate-100 text-slate-700 hover:text-slate-900 cursor-pointer"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex border-b border-slate-100 pb-2 mb-2",
        weekday: "text-slate-500 rounded-md w-9 font-medium text-[0.8rem] capitalize",
        week: "flex w-full mt-2",
        day: "h-9 w-9 text-center text-sm p-0 m-0 relative",
        day_button: cn(
          "h-9 w-9 p-0 font-normal bg-transparent hover:bg-slate-100 rounded-md flex items-center justify-center transition-colors cursor-pointer text-slate-800"
        ),
        selected: "bg-teal-600 text-white rounded-md hover:bg-teal-700 hover:text-white font-bold",
        today: "bg-slate-100 text-slate-900 font-bold rounded-md",
        outside: "text-slate-400 opacity-50 bg-transparent",
        disabled: "text-slate-300 opacity-50 cursor-not-allowed",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }: { orientation?: string }) => {
          if (orientation === 'left') return <ChevronLeft className="h-4 w-4" />
          return <ChevronRight className="h-4 w-4" />
        }
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
