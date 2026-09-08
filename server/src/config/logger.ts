import pino, { Logger } from "pino";
import fs from "fs";
import path from "path";

const logDir = path.join(__dirname, "../../logs");

// สร้างโฟลเดอร์ logs ถ้ายังไม่มี
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

let logger: Logger;

if (process.env.NODE_ENV === "production") {
  // Production → เขียนลงไฟล์
  console.log("log production working");
  
  const logStream = fs.createWriteStream(path.join(logDir, "app.log"), {
    flags: "a",
  });
  logger = pino(
    {
      level: "info",
    },
    logStream,
  );
} else {
  // Development → log สวยใน console
  logger = pino(
    {
      level: "info",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
    },
  );
}

export default logger;
