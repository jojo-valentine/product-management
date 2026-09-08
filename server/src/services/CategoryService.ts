import Category from "../models/Category";
import { Op } from "sequelize";

async function isCategoryNameExists(
  name: string,
  excludeId?: string,
): Promise<boolean> {
  const existing = await Category.findOne({
    where: excludeId ? { name, uuid: { [Op.ne]: excludeId } } : { name },
  });
  // create → ใช้ { name } → เช็กว่ามีชื่อซ้ำหรือไม่
  // update → ใช้ { name, uuid: { [Op.ne]: excludeId } } → เช็กว่ามีชื่อซ้ำ แต่ไม่รวม record ของตัวเอง
  return !!existing;
}
async function categoryIdsExist(ids: string[]): Promise<boolean> {
  const categories = await Category.findAll({
    where: { uuid: { [Op.in]: ids } },
  });
  return categories.length === ids.length;
}
async function categoryIdExist(id: string): Promise<boolean> {
  const category = await Category.findOne({
    where: { uuid: id },
  });

  if (!category) {
    throw new Error(`Category id ${id} not found`);
  }

  return true;
}
async function getCategoryIdsFromUuids(uuids: string[]): Promise<number[]> {
  const categories = await Category.findAll({
    where: { uuid: { [Op.in]: uuids }, deletedAt: null },
    attributes: ["id"],
  });

  return categories.map((c) => c.id);
}
function normalizeCategoryIds(input: string[] | string): string[] {
  if (Array.isArray(input)) {
    return input.flatMap((item) =>
      item.includes(",") ? item.split(",") : item,
    );
  }
  return input.split(",");
}

export {
  isCategoryNameExists,
  categoryIdsExist,
  categoryIdExist,
  getCategoryIdsFromUuids,
  normalizeCategoryIds,
};
