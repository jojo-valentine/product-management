import express, { Router, Request, Response } from "express";
import productRouter from "./product";
import categoryRouter from "./category";
import dashboardRouter from "./dashboard";
import ordersRouter from "./orders";
import assistantRouter from "./assistant";
import paymentRouter from "./payment";
import mockGatewayRouter from "./mock_gateway";

const router = Router();
router.use("/products", productRouter);
router.use("/category", categoryRouter);
router.use("/orders", ordersRouter);
router.use("/dashboard", dashboardRouter);
router.use("/assistant", assistantRouter);
router.use("/payments", paymentRouter);
router.use("/mock-gateway", mockGatewayRouter);

router.get("/", (req: Request, res: Response) => {
  //   console.log("API is working!");
  res.send("✅  API is working!");
});
// router.post("/api/webhooks/payment");

export default router;
