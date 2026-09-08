import { faker } from "@faker-js/faker";
import crypto from "crypto";
import { QueryInterface, QueryTypes } from "sequelize";

const generateTagIdProduct = (
  prefix: string = "PRO",
  length: number = 8,
): string => {
  const randomPart = crypto
    .randomBytes(length)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, length);
  return `${prefix}${randomPart}`;
};

export default {
  async up(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. ดึง product id ทั้งหมด
      const products = await queryInterface.sequelize.query<{ id: number }>(
        "SELECT id FROM products WHERE status = 'active';",
        { type: QueryTypes.SELECT, transaction },
      );
      const productIds = products.map((p) => p.id);

      // 2. สร้าง images
      const images: any[] = [];
      for (let i = 0; i < 30; i++) {
        const randomProductId =
          productIds[Math.floor(Math.random() * productIds.length)];

        images.push({
          uuid: faker.string.uuid(),
          productId: randomProductId,
          path: faker.image.urlPicsumPhotos(),
          image: faker.image.urlPicsumPhotos(),
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // 3. insert พร้อม transaction
      await queryInterface.bulkInsert("product_images", images, {
        transaction,
      });

      // 4. commit
      await transaction.commit();
      console.log("✅ Product_images seeding success!");
    } catch (error) {
      // rollback ถ้า error
      await transaction.rollback();
      console.error("❌ Product_images seeding failed:", error);
      throw error;
    }
  },

  async down(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete("product_images", {}, { transaction });
      await transaction.commit();
      console.log("✅ Product_images deleted!");
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Product_images delete failed:", error);
      throw error;
    }
  },
};
