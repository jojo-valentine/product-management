import * as React from "react";
import { cn } from "@/app/lib/utils";
import { Input } from "./Input";

type SearchCategoriesProps = {
  value: string;
  onValueChange: (value: string) => void;
} & React.ComponentProps<"input">;

type SearchProductProps = {
  value: string;
  onValueChange: (value: string) => void;
} & React.ComponentProps<"input">;

const SearchCategories = React.forwardRef<
  HTMLInputElement,
  SearchCategoriesProps
>(({ className, value, onValueChange, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      placeholder="Search category..."
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className={cn("w-full", className)}
      {...props}
    />
  );
});

SearchCategories.displayName = "SearchCategories";

const SearchProducts = React.forwardRef<
  HTMLInputElement,
  SearchCategoriesProps
>(({ className, value, onValueChange, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      placeholder="Search product..."
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className={cn("w-full", className)}
      {...props}
    />
  );
});

SearchProducts.displayName = "SearchProducts";

export { SearchCategories, SearchProducts };
