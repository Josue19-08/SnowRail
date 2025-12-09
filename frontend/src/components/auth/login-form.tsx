/**
 * Login form component
 * Handles user login with email and password
 */

import { useState } from "react";
import { Mail, Lock, AlertCircle, Eye, EyeOff, Snowflake } from "lucide-react";
import type { LoginRequest } from "../../types/auth-types.js";
import { motion } from "framer-motion";
import { SpotlightCard } from "../ui/spotlight-card";

type LoginFormProps = {
  onSubmit: (data: LoginRequest) => Promise<boolean>;
  isLoading?: boolean;
  error?: string | null;
  onNavigateToSignup?: () => void;
};

export function LoginForm({
  onSubmit,
  isLoading = false,
  error: externalError = null,
  onNavigateToSignup,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!email || !password) {
      setError("Please complete all required fields");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    const success = await onSubmit({ email, password });
    setIsSubmitting(false);

    if (!success) {
      // Error is handled by parent component
      return;
    }
  };

  const displayError = externalError || error;
  const submitting = isLoading || isSubmitting;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <SpotlightCard className="p-8 border-white/10 bg-navy-800/50">
        <div className="text-center mb-8">
          <div className="mb-6">
            <img src="/snowrail_logo.png" alt="SnowRail Logo" className="w-16 h-16 object-contain mx-auto drop-shadow-[0_0_15px_rgba(0,212,255,0.3)]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Welcome back
          </h1>
          <p className="text-gray-400">Sign in to your SnowRail account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Email field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Email
            </label>
            <div className="relative">
              <div className="absolute top-0 bottom-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <Mail className="w-5 h-5 text-gray-500" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-navy-900/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-electric-blue focus:ring-1 focus:ring-electric-blue transition-all"
                placeholder="you@company.com"
                disabled={submitting}
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <div className="flex justify-between mb-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <a href="#" className="text-sm text-electric-blue hover:text-white transition-colors">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <div className="absolute top-0 bottom-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <Lock className="w-5 h-5 text-gray-500" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-3 bg-navy-900/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-electric-blue focus:ring-1 focus:ring-electric-blue transition-all"
                placeholder="••••••••"
                disabled={submitting}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-0 bottom-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Error message */}
          {displayError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{displayError}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting}
            className={`
              w-full py-3 px-4 rounded-xl font-medium text-white shadow-lg transition-all duration-300
              ${submitting 
                ? 'bg-gray-600 cursor-not-allowed opacity-70' 
                : 'bg-gradient-to-r from-electric-blue to-purple-600 hover:shadow-electric-blue/25 hover:scale-[1.02]'
              }
              flex items-center justify-center gap-2
            `}
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        {/* Sign up link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onNavigateToSignup}
              className="font-medium text-electric-blue hover:text-white transition-colors"
            >
              Sign up
            </button>
          </p>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}
