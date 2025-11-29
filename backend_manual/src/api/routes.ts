import { Router, Express } from "express";
import { executePayroll, getPayroll } from "./payroll.controller";
import { getTreasuryBalance } from "./treasury.controller";
import { x402Protect } from "../x402/middleware";
import { checkFacilitatorHealth } from "../x402/facilitatorClient";

/**
 * API Routes
 * Registers all API endpoints
 */

const router = Router();

// Payroll routes
// POST /api/payroll/execute - Protected by x402
router.post("/payroll/execute", x402Protect("payroll_execute"), executePayroll);

// GET /api/payroll/:id - Public (read-only)
router.get("/payroll/:id", getPayroll);

// Treasury routes
// GET /api/treasury/balance - Get treasury balance
router.get("/treasury/balance", getTreasuryBalance);

// Health check
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Facilitator health check
router.get("/facilitator/health", async (req, res) => {
  try {
    const health = await checkFacilitatorHealth();
    res.status(health.healthy ? 200 : 503).json(health);
  } catch (error) {
    res.status(503).json({
      healthy: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Register all routes on the Express app
 * @param app - Express application
 */
export function registerRoutes(app: Express): void {
  app.use("/api", router);
}

export { router };

