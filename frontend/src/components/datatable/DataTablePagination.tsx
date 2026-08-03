import type { Table } from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  pageSizeOptions?: number[]
  mode?: "client" | "server"
  totalRows?: number
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 50, 100],
  totalRows,
}: DataTablePaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const pageCount = table.getPageCount()
  const filteredRowsCount = totalRows !== undefined ? totalRows : table.getFilteredRowModel().rows.length

  const fromItem = filteredRowsCount === 0 ? 0 : pageIndex * pageSize + 1
  const toItem = Math.min((pageIndex + 1) * pageSize, filteredRowsCount)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-slate-200/80 bg-white">
      {/* Selected Rows & Total Info */}
      <div className="flex-1 text-xs text-slate-500">
        {table.getFilteredSelectedRowModel().rows.length > 0 ? (
          <span className="font-medium text-[#0065eb]">
            Đã chọn {table.getFilteredSelectedRowModel().rows.length} trên {filteredRowsCount} hàng.
          </span>
        ) : (
          <span>
            Hiển thị <strong className="font-semibold text-slate-700">{fromItem}</strong> -{" "}
            <strong className="font-semibold text-slate-700">{toItem}</strong> trong tổng số{" "}
            <strong className="font-semibold text-slate-700">{filteredRowsCount}</strong> mục
          </span>
        )}
      </div>

      {/* Page Size & Page Controls */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        {/* Page Size Selector */}
        <div className="flex items-center space-x-2">
          <p className="text-xs text-slate-500 font-medium">Dòng / trang</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px] bg-slate-50 border-slate-200 text-xs rounded-md cursor-pointer">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top" className="bg-white border-slate-200 text-xs rounded-md">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`} className="text-xs cursor-pointer">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Current Page Label */}
        <div className="flex w-[100px] items-center justify-center text-xs font-medium text-slate-600">
          Trang {pageIndex + 1} / {Math.max(1, pageCount)}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-md border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Trang đầu</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-md border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Trang trước</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-md border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Trang kế</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-md border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Trang cuối</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
