"use strict";
import { faker } from "@faker-js/faker";
import crypto from "crypto";

const generateTagIdCategory = (
  prefix: string = "CT",
  length: number = 8,
): string => {
  // สร้าง random string base36 (0-9a-z)
  const randomPart = crypto
    .randomBytes(length)
    .toString("base64") // แปลงเป็น base64
    .replace(/[^a-zA-Z0-9]/g, "") // กรองให้เหลือแค่ alphanumeric
    .substring(0, length); // ตัดให้ได้ความยาวตามต้องการ
  return `${prefix}${randomPart}`;
};

const generateTagIdProduct = (
  prefix: string = "PRO",
  length: number = 8,
): string => {
  // สร้าง random string base36 (0-9a-z)
  const randomPart = crypto
    .randomBytes(length)
    .toString("base64") // แปลงเป็น base64
    .replace(/[^a-zA-Z0-9]/g, "") // กรองให้เหลือแค่ alphanumeric
    .substring(0, length); // ตัดให้ได้ความยาวตามต้องการ
  return `${prefix}${randomPart}`;
};

const generateTagIdProductImage = (
  prefix: string = "PROIMA",
  length: number = 8,
): string => {
  // สร้าง random string base36 (0-9a-z)
  const randomPart = crypto
    .randomBytes(length)
    .toString("base64") // แปลงเป็น base64
    .replace(/[^a-zA-Z0-9]/g, "") // กรองให้เหลือแค่ alphanumeric
    .substring(0, length); // ตัดให้ได้ความยาวตามต้องการ
  return `${prefix}${randomPart}`;
};

export {
  generateTagIdCategory,
  generateTagIdProduct,
  generateTagIdProductImage,
};
