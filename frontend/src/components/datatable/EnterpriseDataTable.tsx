import { DataTable } from './DataTable';
import type { DataTableProps } from './types';

export function EnterpriseDataTable<TData, TValue>(props: DataTableProps<TData, TValue>) {
  return <DataTable {...props} />;
}
