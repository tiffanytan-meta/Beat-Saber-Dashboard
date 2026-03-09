import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for data uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // ============================================================
  // REST endpoints for external data upload (used by DaiqueryClient scripts)
  // These are convenience wrappers — the tRPC endpoints also work.
  // ============================================================

  // POST /api/data/upload — Upload data for a single dashboard
  app.post("/api/data/upload", async (req, res) => {
    try {
      const { apiKey, dashboardKey, payload, dataDate } = req.body;
      if (!apiKey || !dashboardKey || !payload) {
        res.status(400).json({
          error: "Missing required fields: apiKey, dashboardKey, payload",
        });
        return;
      }
      const db = await import("../db");
      const { valid, keyId } = await db.validateApiKey(apiKey);
      if (!valid) {
        res.status(401).json({ error: "Invalid or inactive API key" });
        return;
      }
      const payloadSize = Buffer.byteLength(JSON.stringify(payload), "utf-8");
      await db.upsertDashboardData(dashboardKey, payload, dataDate);
      await db.logUpload(dashboardKey, keyId, payloadSize, "success");
      res.json({
        success: true,
        dashboardKey,
        message: `Data for "${dashboardKey}" uploaded successfully`,
        uploadedAt: new Date().toISOString(),
      });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: errMsg });
    }
  });

  // POST /api/data/bulk-upload — Upload data for multiple dashboards at once
  app.post("/api/data/bulk-upload", async (req, res) => {
    try {
      const { apiKey, dataDate, dashboards } = req.body;
      if (!apiKey || !dashboards || !Array.isArray(dashboards)) {
        res.status(400).json({
          error: "Missing required fields: apiKey, dashboards (array)",
        });
        return;
      }
      const db = await import("../db");
      const { valid, keyId } = await db.validateApiKey(apiKey);
      if (!valid) {
        res.status(401).json({ error: "Invalid or inactive API key" });
        return;
      }
      const results: { dashboardKey: string; success: boolean; error?: string }[] = [];
      for (const item of dashboards) {
        try {
          await db.upsertDashboardData(item.dashboardKey, item.payload, dataDate);
          const payloadSize = Buffer.byteLength(JSON.stringify(item.payload), "utf-8");
          await db.logUpload(item.dashboardKey, keyId, payloadSize, "success");
          results.push({ dashboardKey: item.dashboardKey, success: true });
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : "Unknown error";
          await db.logUpload(item.dashboardKey, keyId, 0, "error", errMsg);
          results.push({ dashboardKey: item.dashboardKey, success: false, error: errMsg });
        }
      }
      res.json({
        uploadedAt: new Date().toISOString(),
        dataDate: dataDate ?? null,
        results,
      });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: errMsg });
    }
  });

  // GET /api/data/:dashboardKey — Retrieve data for a dashboard
  app.get("/api/data/:dashboardKey", async (req, res) => {
    try {
      const db = await import("../db");
      const result = await db.getDashboardData(req.params.dashboardKey as any);
      if (!result) {
        res.json({
          hasData: false,
          payload: null,
          dataDate: null,
          lastUpdated: null,
        });
        return;
      }
      res.json({
        hasData: true,
        payload: result.payload,
        dataDate: result.dataDate,
        lastUpdated: result.updatedAt.toISOString(),
      });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: errMsg });
    }
  });

  // GET /api/data — Get status of all dashboards
  app.get("/api/data", async (_req, res) => {
    try {
      const db = await import("../db");
      const status = await db.getAllDashboardStatus();
      res.json({ dashboards: status });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: errMsg });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
