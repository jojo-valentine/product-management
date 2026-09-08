import * as React from "react";
import { cn } from "@/app/lib/utils";

interface SwitchProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onChange"
> {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onChange, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer",
          checked ? "bg-green-500" : "bg-gray-300",
          className,
        )}
        {...props}
      >
        <span
          className={cn(
            "absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ease-in-out",
            checked && "translate-x-5",
          )}
        />
      </button>
    );
  },
);

Switch.displayName = "Switch";

export { Switch };
