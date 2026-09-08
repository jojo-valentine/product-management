import { faker } from "@faker-js/faker";
import { QueryInterface } from "sequelize";
import { generateTagIdCategory } from "../services/TagService";

export default {
  async up(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const categories: any[] = [];

      for (let i = 0; i < 10; i++) {
        categories.push({
          uuid: faker.string.uuid(),
          tagId: generateTagIdCategory("CT"),
          name: faker.commerce.department(),
          description: faker.commerce.productDescription(),
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      await queryInterface.bulkInsert("categories", categories, {
        transaction,
      });
      await transaction.commit();
      console.log("✅ Categories seeding success!");
    } catch (error) {
      console.error("❌ Categories seeding failed:", error);
      throw error; // rethrow เพื่อให้ sequelize-cli รู้ว่าล้มเหลว
    }
  },

  async down(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete("categories", {}, { transaction });
      await transaction.commit();
      console.log("✅ Categories deleted!");
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Categories delete failed:", error);
      throw error;
    }
  },
};
