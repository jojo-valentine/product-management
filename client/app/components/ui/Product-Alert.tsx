import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/components/ui/Alert-dialog";
import { Save, Trash, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AlertDialogFooter, AlertDialogHeader } from "./Alert-dialog";
import { Button } from "./Button";

const ConfirmBtnCreateProduct = ({
  onConfirm,
  loading,
}: {
  onConfirm: () => void;
  loading: boolean;
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="px-4 flex py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          disabled={loading}
        >
          <Save className="mr-2 h-4 w-4" /> {/* ✅ แก้ icon size */}
          {loading ? "Creating..." : "Create Product"}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Creation</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to create this category? Please double-check
            your inputs before proceeding.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <button
              type="button"
              className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
            >
              {/* ✅ เพิ่ม type="button" */}
              Cancel
            </button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <button
              type="button" /* ✅ เพิ่ม type="button" */
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              onClick={onConfirm}
            >
              Yes, create {/* ✅ เอา loading text ออก เพราะไม่มีวันโชว์จริง */}
            </button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
ConfirmBtnCreateProduct.displayName = "ConfirmBtnCreateProduct";
const ConfirmBtnUpdateProduct = ({
  onConfirm,
  loading,
  triggerText,
  confirmText,
}: {
  onConfirm: () => void;
  loading: boolean;
  triggerText: string;
  confirmText: string;
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          disabled={loading}
        >
          <Save className="h-5 w-5" />
          <span>{loading ? "Processing..." : triggerText}</span>
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Action</AlertDialogTitle>
          <AlertDialogDescription>
            Please confirm before proceeding.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <button className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100">
              Cancel
            </button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Processing..." : confirmText}
            </button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
ConfirmBtnUpdateProduct.displayName = "ConfirmBtnUpdateProduct";

type ConfirmModalProps = {
  open: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
  textBtnConfirm?: string;
};

const ConfirmModalDeleteImageProduct = ({
  open,
  title = "ยืนยันการลบ",
  message = "คุณต้องการลบรูปภาพนี้ใช่หรือไม่?",
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  if (!open) return null;
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>

          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600"
          >
            ลบ
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
ConfirmModalDeleteImageProduct.displayName = "ConfirmModalDeleteImageProduct";
interface SuccessModalProps {
  open: boolean;
  title?: string;
  message?: string;
  redirectPath?: string;
  timeout?: number;
  onStay?: () => void;
  onRedirect?: () => void;
}
const SuccessModal = ({
  open,
  title = "สำเร็จ",
  message = "ดำเนินการสำเร็จ",
  redirectPath,
  timeout = 3000,
  onStay,
  onRedirect,
}: SuccessModalProps) => {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      onRedirect?.();
    }, timeout);
    return () => clearTimeout(timer);
  }, [open, timeout, onRedirect]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      {" "}
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {" "}
        <h2 className="text-lg font-semibold text-gray-900"> {title} </h2>{" "}
        <p className="mt-2 text-sm text-gray-600"> {message} </p>{" "}
        <p className="mt-2 text-xs text-gray-400">
          {" "}
          หากไม่เลือก ระบบจะออกจากหน้านี้อัตโนมัติใน {timeout / 1000}{" "}
          วินาที{" "}
        </p>{" "}
        <div className="mt-6 flex justify-end gap-3">
          {" "}
          <button
            type="button"
            onClick={onStay}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
          >
            {" "}
            อยู่ต่อ{" "}
          </button>{" "}
          <button
            type="button"
            onClick={onRedirect}
            className="rounded-md bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
          >
            {" "}
            ออกไปหน้าอื่น{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
SuccessModal.displayName = "SuccessModal";
const ConfirmModalChangeStatusImageProduct = ({
  open,
  title = "ยืนยันการลบ",
  message = "คุณต้องการลบรูปภาพนี้ใช่หรือไม่?",
  textBtnConfirm = "ยืนยัน",
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  if (!open) return null;
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>

          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600"
          >
            {textBtnConfirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
ConfirmModalChangeStatusImageProduct.displayName =
  "ConfirmModalChangeStatusImageProduct";

const ConfirmModalChangeStatusProduct = ({
  open,
  title = "ยืนยันการลบ",
  message = "คุณต้องการลบรูปภาพนี้ใช่หรือไม่?",
  textBtnConfirm = "ยืนยัน",
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  if (!open) return null;
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>

          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600"
          >
            {textBtnConfirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
ConfirmModalChangeStatusProduct.displayName = "ConfirmModalChangeStatusProduct";
const ConfirmModalDeleteProduct = ({
  open,
  title = "ยืนยันการลบ",
  message = "คุณต้องการลบรูปภาพนี้ใช่หรือไม่?",
  textBtnConfirm = "ยืนยัน",
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  if (!open) return null;
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>

          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600"
          >
            {textBtnConfirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

type BtnConfirmModalProps = {
  onConfirm: () => void;
  onCancel: () => void;
  disabled?: boolean;
};

const ButtonDeleteAlert = ({
  onConfirm,
  onCancel,
  disabled,
}: BtnConfirmModalProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="destructive"
        className="p-1.5 rounded-base hover:bg-red-50 text-neutral-500 hover:text-red-600 transition-colors"
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบสินค้า?</AlertDialogTitle>

            <AlertDialogDescription>
              เมื่อลบแล้วจะไม่สามารถกู้คืนข้อมูลได้
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={onCancel} disabled={disabled}>
              ยกเลิก
            </AlertDialogCancel>

            <AlertDialogAction onClick={onConfirm} disabled={disabled}>
              ยืนยันการลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
ButtonDeleteAlert.displayName = "ButtonDeleteAlert";
export {
  ConfirmBtnCreateProduct,
  ConfirmBtnUpdateProduct,
  ConfirmModalDeleteImageProduct,
  SuccessModal,
  ConfirmModalChangeStatusImageProduct,
  ConfirmModalChangeStatusProduct,
  ConfirmModalDeleteProduct,
  ButtonDeleteAlert,
};
