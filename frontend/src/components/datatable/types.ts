import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  Row,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table"
import type React from "react"

export interface FacetedFilterOption {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
}

export interface FacetedFilterConfig {
  columnId: string
  title: string
  options: FacetedFilterOption[]
}

export interface BulkAction<TData> {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost"
  action: (selectedRows: Row<TData>[]) => void | Promise<void>
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  
  // Loading & Error States
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  onRefresh?: () => void

  // Mode & Server-Side Controls
  mode?: "client" | "server"
  pageCount?: number
  rowCount?: number

  // Controlled States
  pagination?: PaginationState
  onPaginationChange?: (pagination: PaginationState) => void

  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void

  columnFilters?: ColumnFiltersState
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void

  globalFilter?: string
  onGlobalFilterChange?: (filter: string) => void

  columnVisibility?: VisibilityState
  onColumnVisibilityChange?: (visibility: VisibilityState) => void

  rowSelection?: RowSelectionState
  onRowSelectionChange?: (selection: RowSelectionState) => void

  // Additional Features
  searchPlaceholder?: string
  facetedFilters?: FacetedFilterConfig[]
  bulkActions?: BulkAction<TData>[]
  enableColumnVisibility?: boolean
  enableGlobalFilter?: boolean
  enableRowSelection?: boolean
  stickyHeader?: boolean
  pageSizeOptions?: number[]

  // Customization
  emptyTitle?: string
  emptyDescription?: string
  className?: string
  onRowClick?: (row: Row<TData>) => void
}
