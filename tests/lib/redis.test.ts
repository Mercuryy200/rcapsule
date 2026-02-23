/**
 * Redis helper tests.
 *
 * Strategy: mock @upstash/redis with vi.hoisted() so the mock object
 * is available before vi.mock() factories and module imports run.
 * The Redis constructor mock uses a proper function (not arrow) so that
 * `new Redis()` correctly returns our redisMock instance.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Expose the mock instance so tests can control it ──────────────────────
// vi.hoisted() runs BEFORE vi.mock factory AND before module imports,
// so redisMock is guaranteed to exist when the Redis constructor fires.
const redisMock = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
}));

vi.mock("@upstash/redis", () => {
  // Must be a regular function (not arrow) so it works with `new Redis()`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function Redis(this: any) {
    return redisMock;
  }
  return { Redis };
});

import { cacheGet, cacheSet, cacheDel } from "@/lib/redis";

beforeEach(() => {
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://test.upstash.io");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-token");
  redisMock.get.mockReset().mockResolvedValue(null);
  redisMock.set.mockReset().mockResolvedValue("OK");
  redisMock.del.mockReset().mockResolvedValue(1);
});

describe("cacheGet", () => {
  it("returns null on a cache miss", async () => {
    redisMock.get.mockResolvedValue(null);
    const result = await cacheGet("nonexistent-key");
    expect(result).toBeNull();
    expect(redisMock.get).toHaveBeenCalledWith("nonexistent-key");
  });

  it("returns the cached value on a cache hit", async () => {
    redisMock.get.mockResolvedValue({ hello: "world" });
    const result = await cacheGet<{ hello: string }>("test-key");
    expect(result).toEqual({ hello: "world" });
  });

  it("returns null without throwing when Redis rejects", async () => {
    redisMock.get.mockRejectedValue(new Error("Connection refused"));
    await expect(cacheGet("boom")).resolves.toBeNull();
  });
});

describe("cacheSet", () => {
  it("calls redis.set with the correct key, value and TTL option", async () => {
    await cacheSet("my-key", { data: 42 }, 300);
    expect(redisMock.set).toHaveBeenCalledWith("my-key", { data: 42 }, { ex: 300 });
  });

  it("uses the default TTL of 300 when none is provided", async () => {
    await cacheSet("key", "value");
    expect(redisMock.set).toHaveBeenCalledWith("key", "value", { ex: 300 });
  });

  it("does not throw when Redis rejects", async () => {
    redisMock.set.mockRejectedValue(new Error("Write failed"));
    await expect(cacheSet("boom", "value", 60)).resolves.not.toThrow();
  });
});

describe("cacheDel", () => {
  it("calls redis.del with the provided key", async () => {
    await cacheDel("to-delete");
    expect(redisMock.del).toHaveBeenCalledWith("to-delete");
  });

  it("is a no-op when called with no keys (never calls redis.del)", async () => {
    await cacheDel();
    expect(redisMock.del).not.toHaveBeenCalled();
  });

  it("passes multiple keys to redis.del", async () => {
    await cacheDel("key-a", "key-b", "key-c");
    expect(redisMock.del).toHaveBeenCalledWith("key-a", "key-b", "key-c");
  });

  it("does not throw when Redis rejects", async () => {
    redisMock.del.mockRejectedValue(new Error("Del failed"));
    await expect(cacheDel("boom")).resolves.not.toThrow();
  });
});
