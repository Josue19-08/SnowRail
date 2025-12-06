/**
 * Internal Routes
 * Endpoints for internal system communication (callbacks, webhooks)
 */

import type { Express, Request, Response } from "express";
import { logger } from "../utils/logger.js";
import { confirmPayment } from "../services/paymentIntentService.js";
import { config } from "../config/env.js";

// Request type for x402 callback
type X402CallbackRequest = {
  paymentIntentId: string;
  token: string;
  amount: number;
  txHash: string;
  timestamp?: string;
};

/**
 * Validate callback secret (if configured)
 */
function validateCallbackSecret(req: Request): boolean {
  const secret = process.env.X402_CALLBACK_SECRET;
  if (!secret) {
    // If no secret configured, allow (for development)
    return true;
  }

  const providedSecret = req.header("X-Callback-Secret");
  return providedSecret === secret;
}

/**
 * Register internal routes
 */
export function registerInternalRoutes(app: Express) {
  /**
   * POST /internal/x402/callback
   * Internal endpoint called by facilitator when payment is confirmed on-chain
   * Protected by secret key (X-Callback-Secret header)
   */
  app.post(
    "/internal/x402/callback",
    async (req: Request, res: Response) => {
      try {
        // Validate secret if configured
        if (!validateCallbackSecret(req)) {
          logger.warn("Invalid callback secret");
          return res.status(401).json({
            ok: false,
            error: "UNAUTHORIZED",
            message: "Invalid callback secret",
          });
        }

        const body: X402CallbackRequest = req.body;
        const { paymentIntentId, token, amount, txHash, timestamp } = body;

        // Validate required fields
        if (!paymentIntentId || !token || !amount || !txHash) {
          return res.status(400).json({
            ok: false,
            error: "INVALID_REQUEST",
            message: "paymentIntentId, token, amount, and txHash are required",
          });
        }

        logger.info(`Payment callback received: ${paymentIntentId}`, {
          token,
          amount,
          txHash,
        });

        // Confirm payment (this will update Payment and CompanyBalance)
        const result = await confirmPayment(
          paymentIntentId,
          txHash,
          amount,
          token,
        );

        return res.status(200).json({
          ok: true,
          message: "Payment confirmed and balance updated",
          companyId: result.companyId,
          paymentIntentId,
          status: result.status,
          txHash: result.txHash,
          balanceUpdated: true,
        });
      } catch (error) {
        logger.error("Error processing x402 callback:", error);

        // Handle specific errors
        if (error instanceof Error) {
          if (error.message.includes("not found")) {
            return res.status(404).json({
              ok: false,
              error: "PAYMENT_INTENT_NOT_FOUND",
              message: error.message,
            });
          }

          if (error.message.includes("already confirmed")) {
            return res.status(200).json({
              ok: true,
              message: "Payment already confirmed (idempotent)",
            });
          }

          if (error.message.includes("invalid status")) {
            return res.status(400).json({
              ok: false,
              error: "INVALID_STATUS",
              message: error.message,
            });
          }
        }

        return res.status(500).json({
          ok: false,
          error: "INTERNAL_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to process payment callback",
        });
      }
    },
  );
}

