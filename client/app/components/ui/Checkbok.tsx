import * as React from "react";
import { cn } from "@/app/lib/utils";
import { productCategoryList } from "@/app/types/product";
type Props = {
  value: string[];
  onValueChange: (value: string[]) => void; // 👈 เปลี่ยนชื่อ
  arrayData: productCategoryList[];
} & React.HTMLAttributes<HTMLDivElement>;

const CheckBoxList = React.forwardRef<HTMLDivElement, Props>(
  ({ className, value, arrayData, onValueChange, ...props }, ref) => {
    const toggleCategory = (id: string) => {
      if (!value) return;

      if (value.includes(id)) {
        onValueChange(value.filter((v) => v !== id));
      } else {
        onValueChange([...value, id]);
      }
    };

    return (
      <div
        ref={ref}
        className={cn("flex flex-wrap gap-2", className)}
        {...props}
      >
        {arrayData.map((data) => {
          const checked = value.includes(data.uuid);
          return (
            <label
              key={data.uuid}
              htmlFor={data.uuid}
              className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-md cursor-pointer transition border",
                checked
                  ? "bg-blue-500 text-white border-blue-500"
                  : "hover:bg-muted/30",
              )}
            >
              <input
                id={data.uuid}
                type="checkbox"
                checked={checked}
                onChange={() => toggleCategory(data.uuid)}
                className="accent-blue-500 cursor-pointer"
              />
              <span>{data.name}</span>
            </label>
          );
        })}
      </div>
    );
  },
);
CheckBoxList.displayName = "CheckBoxList";

type ProductCheckBoxListProps = {
  value: string[];
  onValueChange: (value: string[]) => void;
  categories: productCategoryList[];
  error?: string;
  onClearError?: () => void;
};
const CheckBoxListProduct: React.FC<ProductCheckBoxListProps> = ({
  value,
  onValueChange,
  categories,
  error,
  onClearError,
}) => {
  const toggleCategory = (id: string) => {
    const newValue = value.includes(id)
      ? value.filter((v) => v !== id)
      : [...value, id];

    onValueChange(newValue);

    if (newValue.length > 0) {
      onClearError?.();
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const checked = Array.isArray(value)
            ? value.includes(cat.uuid)
            : false;

          return (
            <label
              key={cat.uuid}
              htmlFor={cat.uuid}
              className={`flex items-center gap-2 px-3 py-1 rounded-md cursor-pointer transition border ${
                checked
                  ? "bg-blue-500 text-white border-blue-500"
                  : "hover:bg-muted/30"
              }`}
            >
              <input
                id={cat.uuid}
                type="checkbox"
                checked={checked}
                onChange={() => toggleCategory(cat.uuid)}
                className="accent-blue-500 cursor-pointer"
              />
              <span>{cat.name}</span>
            </label>
          );
        })}
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

CheckBoxListProduct.displayName = "CheckBoxListProduct";
export { CheckBoxList, CheckBoxListProduct };
