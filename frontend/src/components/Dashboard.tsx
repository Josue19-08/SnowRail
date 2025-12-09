import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { executePayroll } from "../lib/api";
import type { MeteringInfo } from "../App";
import { CreditCard, Wallet, Box, ArrowRight, Zap, Shield, Activity, Globe, DollarSign, Sparkles, BarChart3 } from "lucide-react";
import { SpotlightCard } from "./ui/spotlight-card";
import { motion } from "framer-motion";

type DashboardProps = {
  onPaymentRequired: (metering: MeteringInfo) => void;
};

function Dashboard({ onPaymentRequired }: DashboardProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExecutePayroll = async () => {
    setLoading(true);
    setError(null);

    try {
      // First call without payment token - expect 402
      const result = await executePayroll();

      if (!result.success && result.status === 402) {
        // Payment required - show payment flow
        if (result.error.metering) {
          const meteringInfo: MeteringInfo = {
            ...(result.error.metering as MeteringInfo),
            meterId: result.error.meterId || "payroll_execute",
          };
          onPaymentRequired(meteringInfo);
        }
      } else if (!result.success) {
        setError(result.error.message || "Failed to execute payroll");
      }
    } catch (err) {
      setError("Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      {/* Hero Section */}
      <section className="text-center py-16 max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-electric-blue text-sm font-medium mb-6 backdrop-blur-sm"
        >
          <Sparkles size={14} />
          <span>Sovereign Agent Stack • x402 + ERC-8004 + Arweave</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-tight"
        >
          AI-Native Treasury on
          <span className="text-electric-blue"> Avalanche</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto"
        >
          Autonomous treasury orchestration for AI agents. Execute cross-border payroll with permanent audit trail.
        </motion.p>
        
        {/* Treasury Dashboard Link */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center mt-8"
        >
          <button
            onClick={() => navigate("/treasury-dashboard")}
            className="btn btn-primary btn-large flex items-center gap-2 px-8 py-4 text-lg bg-gradient-to-r from-electric-blue to-purple-600 rounded-full hover:shadow-lg hover:shadow-electric-blue/20 transition-all"
          >
            <BarChart3 size={20} />
            View Treasury Dashboard
          </button>
        </motion.div>
      </section>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
      {/* Main Action Card */}
        <SpotlightCard className="p-8 flex flex-col bg-navy-800/50">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-electric-blue/10 rounded-xl shrink-0 text-electric-blue">
              <Wallet size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Demo Payroll</h2>
              <p className="text-gray-400">Execute a batch payment to 10 freelancers</p>
            </div>
          </div>

          <div className="space-y-3 mb-6 bg-navy-900/50 p-4 rounded-xl border border-white/5 flex-grow">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Recipients</span>
              <span className="font-medium text-white">10 freelancers</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Amount</span>
              <span className="font-medium text-white">$6,000.00 USD</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Network</span>
              <span className="font-medium text-white">Avalanche C-Chain</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Protocol</span>
              <span className="font-mono text-xs bg-electric-blue/20 px-2 py-0.5 rounded text-electric-blue border border-electric-blue/30">x402 + 8004</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 text-red-400 text-sm rounded-lg border border-red-500/20 flex items-center gap-2">
              <Activity size={16} />
              {error}
            </div>
          )}

          <button
            className="btn btn-primary btn-large w-full mt-auto"
            onClick={handleExecutePayroll}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <Zap size={18} />
                Execute Payroll
              </>
            )}
          </button>
        </SpotlightCard>

      {/* Payment Form Section */}
        <SpotlightCard className="p-8 flex flex-col bg-navy-800/50">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-purple-600/10 rounded-xl shrink-0 text-purple-400">
              <CreditCard size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Process Payment</h2>
              <p className="text-gray-400">Complete payment flow: Rail + Blockchain</p>
            </div>
          </div>

          <div className="space-y-3 mb-6 bg-navy-900/50 p-4 rounded-xl border border-white/5 flex-grow">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Integration</span>
              <span className="font-medium text-white">Rail API + Smart Contracts</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Payment Method</span>
              <span className="font-medium text-white">x402 Protocol</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Network</span>
              <span className="font-medium text-white">Avalanche Fuji Testnet</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Features</span>
              <span className="font-medium text-white">Gasless Transactions</span>
            </div>
          </div>

          <button
            className="btn btn-secondary w-full mt-auto flex items-center justify-center gap-2"
            onClick={() => navigate("/payment-form")}
          >
            <span>🚀</span>
            Open Payment Form
          </button>
        </SpotlightCard>
      </div>

      {/* Sovereign Agent Stack Cards */}
      <section className="grid md:grid-cols-3 gap-6 mb-16">
        <SpotlightCard className="p-6 bg-navy-800/30">
          <div className="w-10 h-10 bg-electric-blue/10 rounded-lg flex items-center justify-center mb-4 text-electric-blue">
            <Shield size={20} />
          </div>
          <h3 className="font-bold text-white mb-2">Payments & Metering</h3>
          <p className="text-sm text-gray-400">x402 + ERC-8004 protocol for autonomous AI agent payments.</p>
        </SpotlightCard>
        
        <SpotlightCard className="p-6 bg-navy-800/30">
          <div className="w-10 h-10 bg-purple-600/10 rounded-lg flex items-center justify-center mb-4 text-purple-400">
            <Sparkles size={20} />
          </div>
          <h3 className="font-bold text-white mb-2">Agent Identity</h3>
          <p className="text-sm text-gray-400">ERC-8004 identity card for agent-to-agent discovery.</p>
        </SpotlightCard>
        
        <SpotlightCard className="p-6 bg-navy-800/30">
          <div className="w-10 h-10 bg-snow-red/10 rounded-lg flex items-center justify-center mb-4 text-snow-red">
            <Box size={20} />
          </div>
          <h3 className="font-bold text-white mb-2">Permanent Storage</h3>
          <p className="text-sm text-gray-400">Arweave receipts - immutable audit trail forever.</p>
        </SpotlightCard>
      </section>

      {/* Agent Identity Section - Highlighted */}
      <SpotlightCard className="p-8 relative overflow-hidden mb-8 border-electric-blue/30 bg-gradient-to-br from-navy-900 to-navy-800">
        <div className="absolute top-0 right-0 p-32 bg-electric-blue rounded-full blur-[100px] opacity-10 -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/10 rounded-xl text-white shrink-0 backdrop-blur-sm border border-white/10">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">🤖 Agent Activity & Identity</h2>
              <p className="text-gray-400 max-w-xl">View real payroll transactions with Arweave receipts, agent identity (ERC-8004), and live statistics.</p>
            </div>
          </div>
          
          <button
            className="py-3 px-6 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors flex items-center gap-2 whitespace-nowrap border border-white/10 backdrop-blur-sm"
            onClick={() => navigate("/agent-identity")}
          >
            View Activity
            <ArrowRight size={16} />
          </button>
        </div>
      </SpotlightCard>

      {/* Contract Test Section */}
      <SpotlightCard className="p-8 relative overflow-hidden mb-16 border-purple-600/30 bg-gradient-to-br from-navy-900 to-navy-800">
        <div className="absolute top-0 right-0 p-32 bg-purple-600 rounded-full blur-[100px] opacity-10 -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/10 rounded-xl text-white shrink-0 backdrop-blur-sm border border-white/10">
              <Activity size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Contract Test</h2>
              <p className="text-gray-400 max-w-xl">Test Treasury contract operations through the agent with facilitator validation.</p>
            </div>
          </div>
          
          <button
            className="py-3 px-6 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors flex items-center gap-2 whitespace-nowrap border border-white/10 backdrop-blur-sm"
            onClick={() => navigate("/contract-test")}
          >
            Run Contract Test
            <ArrowRight size={16} />
          </button>
        </div>
      </SpotlightCard>

      {/* About Section - Clean and Simple */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Built for Autonomous AI Agents
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
            SnowRail implements the Sovereign Agent Stack - the first treasury system designed for AI agents 
            to discover, pay, and execute cross-border payroll autonomously.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Benefit 1 */}
          <SpotlightCard className="p-8 text-center bg-navy-800/30">
            <div className="w-14 h-14 bg-electric-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-electric-blue">
              <Globe size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Global Reach</h3>
            <p className="text-gray-400 leading-relaxed">
              Pay anyone, anywhere in the world. Send stablecoins to freelancers and contractors 
              without borders or bank delays.
            </p>
          </SpotlightCard>

          {/* Benefit 2 */}
          <SpotlightCard className="p-8 text-center bg-navy-800/30">
            <div className="w-14 h-14 bg-purple-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-400">
              <Zap size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Instant Payments</h3>
            <p className="text-gray-400 leading-relaxed">
              Settle payments in seconds on Avalanche blockchain. 
              No waiting days for bank transfers or dealing with intermediaries.
            </p>
          </SpotlightCard>

          {/* Benefit 3 */}
          <SpotlightCard className="p-8 text-center bg-navy-800/30">
            <div className="w-14 h-14 bg-snow-red/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-snow-red">
              <DollarSign size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Transparent Costs</h3>
            <p className="text-gray-400 leading-relaxed">
              Pay only for what you use with clear, upfront pricing. 
              No hidden fees, no surprises, powered by x402 protocol.
            </p>
          </SpotlightCard>
        </div>

        {/* Simple CTA */}
        <div className="glass-panel p-10 mt-8 text-center border-electric-blue/30 bg-gradient-to-r from-navy-900/50 to-navy-800/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-electric-blue/5 animate-pulse"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-electric-blue font-medium mb-4 border border-white/10 backdrop-blur-sm">
              <Sparkles size={16} />
              <span>Built on Avalanche</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Ready to streamline your global payroll?
            </h3>
            <p className="text-gray-400 text-lg">
              Try our demo and experience the future of international payments
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Dashboard;
