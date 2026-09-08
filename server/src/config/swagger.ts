import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Category API",
      version: "1.0.0",
      description: "API documentation for Category service",
    },
  },
  apis: ["src/routes/**/*.ts", "dist/routes/**/*.js"], // ✅ path ไปยังไฟล์ที่มี JSDoc comments
  //   "src/routes/**/*.ts" → ให้ไปอ่านไฟล์ .ts ทั้งหมดในโฟลเดอร์ src/routes และ subfolder
  // "dist/routes/**/*.js" → ให้ไปอ่านไฟล์ .js ที่ถูก build แล้ว (จาก TypeScript → JavaScript) ในโฟลเดอร์ dist/routes
};
const swaggerSpec = swaggerJsdoc(options);

console.log((swaggerSpec as any).paths);

export function setupSwagger(app: Express) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
