// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { nanoid } from "nanoid";
var MemStorage = class {
  events;
  constructor() {
    this.events = /* @__PURE__ */ new Map();
  }
  async createWebhookEvent(insertEvent) {
    const id = nanoid();
    const event = {
      ...insertEvent,
      id,
      timestamp: /* @__PURE__ */ new Date()
    };
    this.events.set(id, event);
    return event;
  }
  async getWebhookEvents(limit = 50, offset = 0, eventType) {
    let events = Array.from(this.events.values());
    if (eventType && eventType !== "all") {
      events = events.filter((event) => event.action === eventType.toUpperCase());
    }
    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return events.slice(offset, offset + limit);
  }
  async getEventStats() {
    const events = Array.from(this.events.values());
    return {
      totalEvents: events.length,
      pushEvents: events.filter((e) => e.action === "PUSH").length,
      pullRequests: events.filter((e) => e.action === "PULL_REQUEST").length,
      mergeEvents: events.filter((e) => e.action === "MERGE").length
    };
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { z } from "zod";
var webhookEventSchema = z.object({
  id: z.string(),
  request_id: z.string(),
  author: z.string(),
  action: z.enum(["PUSH", "PULL_REQUEST", "MERGE"]),
  from_branch: z.string().optional(),
  to_branch: z.string(),
  timestamp: z.date(),
  repository: z.string(),
  message: z.string().optional(),
  commit_id: z.string().optional(),
  pr_number: z.number().optional(),
  pr_title: z.string().optional(),
  merge_commit: z.string().optional()
});
var insertWebhookEventSchema = webhookEventSchema.omit({
  id: true,
  timestamp: true
});
var eventStatsSchema = z.object({
  totalEvents: z.number(),
  pushEvents: z.number(),
  pullRequests: z.number(),
  mergeEvents: z.number()
});

// server/routes.ts
import crypto from "crypto";
async function registerRoutes(app2) {
  app2.post("/api/webhook", async (req, res) => {
    try {
      const { body, headers } = req;
      const signature = headers["x-hub-signature-256"];
      const requestId = headers["x-github-delivery"] || crypto.randomUUID();
      let eventData;
      if (headers["x-github-event"] === "push") {
        eventData = {
          request_id: requestId,
          author: body.pusher?.name || body.head_commit?.author?.name || "Unknown",
          action: "PUSH",
          to_branch: body.ref?.replace("refs/heads/", "") || "main",
          repository: body.repository?.name || "unknown",
          message: body.head_commit?.message || "No commit message",
          commit_id: body.head_commit?.id?.substring(0, 7) || ""
        };
      } else if (headers["x-github-event"] === "pull_request") {
        const prAction = body.action;
        eventData = {
          request_id: requestId,
          author: body.pull_request?.user?.login || "Unknown",
          action: "PULL_REQUEST",
          from_branch: body.pull_request?.head?.ref || "",
          to_branch: body.pull_request?.base?.ref || "main",
          repository: body.repository?.name || "unknown",
          pr_number: body.pull_request?.number || 0,
          pr_title: body.pull_request?.title || "No title",
          message: `${prAction} pull request`
        };
      } else if (headers["x-github-event"] === "pull_request" && body.pull_request?.merged) {
        eventData = {
          request_id: requestId,
          author: body.pull_request?.merged_by?.login || body.pull_request?.user?.login || "Unknown",
          action: "MERGE",
          from_branch: body.pull_request?.head?.ref || "",
          to_branch: body.pull_request?.base?.ref || "main",
          repository: body.repository?.name || "unknown",
          merge_commit: body.pull_request?.merge_commit_sha?.substring(0, 7) || "",
          message: body.pull_request?.title || "No merge message"
        };
      } else {
        return res.status(200).json({ message: "Event type not supported" });
      }
      const validatedEvent = insertWebhookEventSchema.parse(eventData);
      const savedEvent = await storage.createWebhookEvent(validatedEvent);
      res.status(200).json({ message: "Webhook received", event: savedEvent });
    } catch (error) {
      console.error("Webhook processing error:", error);
      res.status(400).json({ message: "Invalid webhook data", error: error.message });
    }
  });
  app2.get("/api/events", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;
      const eventType = req.query.type;
      const events = await storage.getWebhookEvents(limit, offset, eventType);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events", error: error.message });
    }
  });
  app2.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getEventStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats", error: error.message });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid as nanoid2 } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid2()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
