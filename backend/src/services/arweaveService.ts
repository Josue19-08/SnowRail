import Arweave from "arweave";
import type { JWKInterface } from "arweave/node/lib/wallet.js";
import { logger } from "../utils/logger.js";
import type { PayrollStatusType } from "../domain/payroll.js";

export type PayrollReceipt = {
  payrollId: string;
  status: PayrollStatusType;
  totalAmount: string;
  currency: string;
  recipientCount: number;
  network: string;
  treasuryContract: string;
  onchainTxHash?: string;
  createdAt: string;
  completedAt?: string;
  version: string;
  protocol: string;
  agentId: string;
  x402MeterId: string;
  metadata?: Record<string, unknown>;
};

export type ArweaveSaveResult = {
  success: boolean;
  txId?: string;
  url?: string;
  error?: string;
  skipped?: boolean;
};

const arweave = Arweave.init({
  host: process.env.ARWEAVE_HOST || "arweave.net",
  port: Number(process.env.ARWEAVE_PORT || 443),
  protocol: process.env.ARWEAVE_PROTOCOL || "https",
});

let cachedKey: JWKInterface | null = null;
let keyLoaded = false;

function getArweaveKey(): JWKInterface | null {
  if (keyLoaded) {
    return cachedKey;
  }

  keyLoaded = true;
  const jwkRaw = process.env.ARWEAVE_JWK;
  if (!jwkRaw) {
    return null;
  }

  try {
    cachedKey = JSON.parse(jwkRaw);
  } catch (error) {
    logger.error("Invalid ARWEAVE_JWK JSON", error);
    cachedKey = null;
  }

  return cachedKey;
}

export function isArweaveConfigured(): boolean {
  return Boolean(getArweaveKey());
}

export async function saveReceiptToArweave(
  receipt: PayrollReceipt,
): Promise<ArweaveSaveResult> {
  const key = getArweaveKey();
  if (!key) {
    logger.warn(
      "ARWEAVE_JWK not configured - skipping Arweave receipt persistence",
    );
    return {
      success: false,
      skipped: true,
      error: "ARWEAVE_JWK not configured",
    };
  }

  try {
    const payload = JSON.stringify({
      type: "snowrail.payroll.receipt",
      issuedAt: new Date().toISOString(),
      receipt,
    });

    const transaction = await arweave.createTransaction(
      {
        data: Buffer.from(payload, "utf-8"),
      },
      key,
    );

    transaction.addTag("App-Name", "SnowRail");
    transaction.addTag("Content-Type", "application/json");
    transaction.addTag("Protocol", receipt.protocol);
    transaction.addTag("Agent-Id", receipt.agentId);
    transaction.addTag("Payroll-Id", receipt.payrollId);

    await arweave.transactions.sign(transaction, key);
    const response = await arweave.transactions.post(transaction);

    if (response.status === 200 || response.status === 202) {
      logger.info(`Arweave receipt stored: ${transaction.id}`);
      return {
        success: true,
        txId: transaction.id,
        url: `https://arweave.net/${transaction.id}`,
      };
    }

    logger.error("Arweave responded with unexpected status", response.status);
    return {
      success: false,
      error: `Arweave responded with status ${response.status}`,
    };
  } catch (error) {
    logger.error("Failed to save receipt to Arweave", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
