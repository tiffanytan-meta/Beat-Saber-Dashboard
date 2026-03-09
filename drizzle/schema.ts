import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  double,
  json,
  bigint,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

// ============================================================
// Core user table (from template)
// ============================================================
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================
// Dashboard data snapshots — stores full JSON blobs per dashboard
// This approach is simpler and more flexible than normalized tables
// since the data comes from pre-aggregated SQL queries.
// ============================================================
export const dataSnapshots = mysqlTable(
  "data_snapshots",
  {
    id: int("id").autoincrement().primaryKey(),
    /** Which dashboard this data belongs to */
    dashboardKey: varchar("dashboardKey", { length: 64 }).notNull(),
    /** Full JSON payload for this dashboard */
    payload: json("payload").notNull(),
    /** When this data was generated/exported from Daiquery */
    dataDate: varchar("dataDate", { length: 32 }),
    /** Upload metadata */
    uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    uniqueIndex("uniq_dashboard_key").on(table.dashboardKey),
  ]
);

export type DataSnapshot = typeof dataSnapshots.$inferSelect;
export type InsertDataSnapshot = typeof dataSnapshots.$inferInsert;

// ============================================================
// API keys for data upload authentication
// ============================================================
export const apiKeys = mysqlTable("api_keys", {
  id: int("id").autoincrement().primaryKey(),
  /** The hashed API key */
  keyHash: varchar("keyHash", { length: 128 }).notNull().unique(),
  /** Human-readable label */
  label: varchar("label", { length: 128 }).notNull(),
  /** Who created this key */
  createdByUserId: int("createdByUserId"),
  /** Is this key active? */
  isActive: int("isActive").default(1).notNull(),
  lastUsedAt: timestamp("lastUsedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

// ============================================================
// Upload audit log
// ============================================================
export const uploadLogs = mysqlTable("upload_logs", {
  id: int("id").autoincrement().primaryKey(),
  dashboardKey: varchar("dashboardKey", { length: 64 }).notNull(),
  apiKeyId: int("apiKeyId"),
  /** Size of the payload in bytes */
  payloadSize: bigint("payloadSize", { mode: "number" }),
  status: varchar("status", { length: 32 }).notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UploadLog = typeof uploadLogs.$inferSelect;
