import { Router, Request, Response } from "express";
import ClientAssistantController from "../controllers/clientAssistantController";
const router = Router();
router.post("/client/chat", ClientAssistantController.chat);
export default router;
