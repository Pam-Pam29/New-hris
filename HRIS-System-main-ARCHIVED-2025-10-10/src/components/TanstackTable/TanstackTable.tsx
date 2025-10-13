import React, { useEffect, useRef, useState } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableFooter,
  TableCaption,
} from '../../components/ui/table';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import { Search, Download } from 'lucide-react';
import { fuzzyFilter } from './utils';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';

export type TableData<T extends object> = T & { subRows?: T[] };

interface AtomicTableProps<T extends object> {
  data: TableData<T>[];
  columns: ColumnDef<T>[];
  showGlobalFilter?: boolean;
  globalFilterPlaceholder?: string;
  pageSizeOptions?: number[];
  initialPageSize?: number;
  className?: string;
  isLoading?: boolean;
  // New
  filterDropdowns?: React.ReactNode;
}

export function AtomicTanstackTable<T extends object>({
  data,
  columns,
  showGlobalFilter = true,
  globalFilterPlaceholder = 'Search...',
  pageSizeOptions = [10, 20, 50],
  initialPageSize = 10,
  className,
  isLoading = false,
  filterDropdowns,
}: AtomicTableProps<T>) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination: { pageIndex, pageSize },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: fuzzyFilter,
  });

  useEffect(() => {
    if (pageIndex > table.getPageCount() - 1) {
      setPageIndex(Math.max(0, table.getPageCount() - 1));
    }
  }, [pageIndex, table]);

  return (
    <div className={cn('w-full', className)}>
      {showGlobalFilter && (
        <div className="mb-4 flex items-center gap-2 my-4 px-2 justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-full max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Search className="w-4 h-4" />
              </span>
              <Input
                placeholder={globalFilterPlaceholder}
                value={globalFilter}
                onChange={e => setGlobalFilter(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg shadow-sm bg-card border border-violet-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-400 dark:border-violet-800 dark:focus:border-violet-500 dark:focus:ring-violet-700 transition-colors"
                aria-label="Search table"
              />
            </div>
            <div className="flex gap-2">{filterDropdowns}</div>
          </div>
          <Button className="bg-violet-600 hover:bg-violet-700 text-white flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      )}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id} className="text-xs font-semibold">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                  No data found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-2 border-t bg-card">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              {'<<'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {'<'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {'>'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              {'>>'}
            </Button>
            <span className="text-xs">
              Page{' '}
              <strong>
                {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </strong>
            </span>
            <span className="text-xs">
              | Go to page:
              <input
                type="number"
                min={1}
                max={table.getPageCount()}
                defaultValue={table.getState().pagination.pageIndex + 1}
                onChange={e => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0;
                  table.setPageIndex(page);
                }}
                className="w-12 ml-1 border rounded px-1 py-0.5 text-xs bg-background"
              />
            </span>
            <select
              className="ml-2 border rounded px-1 py-0.5 text-xs bg-background"
              value={table.getState().pagination.pageSize}
              onChange={e => {
                table.setPageSize(Number(e.target.value));
              }}
            >
              {pageSizeOptions.map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
          </div>
          <span className="text-xs text-muted-foreground">
            {table.getFilteredRowModel().rows.length} row(s)
          </span>
        </div>
      </div>
    </div>
  );
}
