"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  sortBy?: (row: T) => string | number;
  className?: string;
  align?: "left" | "right";
};

type SortState = { key: string; dir: "asc" | "desc" } | null;

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[] | null;
  pageSize?: number;
  rowKey: (row: T) => string;
  emptyLabel?: string;
  skeletonRows?: number;
  skeletonCell?: (colIndex: number) => React.ReactNode;
  /**
   * When provided, pagination is controlled by the parent — useful for syncing
   * page with URL state. Pass both to fully control; pass neither for local state.
   */
  page?: number;
  onPageChange?: (page: number) => void;
};

export function DataTable<T>({
  columns,
  data,
  pageSize = 10,
  rowKey,
  emptyLabel,
  skeletonRows = 8,
  skeletonCell,
  page: controlledPage,
  onPageChange,
}: DataTableProps<T>) {
  const t = useTranslations("dataTable");
  const [sort, setSort] = useState<SortState>(null);
  const [uncontrolledPage, setUncontrolledPage] = useState(0);
  const isControlled = controlledPage !== undefined;
  const page = isControlled ? controlledPage : uncontrolledPage;
  const setPage = (next: number) => {
    if (isControlled) onPageChange?.(next);
    else setUncontrolledPage(next);
  };

  const sorted = useMemo(() => {
    if (!data) return null;
    if (!sort) return data;
    const column = columns.find((c) => c.key === sort.key);
    if (!column?.sortBy) return data;
    const compare = (a: T, b: T) => {
      const av = column.sortBy!(a);
      const bv = column.sortBy!(b);
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ? 1 : -1;
      return 0;
    };
    return [...data].sort(compare);
  }, [data, sort, columns]);

  const totalPages = sorted ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
  const clampedPage = Math.min(page, totalPages - 1);
  const start = clampedPage * pageSize;
  const pageRows = sorted?.slice(start, start + pageSize) ?? null;

  function onSort(column: DataTableColumn<T>) {
    if (!column.sortBy) return;
    setPage(0);
    setSort((prev) => {
      if (!prev || prev.key !== column.key) return { key: column.key, dir: "asc" };
      if (prev.dir === "asc") return { key: column.key, dir: "desc" };
      return null;
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => {
              const isSorted = sort?.key === col.key;
              const Icon = isSorted
                ? sort!.dir === "asc"
                  ? ArrowUp
                  : ArrowDown
                : ArrowUpDown;
              return (
                <TableHead
                  key={col.key}
                  className={cn(col.align === "right" && "text-right", col.className)}
                >
                  {col.sortBy ? (
                    <button
                      type="button"
                      onClick={() => onSort(col)}
                      className={cn(
                        "inline-flex items-center gap-1 text-left font-medium hover:text-foreground",
                        col.align === "right" && "ml-auto flex-row-reverse text-right",
                        !isSorted && "text-muted-foreground",
                      )}
                      aria-sort={
                        isSorted ? (sort!.dir === "asc" ? "ascending" : "descending") : "none"
                      }
                    >
                      {col.header}
                      <Icon className="size-3" aria-hidden="true" />
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageRows
            ? pageRows.length > 0
              ? pageRows.map((row) => (
                  <TableRow key={rowKey(row)}>
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        className={cn(col.align === "right" && "text-right", col.className)}
                      >
                        {col.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="py-8 text-center text-muted-foreground"
                    >
                      {emptyLabel ?? t("empty")}
                    </TableCell>
                  </TableRow>
                )
            : Array.from({ length: skeletonRows }).map((_, r) => (
                <TableRow key={`skel-${r}`}>
                  {columns.map((col, c) => (
                    <TableCell
                      key={col.key}
                      className={cn(col.align === "right" && "text-right", col.className)}
                    >
                      {skeletonCell?.(c) ?? (
                        <span className="inline-block h-4 w-20 animate-pulse rounded bg-muted" />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
        </TableBody>
      </Table>

      {sorted && sorted.length > pageSize && (
        <div className="flex items-center justify-between gap-2 px-4 pb-2 text-xs text-muted-foreground">
          <span>
            {t("range", {
              from: start + 1,
              to: Math.min(start + pageSize, sorted.length),
              total: sorted.length,
            })}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setPage(Math.max(0, clampedPage - 1))}
              disabled={clampedPage === 0}
              aria-label={t("previous")}
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <span className="tabular-nums">
              {t("pageOf", { page: clampedPage + 1, total: totalPages })}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setPage(Math.min(totalPages - 1, clampedPage + 1))}
              disabled={clampedPage >= totalPages - 1}
              aria-label={t("next")}
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
