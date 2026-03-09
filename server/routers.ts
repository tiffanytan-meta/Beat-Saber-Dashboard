import { COOKIE_NAME } from "@shared/const";
import { DASHBOARD_KEYS, type DashboardKey } from "@shared/dashboardTypes";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  upsertDashboardData,
  getDashboardData,
  getAllDashboardStatus,
  createApiKey,
  validateApiKey,
  logUpload,
} from "./db";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============================================================
  // Dashboard data endpoints
  // ============================================================
  dashboard: router({
    /** Get data for a specific dashboard (public — no auth required for viewing) */
    getData: publicProcedure
      .input(
        z.object({
          dashboardKey: z.enum(DASHBOARD_KEYS),
        })
      )
      .query(async ({ input }) => {
        const result = await getDashboardData(input.dashboardKey);
        if (!result) {
          return {
            hasData: false as const,
            payload: null,
            dataDate: null,
            lastUpdated: null,
          };
        }
        return {
          hasData: true as const,
          payload: result.payload,
          dataDate: result.dataDate,
          lastUpdated: result.updatedAt.toISOString(),
        };
      }),

    /** Get status of all dashboards */
    getStatus: publicProcedure.query(async () => {
      return getAllDashboardStatus();
    }),

    /** Upload data for a dashboard (requires API key in payload) */
    upload: publicProcedure
      .input(
        z.object({
          apiKey: z.string().min(1),
          dashboardKey: z.enum(DASHBOARD_KEYS),
          payload: z.unknown(),
          dataDate: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        // Validate API key
        const { valid, keyId } = await validateApiKey(input.apiKey);
        if (!valid) {
          await logUpload(input.dashboardKey, null, 0, "rejected", "Invalid API key");
          throw new Error("Invalid or inactive API key");
        }

        const payloadStr = JSON.stringify(input.payload);
        const payloadSize = Buffer.byteLength(payloadStr, "utf-8");

        try {
          await upsertDashboardData(
            input.dashboardKey,
            input.payload,
            input.dataDate
          );

          await logUpload(input.dashboardKey, keyId, payloadSize, "success");

          return {
            success: true,
            dashboardKey: input.dashboardKey,
            message: `Data for "${input.dashboardKey}" uploaded successfully`,
            uploadedAt: new Date().toISOString(),
          };
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : "Unknown error";
          await logUpload(input.dashboardKey, keyId, payloadSize, "error", errMsg);
          throw error;
        }
      }),

    /** Bulk upload — upload multiple dashboards at once */
    bulkUpload: publicProcedure
      .input(
        z.object({
          apiKey: z.string().min(1),
          dataDate: z.string().optional(),
          dashboards: z.array(
            z.object({
              dashboardKey: z.enum(DASHBOARD_KEYS),
              payload: z.unknown(),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        const { valid, keyId } = await validateApiKey(input.apiKey);
        if (!valid) {
          throw new Error("Invalid or inactive API key");
        }

        const results: { dashboardKey: string; success: boolean; error?: string }[] = [];

        for (const item of input.dashboards) {
          try {
            await upsertDashboardData(
              item.dashboardKey,
              item.payload,
              input.dataDate
            );
            const payloadSize = Buffer.byteLength(JSON.stringify(item.payload), "utf-8");
            await logUpload(item.dashboardKey, keyId, payloadSize, "success");
            results.push({ dashboardKey: item.dashboardKey, success: true });
          } catch (error) {
            const errMsg = error instanceof Error ? error.message : "Unknown error";
            await logUpload(item.dashboardKey, keyId, 0, "error", errMsg);
            results.push({ dashboardKey: item.dashboardKey, success: false, error: errMsg });
          }
        }

        return {
          uploadedAt: new Date().toISOString(),
          dataDate: input.dataDate ?? null,
          results,
        };
      }),
  }),

  // ============================================================
  // API key management (admin only)
  // ============================================================
  apiKeys: router({
    /** Create a new API key (admin only) */
    create: adminProcedure
      .input(z.object({ label: z.string().min(1).max(128) }))
      .mutation(async ({ input, ctx }) => {
        const result = await createApiKey(input.label, ctx.user.id);
        return {
          id: result.id,
          key: result.key,
          label: input.label,
          message:
            "Save this key now — it will not be shown again. Use it in the X-API-Key header or apiKey field when uploading data.",
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
