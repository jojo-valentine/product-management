import { QueryInterface } from "sequelize";

import categorySeeder from "./20260731151314-demo-category";
import productSeeder from "./20260731151321-demo-product";
import productImageSeeder from "./20260731151327-demo-product-image";
import productCategoriesSeeder from "./20260731151328-demo-product-category";

export default {
  async up(queryInterface: QueryInterface) {
    await categorySeeder.up(queryInterface);
    await productSeeder.up(queryInterface);
    await productImageSeeder.up(queryInterface);
    await productCategoriesSeeder.up(queryInterface);
  },

  async down(queryInterface: QueryInterface) {
    await productCategoriesSeeder.down(queryInterface);
    await productImageSeeder.down(queryInterface);
    await productSeeder.down(queryInterface);
    await categorySeeder.down(queryInterface);
  },
};
