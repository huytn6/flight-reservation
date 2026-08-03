import { DataTable } from './DataTable';
import type { DataTableProps } from './types';

export function EnterpriseDataTable<TData, TValue>(props: DataTableProps<TData, TValue>) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      <DataTable {...props} />
    </div>
  );
}
