"use client";
import React from "react";
import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Plus, Save } from "lucide-react";
import { Label } from "@/app/components/ui/Label";
import { Input } from "@/app/components/ui/Input";
import { Textarea } from "@/app/components/ui/Textarea";
import { Radio } from "@/app/components/ui/Radio";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/Card";
import {
  initialCategoryError,
  errorCategory,
  formCategory,
  initialFormCategory,
} from "@/app/types/category";
import { Alert, AlertTitle, AlertDescription } from "@/app/components/ui/Alert";
import { ConfirmCreateCategory } from "@/app/components/ui/Category-Alert";
import { useRouter } from "next/navigation";
import axios from "axios";
import { validateForm } from "@/app/utils/validateCategory";

export default function page() {
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [redirectTimer, setRedirectTimer] = useState<NodeJS.Timeout | null>(
    null,
  );
  const router = useRouter();
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [formCategory, setFormCategory] =
    useState<formCategory>(initialFormCategory);
  const [errorCategory, setErrorCategory] =
    useState<errorCategory>(initialCategoryError);
  const inputErrorClass = "border-red-500 focus-visible:ring-red-500";
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value, type } = e.target;
    if (type === "radio") {
      setFormCategory((prev) => ({
        ...prev,
        status: value === "active",
      }));
      setErrorCategory((prev) => ({
        ...prev,
        status: "",
      }));
      return;
    }
    setFormCategory((prev) => ({
      ...prev,
      [id]: value,
    }));
    setErrorCategory((prev) => ({
      ...prev,
      [id]: "",
    }));
  };
  const handleSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorCategory(initialCategoryError);
    setLoadingCategory(true);
    const errors = validateForm(formCategory);
    const hasError = Object.values(errors).some((err) => err !== "");
    setErrorCategory(errors);
    if (hasError) {
      return;
    }
    try {
      await axios.post("/api/categories", formCategory);
      setFormCategory(initialFormCategory);
      setAlert({ type: "success", message: "Category created successfully!" });
      const timer = setTimeout(() => {
        router.push("/categories");
      }, 3000);
      setRedirectTimer(timer);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const err = error.response?.data;
        if (err?.errors) {
          const fieldErrors = { ...initialCategoryError };
          err.errors.forEach((e: { path: string; message: string }) => {
            (fieldErrors as any)[e.path] = e.message;
          });
          setErrorCategory(fieldErrors);
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
      setLoadingCategory(false);
    }
  };
  const cancelRedirect = () => {
    if (redirectTimer) {
      clearTimeout(redirectTimer);
      setRedirectTimer(null);
    }
    setAlert(null);
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-7xl min-w-full min-h-dvh px-6 py-10"
    >
      {alert && (
        <Alert
          variant={alert.type === "success" ? "success" : "destructive"}
          className="transition-all duration-500 ease-in-out animate-in fade-in slide-in-from-top-2"
        >
          <AlertTitle>
            {alert.type === "success" ? "Success" : "Error"}
          </AlertTitle>
          <AlertDescription>
            {alert.message}
            {alert.type === "success" && (
              <button
                onClick={cancelRedirect}
                className="ml-4 text-sm underline text-blue-600"
              >
                Cancel
              </button>
            )}
          </AlertDescription>
        </Alert>
      )}
      <form id="category-form" onSubmit={handleSubmitForm}>
        <Card className="mb-5">
          <CardHeader className="flex !flex-row items-center justify-between mb-8">
            <CardTitle className="font-heading text-2xl">
              Category create
            </CardTitle>
            <div className="">
              <Link
                href="/categories"
                className="inline-flex items-center gap-1.5 rounded-base bg-neutral-900 text-white px-4 py-2 text-sm font-medium hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                ย้อนกลับ
              </Link>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name category</Label>

              <Input
                id="name"
                placeholder="Enter your category"
                value={formCategory.name}
                onChange={handleChange}
                className={errorCategory.name ? inputErrorClass : ""}
              />

              {errorCategory.name && (
                <p className="text-sm text-red-500">{errorCategory.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description category</Label>
              <Textarea
                id="description"
                placeholder="Enter your description"
                value={formCategory.description}
                onChange={handleChange}
                className={errorCategory.description ? inputErrorClass : ""}
              />
              {errorCategory.description && (
                <p className="text-sm text-red-500">
                  {errorCategory.description}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Status category</Label>
              <div className="flex flex-col gap-3">
                <Radio
                  name="status"
                  value="active"
                  label="Active"
                  checked={formCategory.status === true}
                  onChange={handleChange}
                />
                <Radio
                  name="status"
                  value="inactive"
                  label="Inactive"
                  checked={formCategory.status === false}
                  onChange={handleChange}
                />
              </div>
              {errorCategory.status && (
                <p className="text-sm text-red-500">{errorCategory.status}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <ConfirmCreateCategory
              onConfirm={() => {
                const form = document.getElementById(
                  "category-form",
                ) as HTMLFormElement;
                console.log("checkValidity:", form?.checkValidity());
                form?.requestSubmit();
              }}
              loading={loadingCategory}
            />
          </CardFooter>
        </Card>
      </form>
    </motion.div>
  );
}
