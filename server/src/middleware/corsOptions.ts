import { CorsOptions } from "cors";

export const corsOptions: CorsOptions = {
  origin: [
    "http://localhost:3000",
    // "http://localhost:5000",
    "https://myfrontend.com",
    "redis://localhost:6379",
  ], // whitelist
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
};
