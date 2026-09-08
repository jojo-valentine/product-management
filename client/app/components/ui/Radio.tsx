import * as React from "react";
import { cn } from "@/app/lib/utils";

interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          ref={ref}
          type="radio"
          {...props}
          className={cn(
            "h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500",
            className,
          )}
        />
        <span className="text-sm text-gray-700">{label}</span>
      </label>
    );
  },
);

Radio.displayName = "Radio";

export { Radio };
