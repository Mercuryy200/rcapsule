import { describe, it, expect, vi, beforeEach } from "vitest";
import { requireAdmin } from "@/lib/admin";

vi.mock("@/auth", () => ({ auth: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("requireAdmin", () => {
  it("returns a 401 error when there is no session", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce(null);

    const result = await requireAdmin();

    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error.status).toBe(401);
    }
  });

  it("returns a 401 error when session has no user id", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce({
      user: {},
      expires: "2099-01-01",
    } as any);

    const result = await requireAdmin();

    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error.status).toBe(401);
    }
  });

  it("returns a 403 error when user role is not admin", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user-1", role: "user" },
      expires: "2099-01-01",
    } as any);

    const result = await requireAdmin();

    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error.status).toBe(403);
    }
  });

  it("returns the session when user has the admin role", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "admin-1", role: "admin" },
      expires: "2099-01-01",
    } as any);

    const result = await requireAdmin();

    expect("session" in result).toBe(true);
    if ("session" in result) {
      expect(result.session.user.id).toBe("admin-1");
    }
  });

  it("response bodies contain the correct error messages", async () => {
    const { auth } = await import("@/auth");

    vi.mocked(auth).mockResolvedValueOnce(null);
    const result401 = await requireAdmin();
    if ("error" in result401) {
      const body = await result401.error.json();
      expect(body.error).toMatch(/unauthorized/i);
    }

    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "u1", role: "user" },
      expires: "2099-01-01",
    } as any);
    const result403 = await requireAdmin();
    if ("error" in result403) {
      const body = await result403.error.json();
      expect(body.error).toMatch(/forbidden/i);
    }
  });
});
