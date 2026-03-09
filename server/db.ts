import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, dataSnapshots, apiKeys, uploadLogs } from "../drizzle/schema";
import { ENV } from "./_core/env";
import type { DashboardKey } from "@shared/dashboardTypes";
import crypto from "crypto";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================
// User helpers (from template)
// ============================================================
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================
// Dashboard data helpers
// ============================================================

/** Upsert a dashboard data snapshot (insert or replace) */
export async function upsertDashboardData(
  dashboardKey: DashboardKey,
  payload: unknown,
  dataDate?: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .insert(dataSnapshots)
    .values({
      dashboardKey,
      payload,
      dataDate: dataDate ?? null,
    })
    .onDuplicateKeyUpdate({
      set: {
        payload,
        dataDate: dataDate ?? null,
      },
    });
}

/** Get the latest data snapshot for a dashboard */
export async function getDashboardData(
  dashboardKey: DashboardKey
): Promise<{ payload: unknown; dataDate: string | null; updatedAt: Date } | null> {
  const db = await getDb();
  if (!db) return null;

  const rows = await db
    .select()
    .from(dataSnapshots)
    .where(eq(dataSnapshots.dashboardKey, dashboardKey))
    .limit(1);

  if (rows.length === 0) return null;

  return {
    payload: rows[0].payload,
    dataDate: rows[0].dataDate,
    updatedAt: rows[0].updatedAt,
  };
}

/** Get status of all dashboards */
export async function getAllDashboardStatus(): Promise<
  {
    dashboardKey: string;
    hasData: boolean;
    lastUpdated: string | null;
    dataDate: string | null;
  }[]
> {
  const db = await getDb();
  if (!db) return [];

  const rows = await db.select().from(dataSnapshots);

  return rows.map((r) => ({
    dashboardKey: r.dashboardKey,
    hasData: true,
    lastUpdated: r.updatedAt.toISOString(),
    dataDate: r.dataDate,
  }));
}

// ============================================================
// API key helpers
// ============================================================

export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

export function generateApiKey(): string {
  return "bsd_" + crypto.randomBytes(32).toString("hex");
}

export async function createApiKey(
  label: string,
  createdByUserId?: number
): Promise<{ key: string; id: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const rawKey = generateApiKey();
  const keyHash = hashApiKey(rawKey);

  const result = await db.insert(apiKeys).values({
    keyHash,
    label,
    createdByUserId: createdByUserId ?? null,
  });

  return { key: rawKey, id: Number(result[0].insertId) };
}

export async function validateApiKey(
  rawKey: string
): Promise<{ valid: boolean; keyId: number | null }> {
  const db = await getDb();
  if (!db) return { valid: false, keyId: null };

  const keyHash = hashApiKey(rawKey);
  const rows = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.keyHash, keyHash))
    .limit(1);

  if (rows.length === 0 || !rows[0].isActive) {
    return { valid: false, keyId: null };
  }

  // Update last used timestamp
  await db
    .update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, rows[0].id));

  return { valid: true, keyId: rows[0].id };
}

/** Log an upload attempt */
export async function logUpload(
  dashboardKey: string,
  apiKeyId: number | null,
  payloadSize: number,
  status: string,
  errorMessage?: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(uploadLogs).values({
    dashboardKey,
    apiKeyId,
    payloadSize,
    status,
    errorMessage: errorMessage ?? null,
  });
}
