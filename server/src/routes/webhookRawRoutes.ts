import express, { Router, Request, Response } from "express";
import webhookRoutes from "./webhook";

const router = Router();

router.use(
  "/",
  express.raw({ type: "application/json" }),
  webhookRoutes,
);
router.get("/", (req: Request, res: Response) => {
  //   console.log("API is working!");
  res.send("✅  API is working!");
});
// router.post("/api/webhooks/payment");

export default router;
