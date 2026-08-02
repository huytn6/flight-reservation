import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table"
import {
  AlertCircle,
  FileQuestion,
  RefreshCw,
  Search,
  X,
} from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

import { DataTableBulkActions } from "./DataTableBulkActions"
import { DataTableFacetedFilter } from "./DataTableFacetedFilter"
import { DataTablePagination } from "./DataTablePagination"
import { DataTableSkeleton } from "./DataTableSkeleton"
import { DataTableViewOptions } from "./DataTableViewOptions"
import type { DataTableProps } from "./types"

export function DataTable<TData, TValue>({
  columns: userColumns,
  data,
  loading = false,
  error = null,
  onRetry,
  onRefresh,

  mode = "client",
  pageCount: userPageCount,
  rowCount: userRowCount,

  pagination: userPagination,
  onPaginationChange,

  sorting: userSorting,
  onSortingChange,

  columnFilters: userColumnFilters,
  onColumnFiltersChange,

  globalFilter: userGlobalFilter,
  onGlobalFilterChange,

  columnVisibility: userColumnVisibility,
  onColumnVisibilityChange,

  rowSelection: userRowSelection,
  onRowSelectionChange,

  searchPlaceholder = "Filter data...",
  facetedFilters = [],
  bulkActions = [],
  enableColumnVisibility = true,
  enableGlobalFilter = true,
  enableRowSelection = false,
  stickyHeader = true,
  pageSizeOptions = [10, 20, 30, 50, 100],

  emptyTitle = "No records found",
  emptyDescription = "There are no entries matching your current filters.",
  className,
  onRowClick,
}: DataTableProps<TData, TValue>) {

  // Local state fallbacks for uncontrolled mode
  const [internalPagination, setInternalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [internalSorting, setInternalSorting] = useState<SortingState>([])
  const [internalColumnFilters, setInternalColumnFilters] = useState<ColumnFiltersState>([])
  const [internalGlobalFilter, setInternalGlobalFilter] = useState<string>("")
  const [internalColumnVisibility, setInternalColumnVisibility] = useState<VisibilityState>({})
  const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>({})

  const pagination = userPagination ?? internalPagination
  const sorting = userSorting ?? internalSorting
  const columnFilters = userColumnFilters ?? internalColumnFilters
  const globalFilter = userGlobalFilter ?? internalGlobalFilter
  const columnVisibility = userColumnVisibility ?? internalColumnVisibility
  const rowSelection = userRowSelection ?? internalRowSelection

  // Add selection column if row selection is enabled
  const columns = useMemo(() => {
    if (!enableRowSelection) return userColumns

    const selectionColumn: ColumnDef<TData, TValue> = {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }

    return [selectionColumn, ...userColumns]
  }, [userColumns, enableRowSelection])

  // Configure TanStack Table
  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
    manualPagination: mode === "server",
    manualSorting: mode === "server",
    manualFiltering: mode === "server",
    pageCount: userPageCount,
    rowCount: userRowCount,

    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater(pagination) : updater
      if (onPaginationChange) onPaginationChange(next)
      else setInternalPagination(next)
    },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater
      if (onSortingChange) onSortingChange(next)
      else setInternalSorting(next)
    },
    onColumnFiltersChange: (updater) => {
      const next = typeof updater === "function" ? updater(columnFilters) : updater
      if (onColumnFiltersChange) onColumnFiltersChange(next)
      else setInternalColumnFilters(next)
    },
    onGlobalFilterChange: (updater) => {
      const next = typeof updater === "function" ? updater(globalFilter) : updater
      if (onGlobalFilterChange) onGlobalFilterChange(next)
      else setInternalGlobalFilter(next)
    },
    onColumnVisibilityChange: (updater) => {
      const next = typeof updater === "function" ? updater(columnVisibility) : updater
      if (onColumnVisibilityChange) onColumnVisibilityChange(next)
      else setInternalColumnVisibility(next)
    },
    onRowSelectionChange: (updater) => {
      const next = typeof updater === "function" ? updater(rowSelection) : updater
      if (onRowSelectionChange) onRowSelectionChange(next)
      else setInternalRowSelection(next)
    },

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: mode === "client" ? getFilteredRowModel() : undefined,
    getPaginationRowModel: mode === "client" ? getPaginationRowModel() : undefined,
    getSortedRowModel: mode === "client" ? getSortedRowModel() : undefined,
    getFacetedRowModel: mode === "client" ? getFacetedRowModel() : undefined,
    getFacetedUniqueValues: mode === "client" ? getFacetedUniqueValues() : undefined,
  })

  const isFiltered = table.getState().columnFilters.length > 0 || !!table.getState().globalFilter

  // Handle Skeleton Loading State
  if (loading && data.length === 0) {
    return (
      <DataTableSkeleton
        columnCount={columns.length}
        rowCount={pagination.pageSize}
        showCheckbox={enableRowSelection}
      />
    )
  }

  // Handle Error State
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg border border-red-200 text-center gap-3">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Failed to load table data</h3>
          <p className="text-xs text-slate-500 mt-1">{error}</p>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="h-8 text-xs font-normal border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer rounded-md"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Retry
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className={cn("w-full space-y-3 font-sans", className)}>
      
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        
        {/* Search Input & Faceted Filters */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {enableGlobalFilter && (
            <div className="relative max-w-sm w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter}
                onChange={(e) => {
                  const val = e.target.value
                  if (onGlobalFilterChange) onGlobalFilterChange(val)
                  else setInternalGlobalFilter(val)
                }}
                className="pl-8 pr-8 h-8 text-xs bg-slate-50 border-slate-200 focus:bg-white rounded-md focus:border-[#0065eb]"
              />
              {globalFilter && (
                <button
                  onClick={() => {
                    if (onGlobalFilterChange) onGlobalFilterChange("")
                    else setInternalGlobalFilter("")
                  }}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Faceted Multi-Filters */}
          {facetedFilters.map((ff) => (
            <DataTableFacetedFilter
              key={ff.columnId}
              column={table.getColumn(ff.columnId)}
              title={ff.title}
              options={ff.options}
            />
          ))}

          {/* Reset Filters Button */}
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                table.resetColumnFilters()
                if (onGlobalFilterChange) onGlobalFilterChange("")
                else setInternalGlobalFilter("")
              }}
              className="h-8 text-xs font-normal text-slate-500 hover:text-slate-800 px-2 cursor-pointer"
            >
              Reset Filters
              <X className="ml-1 h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Refresh & Column Visibility Options */}
        <div className="flex items-center gap-2 justify-end">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="h-8 text-xs font-normal border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 cursor-pointer rounded-md"
            >
              <RefreshCw className={cn("h-3.5 w-3.5 text-slate-500", loading && "animate-spin")} />
              <span className="hidden sm:inline ml-1">Refresh</span>
            </Button>
          )}

          {enableColumnVisibility && <DataTableViewOptions table={table} />}
        </div>
      </div>

      {/* Selected Row Bulk Actions Toolbar */}
      {enableRowSelection && (
        <DataTableBulkActions
          selectedRows={table.getSelectedRowModel().rows}
          bulkActions={bulkActions}
          onClearSelection={() => table.resetRowSelection()}
        />
      )}

      {/* Main Table View Container */}
      <div className="rounded-lg border border-slate-200/80 bg-white overflow-hidden shadow-none">
        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader className={cn("bg-slate-50", stickyHeader && "sticky top-0 z-10 shadow-xs")}>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b border-slate-200/80 hover:bg-slate-50">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="h-10 px-3 text-xs font-semibold text-slate-700 select-none"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows?.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={cn(
                      "border-b border-slate-100/80 hover:bg-slate-50/70 transition-colors text-xs text-slate-800",
                      row.getIsSelected() && "bg-blue-50/60 hover:bg-blue-50",
                      onRowClick && "cursor-pointer"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2.5 px-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                /* Empty State */
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-48 text-center py-8"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileQuestion className="h-8 w-8 text-slate-300" />
                      <div className="flex flex-col gap-0.5">
                        <p className="text-xs font-semibold text-slate-700">{emptyTitle}</p>
                        <p className="text-[11px] text-slate-400">{emptyDescription}</p>
                      </div>
                      {isFiltered && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            table.resetColumnFilters()
                            if (onGlobalFilterChange) onGlobalFilterChange("")
                            else setInternalGlobalFilter("")
                          }}
                          className="h-7 text-xs font-normal mt-2 border-slate-200 text-slate-600 rounded-md cursor-pointer"
                        >
                          Clear all filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer Pagination */}
        <DataTablePagination
          table={table}
          pageSizeOptions={pageSizeOptions}
          mode={mode}
          totalRows={userRowCount}
        />
      </div>
    </div>
  )
}
