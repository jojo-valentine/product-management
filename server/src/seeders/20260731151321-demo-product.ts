import { faker } from "@faker-js/faker";
import { QueryInterface, QueryTypes } from "sequelize";
import { generateTagIdProduct } from "../services/TagService";

export default {
  async up(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const products = [];

      // const categories = await queryInterface.sequelize.query<{ id: number }>(
      //   "SELECT id FROM categories WHERE status = true",
      //   {
      //     type: QueryTypes.SELECT,
      //     transaction,
      //   },
      // );

      // const categoryIds = categories.map((c) => c.id);

      for (let i = 0; i < 20; i++) {
        // const randomCategoryId =
        //   categoryIds[Math.floor(Math.random() * categoryIds.length)];

        products.push({
          uuid: faker.string.uuid(),
          tagId: generateTagIdProduct("PRO"),
          name: faker.commerce.productName(),
          detail: faker.commerce.productDescription(),
          price: faker.number.int({ min: 100, max: 5000 }),
          stock: faker.number.int({ min: 1, max: 100 }),
          status: "active",
          // categoryId: randomCategoryId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      await queryInterface.bulkInsert("products", products, {
        transaction,
      });
      await transaction.commit();
      console.log("✅ Products seeding success!");
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Categories seeding failed:", error);
      throw error; // rethrow เพื่อให้ sequelize-cli รู้ว่าล้มเหลว
    }
  },

  async down(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete("products", {}, { transaction });
      await transaction.commit();
      console.log("✅ Products deleted!");
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Products delete failed:", error);
      throw error;
    }
  },
};
