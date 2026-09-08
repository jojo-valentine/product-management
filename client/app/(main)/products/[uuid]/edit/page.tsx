"use client";
import React, { useEffect } from "react";
import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Plus, Save, X, XCircle } from "lucide-react";
import { Label } from "@/app/components/ui/Label";
import { Input } from "@/app/components/ui/Input";
import { Textarea } from "@/app/components/ui/Textarea";
import axios from "axios";
import {
  ExistingImage,
  initialProductEditForm,
  initialProductEditFormError,
  productCategoryList,
  productEditForm,
  productEditFormError,
  productImages,
} from "@/app/types/product";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/Card";
import { CheckBoxListProduct } from "@/app/components/ui/Checkbok";
import { ImageUpload } from "@/app/components/ui/ImageUpload";
import {
  ConfirmBtnUpdateProduct,
  SuccessModal,
} from "@/app/components/ui/Product-Alert";
import { validateFormEdit } from "@/app/utils/validateProduct";
import { AlertState } from "@/app/types/AlertState";
const inputErrorClass = "border-red-500 focus-visible:ring-red-500";
export default function page() {
  const [alert, setAlert] = useState<AlertState>(null);
  const router = useRouter();
  const params = useParams<{ uuid: string }>();
  const id = params?.uuid;
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categories, setCategories] = useState<productCategoryList[]>([]);
  const [productEditForm, setProductEditForm] = useState<productEditForm>(
    initialProductEditForm,
  );
  const [isDirty, setIsDirty] = useState(false);
  const [productFormError, setProductFormError] =
    useState<productEditFormError>(initialProductEditFormError);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsFetching(true);
      setIsLoadingCategories(true);
      const [categoriesRes, productsRes] = await Promise.all([
        axios.get("/api/categories/for-product"),
        axios.get(`/api/products/${id}`),
      ]);
      setCategories(categoriesRes.data);
      const data = productsRes.data;
      setProductEditForm({
        name: data.name,
        detail: data.detail,
        price: data.price,
        stock: data.stock,
        categoryIds:
          data.categories.map((category: { uuid: string }) => category.uuid) ??
          [],
        images: [],
      });
      setExistingImages(data.images);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
      setAlert({ type: "error", message });
    } finally {
      setIsLoadingCategories(false);
      setIsFetching(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isFetching) {
    return (
      <div className="mx-auto max-w-7xl min-w-full min-h-dvh px-6 py-10 flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
      </div>
    );
  }

  const handleRemoveExisting = async (uuid: string) => {
    try {
      await axios.delete(`/api/products/${id}/images/${uuid}`);
      setExistingImages((prev) => prev.filter((image) => image.uuid !== uuid));
      setAlert({
        type: "success",
        message: "ลบรูปภาพเรียบร้อยแล้ว",
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
      setAlert({ type: "error", message });
    }
  };
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    setIsDirty(true);
    if (id === "price" || id === "stock") {
      const cleaned = value.replace(/^0+(?=\d)/, "");
      setProductEditForm((prev) => ({
        ...prev,
        [id]: cleaned,
      }));
      setProductFormError((prev) => ({
        ...prev,
        [id]: "",
      }));
      return;
    }
    setProductEditForm((prev) => ({
      ...prev,
      [id]: value,
    }));
    setProductFormError((prev) => ({
      ...prev,
      [id]: "",
    }));
  };
  const handleChangeImageStatus = async (
    uuid: string,
    status: "active" | "inactive" | "archived",
  ) => {
    try {
      setAlert(null);
      const resProductImage = await axios.patch(
        `/api/products/${id}/images/${uuid}`,
        {
          status,
        },
      );
      setExistingImages((prev) =>
        prev.map((img) =>
          img.uuid === uuid ? { ...img, status: status } : img,
        ),
      );
      setAlert({
        type: "success",
        message: "แก้ไขรูปสินค้าเรียบร้อยแล้ว",
      });
      setShowSuccess(true);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
      setAlert({ type: "error", message });
    }
  };
  const handleUpdateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAlert(null);
    const errors = validateFormEdit(productEditForm);
    const hasError = Object.values(errors).some((err) => err !== "");
    setProductFormError(errors);
    if (hasError) {
      return;
    }
    setLoading(true);
    try {
      const resProduct = await axios.put(`/api/products/${id}`, {
        name: productEditForm.name,
        detail: productEditForm.detail,
        price: Number(productEditForm.price),
        stock: Number(productEditForm.stock),
        categoryIds: productEditForm.categoryIds,
      });
      if (productEditForm.images.length > 0) {
        const imageForm = new FormData();
        productEditForm.images.forEach((file) => {
          imageForm.append("images", file);
        });
        const resImage = await axios.post(
          `/api/products/${id}/images`,
          imageForm,
        );
        const newImagesArray = resImage.data.newProductImages.images;
        setExistingImages((prev) => [...prev, ...newImagesArray]);
        setProductEditForm((prev) => ({
          ...prev,
          images: [],
        }));
      }
      const data = resProduct.data.data;
      const categoryIds =
        data.categories?.map((category: { uuid: string }) => category.uuid) ??
        [];
      setProductEditForm({
        name: data.name,
        detail: data.detail,
        price: data.price,
        stock: data.stock,
        categoryIds,
        images: [],
      });
      setIsDirty(false);
      setProductFormError(initialProductEditFormError);
      setAlert({
        type: "success",
        message: "แก้ไขสินค้าเรียบร้อยแล้ว",
      });
      setShowSuccess(true);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const err = error.response?.data;
        if (err?.errors) {
          const fieldErrors = { ...initialProductEditFormError };
          err.errors.forEach((e: { path: string; message: string }) => {
            (fieldErrors as any)[e.path] = e.message;
          });
          setProductFormError(fieldErrors);
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
      router.push("/products");
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
              onClick={() => setAlert(null)}
              className="ml-2 opacity-60 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>{" "}
      <AnimatePresence>
        {showLeaveConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowLeaveConfirm(false)}
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
                  onClick={() => router.push("/products")} // ✅ ยืนยัน -> ออกจากหน้า
                  className="rounded-base bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  ออกโดยไม่บันทึก
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <SuccessModal
        open={showSuccess}
        title="แก้ไขสินค้าสำเร็จ"
        message="ข้อมูลสินค้าได้รับการอัปเดตเรียบร้อยแล้ว"
        timeout={5000}
        onStay={() => {
          setShowSuccess(false);
        }}
        onRedirect={() => {
          router.push("/products");
        }}
      />
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
          <form id="update-product-form" onSubmit={handleUpdateProduct}>
            <div className="space-y-2">
              <Label htmlFor="name">Name product</Label>
              <Input
                id="name"
                placeholder="Enter your product"
                value={productEditForm.name}
                onChange={handleChange}
                className={productFormError.name ? inputErrorClass : ""}
              />
              {productFormError.name && (
                <p className="text-sm text-red-500">{productFormError.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="detail">product detail</Label>
              <Textarea
                id="detail"
                placeholder="Enter your detail"
                value={productEditForm.detail}
                onChange={handleChange}
                className={productFormError.detail ? inputErrorClass : ""}
              />
              {productFormError.detail && (
                <p className="text-sm text-red-500">
                  {productFormError.detail}
                </p>
              )}
            </div>

            <div className="">
              <label htmlFor="">product price</label>
              <Input
                type="number"
                id="price"
                placeholder="Enter your price"
                value={productEditForm.price}
                onChange={handleChange}
                className={productFormError.price ? inputErrorClass : ""}
              />
              {productFormError.price && (
                <p className="text-sm text-red-500">{productFormError.price}</p>
              )}
            </div>
            <div className="">
              <label htmlFor="">product stock</label>
              <Input
                type="number"
                id="stock"
                placeholder="Enter your stock"
                value={productEditForm.stock}
                onChange={handleChange}
                className={productFormError.stock ? inputErrorClass : ""}
              />
              {productFormError.stock && (
                <p className="text-sm text-red-500">{productFormError.stock}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>category product</Label>
              {isLoadingCategories ? (
                <p className="text-sm text-neutral-400">กำลังโหลดหมวดหมู่...</p>
              ) : (
                <CheckBoxListProduct
                  value={productEditForm.categoryIds ?? []}
                  onValueChange={(value) =>
                    setProductEditForm((prev) => ({
                      ...prev,
                      categoryIds: value,
                    }))
                  }
                  categories={categories ?? []}
                  error={productFormError.categoryIds}
                  onClearError={() =>
                    setProductFormError((prev) => ({
                      ...prev,
                      categoryIds: "",
                    }))
                  }
                />
              )}
            </div>

            <div>
              <ImageUpload
                value={productEditForm.images}
                onChange={(files) =>
                  setProductEditForm((prev) => ({
                    ...prev,
                    images: files,
                  }))
                }
                existingImages={existingImages}
                onRemoveExisting={handleRemoveExisting}
                statusChange={handleChangeImageStatus}
              />
            </div>
          </form>
        </CardContent>

        <CardFooter>
          <div className="flex justify-center">
            <ConfirmBtnUpdateProduct
              onConfirm={() => {
                const form = document.getElementById(
                  "update-product-form",
                ) as HTMLFormElement;
                form?.requestSubmit();
              }}
              loading={loading}
              triggerText="Update product"
              confirmText="Yes, update"
            />
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
