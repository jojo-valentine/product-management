import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  validateProductUpdateStatus,
  validateStatus,
  productSchema,
  validateProductUpdate,
  validateProduct,
  validateCheckIdProduct,
  validateProductImageLimit,
  useValidation,
} from "../validations/product";
import Product from "../models/Product";
import ProductImage from "../models/ProductImage";

const { mockCategoryIdsExist } = vi.hoisted(() => ({
  mockCategoryIdsExist: vi.fn(),
}));

vi.mock("../services/CategoryService", () => ({
  categoryIdsExist: mockCategoryIdsExist,
  normalizeCategoryIds: vi.fn((ids) => ids),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("validateProductUpdateStatus", () => {
  it("should pass when status is valid", async () => {
    const result = await validateProductUpdateStatus({
      status: "active",
    });

    expect(result.errors).toEqual([]);
    expect(result.data).toBeDefined();
  });

  it("should fail when status is invalid", async () => {
    const result = await validateProductUpdateStatus({
      status: "invalid",
    });

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.data).toBeNull();
  });

  it("should return 400 when validation fails", () => {
    const req = {
      body: {
        status: "invalid-status",
      },
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;

    const next = vi.fn();

    const middleware = useValidation(schema);

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      message: "Validation error",
      errors: [
        {
          field: "status",
          message: expect.any(String),
        },
      ],
    });

    expect(next).not.toHaveBeenCalled();
  });
});

describe("productSchema.create", () => {
  it("should pass with valid product data", () => {
    const result = productSchema.create.safeParse({
      name: "Test Product",
      detail: "Test product detail",
      price: 100,
      stock: 10,
      status: "active",
      categoryIds: [],
    });

    expect(result.success).toBe(true);
  });

  it("should fail when price is less than 1", () => {
    const result = productSchema.create.safeParse({
      name: "Test Product",
      detail: "Test product detail",
      price: 0,
      stock: 10,
      status: "active",
      categoryIds: [],
    });

    expect(result.success).toBe(false);
  });
});

describe("productSchema.update", () => {
  it("should pass with valid product data", () => {
    const result = productSchema.update.safeParse({
      name: "Test Product",
      detail: "Test product detail",
      price: 100,
      stock: 10,
      categoryIds: [],
    });

    expect(result.success).toBe(true);
  });

  it("should fail when price is less than 1", () => {
    const result = productSchema.update.safeParse({
      name: "Test Product",
      detail: "Test product detail",
      price: 0,
      stock: 10,
      categoryIds: [],
    });

    expect(result.success).toBe(false);
  });
});

describe("validateProductUpdate", () => {
  it("should pass with valid product data", async () => {
    mockCategoryIdsExist.mockResolvedValue(true);

    const result = await validateProductUpdate({
      name: "Test Product",
      detail: "Test product detail",
      price: 100,
      stock: 10,
      categoryIds: [],
    });

    expect(result.errors).toEqual([]);
    expect(result.data).toBeDefined();
  });

  it("should fail when category does not exist", async () => {
    mockCategoryIdsExist.mockResolvedValue(false);

    // console.log(
    //   "MOCK RESULT:",
    //   await mockCategoryIdsExist(["invalid-category-id"]),
    // );

    const result = await validateProductUpdate({
      name: "Test Product",
      detail: "Test product detail",
      price: 100,
      stock: 10,
      categoryIds: ["invalid-category-id"],
    });

    // console.log("MOCK CALL:", mockCategoryIdsExist.mock.calls);
    // console.log("RESULT:", result);

    expect(mockCategoryIdsExist).toHaveBeenCalled();
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].field).toBe("categoryIds");
    expect(result.errors[0].message).toBe("Some categoryIds do not exist");
  });
});

describe("validateStatus", () => {
  it("should pass when status is valid", async () => {
    const result = await validateStatus("active");

    expect(result.errors).toEqual([]);
    expect(result.data).toBeDefined();
  });

  it("should fail when status is invalid", async () => {
    const result = await validateStatus("invalid");

    expect(result.errors).toHaveLength(1);
    expect(result.data).toBeNull();
  });
});

describe("validateProduct", () => {
  it("should pass with valid product data", async () => {
    mockCategoryIdsExist.mockResolvedValue(true);

    const req = {
      body: {
        name: "Test Product",
        detail: "Test product detail",
        price: 100,
        stock: 10,
        status: "active",
        categoryIds: [],
      },
      files: undefined,
      multerError: undefined,
    } as any;

    const res = {} as any;

    const result = await validateProduct(req, res);

    expect(result).toEqual({
      errors: [],
      data: expect.any(Object),
    });
  });

  it("should fail when price is less than 1", async () => {
    const req = {
      body: {
        name: "Test Product",
        detail: "Test product detail",
        price: 0,
        stock: 10,
        status: "active",
        categoryIds: [],
      },
      files: undefined,
      multerError: undefined,
    } as any;

    const res = {} as any;

    const result = await validateProduct(req, res);

    expect(result).toEqual({
      errors: [
        {
          field: "price",
          message: "Price must be at least 1",
        },
      ],
      data: null,
    });
  });

  it("should fail when category does not exist", async () => {
    mockCategoryIdsExist.mockResolvedValue(false);

    const req = {
      body: {
        name: "Test Product",
        detail: "Test product detail",
        price: 100,
        stock: 10,
        status: "active",
        categoryIds: ["invalid-category-id"],
      },
      files: undefined,
      multerError: undefined,
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;

    await validateProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      message: "Validation error",
      errors: [
        {
          field: "categoryIds",
          message: "Some categoryIds do not exist",
        },
      ],
    });
  });

  it("should fail when multer has an error", async () => {
    mockCategoryIdsExist.mockResolvedValue(true);

    const req = {
      body: {
        name: "Test Product",
        detail: "Test product detail",
        price: 100,
        stock: 10,
        status: "active",
        categoryIds: [],
      },
      files: undefined,

      // จำลอง Multer error
      multerError: {
        field: "images",
        message: "Too many files",
      },
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;

    await validateProduct(req, res);
    // console.dir(res.json.mock.calls, { depth: null });
    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      message: "Validation error",
      errors: [
        {
          field: "images",
          message: "Too many files",
        },
      ],
    });
  });
});
describe("validateCheckIdProduct", () => {
  it("should return product when product exists", async () => {
    vi.spyOn(Product, "findOne").mockResolvedValue({
      id: 1,
    } as any);

    const result = await validateCheckIdProduct("product-uuid");

    expect(result).toEqual({
      id: 1,
    });

    expect(Product.findOne).toHaveBeenCalledWith({
      where: {
        uuid: "product-uuid",
      },
      attributes: ["id"],
    });
  });
  it("should return null when product does not exist", async () => {
    vi.spyOn(Product, "findOne").mockResolvedValue(null);

    const result = await validateCheckIdProduct("not-found-uuid");

    expect(result).toBeNull();

    expect(Product.findOne).toHaveBeenCalledWith({
      where: {
        uuid: "not-found-uuid",
      },
      attributes: ["id"],
    });
  });
});
describe("validateProductImageLimit", () => {
  it("should return product when product image limit", async () => {
    vi.spyOn(Product, "findOne").mockResolvedValue({
      id: 1,
    } as any);
    vi.spyOn(ProductImage, "count").mockResolvedValue(2);

    const result = await validateProductImageLimit("product-uuid", 3);

    expect(result).toEqual({
      exists: true,
      valid: true,
      currentImageCount: 2,
    });
  });
  it("should return invalid when product image limit is exceeded", async () => {
    vi.spyOn(Product, "findOne").mockResolvedValue({
      id: 1,
    } as any);

    vi.spyOn(ProductImage, "count").mockResolvedValue(2);

    const result = await validateProductImageLimit("product-uuid", 9);

    expect(result).toEqual({
      exists: true,
      valid: false,
      currentImageCount: 2,
    });
  });

  it("should return invalid when product does not exist", async () => {
    vi.spyOn(Product, "findOne").mockResolvedValue(null);

    const result = await validateProductImageLimit("product-uuid", 9);

    expect(result).toEqual({
      exists: false,
      valid: false,
      currentImageCount: 0,
    });
  });
});
const schema = {
  body: productSchema.changeStatus,
};

describe("useValidation", () => {
  it("should call next when validation passes", () => {
    const req = {
      body: {
        status: "active",
      },
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;

    const next = vi.fn();

    const middleware = useValidation(schema);

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
  it("should update req.body with parsed data", () => {
    const req = {
      body: {
        status: "active",
      },
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;

    const next = vi.fn();

    const middleware = useValidation(schema);

    middleware(req, res, next);

    expect(req.body).toEqual({
      status: "active",
    });

    expect(next).toHaveBeenCalled();
  });
});
