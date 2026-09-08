import express from "express";
import cors from "cors";
import { sequelize } from "./config/database";
import { corsOptions } from "./middleware/corsOptions";
import apiRoutes from "./routes";
import { apiLimiter } from "./middleware/rateLimit";
import { connectRedis } from "./config/redis";
import helmet from "helmet";
import { setupSwagger } from "./config/swagger";
import path from "path";

const app = express();

// เปิดใช้งาน CORS แบบ pro (ใช้ config แยก)
app.use(cors(corsOptions));

// Middleware สำหรับ JSON
app.use(express.json());

setupSwagger(app);

app.use(
  "/uploads",
  express.static(path.resolve(process.cwd(), "uploads")), // ใช้ root ของ project
); // รองรับ form submit (x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use("/api", apiLimiter);
app.use("/api", apiRoutes);
async function startServer() {
  try {
    try {
      await sequelize.authenticate();
      console.log("✅ Database connected successfully");
    } catch (error) {
      console.error("❌ Unable to connect to the database:", error);
      return;
    }

    await connectRedis();
    app.listen(process.env.PORT ?? 4000, () => {
      console.log(
        `🚀 Server running on http://localhost:${process.env.PORT ?? 4000}`,
      );
    });
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
  }
}

startServer();
