import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  // windowMs: 15 * 60 * 1000, // 15 นาที
  // limit: 1000, // 100 requests/IP
  windowMs: 60 * 1000, // 1 นาที
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});
