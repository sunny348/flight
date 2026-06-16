import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

/**
 * Shared Redis client.
 *
 * Redis is treated as a *non-fatal* dependency: if it is unavailable the app
 * keeps serving requests (just without caching). We therefore never let a
 * connection/command error crash the process.
 */
const redis = new Redis(REDIS_URL, {
  lazyConnect: false,
  // Cap reconnect backoff so we don't spam logs when Redis is down.
  retryStrategy: (times) => Math.min(times * 200, 5000),
  maxRetriesPerRequest: 1,
});

let warnedUnavailable = false;
redis.on("error", (err) => {
  // Log once per outage window to avoid flooding logs on every retry.
  if (!warnedUnavailable) {
    console.warn("[redis] connection error, caching disabled:", err.message);
    warnedUnavailable = true;
  }
});
redis.on("ready", () => {
  if (warnedUnavailable) {
    console.log("[redis] connection restored, caching enabled");
    warnedUnavailable = false;
  }
});

/**
 * Get and JSON-parse a cached value. Returns null on miss or any Redis error.
 * @param {string} key
 * @returns {Promise<any|null>}
 */
export const cacheGet = async (key) => {
  try {
    const raw = await redis.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn(`[redis] cacheGet failed for "${key}":`, err.message);
    return null;
  }
};

/**
 * JSON-stringify and store a value with a TTL (seconds). No-op on error.
 * @param {string} key
 * @param {any} value
 * @param {number} ttlSeconds
 */
export const cacheSet = async (key, value, ttlSeconds) => {
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (err) {
    console.warn(`[redis] cacheSet failed for "${key}":`, err.message);
  }
};

export default redis;
