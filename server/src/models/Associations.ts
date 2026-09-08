import Product from "./Product";
import Category from "./Category";
import ProductImage from "./ProductImage";
import ProductCategories from "./ProductCategories";

// One-to-many
Product.hasMany(ProductImage, { foreignKey: "productId", as: "images" });
ProductImage.belongsTo(Product, { foreignKey: "productId", as: "product" });

// Many-to-many
Product.belongsToMany(Category, {
  through: ProductCategories,
  foreignKey: "productId",
  as: "categories",
});
Category.belongsToMany(Product, {
  through: ProductCategories,
  foreignKey: "categoryId",
  as: "products",
});

export { Product, Category, ProductImage, ProductCategories };
