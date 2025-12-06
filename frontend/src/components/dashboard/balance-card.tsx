/**
 * Balance Card Component
 * Displays total balance and balances by token
 */

import { DollarSign } from "lucide-react";
import type { DashboardData } from "../../types/dashboard-types.js";

type BalanceCardProps = {
  data: DashboardData;
};

export function BalanceCard({ data }: BalanceCardProps) {
  const { balances } = data;

  return (
    <div className="card p-8">
      {/* Total Balance */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-teal-100 rounded-lg" style={{ color: "#0d9488" }}>
            <DollarSign size={20} />
          </div>
          <span className="text-sm font-medium text-teal-700">Total Balance</span>
        </div>
        <h2 className="text-4xl font-bold text-teal-900">
          ${balances.totalUsd.toFixed(2)} USD
        </h2>
        <p className="text-sm text-teal-600 mt-1">Available for withdrawal</p>
      </div>

      {/* Balances by Token */}
      {balances.byToken.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-teal-900 mb-3">Balances by Token</h3>
          {balances.byToken.map((balance) => (
            <div
              key={balance.token}
              className="flex items-center justify-between p-4 bg-teal-50 rounded-lg border border-teal-200"
            >
              <div>
                <div className="font-semibold text-teal-900">{balance.token}</div>
                <div className="text-sm text-teal-600">
                  {balance.balanceToken.toFixed(6)} tokens
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-teal-900">
                  ${balance.balanceUsd.toFixed(2)}
                </div>
                <div className="text-xs text-teal-600">USD</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-teal-600">
          <p className="text-sm">No balances yet</p>
          <p className="text-xs mt-1">Start receiving payments to see balances here</p>
        </div>
      )}
    </div>
  );
}

