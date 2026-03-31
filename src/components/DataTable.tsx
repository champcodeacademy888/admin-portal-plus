import { Checkbox } from "@/components/ui/checkbox";

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  totalItems?: number;
  currentPage?: number;
  totalPages?: number;
  onRowClick?: (row: T, index: number) => void;
  onPageChange?: (page: number) => void;
  rowClassName?: (row: T) => string;
  emptyMessage?: string;
  viewingAll?: boolean;
  selectable?: boolean;
  selectedIndices?: Set<number>;
  onSelectionChange?: (indices: Set<number>) => void;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  totalItems,
  currentPage = 1,
  totalPages = 1,
  onRowClick,
  onPageChange,
  rowClassName,
  emptyMessage = "No data found",
  viewingAll = false,
  selectable = false,
  selectedIndices,
  onSelectionChange,
}: DataTableProps<T>) {
  const allSelected = data.length > 0 && selectedIndices?.size === data.length;

  const toggleAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(data.map((_, i) => i)));
    }
  };

  const toggleRow = (index: number) => {
    if (!onSelectionChange || !selectedIndices) return;
    const next = new Set(selectedIndices);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    onSelectionChange(next);
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-table-header">
              {selectable && (
                <th className="px-3 py-3 w-10">
                  <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-table-header-foreground text-left whitespace-nowrap ${col.className || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-table-border">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl">📋</div>
                    <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={i}
                  onClick={() => onRowClick?.(row, i)}
                  className={`hover:bg-table-row-hover transition-colors ${onRowClick ? "cursor-pointer" : ""} ${rowClassName?.(row) || ""}`}
                >
                  {selectable && (
                    <td className="px-3 py-3.5 w-10" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={selectedIndices?.has(i) || false} onCheckedChange={() => toggleRow(i)} />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3.5 text-sm text-foreground ${col.className || ""}`}>
                      {col.render ? col.render(row) : (row[col.key] as React.ReactNode) ?? "—"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-center gap-4 py-3 border-t border-border text-sm text-muted-foreground">
        <button className="hover:text-foreground disabled:opacity-50" disabled={currentPage <= 1} onClick={() => onPageChange?.(currentPage - 1)}>Previous</button>
        <span>Page {currentPage} of {totalPages} · {totalItems ?? data.length} total</span>
        <button className="hover:text-foreground disabled:opacity-50 font-medium" disabled={currentPage >= totalPages} onClick={() => onPageChange?.(currentPage + 1)}>Next</button>
        {totalPages > 1 && (
          <button className="ml-2 text-xs hover:text-foreground underline underline-offset-2" onClick={() => onPageChange?.(0)}>
            {currentPage === 0 ? "Paginate" : "View All"}
          </button>
        )}
      </div>
    </div>
  );
}
