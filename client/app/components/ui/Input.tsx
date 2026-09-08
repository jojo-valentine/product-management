import { cn } from "@/app/lib/utils";
import * as React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

const InputWithLabel = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <input
          ref={ref}
          type={type}
          {...props}
          className={cn(
            "flex h-10 w-full rounded-md border border-gray-300 bg-gray-100 text-black dark:bg-gray-800 dark:text-white px-3 py-2 text-base placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className,
          )}
        />
      </div>
    );
  },
);

InputWithLabel.displayName = "InputWithLabel";

export { Input, InputWithLabel };
