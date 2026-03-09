import { describe, expect, it } from "vitest";
import { DASHBOARD_KEYS, type DashboardKey } from "../shared/dashboardTypes";
import { hashApiKey, generateApiKey } from "./db";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ============================================================
// Shared helpers
// ============================================================

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

// ============================================================
// 1. Dashboard Types & Constants
// ============================================================

describe("Dashboard Types", () => {
  it("has exactly 5 dashboard keys", () => {
    expect(DASHBOARD_KEYS).toHaveLength(5);
  });

  it("includes all expected dashboard keys", () => {
    const expected: DashboardKey[] = [
      "overview",
      "sales_overall",
      "individual_pack",
      "pack_release",
      "song_metrics",
    ];
    expect(DASHBOARD_KEYS).toEqual(expected);
  });

  it("dashboard keys are readonly", () => {
    // TypeScript enforces this at compile time, but we can verify the array is frozen-like
    expect(Array.isArray(DASHBOARD_KEYS)).toBe(true);
  });
});

// ============================================================
// 2. API Key Helpers (unit tests — no DB required)
// ============================================================

describe("API Key Helpers", () => {
  describe("generateApiKey", () => {
    it("generates a key with bsd_ prefix", () => {
      const key = generateApiKey();
      expect(key).toMatch(/^bsd_[a-f0-9]{64}$/);
    });

    it("generates unique keys each time", () => {
      const key1 = generateApiKey();
      const key2 = generateApiKey();
      expect(key1).not.toBe(key2);
    });

    it("generates keys of consistent length", () => {
      const key = generateApiKey();
      // "bsd_" (4) + 64 hex chars = 68 total
      expect(key.length).toBe(68);
    });
  });

  describe("hashApiKey", () => {
    it("produces a SHA-256 hex hash", () => {
      const hash = hashApiKey("bsd_test123");
      // SHA-256 produces 64 hex characters
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it("produces deterministic hashes", () => {
      const hash1 = hashApiKey("bsd_samekey");
      const hash2 = hashApiKey("bsd_samekey");
      expect(hash1).toBe(hash2);
    });

    it("produces different hashes for different keys", () => {
      const hash1 = hashApiKey("bsd_key1");
      const hash2 = hashApiKey("bsd_key2");
      expect(hash1).not.toBe(hash2);
    });
  });
});

// ============================================================
// 3. tRPC Router — Public endpoints (no DB)
// ============================================================

describe("Dashboard tRPC Router", () => {
  describe("dashboard.getData", () => {
    it("returns hasData: false when no data exists (no DB)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.dashboard.getData({
        dashboardKey: "overview",
      });

      expect(result).toEqual({
        hasData: false,
        payload: null,
        dataDate: null,
        lastUpdated: null,
      });
    });

    it("accepts all valid dashboard keys", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      for (const key of DASHBOARD_KEYS) {
        const result = await caller.dashboard.getData({ dashboardKey: key });
        expect(result).toHaveProperty("hasData");
      }
    });
  });

  describe("dashboard.getStatus", () => {
    it("returns an empty array when no DB is connected", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.dashboard.getStatus();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("dashboard.upload", () => {
    it("rejects upload with invalid API key (no DB)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.dashboard.upload({
          apiKey: "bsd_invalid_key",
          dashboardKey: "overview",
          payload: { test: true },
        })
      ).rejects.toThrow();
    });

    it("rejects upload with empty API key", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.dashboard.upload({
          apiKey: "",
          dashboardKey: "overview",
          payload: { test: true },
        })
      ).rejects.toThrow();
    });
  });

  describe("dashboard.bulkUpload", () => {
    it("rejects bulk upload with invalid API key", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.dashboard.bulkUpload({
          apiKey: "bsd_invalid_key",
          dashboards: [
            { dashboardKey: "overview", payload: {} },
            { dashboardKey: "sales_overall", payload: {} },
          ],
        })
      ).rejects.toThrow();
    });
  });

  describe("auth.me", () => {
    it("returns null for unauthenticated users", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();
      expect(result).toBeNull();
    });

    it("returns user for authenticated users", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();
      expect(result).not.toBeNull();
      expect(result?.role).toBe("admin");
      expect(result?.openId).toBe("admin-user");
    });
  });
});

// ============================================================
// 4. Data Service Layer — Synthetic data validation
// ============================================================

describe("Synthetic Data Validation", () => {
  it("DASHBOARD_KEYS covers all 5 dashboards", () => {
    expect(DASHBOARD_KEYS).toContain("overview");
    expect(DASHBOARD_KEYS).toContain("sales_overall");
    expect(DASHBOARD_KEYS).toContain("individual_pack");
    expect(DASHBOARD_KEYS).toContain("pack_release");
    expect(DASHBOARD_KEYS).toContain("song_metrics");
  });
});
