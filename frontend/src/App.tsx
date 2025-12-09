/**
 * Main App component with routing
 */

import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import { useState, Suspense } from "react";
import { useAuth } from "./hooks/use-auth.js";
import { ProtectedRoute } from "./components/auth/protected-route.js";
import { LoginPage } from "./pages/login.js";
import { SignupPage } from "./pages/signup.js";
import Dashboard from "./pages/dashboard.js";
import LegacyDashboard from "./components/Dashboard.js";
import PaymentForm from "./components/PaymentForm";
import PaymentFlow from "./components/PaymentFlow";
import ContractTest from "./components/ContractTest";
import { AgentIdentity } from "./components/AgentIdentity";
import { ParticleBackground } from "./components/ParticleBackground";
import { UserMenu } from "./components/auth/user-menu.js";
import { BackButton } from "./components/ui/back-button.js";
import "./App.css";
import type { MeteringInfo } from "./lib/api.js";

// Re-export MeteringInfo for backward compatibility
export type { MeteringInfo };

/**
 * Dashboard with Payment Flow Handler
 * Wraps LegacyDashboard to handle payment flow state
 */
function DashboardWithPaymentFlow() {
  const [paymentRequired, setPaymentRequired] = useState<MeteringInfo | null>(null);
  const navigate = useNavigate();

  const handlePaymentRequired = (metering: MeteringInfo) => {
    setPaymentRequired(metering);
  };

  const handlePaymentSuccess = () => {
    setPaymentRequired(null);
    // Navigate to agent identity page to see the executed payroll
    navigate("/agent-identity");
  };

  const handlePaymentCancel = () => {
    setPaymentRequired(null);
  };

  if (paymentRequired) {
    return (
      <PaymentFlow
        metering={paymentRequired}
        meterId={paymentRequired.meterId || "payroll_execute"}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
      />
    );
  }

  return <LegacyDashboard onPaymentRequired={handlePaymentRequired} />;
}

/**
 * Root route component that handles authentication check and routing
 */
function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Routes>
      {/* Root - landing page with demo content */}
      <Route
        path="/"
        element={
          isLoading ? (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-electric-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-electric-blue">Loading...</p>
              </div>
            </div>
          ) : isAuthenticated ? (
            <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
              <AppLayout>
                <DashboardWithPaymentFlow />
              </AppLayout>
            </ProtectedRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected routes */}
      <Route
        path="/treasury-dashboard"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Legacy hash routes - keeping for backward compatibility */}
      <Route
        path="/payment-form"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <AppLayout>
              <PaymentForm />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/contract-test"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <AppLayout>
              <ContractTest onBack={() => window.history.back()} />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/agent-identity"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <AppLayout>
              <AgentIdentity />
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

/**
 * App layout wrapper with header and footer
 */
function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const showBackButton = location.pathname !== "/" && location.pathname !== "/treasury-dashboard";

  return (
    <div className="relative w-full min-h-screen text-white overflow-hidden selection:bg-snow-red selection:text-white bg-navy-900">
      {/* Background Layers */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ParticleBackground />
        {/* Aurora Gradients */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-snow-red/20 rounded-full blur-[120px] animate-blob mix-blend-screen opacity-50" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-electric-blue/15 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-screen opacity-50" />
      </div>

      <div className="app min-h-screen font-sans relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-navy-900/70 border-b border-white/5 shadow-sm">
          <div className="container mx-auto px-4 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {showBackButton && (
                <div className="flex-shrink-0">
                  <BackButton iconOnly={true} />
                </div>
              )}
              <Link
                to="/"
                className="flex items-center gap-2 cursor-pointer group"
                aria-label="SnowRail home"
              >
                <img src="/snowrail_logo.png" alt="SnowRail Logo" className="w-10 h-10 object-contain hover:drop-shadow-[0_0_10px_rgba(0,212,255,0.5)] transition-all duration-300" />
                <span className="font-bold text-xl tracking-tight text-white group-hover:text-electric-blue transition-colors">SnowRail</span>
              </Link>
            </div>
            <div className="header-meta flex items-center gap-4">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-electric-blue hover:bg-white/10 transition-colors backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Avalanche C-Chain
              </span>
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="main py-12">
          <div className="container mx-auto px-4 max-w-6xl">{children}</div>
        </main>

        {/* Footer */}
        <footer className="footer py-8 bg-navy-900/50 backdrop-blur-md border-t border-white/5 mt-auto">
          <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
            <p className="flex items-center justify-center gap-2">
              <span>Powered by x402 Protocol</span>
              <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
              <span>Built on Avalanche</span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

/**
 * Main App component
 */
function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
