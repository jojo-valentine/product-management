import * as React from "react";
import { cn } from "@/app/lib/utils";
type PropsInfo = {
  page: number;
  limit: number;
  totalItem: number;
};
type Props = {
  page: number;
  totalPages: number;
  limit: number;
  totalItem: number;
  onValueChange: (page: number) => void;
} & React.HTMLAttributes<HTMLDivElement>;
const getPages = (current: number, total: number): (number | "...")[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");

  pages.push(total);
  return pages;
};
const PaginationInfo = ({ page, limit, totalItem }: PropsInfo) => {
  const start = totalItem === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, totalItem);

  return (
    <p className="text-sm text-gray-600">
      Showing {start}–{end} of {totalItem}
    </p>
  );
};
const Pagination = React.forwardRef<HTMLDivElement, Props>(
  (
    { className, page, limit, totalPages, totalItem, onValueChange, ...props },
    ref,
  ) => {
    if (totalPages <= 1) return null;
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
      <div
        ref={ref}
        className={cn(
          "flex justify-between gap-2 rounded-lg border bg-card text-card-foreground shadow-sm p-2",
          className,
        )}
        {...props}
      >
        <PaginationInfo page={page} limit={limit} totalItem={totalItem} />
        <div>
          <button
            disabled={page === 1}
            onClick={() => onValueChange(page - 1)}
            className={`px-3 py-1 border rounded disabled:opacity-50 ${page === 1 ? "cursor-not-allowed" : "cursor-pointer"}`}
          >
            Prev
          </button>

          {getPages(page, totalPages).map((p, i) =>
            p === "..." ? (
              <span
                key={`dot-${i}`}
                className="px-2 py-1.5 text-sm text-muted-foreground"
              >
                ...
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onValueChange(p)}
                className={cn(
                  "w-9 h-9 rounded-lg border text-sm font-medium transition-colors cursor-pointer mx-1",
                  p === page
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "hover:bg-muted text-foreground",
                )}
              >
                {p}
              </button>
            ),
          )}

          <button
            disabled={page === totalPages}
            onClick={() => onValueChange(page + 1)}
            className={`px-3 py-1 border rounded disabled:opacity-50 ${page === totalPages ? "cursor-not-allowed" : "cursor-pointer"}`}
          >
            Next
          </button>
        </div>
      </div>
    );
  },
);

Pagination.displayName = "Pagination";

export { Pagination };
