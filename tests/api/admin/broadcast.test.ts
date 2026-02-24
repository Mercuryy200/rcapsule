import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/admin/broadcast/route";

// ── Mocks ─────────────────────────────────────────────────────────────────
vi.mock("@/auth", () => ({ auth: vi.fn() }));

const mockLimit = vi.fn().mockResolvedValue({ success: true, reset: 0 });

vi.mock("@/lib/ratelimit", () => ({
  heavyLimiter: vi.fn(() => ({ limit: mockLimit })),
  rateLimitResponse: vi.fn(() =>
    new Response(JSON.stringify({ error: "Too many requests." }), { status: 429 }),
  ),
}));

function makeChain(resolveWith: object = { data: null, error: null }) {
  const chain: any = {};
  const returnsThis = ["select", "eq", "order", "range", "limit", "insert"];

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

function makePostRequest(body: object) {
  return new Request("https://example.com/api/admin/broadcast", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockLimit.mockResolvedValue({ success: true, reset: 0 });
  mockDbChain = makeChain();
  mockFrom.mockReturnValue(mockDbChain);
});

// ── Tests ─────────────────────────────────────────────────────────────────
describe("POST /api/admin/broadcast", () => {
  it("returns 401 when not authenticated", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce(null);

    const res = await POST(makePostRequest({ title: "Hello", message: "World" }));
    expect(res.status).toBe(401);
  });

  it("returns 403 when user is not admin", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "u1", role: "user" },
      expires: "2099-01-01",
    } as any);

    const res = await POST(makePostRequest({ title: "Hello", message: "World" }));
    expect(res.status).toBe(403);
  });

  it("returns 429 when rate limited", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce(adminSession as any);
    mockLimit.mockResolvedValueOnce({ success: false, reset: Date.now() + 60_000 });

    const res = await POST(makePostRequest({ title: "Hello", message: "World" }));
    expect(res.status).toBe(429);
  });

  it("returns 400 when title is missing", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce(adminSession as any);

    const res = await POST(makePostRequest({ message: "World" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when message is missing", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce(adminSession as any);

    const res = await POST(makePostRequest({ title: "Hello" }));
    expect(res.status).toBe(400);
  });

  it("returns 200 with sent:0 when there are no users", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce(adminSession as any);

    // Users query resolves with empty array
    mockDbChain.then = (resolve: any, reject: any) =>
      Promise.resolve({ data: [], error: null }).then(resolve, reject);

    const res = await POST(makePostRequest({ title: "Announcement", message: "Hello everyone" }));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty("sent");
    expect(body.sent).toBe(0);
  });

  it("returns 200 and inserts notifications for all users", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce(adminSession as any);

    const mockUsers = [{ id: "u1" }, { id: "u2" }, { id: "u3" }];
    let callCount = 0;

    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // First call: User.select("id") → returns users
        return makeChain({ data: mockUsers, error: null });
      }
      // Subsequent calls: Notification.insert → success
      return makeChain({ error: null });
    });

    const res = await POST(makePostRequest({ title: "Update", message: "New features!" }));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.sent).toBe(3);
  });

  it("returns 500 when fetching users fails", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValueOnce(adminSession as any);

    mockDbChain.then = (resolve: any, reject: any) =>
      Promise.resolve({ data: null, error: new Error("DB fail") }).then(resolve, reject);

    const res = await POST(makePostRequest({ title: "Hello", message: "World" }));
    expect(res.status).toBe(500);
  });
});
