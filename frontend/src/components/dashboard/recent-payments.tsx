/**
 * Recent Payments Component
 * Displays list of recent payments received
 */

import { ExternalLink, Clock, CheckCircle2, XCircle } from "lucide-react";
import type { RecentPayment } from "../../types/dashboard-types.js";

type RecentPaymentsProps = {
  payments: RecentPayment[];
};

function getStatusIcon(status: RecentPayment["status"]) {
  switch (status) {
    case "CONFIRMED_ONCHAIN":
      return <CheckCircle2 size={16} className="text-green-600" />;
    case "PENDING_X402":
      return <Clock size={16} className="text-yellow-600" />;
    case "FAILED":
      return <XCircle size={16} className="text-red-600" />;
    default:
      return <Clock size={16} className="text-gray-600" />;
  }
}

function getStatusLabel(status: RecentPayment["status"]) {
  switch (status) {
    case "CONFIRMED_ONCHAIN":
      return "Confirmed";
    case "PENDING_X402":
      return "Pending";
    case "FAILED":
      return "Failed";
    default:
      return status;
  }
}

function getStatusColor(status: RecentPayment["status"]) {
  switch (status) {
    case "CONFIRMED_ONCHAIN":
      return "text-green-700 bg-green-50 border-green-200";
    case "PENDING_X402":
      return "text-yellow-700 bg-yellow-50 border-yellow-200";
    case "FAILED":
      return "text-red-700 bg-red-50 border-red-200";
    default:
      return "text-gray-700 bg-gray-50 border-gray-200";
  }
}

function truncateHash(hash: string | null, length: number = 8): string {
  if (!hash) return "-";
  if (hash.length <= length * 2 + 2) return hash;
  return `${hash.substring(0, length + 2)}...${hash.substring(hash.length - length)}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RecentPayments({ payments }: RecentPaymentsProps) {
  if (payments.length === 0) {
    return (
      <div className="card p-8">
        <h3 className="text-lg font-semibold text-teal-900 mb-4">Recent Payments</h3>
        <div className="text-center py-8 text-teal-600">
          <p className="text-sm">No payments received yet</p>
          <p className="text-xs mt-1">Payments will appear here once received</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-8">
      <h3 className="text-lg font-semibold text-teal-900 mb-6">Recent Payments</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-teal-200">
              <th className="text-left py-3 px-2 text-xs font-semibold text-teal-700 uppercase tracking-wider">
                Date
              </th>
              <th className="text-left py-3 px-2 text-xs font-semibold text-teal-700 uppercase tracking-wider">
                Token
              </th>
              <th className="text-right py-3 px-2 text-xs font-semibold text-teal-700 uppercase tracking-wider">
                Amount
              </th>
              <th className="text-right py-3 px-2 text-xs font-semibold text-teal-700 uppercase tracking-wider">
                USD
              </th>
              <th className="text-left py-3 px-2 text-xs font-semibold text-teal-700 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left py-3 px-2 text-xs font-semibold text-teal-700 uppercase tracking-wider">
                Transaction
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-teal-100">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-teal-50 transition-colors">
                <td className="py-3 px-2 text-sm text-teal-900">
                  {formatDate(payment.createdAt)}
                </td>
                <td className="py-3 px-2 text-sm font-medium text-teal-900">
                  {payment.token}
                </td>
                <td className="py-3 px-2 text-sm text-teal-900 text-right">
                  {payment.amountToken.toFixed(6)}
                </td>
                <td className="py-3 px-2 text-sm font-semibold text-teal-900 text-right">
                  ${payment.amountUsd.toFixed(2)}
                </td>
                <td className="py-3 px-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      payment.status
                    )}`}
                  >
                    {getStatusIcon(payment.status)}
                    {getStatusLabel(payment.status)}
                  </span>
                </td>
                <td className="py-3 px-2">
                  {payment.txHash ? (
                    <a
                      href={`https://testnet.snowtrace.io/tx/${payment.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800 font-mono"
                    >
                      {truncateHash(payment.txHash)}
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span className="text-xs text-teal-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

