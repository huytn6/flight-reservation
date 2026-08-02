import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableSkeletonProps {
  columnCount?: number
  rowCount?: number
  showCheckbox?: boolean
}

export function DataTableSkeleton({
  columnCount = 5,
  rowCount = 5,
  showCheckbox = true,
}: DataTableSkeletonProps) {
  const effectiveColumns = showCheckbox ? columnCount + 1 : columnCount

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between gap-4 py-2">
        <Skeleton className="h-8 w-64 bg-slate-200/60 rounded-md" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 bg-slate-200/60 rounded-md" />
          <Skeleton className="h-8 w-24 bg-slate-200/60 rounded-md" />
        </div>
      </div>

      <div className="rounded-md border border-slate-200/80 overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="border-b border-slate-200/80">
              {Array.from({ length: effectiveColumns }).map((_, i) => (
                <TableHead key={i} className="h-10 px-3">
                  <Skeleton className="h-4 w-full max-w-[100px] bg-slate-200/80 rounded" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, rowIndex) => (
              <TableRow key={rowIndex} className="border-b border-slate-100">
                {Array.from({ length: effectiveColumns }).map((_, colIndex) => (
                  <TableCell key={colIndex} className="py-3 px-3">
                    <Skeleton className="h-4 w-full bg-slate-100 rounded" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
