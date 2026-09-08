"use client";
import React, { useEffect } from "react";
import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Plus, Save, X, XCircle } from "lucide-react";
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
import axios from "axios";
import {
  initialProductForm,
  initialProductFormError,
  productCategoryList,
  productForm,
  productFormError,
} from "@/app/types/product";
import { CheckBoxListProduct } from "@/app/components/ui/Checkbok";
import { ImageUpload } from "@/app/components/ui/ImageUpload";
import { ConfirmBtnCreateProduct } from "@/app/components/ui/Product-Alert";
import { validateForm } from "@/app/utils/validateProduct";

type AlertState = { type: "success" | "error"; message: string } | null;

export default function page() {
  const router = useRouter();
  const [categories, setCategories] = useState<productCategoryList[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [formProduct, setFormProduct] =
    useState<productForm>(initialProductForm);
  const [formProductError, setFormProductError] = useState<productFormError>(
    initialProductFormError,
  );
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [alert, setAlert] = useState<AlertState>(null);
  const inputErrorClass = "border-red-500 focus-visible:ring-red-500";
  const fetchData = useCallback(async () => {
    try {
      setIsLoadingCategories(true);
      const res = await axios.get("/api/categories/for-product");
      setCategories(res.data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "โหลดหมวดหมู่ไม่สำเร็จ";
      setAlert({ type: "error", message });
    } finally {
      setIsLoadingCategories(false); // ✅ แก้บั๊ก: เดิมว่างเปล่า
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value, type, name } = e.target;
    if (type === "radio") {
      setFormProduct((prev) => ({
        ...prev,
        [name]: value as "active" | "inactive",
      }));
      setFormProductError((prev) => ({
        ...prev,
        [name]: "",
      }));
      return;
    }
    if (id === "price" || id === "stock") {
      const cleaned = value.replace(/^0+(?=\d)/, "");
      setFormProduct((prev) => ({
        ...prev,
        [id]: cleaned,
      }));
      setFormProductError((prev) => ({
        ...prev,
        [id]: "",
      }));
      return;
    }

    setFormProduct((prev) => ({
      ...prev,
      [id]: value,
    }));
    setFormProductError((prev) => ({
      ...prev,
      [id]: "",
    }));
  };

  const handleSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors = validateForm(formProduct);
    Object.entries(errors).forEach(([key, value]) => {
      if (value !== "") {
        return;
      }
    });
    const hasError = Object.values(errors).some((err) => err !== "");
    setFormProductError(errors);
    if (hasError) {
      return;
    }
    try {
      setLoadingProduct(true);
      setAlert(null);
      const formData = new FormData();
      formData.append("name", formProduct.name);
      formData.append("detail", formProduct.detail);
      formData.append("price", formProduct.price);
      formData.append("stock", formProduct.stock);
      formData.append("status", formProduct.status);
      formProduct.categoryIds.forEach((id) => {
        formData.append("categoryIds[]", id);
      });
      formProduct.images.forEach((file) => {
        formData.append("images", file);
      });
      const res = await axios.post("/api/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormProduct(initialProductForm);
      setFormProductError(initialProductFormError);
      setAlert({ type: "success", message: "สร้างสินค้าเรียบร้อยแล้ว" });
      setTimeout(() => {
        router.push("/products");
      }, 2000);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const err = error.response?.data;
        if (err?.errors) {
          const fieldErrors = { ...initialProductFormError };
          err.errors.forEach((e: { path: string; message: string }) => {
            (fieldErrors as any)[e.path] = e.message;
          });
          setFormProductError(fieldErrors);
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
      setLoadingProduct(false);
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

      <form id="product-form" onSubmit={handleSubmitForm}>
        <Card className="mb-5">
          <CardHeader className="flex !flex-row items-center justify-between mb-8">
            <CardTitle className="font-heading text-2xl">
              Product create
            </CardTitle>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 rounded-base bg-neutral-900 text-white px-4 py-2 text-sm font-medium hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              ย้อนกลับ
            </Link>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product</Label>
              <Input
                id="name"
                placeholder="Enter your Product"
                value={formProduct.name}
                onChange={handleChange}
                className={formProductError.name ? inputErrorClass : ""}
              />
              {formProductError.name && (
                <p className="text-sm text-red-500">{formProductError.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="detail">Detail Product</Label>
              <Textarea
                id="detail"
                placeholder="Enter your detail"
                value={formProduct.detail}
                onChange={handleChange}
                className={formProductError.detail ? inputErrorClass : ""}
              />
              {formProductError.detail && (
                <p className="text-sm text-red-500">
                  {formProductError.detail}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Product Price</Label>
              <Input
                id="price"
                type="number"
                placeholder="Enter your Product Price"
                value={formProduct.price ?? ""}
                onChange={handleChange}
                className={formProductError.price ? inputErrorClass : ""}
              />
              {formProductError.price && (
                <p className="text-sm text-red-500">{formProductError.price}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Product Stock</Label>
              <Input
                id="stock"
                type="number"
                placeholder="Enter Product Stock"
                value={formProduct.stock ?? ""}
                onChange={handleChange}
                className={formProductError.stock ? inputErrorClass : ""}
              />
              {formProductError.stock && (
                <p className="text-sm text-red-500">{formProductError.stock}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>category product</Label>
              {isLoadingCategories ? (
                <p className="text-sm text-neutral-400">กำลังโหลดหมวดหมู่...</p>
              ) : (
                <CheckBoxListProduct
                  value={formProduct.categoryIds}
                  onValueChange={(value) =>
                    setFormProduct((prev) => ({
                      ...prev,
                      categoryIds: value,
                    }))
                  }
                  categories={categories}
                  error={formProductError.categoryIds}
                  onClearError={() =>
                    setFormProductError((prev) => ({
                      ...prev,
                      categoryIds: "",
                    }))
                  }
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Status Detail</Label>
              <div className="flex flex-col gap-3">
                <Radio
                  name="status"
                  value="active"
                  label="Active"
                  checked={formProduct.status === "active"}
                  onChange={handleChange}
                />
                <Radio
                  name="status"
                  value="inactive"
                  label="Inactive"
                  checked={formProduct.status === "inactive"}
                  onChange={handleChange}
                />
              </div>
              {formProductError.status && (
                <p className="text-sm text-red-500">
                  {formProductError.status}
                </p>
              )}
            </div>

            <div>
              <ImageUpload
                value={formProduct.images}
                onChange={(files) =>
                  setFormProduct((prev) => ({
                    ...prev,
                    images: files,
                  }))
                }
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-center">
            <ConfirmBtnCreateProduct
              onConfirm={() => {
                const form = document.getElementById(
                  "product-form",
                ) as HTMLFormElement;
                form?.requestSubmit();
              }}
              loading={loadingProduct}
            />
          </CardFooter>
        </Card>
      </form>
    </motion.div>
  );
}
