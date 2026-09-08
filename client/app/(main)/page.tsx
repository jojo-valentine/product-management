"use client";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { AlertState } from "../types/AlertState";
import { CheckCircle2, X, XCircle } from "lucide-react";
interface DataDashboard {
  products: number;
  categories: number;
}
export default function HomePage() {
  const [data, setData] = useState<DataDashboard>();
  const [alert, setAlert] = useState<AlertState>(null);
  const [loading, setLoading] = useState(false);
  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await axios.get(`/api/dashboard/`);
      const data = result.data.data;
      setData(data);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "โหลดข้อมูล Dashboard ไม่สำเร็จ";
      setAlert({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl min-w-full min-h-dvh px-6 py-10 flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
      </div>
    );
  }
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
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

          <p className="mt-2 text-gray-500">
            Manage your products and categories.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Products</p>
            <p className="mt-2 text-3xl font-bold">{data?.products ?? "-"}</p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Categories</p>
            <p className="mt-2 text-3xl font-bold">{data?.categories ?? "-"}</p>
          </div>
        </div>

        <div className="mt-8 rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold">Product Management</h2>

          <p className="mt-2 text-sm text-gray-500">
            Use the navigation above to manage products and categories.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
