import { createClient } from "redis";

export let redisClient: ReturnType<typeof createClient> | null = null;

if (process.env.REDIS_URL) {
  redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
      reconnectStrategy: () => false, // ไม่ retry ซ้ำๆ ถ้าต่อไม่ได้
    },
  });

  redisClient.on("error", (err) => {
    console.error("❌ Redis Error:", err.message);
    redisClient = null; // ❗ ตัด client ทิ้งทันทีที่ error เพื่อไม่ให้โค้ดอื่นเรียกซ้ำ
  });

  redisClient.on("ready", () => {
    console.log("✅ Redis Ready");
  });
}

export const connectRedis = async () => {
  if (!process.env.REDIS_URL || !redisClient) {
    console.warn("⚠️ Redis not configured, skipping cache");
    return;
  }

  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (err) {
    console.warn("⚠️ Redis connection failed, cache disabled:", err);
    redisClient = null; // ❗ ต่อไม่ได้ → ปิด cache ทั้งหมด ให้ server รันต่อแบบไม่มี cache
  }
};