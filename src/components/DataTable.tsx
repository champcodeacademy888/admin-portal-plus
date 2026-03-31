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
  rowClassName?: (row: T) => string;
  emptyMessage?: string;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  totalItems,
  currentPage = 1,
  totalPages = 1,
  onRowClick,
  rowClassName,
  emptyMessage = "No data found",
}: DataTableProps<T>) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-table-header">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider text-table-header-foreground text-left ${col.className || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-table-border">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-16 text-center">
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
                {columns.map((col) => (
                  <td key={col.key} className={`px-6 py-3.5 text-sm text-foreground ${col.className || ""}`}>
                    {col.render ? col.render(row) : (row[col.key] as React.ReactNode) ?? "—"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="flex items-center justify-center gap-4 py-3 border-t border-border text-sm text-muted-foreground">
        <button className="hover:text-foreground disabled:opacity-50" disabled={currentPage <= 1}>Previous</button>
        <span>Page {currentPage} of {totalPages} · {totalItems ?? data.length} total</span>
        <button className="hover:text-foreground disabled:opacity-50 font-medium" disabled={currentPage >= totalPages}>Next</button>
      </div>
    </div>
  );
}
