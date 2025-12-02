# SnowRail

SnowRail is a treasury orchestrator that connects onchain payments (Avalanche C-Chain) with fiat bank payouts using a Rail-like API, protected by the **x402** protocol for API monetization.

- **Onchain**: Users pay in USDC into an EVM treasury (Avalanche C-Chain).
- **SnowRail Backend**: Validates access via x402, runs payroll logic, and triggers Rail payouts.
- **Rail (mock in this MVP)**: Executes fiat payouts (ACH/wire) to bank accounts.
- **Webhooks (future)**: Rail notifies status changes that SnowRail syncs back into the app.

---

## High-Level Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│  Frontend   │────▶│  SnowRail API    │────▶│    Rail     │
│  (React)    │     │  (Express + x402)│     │  (Fiat API) │
└─────────────┘     └────────┬─────────┘     └─────────────┘
                             │
                    ┌────────▼──────────┐
                    │ Avalanche C-Chain │
                    │ (SnowRailTreasury)│
                    └───────────────────┘
```

- **Frontend**: React app that consumes the SnowRail API and drives the demo UX.
- **Backend**: REST API with x402/8004, payroll orchestration, and Rail integration (mock).
- **Smart Contracts**: `SnowRailTreasury` deployed on Avalanche C-Chain.
- **Database**: SQLite in dev (easily swappable to PostgreSQL via Prisma).

---

## Tech Stack

| Area       | Tech                                                    |
|-------------|----------------------------------------------------------|
| Backend     | Node.js, TypeScript, Express                             |
| Database    | Prisma ORM, SQLite (dev) / PostgreSQL-ready (prod)       |
| Onchain     | Ethers.js, Avalanche C-Chain                             |
| Protocols   | x402 (HTTP 402), 8004 (metering config)                  |
| Fiat        | Rail API (mocked client in this MVP)                     |
| Frontend    | React, Vite, TypeScript                                  |
| Contracts   | Solidity ^0.8.20, Hardhat                                |

---

## Project Structure

```
/contracts                  # Solidity smart contracts
  └── src/
      ├── SnowRailTreasury.sol
      └── interfaces/
          ├── IERC20.sol
          └── IJoeRouter2.sol

/backend                    # Node.js backend (Express + x402)
  ├── prisma/
  │   └── schema.prisma
  └── src/
      ├── index.ts          # Server entrypoint
      ├── app.ts            # Express app factory
      ├── config/           # env, network, contract config
      ├── db/               # Prisma client
      ├── x402/             # x402 middleware + 8004 metering
      ├── api/              # Routes + controllers
      ├── services/         # Treasury, Rail (mock), Payroll, Payments
      ├── domain/           # Domain types (payroll, payment)
      └── utils/            # Logger, error helpers

/frontend                   # React demo frontend
  └── src/
      ├── App.tsx          # View orchestration
      ├── components/      # Dashboard, PaymentFlow, PayrollDetail
      └── lib/             # API client (executePayroll, getPayroll)
```

---

## Environment Configuration

### For Development (Fuji Testnet)

```bash
# Server
PORT=4000

# Database
DATABASE_URL="file:./prisma/dev.db"

# Network (fuji for testnet, avalanche for mainnet)
NETWORK=fuji
RPC_URL_AVALANCHE=https://api.avax-test.network/ext/bc/C/rpc

# Smart Contract (Fuji Testnet)
TREASURY_CONTRACT_ADDRESS=0xcba2318C6C4d9c98f7732c5fDe09D1BAe12c27be
PRIVATE_KEY=0x...  # EVM private key for treasury signer

# x402 Facilitator (integrated in same server)
# No need to set X402_FACILITATOR_URL - facilitator runs at /facilitator

# Rail API (Sandbox)
RAIL_API_BASE_URL=https://sandbox.layer2financial.com/api
RAIL_AUTH_URL=https://auth.layer2financial.com/oauth2/ausbdqlx69rH6OjWd696/v1/token
RAIL_CLIENT_ID=0oaomrdnngvTiszCO697
RAIL_CLIENT_SECRET=your_rail_secret_here

# AI Provider (optional - for AI agent endpoints)
AI_PROVIDER=openai  # or eigenai
OPENAI_API_KEY=your_openai_key_here
```

### For Production (Avalanche Mainnet)

```bash
NETWORK=avalanche
RPC_URL_AVALANCHE=https://api.avax.network/ext/bc/C/rpc
TREASURY_CONTRACT_ADDRESS=0xYourMainnetAddressHere
```

> **Switching networks**: set `NETWORK=fuji` (testnet) or `NETWORK=avalanche` (mainnet) and point `TREASURY_CONTRACT_ADDRESS` to the correct deployment. No business logic changes required.

---

## Protocols

### x402 – HTTP 402 Payment Required

All monetized endpoints are protected by a dedicated middleware:

**POST /api/payroll/execute**

- **Without** `X-PAYMENT` header → HTTP 402 with metering payload:
  
  ```json
  {
    "error": "PAYMENT_REQUIRED",
    "meterId": "payroll_execute",
    "metering": {
      "price": "1",
      "asset": "USDC",
      "chain": "avalanche",
      "resource": "payroll_execution",
      "version": "8004-alpha"
    }
  }
  ```

- **With** `X-PAYMENT: demo-token` (MVP) → access is granted and payroll is executed.

**Implementation:**
- `backend/src/x402/metering.ts` – resource catalog.
- `backend/src/x402/validator.ts` – validates `X-PAYMENT` (accepts `demo-token`).
- `backend/src/x402/middleware.ts` – Express middleware that issues HTTP 402.

---

### 8004 – Metering Configuration

```ts
// backend/src/x402/metering.ts
export const meters = {
  payroll_execute: {
    price: "1",
    asset: "USDC",
    chain: "avalanche",
    resource: "payroll_execution",
    description: "Execute international payroll for up to 10 freelancers",
    version: "8004-alpha",
  },
};
```

This structure is intentionally ORM-like so additional resources can be added without changing the middleware.

---

## Backend API

| Method | Endpoint               | Protection | Description                    |
|--------|------------------------|-------------|--------------------------------|
| GET    | `/api/health`          | None        | Service health check           |
| POST   | `/api/payroll/execute` | x402        | Execute demo payroll           |
| GET    | `/api/payroll/:id`     | None        | Get payroll by ID              |
| POST   | `/api/payment/process` | x402        | Complete payment flow (Rail + On-chain) |
| GET    | `/api/treasury/balance`| None        | Get treasury USDC balance     |
| POST   | `/api/treasury/test`   | x402        | Test contract via AI agent     |
| POST   | `/process`             | x402        | AI agent endpoint (A2A compatible) |
| GET    | `/facilitator/health`  | None        | Facilitator health check       |
| POST   | `/facilitator/validate`| None       | Validate payment proof         |

### Status Lifecycle

```
PENDING → ONCHAIN_PAID → RAIL_PROCESSING → PAID
                                   └──────→ FAILED
```

All states are persisted in SQLite via Prisma and exposed to the frontend.

---

## Smart Contracts

### SnowRailTreasury (Solidity)

`contracts/src/SnowRailTreasury.sol` is the onchain treasury for SnowRail:

**State**
- `address public owner;`
- `IJoeRouter2 public router;`
- `mapping(address => mapping(address => uint256)) public swapAllowances;`

**Events**
- `PaymentRequested(payer, payee, amount, token)`
- `PaymentExecuted(payer, payee, amount, token)`
- `PaymentFailed(payer, payee, amount, token, reason)`
- `SwapAuthorized(owner, fromToken, toToken, maxAmount)`
- `SwapExecuted(swapper, fromToken, toToken, amount)`

**Core functions**
- `requestPayment(address payee, uint256 amount, address token)` – logs intent to pay.
- `executePayment(address payer, address payee, uint256 amount, address token)` – sends tokens from treasury to `payee`, emits success/failure events.
- `authorizeSwap(address fromToken, address toToken, uint256 maxAmount)` – admin-only swap limits.
- `executeSwap(address fromToken, address toToken, uint256 amountIn, uint256 amountOutMin, address[] calldata path)` – calls DEX router for swaps.

A thin **ethers.js wrapper** is provided by `backend/src/services/treasuryClient.ts`.

---

## Demo Payroll Flow (End-to-End)

1. **User** opens `http://localhost:3000` and clicks **“Execute Payroll”**.
2. **Frontend** calls `POST /api/payroll/execute` without `X-PAYMENT`.
3. **x402 middleware** returns `402 PAYMENT_REQUIRED` with the `payroll_execute` meter.
4. **Frontend** shows the 8004 metering info (1 USDC on Avalanche) and a **“Simulate Onchain Payment”** button.
5. User clicks the button; frontend calls `POST /api/payroll/execute` with `X-PAYMENT: demo-token`.
6. **x402** validates the token and lets the request through.
7. **Payroll service** (`executePayrollDemo`) creates a `Payroll` with 10 `Payment` rows and transitions states:
   - `PENDING → ONCHAIN_PAID → RAIL_PROCESSING → PAID` (via mock `railClient`).
8. Backend responds with `{ payrollId, status, total, payments[] }`.
9. Frontend navigates to **PayrollDetail** and polls `GET /api/payroll/:id` every few seconds.
10. UI updates until status is **PAID** or **FAILED**, showing a table of the 10 payments.

For a deeper explanation, see `PAYMENT_FLOW_DIAGRAM.md`.

---

## AI Agent Payments

SnowRail enables **machine-to-machine payments** through the x402 protocol, allowing AI agents to autonomously pay for services without human intervention.

### How It Works

1. **AI Agent** makes a request to `POST /process` (A2A-compatible endpoint)
2. **Backend** returns `402 Payment Required` with payment requirements
3. **Agent** creates EIP-3009 signed authorization using its wallet
4. **Agent** resubmits request with payment proof in metadata
5. **Backend** validates payment via facilitator and processes request
6. **Payment** is settled on-chain automatically

### Example: AI Agent Request

```typescript
// Agent sends request
const response = await fetch('http://localhost:4000/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: {
      messageId: 'msg-123',
      role: 'user',
      parts: [{ kind: 'text', text: 'Process my payroll' }],
      metadata: {
        'x402.payment.payload': paymentProof, // EIP-3009 signed authorization
        'x402.payment.status': 'payment-submitted',
        'agent.id': 'agent-abc-123'
      }
    }
  })
});
```

### Use Cases

- **AI Agents** can pay for compute, storage, or API access automatically
- **Autonomous Systems** can execute treasury operations without manual approval
- **Machine-to-Machine** payments for microservices and APIs
- **Automated Workflows** that require on-chain payments

### Endpoints for AI Agents

- **`POST /process`**: Main endpoint for AI agent requests (A2A compatible)
- **`POST /api/treasury/test`**: Test treasury contract operations via agent
- **`GET /facilitator/health`**: Check facilitator status

The x402 protocol is **designed for agents** - payments are cryptographically verified and settled automatically, enabling true autonomous economic agents.

---

## Deployment to Avalanche Testnet (Fuji)

### Prerequisites

- Node.js 18+
- A wallet with Fuji testnet AVAX (for gas) and USDC
- Hardhat installed globally or locally

### Step 1: Deploy Smart Contract

```bash
cd contracts

# Install dependencies
npm install

# Set environment variables
export PRIVATE_KEY=0xYourPrivateKey
export ROUTER_ADDRESS_FUJI=0x688d21b0B8Fc35968A1940f5A36D66A0f522E5B3

# Deploy to Fuji testnet
npm run deploy:fuji
```

The script will output the deployed contract address. Save this for your `.env` file.

**Example output:**
```
SnowRailTreasury deployed to: 0xcba2318C6C4d9c98f7732c5fDe09D1BAe12c27be
```

### Step 2: Fund the Treasury

After deployment, fund the contract with USDC:

```bash
cd backend

# Set your environment
export PRIVATE_KEY=0xYourPrivateKey
export TREASURY_CONTRACT_ADDRESS=0xcba2318C6C4d9c98f7732c5fDe09D1BAe12c27be
export NETWORK=fuji

# Fund with 100 USDC (example)
npx tsx fund-treasury.ts 100
```

The script will:
- Check your wallet balance
- Transfer USDC to the treasury contract
- Display the new treasury balance

### Step 3: Configure Backend

Update `backend/.env`:

```bash
NETWORK=fuji
RPC_URL_AVALANCHE=https://api.avax-test.network/ext/bc/C/rpc
TREASURY_CONTRACT_ADDRESS=0xcba2318C6C4d9c98f7732c5fDe09D1BAe12c27be
PRIVATE_KEY=0xYourPrivateKey
```

### Step 4: Verify Deployment

View your contract on Snowtrace Testnet:
- **Contract**: `https://testnet.snowtrace.io/address/YOUR_CONTRACT_ADDRESS`
- **Transactions**: Check the deployment transaction hash

### Step 5: Test the Deployment

```bash
# Start backend
cd backend
npm run dev

# In another terminal, test contract operations
curl -X POST http://localhost:4000/api/treasury/test \
  -H "Content-Type: application/json" \
  -H "X-PAYMENT: demo-token"
```

### Getting Testnet Tokens

- **AVAX (for gas)**: [Avalanche Faucet](https://faucet.avax.network/)
- **USDC (Fuji)**: Bridge from mainnet or use a testnet faucet

---

## Quick Start

### 1. Compile Contracts

```bash
cd contracts
npm install
npx hardhat compile
```

> **Note**: For testnet deployment, see [Deployment to Avalanche Testnet](#deployment-to-avalanche-testnet-fuji) section above.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run dev
```

Backend will be available at `http://localhost:4000`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:3000` with `/api` proxied to the backend.
