import { createApp } from "./app";
import { config } from "./config/env";
import { logger } from "./utils/logger";
import { startContractEventListener, stopContractEventListener } from "./services/contractHook";

/**
 * SnowRail Backend Entry Point
 * Starts the Express server and contract event listeners
 */

async function main() {
  const app = createApp();

  // Start contract event listener
  try {
    startContractEventListener();
    logger.info("📡 Contract event listener started");
  } catch (error) {
    logger.warn("Failed to start contract event listener", error);
    // Continue even if listener fails to start
  }

  app.listen(config.port, () => {
    logger.info(`🚀 SnowRail API running on http://localhost:${config.port}`);
    logger.info(`📋 Health check: http://localhost:${config.port}/api/health`);
    logger.info(`💰 x402 Protocol enabled`);
    logger.info(`⛓️  Network: ${config.network}`);
    if (config.treasuryContractAddress) {
      logger.info(`📄 Treasury Contract: ${config.treasuryContractAddress}`);
    }
  });

  // Graceful shutdown
  process.on("SIGINT", () => {
    logger.info("Shutting down gracefully...");
    stopContractEventListener();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    logger.info("Shutting down gracefully...");
    stopContractEventListener();
    process.exit(0);
  });
}

main().catch((error) => {
  logger.error("Failed to start server", error);
  process.exit(1);
});

