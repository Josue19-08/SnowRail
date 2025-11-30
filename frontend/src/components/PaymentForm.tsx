import { useState } from "react";
import { processPayment } from "../lib/api";
import type { MeteringInfo } from "../App";
import "./PaymentForm.css";

type PaymentFormData = {
  customer: {
    first_name: string;
    last_name: string;
    email_address: string;
    telephone_number: string;
    mailing_address: {
      address_line1: string;
      city: string;
      state: string;
      postal_code: string;
      country_code: string;
    };
  };
  payment: {
    amount: string; // Will be converted to cents
    currency: string;
    recipient: string;
    description: string;
  };
};

type PaymentResult = {
  success: boolean;
  payrollId: string;
  status: string;
  steps: {
    payroll_created: boolean;
    payments_created: boolean;
    treasury_checked: boolean;
    onchain_requested: boolean;
    onchain_executed: boolean;
    rail_processed: boolean;
  };
  transactions?: {
    request_tx_hashes?: string[];
    execute_tx_hashes?: string[];
  };
  rail?: {
    withdrawal_id?: string;
    status?: string;
  };
  errors?: Array<{
    step: string;
    error: string;
  }>;
};

function PaymentForm({ onBack, onSuccess }: { onBack?: () => void; onSuccess?: (payrollId: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentRequired, setPaymentRequired] = useState<MeteringInfo | null>(null);
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [step, setStep] = useState<string>("");

  const [formData, setFormData] = useState<PaymentFormData>({
    customer: {
      first_name: "",
      last_name: "",
      email_address: "",
      telephone_number: "+15551234567",
      mailing_address: {
        address_line1: "",
        city: "",
        state: "",
        postal_code: "",
        country_code: "US",
      },
    },
    payment: {
      amount: "",
      currency: "USD",
      recipient: "",
      description: "",
    },
  });

  const handleInputChange = (
    section: "customer" | "payment",
    field: string,
    value: string
  ) => {
    if (section === "customer") {
      if (field.startsWith("address_")) {
        const addressField = field.replace("address_", "");
        setFormData((prev) => ({
          ...prev,
          customer: {
            ...prev.customer,
            mailing_address: {
              ...prev.customer.mailing_address,
              [addressField]: value,
            },
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          customer: {
            ...prev.customer,
            [field]: value,
          },
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        payment: {
          ...prev.payment,
          [field]: value,
        },
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setPaymentRequired(null);
    setStep("");

    try {
      // Validate form
      if (!formData.customer.first_name || !formData.customer.last_name) {
        throw new Error("First name and last name are required");
      }
      if (!formData.customer.email_address) {
        throw new Error("Email address is required");
      }
      if (!formData.payment.amount || parseFloat(formData.payment.amount) <= 0) {
        throw new Error("Payment amount must be greater than 0");
      }

      // Convert amount to cents
      const amountInCents = Math.round(parseFloat(formData.payment.amount) * 100);

      setStep("1. Submitting payment request...");

      // Send with demo-token from the start to avoid 402 error
      const response = await processPayment(
        {
          customer: formData.customer,
          payment: {
            amount: amountInCents,
            currency: formData.payment.currency,
            recipient: formData.payment.recipient || undefined,
            description: formData.payment.description || undefined,
          },
        },
        "demo-token" // Always send demo-token to avoid 402
      );

      if (!response.success) {
        // If we still get 402, show payment required UI
        if (response.status === 402 && response.error.metering) {
          const meteringInfo: MeteringInfo = {
            ...(response.error.metering as MeteringInfo),
            meterId: response.error.meterId || "payment_process",
          };
          setPaymentRequired(meteringInfo);
          setStep("2. Payment required - please complete payment...");
          return; // Don't throw error, let user complete payment
        }
        throw new Error(response.error.message || "Payment processing failed");
      }

      setResult(response.data);
      setStep("✅ Payment processed successfully!");

      if (response.data.success && onSuccess) {
        onSuccess(response.data.payrollId);
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to process payment";
      console.error("Payment processing error:", err);
      setError(errorMessage);
      setStep("❌ Payment processing failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-form">
      {onBack && (
        <button className="back-button" onClick={onBack}>
          ← Back to Dashboard
        </button>
      )}

      <div className="card">
        <div className="form-header">
          <div className="form-icon">💳</div>
          <div>
            <h2>Process Payment</h2>
            <p>Complete payment flow: Rail + Blockchain + Facilitator</p>
          </div>
        </div>

        {step && (
          <div className="step-indicator">
            <span>{step}</span>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {paymentRequired && (
          <div className="payment-info">
            <p>
              <strong>Payment Required:</strong> {paymentRequired.price} {paymentRequired.asset} on {paymentRequired.chain}
            </p>
            <p className="payment-note">Using demo-token for testnet</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="payment-form-content">
          {/* Customer Information */}
          <div className="form-section">
            <h3>Customer Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  value={formData.customer.first_name}
                  onChange={(e) => handleInputChange("customer", "first_name", e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  value={formData.customer.last_name}
                  onChange={(e) => handleInputChange("customer", "last_name", e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  value={formData.customer.email_address}
                  onChange={(e) => handleInputChange("customer", "email_address", e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={formData.customer.telephone_number}
                  onChange={(e) => handleInputChange("customer", "telephone_number", e.target.value)}
                  placeholder="+15551234567"
                />
              </div>
            </div>

            {/* Mailing Address */}
            <div className="form-subsection">
              <h4>Mailing Address</h4>
              <div className="form-group">
                <label>Address Line 1 *</label>
                <input
                  type="text"
                  value={formData.customer.mailing_address.address_line1}
                  onChange={(e) => handleInputChange("customer", "address_address_line1", e.target.value)}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    value={formData.customer.mailing_address.city}
                    onChange={(e) => handleInputChange("customer", "address_city", e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    value={formData.customer.mailing_address.state}
                    onChange={(e) => handleInputChange("customer", "address_state", e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Postal Code *</label>
                  <input
                    type="text"
                    value={formData.customer.mailing_address.postal_code}
                    onChange={(e) => handleInputChange("customer", "address_postal_code", e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Country Code *</label>
                  <input
                    type="text"
                    value={formData.customer.mailing_address.country_code}
                    onChange={(e) => handleInputChange("customer", "address_country_code", e.target.value)}
                    required
                    maxLength={2}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="form-section">
            <h3>Payment Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Amount (USD) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.payment.amount}
                  onChange={(e) => handleInputChange("payment", "amount", e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Currency</label>
                <select
                  value={formData.payment.currency}
                  onChange={(e) => handleInputChange("payment", "currency", e.target.value)}
                >
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Recipient Address (Optional)</label>
              <input
                type="text"
                value={formData.payment.recipient}
                onChange={(e) => handleInputChange("payment", "recipient", e.target.value)}
                placeholder="0x..."
              />
            </div>
            <div className="form-group">
              <label>Description (Optional)</label>
              <input
                type="text"
                value={formData.payment.description}
                onChange={(e) => handleInputChange("payment", "description", e.target.value)}
                placeholder="Payment description"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-large"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Processing Payment...
              </>
            ) : (
              <>
                <span>🚀</span>
                Process Payment
              </>
            )}
          </button>
        </form>

        {/* Results */}
        {result && (
          <div className="payment-results">
            <h3>Processing Results</h3>
            <div className="result-summary">
              <div className={`status-badge ${result.success ? "success" : "failed"}`}>
                {result.success ? "✅ Success" : "❌ Failed"}
              </div>
              <div className="result-info">
                <p><strong>Payroll ID:</strong> {result.payrollId}</p>
                <p><strong>Status:</strong> {result.status}</p>
              </div>
            </div>

            <div className="steps-status">
              <h4>Processing Steps</h4>
              <ul>
                <li className={result.steps.payroll_created ? "success" : "pending"}>
                  {result.steps.payroll_created ? "✅" : "⏳"} Payroll Created
                </li>
                <li className={result.steps.payments_created ? "success" : "pending"}>
                  {result.steps.payments_created ? "✅" : "⏳"} Payments Created
                </li>
                <li className={result.steps.treasury_checked ? "success" : "pending"}>
                  {result.steps.treasury_checked ? "✅" : "⏳"} Treasury Checked
                </li>
                <li className={result.steps.onchain_requested ? "success" : "pending"}>
                  {result.steps.onchain_requested ? "✅" : "⏳"} On-Chain Requested
                </li>
                <li className={result.steps.onchain_executed ? "success" : "pending"}>
                  {result.steps.onchain_executed ? "✅" : "⏳"} On-Chain Executed
                </li>
                <li className={result.steps.rail_processed ? "success" : "pending"}>
                  {result.steps.rail_processed ? "✅" : "⏳"} Rail Processed
                </li>
              </ul>
            </div>

            {result.transactions && (
              <div className="transactions">
                <h4>Blockchain Transactions</h4>
                {result.transactions.request_tx_hashes && result.transactions.request_tx_hashes.length > 0 && (
                  <div>
                    <strong>Request Transactions:</strong>
                    <ul>
                      {result.transactions.request_tx_hashes.map((hash, idx) => (
                        <li key={idx}>
                          <a
                            href={`https://testnet.snowtrace.io/tx/${hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="tx-link"
                          >
                            {hash}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.transactions.execute_tx_hashes && result.transactions.execute_tx_hashes.length > 0 && (
                  <div>
                    <strong>Execute Transactions:</strong>
                    <ul>
                      {result.transactions.execute_tx_hashes.map((hash, idx) => (
                        <li key={idx}>
                          <a
                            href={`https://testnet.snowtrace.io/tx/${hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="tx-link"
                          >
                            {hash}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {result.rail && (
              <div className="rail-info">
                <h4>Rail Processing</h4>
                <p><strong>Withdrawal ID:</strong> {result.rail.withdrawal_id}</p>
                <p><strong>Status:</strong> {result.rail.status}</p>
              </div>
            )}

            {result.errors && result.errors.length > 0 && (
              <div className="errors">
                <h4>Errors</h4>
                <ul>
                  {result.errors.map((err, idx) => (
                    <li key={idx}>
                      <strong>{err.step}:</strong> {err.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentForm;

