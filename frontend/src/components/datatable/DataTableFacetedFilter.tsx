import type { Column } from "@tanstack/react-table"
import { PlusCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { FacetedFilterOption } from "./types"

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  title?: string
  options: FacetedFilterOption[]
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  if (!column) return null

  const selectedValues = new Set(column.getFilterValue() as string[])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-dashed border-slate-200 bg-slate-50 text-xs text-slate-700 hover:bg-slate-100 cursor-pointer rounded-md"
        >
          <PlusCircle className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <div className="mx-1.5 h-3 w-px bg-slate-200" />
              <Badge
                variant="secondary"
                className="rounded px-1 text-[10px] font-semibold bg-blue-50 text-[#0065eb]"
              >
                {selectedValues.size}
              </Badge>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[180px] bg-white border-slate-200 rounded-md shadow-sm p-1 text-xs">
        <DropdownMenuLabel className="text-xs font-semibold text-slate-700 px-2 py-1">
          Filter by {title}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-100" />
        {options.map((option) => {
          const isSelected = selectedValues.has(option.value)
          const Icon = option.icon
          return (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={isSelected}
              onCheckedChange={() => {
                if (isSelected) {
                  selectedValues.delete(option.value)
                } else {
                  selectedValues.add(option.value)
                }
                const filterValues = Array.from(selectedValues)
                column.setFilterValue(
                  filterValues.length ? filterValues : undefined
                )
              }}
              className="text-xs cursor-pointer flex items-center gap-2"
            >
              {Icon && <Icon className="h-3.5 w-3.5 text-slate-500 shrink-0" />}
              <span>{option.label}</span>
            </DropdownMenuCheckboxItem>
          )
        })}
        {selectedValues.size > 0 && (
          <>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem
              onClick={() => column.setFilterValue(undefined)}
              className="justify-center text-center text-xs text-slate-500 cursor-pointer"
            >
              Clear filters
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
