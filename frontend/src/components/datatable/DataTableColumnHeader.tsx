import type { Column } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from "lucide-react"
import type React from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn("text-xs font-semibold text-slate-700", className)}>{title}</div>
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 text-xs font-semibold text-slate-700 data-[state=open]:bg-slate-100 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
          >
            <span>{title}</span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-[#0065eb]" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-[#0065eb]" />
            ) : (
              <ChevronsUpDown className="ml-1.5 h-3.5 w-3.5 text-slate-400" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="bg-white rounded-md border border-slate-200 shadow-sm p-1 text-xs">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)} className="cursor-pointer text-xs">
            <ArrowUp className="mr-2 h-3.5 w-3.5 text-slate-500" />
            Ascending
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)} className="cursor-pointer text-xs">
            <ArrowDown className="mr-2 h-3.5 w-3.5 text-slate-500" />
            Descending
          </DropdownMenuItem>
          {column.getIsSorted() && (
            <DropdownMenuItem onClick={() => column.clearSorting()} className="cursor-pointer text-xs text-slate-500">
              Clear Sorting
            </DropdownMenuItem>
          )}
          {column.getCanHide() && (
            <>
              <DropdownMenuSeparator className="bg-slate-100" />
              <DropdownMenuItem onClick={() => column.toggleVisibility(false)} className="cursor-pointer text-xs text-slate-500">
                <EyeOff className="mr-2 h-3.5 w-3.5 text-slate-400" />
                Hide Column
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
