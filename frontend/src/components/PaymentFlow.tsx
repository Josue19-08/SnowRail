import { useState, useEffect } from "react";
import { executePayroll, getPaymentProofFromFacilitator, checkFacilitatorHealth } from "../lib/api";
import { getApiBase } from "../utils/api-config.js";
import type { MeteringInfo } from "../App";
import { CreditCard, CheckCircle2, AlertCircle, Loader2, X, ArrowRight, ShieldCheck, Wifi, WifiOff } from "lucide-react";
import { SpotlightCard } from "./ui/spotlight-card";
import { motion } from "framer-motion";

type PaymentFlowProps = {
  metering: MeteringInfo;
  meterId?: string;
  onSuccess: (payrollId: string) => void;
  onCancel: () => void;
};

type FlowStep = "review" | "getting-proof" | "validating" | "executing" | "success";

function PaymentFlow({ metering, meterId = "payroll_execute", onSuccess, onCancel }: PaymentFlowProps) {
  const [step, setStep] = useState<FlowStep>("review");
  const [error, setError] = useState<string | null>(null);
  const [facilitatorStatus, setFacilitatorStatus] = useState<"checking" | "online" | "offline">("checking");

  // Use full API URL for facilitator (not relative path)
  const FACILITATOR_URL = import.meta.env.VITE_FACILITATOR_URL?.trim() || `${getApiBase()}/facilitator`;

  // Check facilitator status on mount
  useEffect(() => {
    const checkFacilitator = async () => {
      const isHealthy = await checkFacilitatorHealth(FACILITATOR_URL);
      setFacilitatorStatus(isHealthy ? "online" : "offline");
    };
    checkFacilitator();
  }, [FACILITATOR_URL]);

  const handleGetPaymentProof = async () => {
    setStep("getting-proof");
    setError(null);

    try {
      console.log("Getting payment proof from facilitator...");
      // Get payment proof from facilitator
      const proof = await getPaymentProofFromFacilitator(
        FACILITATOR_URL,
        metering,
        meterId
      );
      console.log("Payment proof obtained:", proof ? "✓" : "✗");
      
      setStep("validating");
      
      // Small delay to show validation step
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // Execute payroll with payment proof
      setStep("executing");
      console.log("Executing payroll with proof...");
      const result = await executePayroll(proof);
      console.log("Payroll execution result:", result);

      if (result.success) {
        console.log("Payroll executed successfully:", result.data);
        setStep("success");
        // Small delay before redirecting
        setTimeout(() => {
          console.log("Navigating to agent identity...");
          onSuccess(result.data.payrollId);
        }, 1000);
      } else {
        console.error("Payroll execution failed:", result);
        // If we get 402 again, it means the payment proof was invalid
        if (result.status === 402) {
          setError(result.error.message || "Payment validation failed. Please try again.");
        } else {
          setError(result.error.message || "Payment validation failed");
        }
        setStep("review");
      }
    } catch (err) {
      console.error("Error in payment flow:", err);
      setError(err instanceof Error ? err.message : "Failed to process payment");
      setStep("review");
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12">
      <SpotlightCard className="bg-navy-900 border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="bg-navy-800/80 p-6 text-white flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <CreditCard className="text-red-500" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Payment Required</h2>
              <p className="text-gray-400 text-sm">x402 Protocol Protected</p>
            </div>
          </div>
          
          {/* Facilitator Status Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
            facilitatorStatus === 'online' 
              ? 'bg-green-500/10 border-green-500/20 text-green-400' 
              : facilitatorStatus === 'offline'
              ? 'bg-red-500/10 border-red-500/20 text-red-400'
              : 'bg-white/5 border-white/10 text-gray-400'
          }`}>
            {facilitatorStatus === 'checking' ? (
              <Loader2 size={10} className="animate-spin" />
            ) : facilitatorStatus === 'online' ? (
              <Wifi size={10} />
            ) : (
              <WifiOff size={10} />
            )}
            <span className="capitalize">{facilitatorStatus}</span>
          </div>
        </div>

        <div className="p-8">
          {/* Metering Info */}
          <div className="mb-8 bg-navy-800/50 rounded-xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-2">
                <span className="bg-white/10 text-gray-300 text-xs font-mono px-2 py-0.5 rounded border border-white/10">8004</span>
                <span className="text-sm font-medium text-white">{metering.resource}</span>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Price</span>
                <span className="text-lg font-bold text-white">
                  {metering.price} <span className="text-sm font-normal text-gray-400">{metering.asset}</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Network</span>
                <span className="text-sm font-medium text-white bg-white/5 px-2 py-0.5 rounded border border-white/10">
                  {metering.chain}
                </span>
              </div>
              {metering.description && (
                <div className="pt-3 mt-3 border-t border-white/10">
                  <p className="text-sm text-gray-400 italic">{metering.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Messages */}
          <div className="min-h-[60px] flex items-center justify-center mb-8">
            {step === "getting-proof" && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-2 text-gray-300"
              >
                <Loader2 className="animate-spin text-electric-blue" size={28} />
                <span className="text-sm font-medium">Getting proof from facilitator...</span>
              </motion.div>
            )}

            {step === "validating" && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-2 text-gray-300"
              >
                <ShieldCheck className="animate-pulse text-purple-500" size={28} />
                <span className="text-sm font-medium">Validating payment signature...</span>
              </motion.div>
            )}

            {step === "executing" && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-2 text-gray-300"
              >
                <Loader2 className="animate-spin text-green-500" size={28} />
                <span className="text-sm font-medium">Executing payroll...</span>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-2 text-green-400"
              >
                <CheckCircle2 size={32} />
                <span className="text-sm font-bold">Success! Redirecting...</span>
              </motion.div>
            )}

            {step === "review" && !error && (
              <div className="text-center text-gray-500 text-sm">
                Ready to process payment via facilitator
              </div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 px-4 py-3 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 w-full"
              >
                <AlertCircle size={20} className="shrink-0" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}
          </div>

          {/* Actions */}
          {step === "review" && (
            <div className="grid grid-cols-2 gap-4">
              <button
                className="py-3 px-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                onClick={onCancel}
                disabled={facilitatorStatus === "checking"}
              >
                <X size={18} />
                Cancel
              </button>
              <button
                className="py-3 px-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:scale-[1.02]"
                onClick={handleGetPaymentProof}
                disabled={facilitatorStatus === "checking"}
              >
                <CreditCard size={18} />
                Pay & Execute
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-navy-800/50 p-4 text-center border-t border-white/5">
          <p className="text-xs text-gray-500">
            <strong className="text-gray-400">Agent Flow:</strong> Automated validation via x402 facilitator.
          </p>
        </div>
      </SpotlightCard>
    </div>
  );
}

export default PaymentFlow;
