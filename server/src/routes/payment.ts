import { Router, Request, Response } from "express";
import paymentController from "../controllers/paymentController";
const router = Router();

router.post("/create", paymentController.createPayment);

router.get("/", (req: Request, res: Response) => {
  //   console.log("API is working!");
  res.send("✅  API is working!");
});
export default router;
