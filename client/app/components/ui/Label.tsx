import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/app/lib/utils";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

const LabelOrder = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("mb-2 block text-sm font-medium text-gray-700", className)}
      {...props}
    />
  ),
);

LabelOrder.displayName = "LabelOrder";

export { Label, LabelOrder };
