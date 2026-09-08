"use client";
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  PenSquare,
  Eye,
  EyeOff,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  X,
} from "lucide-react";
import {
  AlertStateCategory,
  Category,
  formCategoryChangeStatus,
} from "@/app/types/category";
import { CategorySkeleton } from "@/app/components/skeleton/CategorySkeleton";
import { Pagination } from "@/app/components/ui/Pagination";
import { SearchCategories } from "@/app/components/ui/Search";
import { useDebounce } from "@/app/hooks/use-debounce";
import {
  CategoryStatusDialog,
  ConfirmBtnCategoryDelete,
} from "@/app/components/ui/Category-Alert";
import axios from "axios";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItem, setTotalItem] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingDeleteId, setLoadingDeleteId] = useState<string | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 400);
  const [alert, setAlert] = useState<AlertStateCategory>(null);
  const [loadingToggle, setLoadingToggle] = useState(false);
  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = axios.get("/api/categories", {
        params: {
          search: debouncedSearch,
          page,
          limit,
        },
      });
      const result = (await res).data;
      setCategories(result.data ?? []);
      setTotalPages(result.pagination.totalPages ?? 1);
      setTotalItem(result.pagination.total);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
      setAlert({ type: "error", message });
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCategorySwitch = async ({
    id,
    status: initialStatus,
  }: formCategoryChangeStatus) => {
    setLoadingToggle(true);
    try {
      const result = await axios.patch(`/api/categories/${id}`, {
        status: initialStatus,
      });
      setCategories((prev) =>
        prev.map((cat) =>
          cat.uuid === id ? { ...cat, status: result.data.status } : cat,
        ),
      );
      setAlert({ type: "success", message: "อัปเดตสำเร็จ" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        setAlert({ type: "error", message: error.message });
      } else {
        setAlert({ type: "error", message: "เกิดข้อผิดพลาด" });
      }
    } finally {
      setLoadingToggle(false);
    }
  };

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleDelete = async (id: string) => {
    try {
      setLoadingDeleteId(id);
      const result = await axios.delete(`/api/categories/${id}`);
      const deleteCategoryId = result.data.id;
      setCategories((prev) =>
        prev.filter((cat) => cat.uuid !== deleteCategoryId),
      );

      setAlert({ type: "success", message: "ลบเรียบร้อยแล้ว" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        setAlert({ type: "error", message: error.message });
      } else {
        setAlert({ type: "error", message: "เกิดข้อผิดพลาด" });
      }
    } finally {
      setLoadingDeleteId(null);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-7xl min-w-full min-h-dvh px-6 py-10"
    >
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className={`fixed top-6 left-1/2 z-50 flex items-center gap-2 rounded-base px-4 py-3 text-sm font-medium shadow-lg ${
              alert.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {alert.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0" />
            )}
            {alert.message}
            <button
              onClick={() => setAlert(null)}
              className="ml-2 opacity-60 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-body">Categories</h1>
          <p className="text-sm text-neutral-500 mt-1">
            จัดการหมวดหมู่ทั้งหมดของคุณ
          </p>
        </div>
        <Link
          href="/categories/create"
          className="inline-flex items-center gap-1.5 rounded-base bg-neutral-900 text-white px-4 py-2 text-sm font-medium hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          เพิ่มหมวดหมู่
        </Link>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <SearchCategories
          value={search}
          onValueChange={setSearch}
          disabled={isSearchLoading}
          className="w-full rounded-base border border-default bg-neutral-primary-soft py-2 pl-9 pr-3 text-sm text-body outline-none focus:ring-2 focus:ring-neutral-400"
        />
      </div>

      <div className="relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default">
        {isLoading ? (
          <CategorySkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={fetchCategories}
              className="rounded-base border border-default px-4 py-1.5 text-sm hover:bg-neutral-secondary-soft transition-colors"
            >
              ลองใหม่
            </button>
          </div>
        ) : (
          <table className="w-full text-sm text-left rtl:text-right text-body">
            <thead className="text-xs uppercase text-neutral-500 bg-neutral-secondary-soft border-b border-default">
              <tr>
                <th scope="col" className="px-6 py-3 font-medium">
                  Tag ID
                </th>
                <th scope="col" className="px-6 py-3 font-medium">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 font-medium">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 font-medium">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 font-medium">
                  Created At
                </th>
                <th scope="col" className="px-6 py-3 font-medium text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {categories.length === 0 ? (
                  // ✅ แก้บั๊ก: เดิมเช็ค < 0 ซึ่งเป็นเท็จเสมอ
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-16 text-center text-neutral-400"
                    >
                      ยังไม่มีหมวดหมู่ — เริ่มเพิ่มหมวดหมู่แรกของคุณได้เลย
                    </td>
                  </tr>
                ) : (
                  categories.map((category, i) => (
                    <motion.tr
                      key={category.uuid}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.03 }}
                      className="bg-neutral-primary border-b border-default hover:bg-neutral-secondary-soft/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-xs text-neutral-500">
                        {category.tagId}
                      </td>
                      <td className="px-6 py-4 font-medium">{category.name}</td>
                      <td className="px-6 py-4 text-neutral-500 max-w-xs truncate">
                        {category.description}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            category.status
                              ? "bg-green-100 text-green-700"
                              : "bg-neutral-200 text-neutral-500"
                          }`}
                        >
                          {category.status ? (
                            <Eye className="h-3 w-3" />
                          ) : (
                            <EyeOff className="h-3 w-3" />
                          )}
                          {category.status ? "แสดงอยู่" : "ซ่อนอยู่"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-neutral-500 whitespace-nowrap">
                        {new Intl.DateTimeFormat("th-TH", {
                          timeZone: "Asia/Bangkok",
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(category.createdAt))}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1">
                          <CategoryStatusDialog
                            key={category.uuid}
                            category={category}
                            loadingToggle={loadingToggle}
                            handleCategorySwitch={handleCategorySwitch}
                          />
                          <button
                            className="p-1.5 rounded-base hover:bg-neutral-secondary-soft text-neutral-500 hover:text-neutral-900 transition-colors"
                            title="แก้ไข"
                          >
                            <Link href={`/categories/${category.uuid}/edit`}>
                              <PenSquare className="h-4 w-4" />
                            </Link>
                          </button>
                          <ConfirmBtnCategoryDelete
                            onConfirm={() => handleDelete(category.uuid)} // ✅ ใส่เป็น arrow function
                            loading={loadingDeleteId === category.uuid}
                            confirmText="Yes, delete"
                          />
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>

      {!isLoading && !error && categories.length > 0 && (
        <Pagination
          page={page}
          limit={limit}
          totalItem={totalItem}
          totalPages={totalPages}
          onValueChange={(p) => setPage(p)}
        />
      )}
    </motion.div>
  );
}
