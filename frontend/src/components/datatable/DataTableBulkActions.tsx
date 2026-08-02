import type { Row } from "@tanstack/react-table"
import { CheckSquare, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { BulkAction } from "./types"

interface DataTableBulkActionsProps<TData> {
  selectedRows: Row<TData>[]
  bulkActions?: BulkAction<TData>[]
  onClearSelection: () => void
}

export function DataTableBulkActions<TData>({
  selectedRows,
  bulkActions = [],
  onClearSelection,
}: DataTableBulkActionsProps<TData>) {
  if (selectedRows.length === 0) return null

  return (
    <div className="flex items-center justify-between gap-3 p-2.5 bg-blue-50/90 border border-blue-200 rounded-md text-xs transition-all animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center gap-2 text-slate-900 font-medium">
        <CheckSquare className="h-4 w-4 text-[#0065eb]" />
        <span>
          <strong className="font-bold text-[#0065eb]">{selectedRows.length}</strong> item(s) selected
        </span>
      </div>

      <div className="flex items-center gap-2">
        {bulkActions.map((action, idx) => {
          const Icon = action.icon
          return (
            <Button
              key={idx}
              variant={action.variant || "secondary"}
              size="sm"
              onClick={() => action.action(selectedRows)}
              className="h-7 text-xs font-medium px-2.5 cursor-pointer rounded-md"
            >
              {Icon && <Icon className="mr-1.5 h-3.5 w-3.5" />}
              {action.label}
            </Button>
          )
        })}

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="h-7 text-xs text-slate-500 hover:text-slate-800 hover:bg-blue-100/60 p-1 rounded-md cursor-pointer ml-1"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
