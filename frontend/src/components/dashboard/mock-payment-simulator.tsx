/**
 * Payment Simulator Component
 * Simulates an external merchant paying to this company using the Merchant API
 */

import { useState } from "react";
import { Zap, DollarSign, Info } from "lucide-react";
import { getToken } from "../../hooks/use-session.js";
import { getApiBase } from "../../utils/api-config.js";
import { SpotlightCard } from "../ui/spotlight-card";

const API_BASE = getApiBase();

type PaymentSimulatorProps = {
  companyId: string;
  onPaymentCreated: () => void;
};

export function PaymentSimulator({
  companyId,
  onPaymentCreated,
}: PaymentSimulatorProps) {
  const [amount, setAmount] = useState("10.5");
  const [token, setToken] = useState("xUSDC");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const tokenValue = getToken();
      if (!tokenValue) {
        throw new Error("Not authenticated");
      }

      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error("Invalid amount");
      }

      // Step 1: Create payment intent via Merchant API
      // This is what an external merchant would call
      const intentResponse = await fetch(`${API_BASE}/merchant/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountNum,
          token: token,
          companyId: companyId,
          reference: `example_payment_${Date.now()}`,
        }),
      });

      if (!intentResponse.ok) {
        // Check if response is JSON before parsing
        const contentType = intentResponse.headers.get("content-type");
        let errorMessage = `Failed to create payment intent (${intentResponse.status})`;
        
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await intentResponse.json();
            errorMessage = errorData.message || errorMessage;
          } catch {
            // If JSON parsing fails, use default message
          }
        } else {
          // If not JSON (e.g., HTML error page), provide helpful message
          if (intentResponse.status === 404) {
            errorMessage = "Merchant API endpoint not found. Please ensure the backend server is running and Merchant API is enabled.";
          } else {
            errorMessage = `Server error: ${intentResponse.status} ${intentResponse.statusText}`;
          }
          // Consume the response body to avoid memory leaks
          await intentResponse.text().catch(() => {});
        }
        
        throw new Error(errorMessage);
      }

      const intentData = await intentResponse.json();
      const paymentIntentId = intentData.paymentIntentId;

      // Step 2: Simulate x402 payment confirmation callback
      // In real flow, this would be called by the x402 facilitator after on-chain settlement
      await new Promise((resolve) => setTimeout(resolve, 800));

      const callbackResponse = await fetch(`${API_BASE}/internal/x402/callback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentIntentId: paymentIntentId,
          token: token,
          amount: amountNum,
          txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!callbackResponse.ok) {
        const errorData = await callbackResponse.json();
        throw new Error(errorData.message || "Failed to confirm payment");
      }

      setSuccess(`Payment of ${amountNum} ${token} received successfully!`);
      onPaymentCreated();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to simulate payment");
    } finally {
      setIsProcessing(false);
    }
  };

  const quickAmounts = [5, 10, 25, 50, 100];

  return (
    <SpotlightCard className="p-6 bg-navy-800/30">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-electric-blue/10 rounded-lg text-electric-blue">
          <Zap size={20} />
        </div>
        <h3 className="text-lg font-semibold text-white">Simulate External Payment</h3>
      </div>

      <div className="mb-4 p-3 bg-navy-900/50 border border-electric-blue/20 rounded-lg">
        <div className="flex items-start gap-2">
          <Info size={16} className="text-electric-blue mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-300">
            <p className="font-medium mb-1 text-white">Example: External Merchant Payment</p>
            <p className="text-xs text-gray-400">
              This simulates how another company would pay you using the Merchant API. It uses the real flow:{" "}
              <code className="mx-1 px-1.5 py-0.5 bg-navy-800/70 rounded text-electric-blue font-mono text-xs border border-electric-blue/20">
                POST /merchant/payments
              </code>
              → x402 payment → callback confirmation.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Amount
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 px-4 py-2 bg-navy-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue text-white placeholder-gray-500"
              placeholder="10.5"
              disabled={isProcessing}
            />
            <select
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="px-4 py-2 bg-navy-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue text-white"
              disabled={isProcessing}
            >
              <option value="xUSDC" className="bg-navy-900">xUSDC</option>
              <option value="USDC" className="bg-navy-900">USDC</option>
              <option value="xUSDT" className="bg-navy-900">xUSDT</option>
              <option value="USDT" className="bg-navy-900">USDT</option>
            </select>
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex flex-wrap gap-2 mt-2">
            {quickAmounts.map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                onClick={() => setAmount(quickAmount.toString())}
                disabled={isProcessing}
                className="px-3 py-1 text-xs bg-navy-900/50 hover:bg-navy-900/70 text-electric-blue rounded-lg border border-electric-blue/30 hover:border-electric-blue/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ${quickAmount}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-500/10 text-red-400 text-sm rounded-lg border border-red-500/20">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-3 bg-green-500/10 text-green-400 text-sm rounded-lg border border-green-500/20">
            {success}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSimulatePayment}
          disabled={isProcessing}
          className="w-full py-3 px-4 rounded-xl font-medium text-white shadow-lg transition-all duration-300 bg-gradient-to-r from-electric-blue to-purple-600 hover:shadow-electric-blue/25 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Processing Payment...
            </>
          ) : (
            <>
              <DollarSign size={18} />
              Simulate External Payment
            </>
          )}
        </button>
      </div>
    </SpotlightCard>
  );
}
