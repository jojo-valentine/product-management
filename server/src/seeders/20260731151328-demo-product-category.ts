import { faker } from "@faker-js/faker";
import crypto from "crypto";
import { QueryInterface, QueryTypes } from "sequelize";

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
      const categories = await queryInterface.sequelize.query<{ id: number }>(
        "SELECT id FROM categories WHERE status = true",
        {
          type: QueryTypes.SELECT,
          transaction,
        },
      );

      const categoryIds = categories.map((c) => c.id);
      // 2. สร้าง images
      const product_categories: any[] = [];
      const usedPairs = new Set<string>();
      for (let i = 0; i < 30; i++) {
        let randomProductId, randomCategoryId, key;
        do {
          randomProductId =
            productIds[Math.floor(Math.random() * productIds.length)];
          randomCategoryId =
            categoryIds[Math.floor(Math.random() * categoryIds.length)];
          key = `${randomProductId}-${randomCategoryId}`;
        } while (usedPairs.has(key));
        usedPairs.add(key);
        product_categories.push({
          uuid: faker.string.uuid(),
          productId: randomProductId,
          categoryId: randomCategoryId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // 3. insert พร้อม transaction
      await queryInterface.bulkInsert(
        "product_categories",
        product_categories,
        {
          transaction,
        },
      );

      // 4. commit
      await transaction.commit();
      console.log("✅ product_categories seeding success!");
    } catch (error) {
      // rollback ถ้า error
      await transaction.rollback();
      console.error("❌ product_categories seeding failed:", error);
      throw error;
    }
  },

  async down(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete(
        "product_categories",
        {},
        { transaction },
      );
      await transaction.commit();
      console.log("✅ product_categories deleted!");
    } catch (error) {
      await transaction.rollback();
      console.error("❌ product_categories delete failed:", error);
      throw error;
    }
  },
};
