import {
  getTreasuryContract,
  getTreasuryContractReadOnly,
} from "../config/contractConfig.js";

/**
 * Treasury Client Service
 * Wrapper for ethers.js interactions with SnowRailTreasury contract.
 */

/**
 * Request an onchain payment
 * NOTE: For MVP we assume success after tx is mined.
 */
export async function requestOnchainPayment(
  payee: string,
  amount: bigint,
  token: string,
): Promise<string> {
  const contract = getTreasuryContract();
  const tx = await contract.requestPayment(payee, amount, token);
  const receipt = await tx.wait();
  return receipt.hash as string;
}

/**
 * Execute an onchain payment from treasury
 * NOTE: For MVP we do not yet inspect events.
 */
export async function executeOnchainPayment(
  payer: string,
  payee: string,
  amount: bigint,
  token: string,
): Promise<string> {
  const contract = getTreasuryContract();
  const tx = await contract.executePayment(payer, payee, amount, token);
  const receipt = await tx.wait();
  return receipt.hash as string;
}

/**
 * Get treasury token balance (read-only)
 */
export async function getTreasuryBalance(
  token: string,
): Promise<bigint> {
  const contract = getTreasuryContractReadOnly();
  const balance = await contract.getTokenBalance(token);
  return balance as bigint;
}



