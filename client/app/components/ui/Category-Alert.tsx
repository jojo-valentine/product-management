import { Alert, AlertTitle, AlertDescription } from "@/app/components/ui/Alert";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/app/components/ui/Alert-dialog";
import { Save, Trash } from "lucide-react";
import { Switch } from "./Switch";
import { useState } from "react";
interface CategoryStatusDialogProps {
  category: {
    uuid: string;
    status: boolean;
  };
  loadingToggle: boolean;
  handleCategorySwitch: (payload: { id: string; status: boolean }) => void;
}

// function CategorySuccessAlert() {
//   return (
//     <Alert variant="success">
//       <AlertTitle>Category Created</AlertTitle>
//       <AlertDescription>
//         Your category has been created successfully.
//       </AlertDescription>
//     </Alert>
//   );
// }

export function ConfirmCreateCategory({
  onConfirm,
  loading,
}: {
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="px-4 flex py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          disabled={loading}
        >
          <Save className="mr-2 h-5 w-4" />

          {loading ? "Creating..." : "Create Category"}
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
            <button className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100">
              Cancel
            </button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <button
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              onClick={onConfirm}
            >
              {loading ? "Processing..." : "Yes, create"}
            </button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
export function ConfirmBtnCategory({
  onConfirm,
  loading,
  triggerText,
  confirmText,
}: {
  onConfirm: () => void;
  loading: boolean;
  triggerText: string;
  confirmText: string;
}) {
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
}

export function categoriesSuccess({
  onConfirm,
  loading,
}: {
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="px-4 flex py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          disabled={loading}
        >
          <Save className="mr-2 h-5 w-4" />

          {loading ? "Creating..." : "Create Category"}
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
            <button className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100">
              Cancel
            </button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <button
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              onClick={onConfirm}
            >
              {loading ? "Processing..." : "Yes, create"}
            </button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function CategoryStatusDialog({
  category,
  loadingToggle,
  handleCategorySwitch,
}: CategoryStatusDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Switch
          checked={category.status}
          onChange={() => {}} // ไม่ toggle ทันที แต่เปิด dialog
          disabled={loadingToggle}
        />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>เปลี่ยนสถานะ?</AlertDialogTitle>
          <AlertDialogDescription>
            {category.status
              ? "คุณต้องการปิดใช้งานหมวดหมู่นี้?"
              : "คุณต้องการเปิดใช้งานหมวดหมู่นี้?"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
          <AlertDialogAction
            onClick={() =>
              handleCategorySwitch({
                id: category.uuid,
                status: !category.status,
              })
            }
          >
            ยืนยัน
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const SuccessAlertDialog = ({
  open,
  onOpenChange,
  title,
  description,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {/* สถานะถูกอัปเดตเรียบร้อยแล้ว */}
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onOpenChange(false)}>
            ปิด
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

SuccessAlertDialog.displayName = "SuccessAlertDialog";

const ConfirmBtnCategoryDelete = ({
  onConfirm,
  loading,
  confirmText,
}: {
  onConfirm: () => void;
  loading: boolean;
  confirmText: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="p-1.5 rounded-base hover:bg-red-50 text-neutral-500 hover:text-red-600 transition-colors"
          disabled={loading}
        >
          <Trash className="h-5 w-5" />
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Are you sure you want to delete this
            category?
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
              className="flex items-center gap-2 px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              onClick={() => {
                onConfirm();
                setOpen(false);
              }}
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
ConfirmBtnCategoryDelete.displayName = "ConfirmBtnCategoryDelete";
export { SuccessAlertDialog, ConfirmBtnCategoryDelete };
