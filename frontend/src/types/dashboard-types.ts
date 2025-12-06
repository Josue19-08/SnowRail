/**
 * Dashboard types for SnowRail MVP
 */

export type BalanceByToken = {
  token: string;
  balanceToken: number;
  balanceUsd: number;
};

export type RecentPayment = {
  id: string;
  paymentIntentId: string;
  token: string;
  amountToken: number;
  amountUsd: number;
  status: "PENDING_X402" | "CONFIRMED_ONCHAIN" | "FAILED";
  txHash: string | null;
  createdAt: string;
  externalRef: string | null;
};

export type DashboardStats = {
  totalPayments: number;
  totalReceived: number;
};

export type DashboardCompany = {
  id: string;
  legalName: string;
  tradeName: string | null;
  country?: string;
  kybLevel: number;
  kybStatus: string;
  railStatus: string;
  railAccountId: string | null;
};

export type DashboardData = {
  company: DashboardCompany;
  balances: {
    totalUsd: number;
    byToken: BalanceByToken[];
  };
  recentPayments: RecentPayment[];
  stats: DashboardStats;
};

