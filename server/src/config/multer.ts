import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
export const MAX_PRODUCT_IMAGES = 10;
export const PRODUCT_IMAGE_FIELD = "images";
const fileTemp = path.join(process.cwd(), "temp/image/products");
declare global {
  namespace Express {
    interface Request {
      multerError?: {
        type: "multer" | "sharp" | "unknown" | "limit";
        message: string;
        field?: string;
      };
    }
  }
}

function ensureDir(dir: string): string {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

// storage แบบ disk
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ensureDir(fileTemp));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};
// ✅ ประกาศ limits ก่อน
const limits: multer.Options["limits"] = {
  fileSize: 5 * 1024 * 1024, // 5MB
  files: MAX_PRODUCT_IMAGES , // อนุญาตสูงสุด 5 ไฟล์
};

export const upload = multer({
  storage,
  fileFilter,
  limits,
});
