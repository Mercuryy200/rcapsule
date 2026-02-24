import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/admin/reports/route";
import { PATCH } from "@/app/api/admin/reports/[id]/route";

// ── Mocks ─────────────────────────────────────────────────────────────────
vi.mock("@/auth", () => ({ auth: vi.fn() }));

const mockLimit = vi.fn().mockResolvedValue({ success: true, reset: 0 });

vi.mock("@/lib/ratelimit", () => ({
  apiLimiter: vi.fn(() => ({ limit: mockLimit })),
  rateLimitResponse: vi.fn(() =>
    new Response(JSON.stringify({ error: "Too many requests." }), { status: 429 }),
  ),
}));

function makeChain(resolveWith: object = { data: null, error: null, count: null }) {
  const chain: any = {};
  const returnsThis = ["select", "eq", "or", "order", "range", "update", "not", "limit"];

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

const mockReport = {
  id: "r1",
  reporterId: "u1",
  targetType: "Clothes",
  targetId: "c1",
  reason: "spam",
  status: "pending",
  createdAt: "2024-01-01T00:00:00.000Z",
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

// ── GET /api/admin/reports ─────────────────────────────────────────────────
describe("GET /api/admin/reports", () => {
  it("returns 401 when not authenticated", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce(null);

    const res = await GET(makeRequest("https://example.com/api/admin/reports"));
    expect(res.status).toBe(401);
  });

  it("returns 403 when user is not admin", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "u1", role: "user" },
      expires: "2099-01-01",
    } as any);

    const res = await GET(makeRequest("https://example.com/api/admin/reports"));
    expect(res.status).toBe(403);
  });

  it("returns 429 when rate limited", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce(adminSession as any);
    mockLimit.mockResolvedValueOnce({ success: false, reset: Date.now() + 60_000 });

    const res = await GET(makeRequest("https://example.com/api/admin/reports"));
    expect(res.status).toBe(429);
  });

  it("returns 200 with reports list on success", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce(adminSession as any);

    // Resolve the thenable chain with report data
    mockDbChain.then = (resolve: any, reject: any) =>
      Promise.resolve({ data: [mockReport], error: null, count: 1 }).then(resolve, reject);

    const res = await GET(makeRequest("https://example.com/api/admin/reports"));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty("reports");
    expect(body).toHaveProperty("total");
    expect(Array.isArray(body.reports)).toBe(true);
  });

  it("filters by status when query param is set", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce(adminSession as any);

    // Default chain (resolves with null data → empty array → 200)
    const res = await GET(
      makeRequest("https://example.com/api/admin/reports?status=pending"),
    );
    expect(res.status).toBe(200);
    expect(mockDbChain.eq).toHaveBeenCalledWith("status", "pending");
  });

  it("returns 500 when database throws", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce(adminSession as any);

    // Resolve with a truthy error → route does `if (error) throw error`
    mockDbChain.then = (resolve: any, reject: any) =>
      Promise.resolve({ data: null, error: { message: "DB fail" }, count: null }).then(resolve, reject);

    const res = await GET(makeRequest("https://example.com/api/admin/reports"));
    expect(res.status).toBe(500);
  });
});

// ── PATCH /api/admin/reports/[id] ─────────────────────────────────────────
describe("PATCH /api/admin/reports/[id]", () => {
  it("returns 401 when not authenticated", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce(null);

    const res = await PATCH(
      makeRequest("https://example.com/api/admin/reports/r1", {
        method: "PATCH",
        body: JSON.stringify({ status: "resolved" }),
      }),
      { params: Promise.resolve({ id: "r1" }) },
    );
    expect(res.status).toBe(401);
  });

  it("returns 403 when user is not admin", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "u1", role: "user" },
      expires: "2099-01-01",
    } as any);

    const res = await PATCH(
      makeRequest("https://example.com/api/admin/reports/r1", {
        method: "PATCH",
        body: JSON.stringify({ status: "resolved" }),
      }),
      { params: Promise.resolve({ id: "r1" }) },
    );
    expect(res.status).toBe(403);
  });

  it("returns 429 when rate limited", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce(adminSession as any);
    mockLimit.mockResolvedValueOnce({ success: false, reset: Date.now() + 60_000 });

    const res = await PATCH(
      makeRequest("https://example.com/api/admin/reports/r1", {
        method: "PATCH",
        body: JSON.stringify({ status: "resolved" }),
      }),
      { params: Promise.resolve({ id: "r1" }) },
    );
    expect(res.status).toBe(429);
  });

  it("returns 400 for an invalid status value", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce(adminSession as any);

    const res = await PATCH(
      makeRequest("https://example.com/api/admin/reports/r1", {
        method: "PATCH",
        body: JSON.stringify({ status: "invalidstatus" }),
      }),
      { params: Promise.resolve({ id: "r1" }) },
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when status is missing", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce(adminSession as any);

    const res = await PATCH(
      makeRequest("https://example.com/api/admin/reports/r1", {
        method: "PATCH",
        body: JSON.stringify({}),
      }),
      { params: Promise.resolve({ id: "r1" }) },
    );
    expect(res.status).toBe(400);
  });

  it("returns 200 with updated report for valid status values", async () => {
    const { auth } = await import("@/auth");
    const validStatuses = ["reviewed", "resolved", "dismissed"];

    for (const status of validStatuses) {
      vi.mocked(auth).mockResolvedValueOnce(adminSession as any);
      const updatedReport = { ...mockReport, status };
      mockDbChain.single = vi.fn().mockResolvedValue({ data: updatedReport, error: null });

      const res = await PATCH(
        makeRequest("https://example.com/api/admin/reports/r1", {
          method: "PATCH",
          body: JSON.stringify({ status }),
        }),
        { params: Promise.resolve({ id: "r1" }) },
      );
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.status).toBe(status);
    }
  });
});
