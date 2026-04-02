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
  indexOffset?: number;
  onRowClick?: (row: T, index: number) => void;
  onPageChange?: (page: number) => void;
  rowClassName?: (row: T) => string;
  emptyMessage?: string;
  viewingAll?: boolean;
  hideFooter?: boolean;
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
  indexOffset = 0,
  onRowClick,
  onPageChange,
  rowClassName,
  emptyMessage = "No data found",
  viewingAll = false,
  hideFooter = false,
  selectable = false,
  selectedIndices,
  onSelectionChange,
}: DataTableProps<T>) {
  const rowIndices = data.map((_, i) => i + indexOffset);
  const allSelected = rowIndices.length > 0 && rowIndices.every((index) => selectedIndices?.has(index));

  const toggleAll = () => {
    if (!onSelectionChange) return;
    const next = new Set(selectedIndices ?? []);
    if (allSelected) {
      rowIndices.forEach((index) => next.delete(index));
    } else {
      rowIndices.forEach((index) => next.add(index));
    }
    onSelectionChange(next);
  };

  const toggleRow = (index: number) => {
    if (!onSelectionChange || !selectedIndices) return;
    const absoluteIndex = index + indexOffset;
    const next = new Set(selectedIndices);
    if (next.has(absoluteIndex)) next.delete(absoluteIndex);
    else next.add(absoluteIndex);
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
                      <Checkbox checked={selectedIndices?.has(i + indexOffset) || false} onCheckedChange={() => toggleRow(i)} />
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
      {!hideFooter && (
        <div className="flex items-center justify-center gap-4 py-3 border-t border-border text-sm text-muted-foreground">
          {!viewingAll && <button className="hover:text-foreground disabled:opacity-50" disabled={currentPage <= 1} onClick={() => onPageChange?.(currentPage - 1)}>Previous</button>}
          <span>{viewingAll ? `Showing all ${totalItems ?? data.length} results` : `Page ${currentPage} of ${totalPages} · ${totalItems ?? data.length} total`}</span>
          {!viewingAll && <button className="hover:text-foreground disabled:opacity-50 font-medium" disabled={currentPage >= totalPages} onClick={() => onPageChange?.(currentPage + 1)}>Next</button>}
          {(totalItems ?? data.length) > 20 && (
            <button className="ml-2 text-xs hover:text-foreground underline underline-offset-2" onClick={() => onPageChange?.(viewingAll ? 1 : 0)}>
              {viewingAll ? "Paginate" : "View All"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
