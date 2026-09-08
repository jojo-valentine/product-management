"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/Card";
import { Label } from "@/app/components/ui/Label";
import { Input } from "@/app/components/ui/Input";
import { Textarea } from "@/app/components/ui/Textarea";
import {
  categoryEdit,
  categoryEditFormError,
  initialCategoryEdit,
  initialCategoryEditFormError,
} from "@/app/types/category";
import { ConfirmBtnCategory } from "@/app/components/ui/Category-Alert";
import axios from "axios";
import { validateFormEdit } from "@/app/utils/validateCategory";

type AlertState = { type: "success" | "error"; message: string } | null;

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams<{ uuid: string }>();
  const id = params?.uuid;
  const [categoryEdit, setCategoryEdit] =
    useState<categoryEdit>(initialCategoryEdit);
  const [errorCategoryEditForm, setErrorCategoryEditForm] =
    useState<categoryEditFormError>(initialCategoryEditFormError);
  const [isFetching, setIsFetching] = useState(true); // ✅ เพิ่ม: loading ตอนดึงข้อมูลเดิม
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>(null); // ✅ เพิ่ม: success/error alert
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false); // ✅ เพิ่ม: confirm ก่อนออกจากหน้า
  const [isDirty, setIsDirty] = useState(false); // ✅ เพิ่ม: track ว่ามีการแก้ไขฟอร์มหรือยัง
  const inputErrorClass = "border-red-500 focus-visible:ring-red-500";
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value, type } = e.target;
    setIsDirty(true); // ✅ พอมีการพิมพ์อะไร ถือว่าฟอร์มถูกแก้แล้ว

    if (type === "radio") {
      setCategoryEdit((prev) => ({ ...prev, status: value === "active" }));
      setErrorCategoryEditForm((prev) => ({ ...prev, status: "" }));
      return;
    }
    setCategoryEdit((prev) => ({ ...prev, [id]: value }));
    setErrorCategoryEditForm((prev) => ({ ...prev, [id]: "" }));
  };

  const fetchDataCategory = async () => {
    try {
      setIsFetching(true);
      const result = await axios.get(`/api/categories/${id}`);
      const data = result.data;
      setCategoryEdit({ name: data.name, description: data.description });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
      setAlert({ type: "error", message });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchDataCategory();
  }, [id]);

  const handleSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorCategoryEditForm(initialCategoryEditFormError);
      setAlert(null);
      const errors = validateFormEdit(categoryEdit);
      const hasError = Object.values(errors).some((err) => err !== "");
      setCategoryEdit(errors);
      if (hasError) {
        return;
      }
      const result = await axios.put(`/api/categories/${id}`, categoryEdit);
      const data = result.data;
      setCategoryEdit((prev) => ({
        ...prev,
        name: data.name,
        description: data.description,
      }));

      setIsDirty(false);
      setAlert({ type: "success", message: "บันทึกการแก้ไขเรียบร้อยแล้ว" });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const err = error.response?.data;
        if (err?.errors) {
          const fieldErrors = { ...initialCategoryEditFormError };
          err.errors.forEach((e: { path: string; message: string }) => {
            (fieldErrors as any)[e.path] = e.message;
          });
          setErrorCategoryEditForm(fieldErrors);
        }
        setAlert({
          type: "error",
          message: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง",
        });
      } else {
        setAlert({
          type: "error",
          message: "บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง",
        });
        return;
      }
      const message =
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
      setAlert({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    if (isDirty) {
      setShowLeaveConfirm(true);
    } else {
      router.push("/categories");
    }
  };

  if (isFetching) {
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
              onClick={() => {
                setAlert(null);
                handleBackClick();
              }}
              className="ml-2 opacity-60 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLeaveConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowLeaveConfirm(false)} // กดพื้นหลัง = ยกเลิก อยู่หน้าเดิม
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-base border border-default bg-neutral-primary-soft p-6 shadow-lg"
            >
              <h3 className="text-base font-semibold text-body">
                ยกเลิกการแก้ไข?
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                คุณมีการแก้ไขที่ยังไม่ได้บันทึก หากออกตอนนี้ข้อมูลจะหายไป
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setShowLeaveConfirm(false)} // ✅ ยกเลิก -> อยู่หน้าเดิม
                  className="rounded-base border border-default px-4 py-2 text-sm font-medium hover:bg-neutral-secondary-soft transition-colors"
                >
                  ยกเลิก อยู่หน้านี้ต่อ
                </button>
                <button
                  onClick={() => router.push("/categories")} // ✅ ยืนยัน -> ออกจากหน้า
                  className="rounded-base bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  ออกโดยไม่บันทึก
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="mb-5">
        <CardHeader className="flex !flex-row items-center justify-between mb-8">
          <CardTitle className="font-heading text-2xl">
            Edit Categories
            <p className="text-sm text-neutral-500 mt-1">
              จัดการหมวดหมู่ของคุณ
            </p>
          </CardTitle>

          <button
            type="button"
            onClick={handleBackClick}
            className="inline-flex items-center gap-1.5 rounded-base bg-neutral-900 text-white px-4 py-2 text-sm font-medium hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            ย้อนกลับ
          </button>
        </CardHeader>

        <CardContent className="space-y-4">
          <form id="category-form" onSubmit={handleSubmitForm}>
            <div className="space-y-2">
              <Label htmlFor="name">Name category</Label>
              <Input
                id="name"
                placeholder="Enter your category"
                value={categoryEdit.name}
                onChange={handleChange}
                className={errorCategoryEditForm.name ? inputErrorClass : ""}
              />
              {errorCategoryEditForm.name && (
                <p className="text-sm text-red-500">
                  {errorCategoryEditForm.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description category</Label>
              <Textarea
                id="description"
                placeholder="Enter your description"
                value={categoryEdit.description}
                onChange={handleChange}
                className={
                  errorCategoryEditForm.description ? inputErrorClass : ""
                }
              />
              {errorCategoryEditForm.description && (
                <p className="text-sm text-red-500">
                  {errorCategoryEditForm.description}
                </p>
              )}
            </div>
          </form>
        </CardContent>

        <CardFooter>
          <div className="flex justify-center">
            <ConfirmBtnCategory
              onConfirm={() => {
                const form = document.getElementById(
                  "category-form",
                ) as HTMLFormElement;
                form?.requestSubmit();
              }}
              loading={loading}
              triggerText="Update Category"
              confirmText="Yes, update"
            />
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
