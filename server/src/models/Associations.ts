import Product from "./Product";
import Category from "./Category";
import ProductImage from "./ProductImage";
import Order from "./Order";
import OrderItem from "./OrderItem";
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
Order.hasMany(OrderItem, {
  foreignKey: "orderId",
  as: "items",
});

OrderItem.belongsTo(Order, {
  foreignKey: "orderId",
  as: "order",
});

Product.hasMany(OrderItem, {
  foreignKey: "productId",
  as: "orderItems",
});

OrderItem.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});

export { Product, Category, ProductImage, ProductCategories, Order, OrderItem };
