"use client";
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Archive,
  CheckCircle,
  CheckCircle2,
  PenSquare,
  Plus,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { SearchProducts } from "@/app/components/ui/Search";
import { pagination, product, productCategoryList } from "@/app/types/product";
import axios from "axios";
import { useDebounce } from "@/app/hooks/use-debounce";
import { CheckBoxList } from "@/app/components/ui/Checkbok";
import { ProductSkeleton } from "@/app/components/skeleton/ProductSkeleton";
import { API_URL } from "@/app/utils/api";
import { Pagination } from "@/app/components/ui/Pagination";
import Link from "next/link";
import { Switch } from "@/app/components/ui/Switch";
import {
  ButtonDeleteAlert,
  ConfirmModalChangeStatusProduct,
} from "@/app/components/ui/Product-Alert";
import { AlertState } from "@/app/types/AlertState";
import ProductImageLightbox from "@/app/components/ui/ProductImageLightbox";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItem, setTotalItem] = useState(1);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [categories, setCategories] = useState<productCategoryList[]>([]);
  const [products, setProducts] = useState<product[]>([]);
  const [pagination, setPagination] = useState<pagination>();
  const [loadingChangeStatusId, setLoadingChangeStatusId] = useState<
    string | null
  >(null);
  const [confirmModelChangeStatus, setConfirmModelChangeStatus] =
    useState(false);
  const [selectedProductUuid, setSelectedProductUuid] = useState<string | null>(
    null,
  );
  const [selectedProductStatus, setSelectedProductStatus] = useState<
    "active" | "inactive" | "archived" | null
  >(null);
  const [alert, setAlert] = useState<AlertState>(null);
  const [loadingDeleteId, setLoadingDeleteId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 400);
  const fetchData = useCallback(async () => {
    try {
      setIsSearchLoading(true);
      const [categoriesRes, productsRes] = await Promise.all([
        axios.get("/api/categories/for-product"),
        axios.get("/api/products", {
          params: {
            search: debouncedSearch,
            page,
            limit,
            categoryId: selectedIds.join(","),
          },
        }),
      ]);

      setCategories(categoriesRes.data);
      setProducts(productsRes.data.data);
      setPagination(productsRes.data.pagination);
      setTotalPages(productsRes.data.pagination.totalPages ?? 1);
      setTotalItem(productsRes.data.pagination.total);
      setIsLoading(false);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "โหลดหมวดหมู่ไม่สำเร็จ";
      setAlert({ type: "error", message });
      setError("เกิดข้อผิดพลาด");
    } finally {
      setIsSearchLoading(false);
    }
  }, [debouncedSearch, page, limit, selectedIds]);

  const handleChangeStatus = async (
    uuid: string,
    status: "active" | "inactive" | "archived" | null,
  ) => {
    const newStatus = status === "active" ? "inactive" : "active";
    try {
      const resProduct = await axios.patch(`/api/products/${uuid}`, {
        status: newStatus,
      });

      setProducts((prev) =>
        prev.map((pro) =>
          pro.uuid === uuid ? { ...pro, status: newStatus } : pro,
        ),
      );
      setAlert({
        type: "success",
        message: "เปลี่ยนสินค้าสำเร็จ",
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
      setAlert({ type: "error", message });
    } finally {
      setLoadingChangeStatusId(null);
    }
  };
  const handleDeleteProduct = async (uuid: string) => {
    try {
      const resProduct = await axios.delete(`/api/products/${uuid}`);
      setProducts((prev) => prev.filter((pro) => pro.uuid !== uuid));
      setAlert({
        type: "success",
        message: "ลบสินค้าสำเร็จ",
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
      setAlert({ type: "error", message });
    } finally {
      setLoadingDeleteId(null);
    }
  };
  useEffect(() => {
    fetchData();
  }, [fetchData]);
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
      </AnimatePresence>{" "}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-body">Product</h1>
          <p className="text-sm text-neutral-500 mt-1">
            จัดการสินค้าทั้งหมดของคุณ
          </p>
        </div>
        <Link
          href="/products/create"
          className="inline-flex items-center gap-1.5 rounded-base bg-neutral-900 text-white px-4 py-2 text-sm font-medium hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          เพิ่มสินค้า
        </Link>
      </div>
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <SearchProducts
          value={search}
          onValueChange={setSearch}
          disabled={isSearchLoading}
          className="w-full rounded-base border border-default bg-neutral-primary-soft py-2 pl-9 pr-3 text-sm text-body outline-none focus:ring-2 focus:ring-neutral-400"
        />
      </div>
      <div>
        <CheckBoxList
          value={selectedIds}
          onValueChange={setSelectedIds}
          arrayData={categories}
        />
      </div>
      <div className="relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default">
        {isLoading ? (
          <ProductSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={fetchData}
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
                  Detail
                </th>
                <th scope="col" className="px-6 py-3 font-medium">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 font-medium">
                  Stock
                </th>
                <th scope="col" className="px-6 py-3 font-medium">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 font-medium">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 font-medium">
                  Created At
                </th>
                <th scope="col" className="px-6 py-3 font-medium">
                  Images
                </th>
                <th scope="col" className="px-6 py-3 font-medium text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {products.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-16 text-center text-neutral-400"
                    >
                      ยังไม่มีหมวดหมู่ — เริ่มเพิ่มหมวดหมู่แรกของคุณได้เลย
                    </td>
                  </tr>
                ) : (
                  products.map((product, i) => (
                    <motion.tr
                      key={product.uuid}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.03 }}
                      className="bg-neutral-primary border-b border-default hover:bg-neutral-secondary-soft/50 transition-colors"
                    >
                      {/* confirmModelDeleteId */}

                      {confirmModelChangeStatus && (
                        <ConfirmModalChangeStatusProduct
                          open={confirmModelChangeStatus}
                          title="เปลี่ยนสถานะรูปภาพ"
                          message={
                            product?.status === "active"
                              ? "คุณต้องการปิดการใช้งานสินค้านี้ใช่หรือไม่?"
                              : "คุณต้องการเปิดการใช้งานสินค้านี้ใช่หรือไม่?"
                          }
                          onCancel={() => {
                            setConfirmModelChangeStatus(false);
                          }}
                          onConfirm={async () => {
                            if (!selectedProductUuid) return;

                            handleChangeStatus(
                              selectedProductUuid,
                              selectedProductStatus,
                            );
                            setConfirmModelChangeStatus(false);
                          }}
                        />
                      )}
                      <td className="px-6 py-4 font-mono text-xs text-neutral-500">
                        {product.tagId}
                      </td>
                      <td className="px-6 py-4 font-medium">{product.name}</td>
                      <td className="px-6 py-4 font-medium">
                        {product.detail}
                      </td>
                      <td className="px-6 py-4 font-medium">{product.price}</td>
                      <td className="px-6 py-4 font-medium">{product.stock}</td>
                      <td className="px-6 py-4">
                        {product.categories.length === 0 ? (
                          <span className="text-xs text-gray-400">
                            No categories
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {product.categories.map((category, i) => (
                              <span
                                key={`${category.uuid}-${i}`}
                                className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
                              >
                                {category.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 font-medium">
                        {product.status === "active" ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-5 h-5" />
                            Active
                          </span>
                        ) : product.status === "inactive" ? (
                          <span className="flex items-center gap-1 text-red-600">
                            <XCircle className="w-5 h-5" />
                            Inactive
                          </span>
                        ) : product.status === "archived" ? (
                          <span className="flex items-center gap-1 text-gray-500">
                            <Archive className="w-5 h-5" />
                            Archived
                          </span>
                        ) : (
                          <span className="text-gray-400">Unknown</span>
                        )}
                      </td>

                      <td className="px-6 py-4 font-medium">
                        {product.createdAt.toLocaleString("th-TH", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        {product.images.length > 0 ? (
                          <div className="flex gap-2 flex-wrap">
                            <ProductImageLightbox
                              images={product.images}
                              apiUrl={API_URL as string}
                            />
                          </div>
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gray-100 text-xs text-gray-400">
                            No image
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="flex justify-end gap-1">
                          <Switch
                            checked={product.status === "active"}
                            onChange={() => {
                              setSelectedProductUuid(product.uuid);
                              setSelectedProductStatus(product.status);
                              setConfirmModelChangeStatus(true);
                            }}
                            disabled={loadingChangeStatusId === product.uuid}
                          />

                          <button
                            className="p-1.5 rounded-base hover:bg-neutral-secondary-soft text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
                            title="แก้ไข"
                          >
                            <Link href={`/products/${product.uuid}/edit`}>
                              <PenSquare className="h-4 w-4" />
                            </Link>
                          </button>

                          <ButtonDeleteAlert
                            onConfirm={() => {
                              handleDeleteProduct(product.uuid);
                            }}
                            onCancel={() => {}}
                            disabled={loadingDeleteId === product.uuid}
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
      {!isLoading && !error && products.length > 0 && (
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
