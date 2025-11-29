import { config } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { getMeter } from "./metering.js";
import { validateWithFacilitator } from "./facilitatorClient.js";

/**
 * x402 Payment Validation
 * Validates X-PAYMENT header against x402 facilitator (Ultravioleta)
 */

// Validation result type
export type ValidationResult = {
  valid: boolean;
  error?: string;
  payer?: string;
  amount?: string;
  facilitatorResponse?: any;
};

/**
 * Validate X-PAYMENT header value against Ultravioleta facilitator
 * @param headerValue - The X-PAYMENT header value (payment proof)
 * @param meterId - The meter ID for the resource being accessed
 * @returns Promise<boolean> - Whether the payment is valid
 */
export async function validateXPaymentHeader(
  headerValue: string,
  meterId: string,
): Promise<boolean> {
  logger.debug(`Validating X-PAYMENT for meter: ${meterId}`);

  // Development: Accept demo-token for testing (only if facilitator is mock)
  if (headerValue === "demo-token" && config.x402FacilitatorUrl.includes("mock")) {
    logger.info(`Demo token accepted for meter: ${meterId} (using mock facilitator)`);
    return true;
  }

  // Production: Validate against Ultravioleta facilitator
  try {
    const meter = getMeter(meterId);
    if (!meter) {
      logger.error(`Meter not found: ${meterId}`);
      return false;
    }

    // Use facilitator client for validation
    const result = await validateWithFacilitator(headerValue, meterId, meter);
    
    if (result.valid === true) {
      return true;
    }

    logger.warn(`Payment validation failed for meter: ${meterId}`, {
      error: result.error,
      message: result.message,
    });
    return false;
  } catch (error) {
    logger.error(`Error validating payment with facilitator for meter: ${meterId}`, error);
    
    // In development, allow demo-token even if facilitator fails
    if (headerValue === "demo-token") {
      logger.warn("Facilitator unavailable, accepting demo-token for development");
      return true;
    }
    
    return false;
  }
}

/**
 * Extended validation with detailed result
 * @param headerValue - The X-PAYMENT header value
 * @param meterId - The meter ID
 * @returns Promise<ValidationResult> - Detailed validation result
 */
export async function validatePaymentDetailed(
  headerValue: string,
  meterId: string
): Promise<ValidationResult> {
  // Development: Demo token handling
  if (headerValue === "demo-token" && config.x402FacilitatorUrl.includes("mock")) {
    return {
      valid: true,
      payer: "0xDemoPayerAddress",
      amount: "1",
    };
  }

  // Production: Validate with Ultravioleta facilitator
  try {
    const meter = getMeter(meterId);
    if (!meter) {
      return {
        valid: false,
        error: "METER_NOT_FOUND",
      };
    }

    // Use facilitator client for validation
    const result = await validateWithFacilitator(headerValue, meterId, meter);
    
    return {
      valid: result.valid === true,
      payer: result.payer,
      amount: result.amount,
      error: result.error,
      facilitatorResponse: result,
    };
  } catch (error) {
    logger.error(`Error in detailed validation for meter: ${meterId}`, error);
    
    // Fallback for development
    if (headerValue === "demo-token") {
      return {
        valid: true,
        payer: "0xDemoPayerAddress",
        amount: "1",
      };
    }
    
    return {
      valid: false,
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
    };
  }
}
