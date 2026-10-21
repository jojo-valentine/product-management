import { Router, Request, Response } from "express";
import productRouter from "./product";
import categoryRouter from "./category";
import dashboardRouter from "./dashboard";
import ordersRouter from "./orders";

const router = Router();
router.use("/products", productRouter);
router.use("/category", categoryRouter);
router.use("/orders", ordersRouter);
router.use("/dashboard", dashboardRouter);
router.get("/", (req: Request, res: Response) => {
  //   console.log("API is working!");
  res.send("✅  API is working!");
});
export default router;
