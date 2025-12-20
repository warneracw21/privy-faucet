# Privy Faucet

A multi-chain testnet (and mainnet) faucet powered by [Privy](https://privy.io) server wallets. Request tokens across Ethereum, Base, Optimism, Arbitrum, Polygon, Abstract, and Solana networks.

## Features

- 🔐 **Privy Authentication** - Sign in with your Privy email
- ⛓️ **Multi-chain Support** - EVM chains + Solana
- 🔄 **Mainnet/Testnet Toggle** - Switch between networks easily
- 📱 **Mobile Friendly** - Responsive design with slide-up menu
- 💰 **Real-time Balances** - Auto-refreshing faucet balances
- 🔗 **Transaction Tracking** - Links to block explorers

## Getting Started

### Prerequisites

- Node.js 18+
- A Privy account with server wallets configured

### Environment Variables

Create a `.env.local` file:

```bash
# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret

# Optional: For chains not supported by Privy balance API (e.g., Abstract)
ALCHEMY_API_KEY=your_alchemy_api_key
```

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Contributing

### Adding a New Chain

Adding a new chain is simple — just edit **one file**: `lib/config/chains.ts`

#### Option A: Privy-Supported Chain

If Privy's balance API supports the chain, use `privyChainId`:

```typescript
mychain: {
  name: "My Chain",
  type: "ethereum",  // or "solana"
  mainnet: {
    caip2: "eip155:123",
    explorerUrl: "https://explorer.mychain.com/tx/",
    privyChainId: "mychain",  // Chain name in Privy API
  },
  testnet: {
    caip2: "eip155:456",
    explorerUrl: "https://testnet.mychain.com/tx/",
    privyChainId: "mychain_testnet",
  },
  tokens: {
    native: { symbol: "MYC", decimals: 18 },
  },
},
```

#### Option B: Custom RPC Chain

If Privy doesn't support the chain's balance API, use `rpcUrl`:

```typescript
mychain: {
  name: "My Chain",
  type: "ethereum",
  mainnet: {
    caip2: "eip155:123",
    explorerUrl: "https://explorer.mychain.com/tx/",
    rpcUrl: "https://rpc.mychain.com",  // We'll fetch balance via RPC
  },
  testnet: {
    caip2: "eip155:456",
    explorerUrl: "https://testnet.mychain.com/tx/",
    rpcUrl: "https://testnet-rpc.mychain.com",
  },
  tokens: {
    native: { symbol: "MYC", decimals: 18 },
  },
},
```

### Configuration Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | ✅ | Display name (e.g., "Ethereum", "Base") |
| `type` | ✅ | `"ethereum"` or `"solana"` |
| `mainnet.caip2` | ✅ | [CAIP-2](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-2.md) chain identifier |
| `mainnet.explorerUrl` | ✅ | Block explorer TX URL prefix |
| `mainnet.explorerSuffix` | ❌ | URL suffix (e.g., `"?cluster=devnet"` for Solana) |
| `mainnet.privyChainId` | ❌* | Privy API chain name |
| `mainnet.rpcUrl` | ❌* | Custom RPC URL for balance fetching |
| `testnet.*` | ✅ | Same fields as mainnet |
| `tokens.native.symbol` | ✅ | Native token symbol (e.g., "ETH", "SOL") |
| `tokens.native.decimals` | ✅ | Native token decimals (18 for ETH, 9 for SOL) |
| `tokens.usdc` | ❌ | USDC token config (future support) |

*Either `privyChainId` or `rpcUrl` should be set for each network

### Finding CAIP-2 Identifiers

- **EVM chains**: `eip155:{chainId}` (e.g., `eip155:1` for Ethereum mainnet)
- **Solana**: `solana:{genesisHash}` (use first 32 chars of genesis hash)

### That's It!

Once you add the chain config:
- ✅ UI automatically shows the new chain
- ✅ Balance fetching works (via Privy or custom RPC)
- ✅ Transfers work via Privy server wallets
- ✅ Transaction links point to the correct explorer

## Project Structure

```
├── app/
│   ├── api/faucet/
│   │   ├── balance/route.ts    # Fetch faucet balances
│   │   ├── transfer/route.ts   # Execute transfers
│   │   └── transaction/[id]/   # Poll transaction status
│   └── page.tsx                # Main UI
├── lib/
│   ├── config/chains.ts        # 👈 Chain configuration (edit this!)
│   ├── balance.ts              # Custom RPC balance fetching
│   ├── privy.ts                # Privy SDK setup
│   └── transaction.ts          # Transaction status helpers
├── hooks/
│   ├── use-balance.ts          # Balance polling hook
│   └── use-transaction-status.ts
├── types/
│   └── index.ts                # TypeScript types
└── middleware.ts               # Auth middleware
```

## License

MIT
