import { describe, it, expect, vi } from "vitest";
import { getIdentifier, rateLimitResponse } from "@/lib/ratelimit";

describe("getIdentifier", () => {
  it("returns user:<id> when userId is provided", () => {
    const req = new Request("https://example.com/api/test");
    expect(getIdentifier(req, "user-123")).toBe("user:user-123");
  });

  it("returns ip:<ip> when no userId is provided", () => {
    const req = new Request("https://example.com/api/test", {
      headers: { "x-forwarded-for": "1.2.3.4" },
    });
    expect(getIdentifier(req)).toBe("ip:1.2.3.4");
  });

  it("uses the first IP from a comma-separated x-forwarded-for header", () => {
    const req = new Request("https://example.com/api/test", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8, 9.10.11.12" },
    });
    expect(getIdentifier(req)).toBe("ip:1.2.3.4");
  });

  it("falls back to ip:unknown when no IP header is present", () => {
    const req = new Request("https://example.com/api/test");
    expect(getIdentifier(req)).toBe("ip:unknown");
  });
});

describe("rateLimitResponse", () => {
  it("returns a 429 response", () => {
    const res = rateLimitResponse(Date.now() + 30_000);
    expect(res.status).toBe(429);
  });

  it("includes a Retry-After header", () => {
    const resetAt = Date.now() + 30_000;
    const res = rateLimitResponse(resetAt);
    const retryAfter = Number(res.headers.get("Retry-After"));
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(30);
  });

  it("includes an X-RateLimit-Reset header", () => {
    const resetAt = Date.now() + 30_000;
    const res = rateLimitResponse(resetAt);
    expect(res.headers.get("X-RateLimit-Reset")).toBeTruthy();
  });

  it("returns Retry-After of 0 when reset time has already passed", () => {
    const pastReset = Date.now() - 5_000;
    const res = rateLimitResponse(pastReset);
    expect(Number(res.headers.get("Retry-After"))).toBe(0);
  });

  it("returns body with error message", async () => {
    const res = rateLimitResponse(Date.now() + 10_000);
    const body = await res.json();
    expect(body).toHaveProperty("error");
    expect(typeof body.error).toBe("string");
  });
});
