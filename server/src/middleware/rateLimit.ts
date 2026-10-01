import rateLimit from "express-rate-limit";

const isLoadTest = process.env.LOAD_TEST === "true";

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isLoadTest ? 100000 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});