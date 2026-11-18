import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/app/lib/utils";
import { LabelOrder } from "./Label";
import { InputOrder } from "./Input";

const OrderHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={`mb-6 ${className ?? ""}`} {...props}>
    <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
    <p className="mt-1 text-sm text-gray-500">
      Manage and track customer orders
    </p>
  </div>
));

OrderHeader.displayName = "OrderHeader";

const OrderSummary = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`mb-6 grid grid-cols-1 gap-4 md:grid-cols-3 ${className ?? ""}`}
    {...props}
  >
    {[
      { label: "Total Orders", value: 24 },
      { label: "Pending", value: 8 },
      { label: "Completed", value: 12 },
    ].map((item) => (
      <div
        key={item.label}
        className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
      >
        <p className="text-sm text-gray-500">{item.label}</p>
        <h2 className="mt-2 text-2xl font-bold text-gray-800">{item.value}</h2>
      </div>
    ))}
  </div>
));

OrderSummary.displayName = "OrderSummary";

const OrderTable = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm",
      className,
    )}
    {...props}
  >
    <div className="border-b border-gray-200 p-5">
      <h2 className="font-semibold text-gray-800">Order List</h2>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full whitespace-nowrap text-left">
        <thead className="bg-gray-50 text-sm text-gray-500">
          <tr>
            <th className="px-5 py-4">Order ID</th>
            <th className="px-5 py-4">Customer</th>
            <th className="px-5 py-4">Order Date</th>
            <th className="px-5 py-4">Total</th>
            <th className="px-5 py-4">Payment</th>
            <th className="px-5 py-4">Order Status</th>
            <th className="px-5 py-4">Action</th>
          </tr>
        </thead>

        <OrderTableBody />
      </table>
    </div>
  </div>
));

OrderTable.displayName = "OrderTable";

const OrderTableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={`divide-y divide-gray-100 text-sm ${className ?? ""}`}
    {...props}
  >
    <tr className="hover:bg-gray-50">
      <td className="px-5 py-4 font-medium">#ORD001</td>
      <td className="px-5 py-4">John</td>
      <td className="px-5 py-4">13/11/2026 10:30</td>
      <td className="px-5 py-4">฿1,500</td>
      <td className="px-5 py-4">
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
          Paid
        </span>
      </td>
      <td className="px-5 py-4">
        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
          Pending
        </span>
      </td>
      <td className="px-5 py-4">
        <button className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700">
          View
        </button>
      </td>
    </tr>
  </tbody>
));

OrderTableBody.displayName = "OrderTableBody";

const SelectOrderStatus = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500",
      className,
    )}
    {...props}
  >
    <option value="">All Status</option>
    <option value="pending">Pending</option>
    <option value="processing">Processing</option>
    <option value="completed">Completed</option>
    <option value="cancelled">Cancelled</option>
  </select>
));

SelectOrderStatus.displayName = "SelectOrderStatus";

export {
  OrderHeader,
  OrderSummary,
  OrderTable,
  OrderTableBody,
  SelectOrderStatus,
};
