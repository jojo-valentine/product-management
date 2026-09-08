// services/CacheService.ts
import logger from "../config/logger";
import { redisClient } from "../config/redis";
import { ICategory, IProduct } from "../types";

export class CacheService {
  static async clearList(pattern: string): Promise<void> {
    let cursor = "0";
    do {
      if (redisClient) {
        const result = await redisClient.scan(cursor, {
          MATCH: pattern,
          COUNT: 100,
        });

        const nextCursor = result.cursor;
        const foundKeys = result.keys;
        if (foundKeys.length > 0) {
          await redisClient.del(foundKeys);
        }
        cursor = nextCursor;
      } else {
        return;
      }
    } while (cursor !== "0");
  }

  static async clearData(key: string): Promise<void> {
    if (!redisClient) {
      logger.warn("Redis client not initialized, skipping clearData");
      return;
    }

    const cached = await redisClient.get(key);
    logger.info({
      event: "CACHE_VALUE",
      key,
      cached,
    });
    await redisClient.del(key);
  }

  private static async getData<T>(key: string): Promise<T | null> {
    if (!redisClient) {
      return null;
    }
    const data = await redisClient.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  }

  static async setData<T>(key: string, value: T): Promise<void> {
    if (!redisClient) {
      logger.warn("Redis client not initialized, skipping cache set");
      return;
    }

    await redisClient.set(key, JSON.stringify(value), { EX: 300 });
    const exists = await redisClient.exists(key);
    logger.info({
      event: "CACHE_EXISTS",
      key,
      exists,
    });
  }

  static async setProduct(product: any) {
    return this.setData<IProduct>(`product:${product.uuid}`, product);
  }
  static async setCategory(categories: any) {
    return this.setData<ICategory>(`categories:${categories.uuid}`, categories);
  }
  static async clearProductList() {
    return this.clearList("products:*");
  }
  static async clearCategoryList() {
    return this.clearList("products:*");
  }
  static async clearProduct(uuid: string) {
    return this.clearData(`product:${uuid}`);
  }
  static async clearCategory(uuid: string) {
    return this.clearData(`categories:${uuid}`);
  }
  static async getProduct(key: string) {
    return this.getData<IProduct>(key);
  }
  static async getCategory(key: string) {
    return this.getData<ICategory>(key);
  }
}
