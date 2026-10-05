import { describe, it, expect, vi, beforeEach } from "vitest";
import { CacheService } from "../services/CacheService";
import { redisClient } from "../config/redis";

vi.mock("../config/redis", () => ({
  redisClient: {
    set: vi.fn(),
    exists: vi.fn(),
    get: vi.fn(),
    del: vi.fn(),
    scan: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("CacheService.setData", () => {
  it("should save data to Redis", async () => {
    vi.mocked(redisClient!.set).mockResolvedValue("OK");
    vi.mocked(redisClient!.exists).mockResolvedValue(1);

    await CacheService.setData("test:key", {
      name: "Test Product",
    });

    expect(redisClient!.set).toHaveBeenCalledWith(
      "test:key",
      JSON.stringify({
        name: "Test Product",
      }),
      { EX: 300 },
    );

    expect(redisClient!.exists).toHaveBeenCalledWith("test:key");
  });
});

describe("CacheService.getProduct", () => {
  it("should return product from Redis when cache exists", async () => {
    const product = {
      uuid: "product-uuid",
      name: "Test Product",
    };

    vi.mocked(redisClient!.get).mockResolvedValue(JSON.stringify(product));

    const result = await CacheService.getProduct("product:product-uuid");

    expect(result).toEqual(product);

    expect(redisClient!.get).toHaveBeenCalledWith("product:product-uuid");
  });
  it("should return null when product is not found in Redis", async () => {
    // ตรงนี้คิดเองก่อนว่า mock redisClient.get
    vi.mocked(redisClient!.get).mockResolvedValue(null);

    const result = await CacheService.getProduct("products:not-found");

    expect(result).toBeNull();
    expect(redisClient!.get).toHaveBeenCalledWith("products:not-found");
  });
});

describe("CacheService.getCategory", () => {
  it("should return category from Redis when cache exists", async () => {
    const category = {
      uuid: "category-uuid",
      name: "Electronics",
    };

    vi.mocked(redisClient!.get).mockResolvedValue(JSON.stringify(category));

    const result = await CacheService.getCategory("categories:category-uuid");

    expect(result).toEqual(category);

    expect(redisClient!.get).toHaveBeenCalledWith("categories:category-uuid");
  });

  it("should return null when category is not found in Redis", async () => {
    vi.mocked(redisClient!.get).mockResolvedValue(null);

    const result = await CacheService.getCategory("categories:not-found");

    expect(result).toBeNull();

    expect(redisClient!.get).toHaveBeenCalledWith("categories:not-found");
  });
});

describe("CacheService.clearData", () => {
  it("should delete cache when data exists", async () => {
    vi.mocked(redisClient!.get).mockResolvedValue(
      JSON.stringify({
        uuid: "product-uuid",
        name: "Test Product",
      }),
    );

    vi.mocked(redisClient!.del).mockResolvedValue(1);

    await CacheService.clearData("product:product-uuid");

    expect(redisClient!.get).toHaveBeenCalledWith("product:product-uuid");

    expect(redisClient!.del).toHaveBeenCalledWith("product:product-uuid");
  });

  it("should delete cache when data does not exist", async () => {
    vi.mocked(redisClient!.get).mockResolvedValue(null);
    vi.mocked(redisClient!.del).mockResolvedValue(0);

    await CacheService.clearData("product:not-found");

    expect(redisClient!.get).toHaveBeenCalledWith("product:not-found");

    expect(redisClient!.del).toHaveBeenCalledWith("product:not-found");
  });
});

describe("CacheService.clearList", () => {
  it("should delete matching cache keys", async () => {
    vi.mocked(redisClient!.scan).mockResolvedValue({
      cursor: "0",
      keys: ["products:page=1", "products:page=2"],
    });

    await CacheService.clearList("products:*");

    expect(redisClient!.del).toHaveBeenCalledWith([
      "products:page=1",
      "products:page=2",
    ]);
  });
  it("should not delete when no cache keys are found", async () => {
    vi.mocked(redisClient!.scan).mockResolvedValue({
      cursor: "0",
      keys: [],
    });

    await CacheService.clearList("products:*");

    expect(redisClient!.del).not.toHaveBeenCalled();
  });
});

describe("CacheService.clearProduct", () => {
  it("should clear product cache", async () => {
    const spy = vi.spyOn(CacheService, "clearData").mockResolvedValue();

    await CacheService.clearProduct("product-123");

    expect(spy).toHaveBeenCalledWith("product:product-123");
  });
});

describe("CacheService.clearCategory", () => {
  it("should clear category cache", async () => {
    const spy = vi.spyOn(CacheService, "clearData").mockResolvedValue();

    await CacheService.clearCategory("category-123");

    expect(spy).toHaveBeenCalledWith("categories:category-123");
  });
});
