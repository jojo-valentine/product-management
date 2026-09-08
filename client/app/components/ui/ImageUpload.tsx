import { ExistingImage, productImages } from "@/app/types/product";
import { API_URL } from "@/app/utils/api";
import { Trash } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import {
  ConfirmModalChangeStatusImageProduct,
  ConfirmModalDeleteImageProduct,
} from "./Product-Alert";
import { Switch } from "./Switch";

type Props = {
  value: File[];
  onChange?: (files: File[]) => void;
  className?: string;
  existingImages?: ExistingImage[];
  onRemoveExisting?: (uuid: string) => void;
  statusChange?: (
    uuid: string,
    status: "active" | "inactive" | "archived",
  ) => void;
};
const ImageUpload = React.forwardRef<HTMLDivElement, Props>(
  (
    {
      value,
      onChange,
      className,
      existingImages = [],
      onRemoveExisting,
      statusChange,
    },
    ref,
  ) => {
    const [errors, setErrors] = useState<string[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const typeImage = ["image/jpeg", "image/png", "image/jpg"];
    const [showConfirm, setShowConfirm] = useState(false);
    const [showStatusConfirm, setShowStatusConfirm] = useState(false);
    const [selectedImageUuid, setSelectedImageUuid] = useState<string | null>(
      null,
    );

    useEffect(() => {
      const urls = value.map((file) => URL.createObjectURL(file));
      setPreviews(urls);
      return () => {
        urls.forEach((url) => URL.revokeObjectURL(url));
      };
    }, [value]);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;
      const files = Array.from(e.target.files);
      const validFiles: File[] = [];
      const newErrors: string[] = [];
      const totalImages =
        existingImages.length + value.length + validFiles.length;

      files.forEach((file) => {
        if (!typeImage.includes(file.type)) {
          newErrors.push(`ไฟล์ ${file.name} ไม่ใช่รูปแบบที่อนุญาต`);
        } else if (file.size > 5 * 1024 * 1024) {
          newErrors.push(`ไฟล์ ${file.name} มีขนาดเกิน 5MB`);
        } else {
          validFiles.push(file);
        }
      });

      if (files.length > 10) {
        newErrors.push("ไฟล์เกิน 10 รูป");
        if (inputRef.current) {
          inputRef.current.value = "";
        }
        setPreviews([]);
        onChange?.([]);
        setErrors(newErrors);
        return;
      } else if (totalImages > 10) {
        newErrors.push("ไฟล์รวมกับรูปเดิมเกิน 10 รูป");

        if (inputRef.current) {
          inputRef.current.value = "";
        }

        setPreviews([]);
        onChange?.([]);
        setErrors(newErrors);
        return;
      }

      if (newErrors.length > 0) {
        setErrors(newErrors);
      } else {
        setErrors([]);
      }

      if (validFiles.length > 0) {
        onChange?.([...value, ...validFiles]);
      }

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    };

    const handleRemove = (index: number) => {
      const newImages = value.filter((_, i) => i !== index);
      onChange?.(newImages);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    };

    const clearAll = () => {
      onChange?.([]);
      setErrors([]);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    };
    const selectedImage = existingImages.find(
      (image) => image.uuid === selectedImageUuid,
    );
    return (
      <div ref={ref} className={`w-full ${className ?? ""}`}>
        {/* Hidden input */}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/jpg"
          onChange={handleUpload}
          className="hidden"
        />

        {existingImages.length > 0 && (
          <div className="my-2">
            <h2>รูปเก่า </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {existingImages?.map((image) => (
                <div
                  key={image.uuid}
                  className="group relative overflow-hidden rounded-lg border bg-white"
                >
                  <img
                    src={`${API_URL}/uploads/${image.path}/${image.image}`}
                    alt={image.image}
                    className="aspect-square w-full object-cover"
                  />
                  <Switch
                    checked={image.status === "active"}
                    onChange={() => {
                      setSelectedImageUuid(image.uuid);
                      setShowStatusConfirm(true);
                    }}
                  />
                  {showStatusConfirm && selectedImage && (
                    <ConfirmModalChangeStatusImageProduct
                      open={showStatusConfirm}
                      title="เปลี่ยนสถานะรูปภาพ"
                      message={
                        image?.status === "active"
                          ? "คุณต้องการปิดการใช้งานรูปภาพนี้ใช่หรือไม่?"
                          : "คุณต้องการเปิดการใช้งานรูปภาพนี้ใช่หรือไม่?"
                      }
                      onCancel={() => {
                        setShowStatusConfirm(false);
                        setSelectedImageUuid(null);
                      }}
                      onConfirm={async () => {
                        if (!selectedImageUuid) return;

                        const newStatus =
                          selectedImage.status === "active"
                            ? "inactive"
                            : "active";

                        await statusChange?.(selectedImage.uuid, newStatus);

                        setShowStatusConfirm(false);
                        setSelectedImageUuid(null);
                      }}
                    />
                  )}

                  <p>{image.status}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImageUuid(image.uuid);
                      setShowConfirm(true);
                    }}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
                  >
                    ✕
                  </button>
                  {showConfirm && (
                    <ConfirmModalDeleteImageProduct
                      open={showConfirm}
                      title="ลบรูปภาพ"
                      message="คุณต้องการลบรูปภาพนี้ใช่หรือไม่?"
                      onCancel={() => {
                        setShowConfirm(false);
                        setSelectedImageUuid(null);
                      }}
                      onConfirm={() => {
                        if (selectedImageUuid) {
                          onRemoveExisting?.(selectedImageUuid);
                        }

                        setShowConfirm(false);
                        setSelectedImageUuid(null);
                      }}
                    />
                  )}

                  <div className="truncate px-2 py-1 text-xs text-gray-500">
                    {image.image}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 rounded-md border border-gray-300  bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
        >
          <span className="text-lg">🖼️</span>
          <span>เลือกภาพ</span>
        </button>

        {errors.length > 0 && (
          <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-600">
            {errors.map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </div>
        )}

        {value.length > 0 && (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">
                รูปภาพที่เลือก ({value.length})
              </p>

              <button
                type="button"
                onClick={clearAll}
                className="text-sm text-red-500 hover:text-red-700"
              >
                ลบทั้งหมด
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {value.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="group relative overflow-hidden rounded-lg border bg-white"
                >
                  <img
                    src={previews[index]}
                    alt={file.name}
                    className="aspect-square w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow transition hover:bg-red-600"
                  >
                    <Trash />
                  </button>

                  <div className="truncate px-2 py-1 text-xs text-gray-500">
                    {file.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  },
);

ImageUpload.displayName = "ImageUpload";

export { ImageUpload };
