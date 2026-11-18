
"use client";

import React from "react";
import { motion } from "framer-motion";

import {
  OrderHeader,
  OrderSummary,
  OrderTable,
  SelectOrderStatus,
} from "@/app/components/ui/OrderManagement";

import { LabelOrder } from "@/app/components/ui/Label";
import { InputOrder } from "@/app/components/ui/Input";

export default function Page() {
  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-dvh bg-gray-50"
    >
      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* Header */}
        <OrderHeader />

        {/* Summary */}
        <OrderSummary />

        {/* Search & Filter */}
        <section className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-800">
            Search & Filter
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

            {/* Search Order */}
            <div>
              <LabelOrder>Search Order</LabelOrder>
              <InputOrder
                type="text"
                placeholder="Order ID / Customer"
              />
            </div>

            {/* Order Status */}
            <div>
              <LabelOrder>Order Status</LabelOrder>
              <SelectOrderStatus />
            </div>

            {/* Start Date */}
            <div>
              <LabelOrder>Start Date</LabelOrder>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* End Date */}
            <div>
              <LabelOrder>End Date</LabelOrder>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

          </div>
        </section>

        {/* Order Table */}
        <OrderTable />

      </div>
    </motion.main>
  );
}
