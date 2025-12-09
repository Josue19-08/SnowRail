import { Archive, Sparkles, TrendingUp } from "lucide-react";

interface AgentIdentityTabsProps {
  activeTab: "activity" | "identity" | "stats";
  onTabChange: (tab: "activity" | "identity" | "stats") => void;
}

export function AgentIdentityTabs({ activeTab, onTabChange }: AgentIdentityTabsProps) {
  const baseButtonClass = "flex-1 min-w-0 px-6 py-4 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 relative z-10";
  
  return (
    <div className="flex items-stretch gap-2 mb-6 bg-navy-900/50 p-1.5 rounded-2xl border border-white/5 w-full backdrop-blur-sm">
      <button
        onClick={() => onTabChange("activity")}
        type="button"
        className={`${baseButtonClass} ${
          activeTab === "activity"
            ? "bg-electric-blue/10 text-electric-blue border border-electric-blue/30 shadow-[0_0_15px_rgba(0,212,255,0.1)]"
            : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
        }`}
      >
        <Archive size={18} className="flex-shrink-0" />
        <span className="whitespace-nowrap">Payroll History</span>
      </button>
      <button
        onClick={() => onTabChange("identity")}
        type="button"
        className={`${baseButtonClass} ${
          activeTab === "identity"
            ? "bg-purple-600/10 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(147,51,234,0.1)]"
            : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
        }`}
      >
        <Sparkles size={18} className="flex-shrink-0" />
        <span className="whitespace-nowrap">Agent Identity</span>
      </button>
      <button
        onClick={() => onTabChange("stats")}
        type="button"
        className={`${baseButtonClass} ${
          activeTab === "stats"
            ? "bg-snow-red/10 text-snow-red border border-snow-red/30 shadow-[0_0_15px_rgba(232,65,66,0.1)]"
            : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
        }`}
      >
        <TrendingUp size={18} className="flex-shrink-0" />
        <span className="whitespace-nowrap">Statistics</span>
      </button>
    </div>
  );
}
