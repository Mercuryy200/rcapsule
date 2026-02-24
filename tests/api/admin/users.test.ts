import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/admin/users/route";
import { GET as getById, PATCH, DELETE } from "@/app/api/admin/users/[id]/route";

// ── Mocks ─────────────────────────────────────────────────────────────────
vi.mock("@/auth", () => ({ auth: vi.fn() }));

const mockLimit = vi.fn().mockResolvedValue({ success: true, reset: 0 });

vi.mock("@/lib/ratelimit", () => ({
  apiLimiter: vi.fn(() => ({ limit: mockLimit })),
  rateLimitResponse: vi.fn(() =>
    new Response(JSON.stringify({ error: "Too many requests." }), { status: 429 }),
  ),
}));

/**
 * Chainable, thenable mock for Supabase queries.
 */
function makeChain(resolveWith: object = { data: null, error: null, count: null }) {
  const chain: any = {};
  const returnsThis = ["select", "eq", "or", "order", "range", "limit", "update", "delete", "insert"];

  returnsThis.forEach((m) => {
    chain[m] = vi.fn().mockReturnValue(chain);
  });

  chain.single = vi.fn().mockResolvedValue(resolveWith);
  chain.then = (resolve: any, reject: any) =>
    Promise.resolve(resolveWith).then(resolve, reject);

  return chain;
}

let mockDbChain: ReturnType<typeof makeChain>;
const mockFrom = vi.fn();

vi.mock("@/lib/supabase-server", () => ({
  getSupabaseServer: () => ({ from: mockFrom }),
}));

const adminSession = {
  user: { id: "admin-1", role: "admin" },
  expires: "2099-01-01",
};

function makeRequest(url: string, options?: RequestInit) {
  return new Request(url, options);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockLimit.mockResolvedValue({ success: true, reset: 0 });
  mockDbChain = makeChain({ data: null, error: null, count: 0 });
  mockFrom.mockReturnValue(mockDbChain);
});

// ── GET /api/admin/users ───────────────────────────────────────────────────
describe("GET /api/admin/users", () => {
  it("returns 401 when not authenticated", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce(null);

    const res = await GET(makeRequest("https://example.com/api/admin/users"));
    expect(res.status).toBe(401);
  });

  it("returns 403 when user is not admin", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "u1", role: "user" },
      expires: "2099-01-01",
    } as any);

    const res = await GET(makeRequest("https://example.com/api/admin/users"));
    expect(res.status).toBe(403);
  });

  it("returns 429 when rate limited", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce(adminSession as any);
    mockLimit.mockResolvedValueOnce({ success: false, reset: Date.now() + 60_000 });

    const res = await GET(makeRequest("https://example.com/api/admin/users"));
    expect(res.status).toBe(429);
  });

  it("returns 200 with users list on success", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce(adminSession as any);

    const mockUsers = [{ id: "u1", name: "Alice", role: "user" }];
    mockDbChain.range = vi.fn().mockResolvedValue({ data: mockUsers, error: null, count: 1 });

    const res = await GET(makeRequest("https://example.com/api/admin/users"));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty("users");
    expect(body).toHaveProperty("total");
    expect(Array.isArray(body.users)).toBe(true);
  });

  it("returns 500 when database throws", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce(adminSession as any);

    mockDbChain.range = vi.fn().mockResolvedValue({ data: null, error: new Error("DB fail"), count: null });

    const res = await GET(makeRequest("https://example.com/api/admin/users"));
    expect(res.status).toBe(500);
  });
});

// ── GET /api/admin/users/[id] ──────────────────────────────────────────────
describe("GET /api/admin/users/[id]", () => {
  it("returns 401 when not authenticated", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce(null);

    const res = await getById(
      makeRequest("https://example.com/api/admin/users/u1"),
      { params: Promise.resolve({ id: "u1" }) },
    );
    expect(res.status).toBe(401);
  });

  it("returns 403 when user is not admin", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "u1", role: "user" },
      expires: "2099-01-01",
    } as any);

    const res = await getById(
      makeRequest("https://example.com/api/admin/users/u1"),
      { params: Promise.resolve({ id: "u1" }) },
    );
    expect(res.status).toBe(403);
  });

  it("returns 429 when rate limited", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce(adminSession as any);
    mockLimit.mockResolvedValueOnce({ success: false, reset: Date.now() + 60_000 });

    const res = await getById(
      makeRequest("https://example.com/api/admin/users/u1"),
      { params: Promise.resolve({ id: "u1" }) },
    );
    expect(res.status).toBe(429);
  });

  it("returns 404 when user is not found", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce(adminSession as any);

    mockDbChain.single = vi.fn().mockResolvedValue({ data: null, error: null });

    const res = await getById(
      makeRequest("https://example.com/api/admin/users/u1"),
      { params: Promise.resolve({ id: "u1" }) },
    );
    expect(res.status).toBe(404);
  });

  it("returns 200 with user data on success", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce(adminSession as any);

    const mockUser = { id: "u1", name: "Alice", role: "user" };
    // All three Promise.all queries resolve via single() or the thenable chain
    mockDbChain.single = vi.fn().mockResolvedValue({ data: mockUser, error: null });
    mockDbChain.then = (resolve: any, reject: any) =>
      Promise.resolve({ data: [], error: null, count: 3 }).then(resolve, reject);

    const res = await getById(
      makeRequest("https://example.com/api/admin/users/u1"),
      { params: Promise.resolve({ id: "u1" }) },
    );
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty("user");
    expect(body.user.id).toBe("u1");
  });
});

// ── PATCH /api/admin/users/[id] ────────────────────────────────────────────
describe("PATCH /api/admin/users/[id]", () => {
  it("returns 401 when not authenticated", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce(null);

    const res = await PATCH(
      makeRequest("https://example.com/api/admin/users/u1", {
        method: "PATCH",
        body: JSON.stringify({ role: "admin" }),
      }),
      { params: Promise.resolve({ id: "u1" }) },
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 when no valid fields are provided", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce(adminSession as any);

    const res = await PATCH(
      makeRequest("https://example.com/api/admin/users/u1", {
        method: "PATCH",
        body: JSON.stringify({ unknownField: "value" }),
      }),
      { params: Promise.resolve({ id: "u1" }) },
    );
    expect(res.status).toBe(400);
  });

  it("returns 200 on successful role update", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce(adminSession as any);

    mockDbChain.then = (resolve: any, reject: any) =>
      Promise.resolve({ error: null }).then(resolve, reject);

    const res = await PATCH(
      makeRequest("https://example.com/api/admin/users/u1", {
        method: "PATCH",
        body: JSON.stringify({ role: "admin" }),
      }),
      { params: Promise.resolve({ id: "u1" }) },
    );
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
  });
});

// ── DELETE /api/admin/users/[id] ───────────────────────────────────────────
describe("DELETE /api/admin/users/[id]", () => {
  it("returns 401 when not authenticated", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce(null);

    const res = await DELETE(
      makeRequest("https://example.com/api/admin/users/u1"),
      { params: Promise.resolve({ id: "u1" }) },
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 when trying to delete own account", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "admin-1", role: "admin" },
      expires: "2099-01-01",
    } as any);

    const res = await DELETE(
      makeRequest("https://example.com/api/admin/users/admin-1"),
      { params: Promise.resolve({ id: "admin-1" }) },
    );
    expect(res.status).toBe(400);
  });

  it("returns 200 on successful deletion", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce(adminSession as any);

    mockDbChain.then = (resolve: any, reject: any) =>
      Promise.resolve({ error: null }).then(resolve, reject);

    const res = await DELETE(
      makeRequest("https://example.com/api/admin/users/other-user"),
      { params: Promise.resolve({ id: "other-user" }) },
    );
    expect(res.status).toBe(200);
  });
});
