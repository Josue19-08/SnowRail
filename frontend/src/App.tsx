/**
 * Main App component with routing
 */

import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
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
                <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-teal-700">Loading...</p>
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
    <>
      <ParticleBackground />
      <div className="app min-h-screen text-slate-900 font-sans">
        {/* Header */}
        <header className="header sticky top-0 z-50 backdrop-blur-lg bg-gradient-to-r from-teal-50/95 via-white/95 to-teal-50/95 border-b border-teal-200/50 shadow-sm">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {showBackButton && (
                <div className="flex-shrink-0">
                  <BackButton iconOnly={true} />
                </div>
              )}
              <Link
                to="/"
                className="logo flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity no-underline hover:no-underline group"
                aria-label="SnowRail home"
              >
                <span className="logo-icon text-2xl group-hover:scale-110 transition-transform">❄️</span>
                <span className="logo-text font-bold text-xl tracking-tight text-teal-900">SnowRail</span>
              </Link>
            </div>
            <div className="header-meta flex items-center gap-3">
              <span className="chain-badge inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-100/80 border border-teal-200 text-sm font-medium text-teal-700 hover:bg-teal-100 transition-colors">
                <span className="chain-dot w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Avalanche C-Chain
              </span>
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="main py-8">
          <div className="container mx-auto px-4 max-w-5xl">{children}</div>
        </main>

        {/* Footer */}
        <footer className="footer py-8 bg-white border-t border-slate-200 mt-auto">
          <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
            <p>Powered by x402 Protocol • Built on Avalanche</p>
          </div>
        </footer>
      </div>
    </>
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
