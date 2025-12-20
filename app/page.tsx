"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useBalance } from "@/hooks/use-balance";
import { useTransactionStatus, isTransactionSuccessful } from "@/hooks/use-transaction-status";
import { CHAINS, CHAIN_IDS, getBalanceKey, getSupportedTokens, hasUsdcSupport, hasGasSponsorship, type ChainId } from "@/lib/config/chains";
import type { NetworkMode, PendingTransaction, TokenType } from "@/types";
import { ChevronDownIcon, MenuIcon, XIcon, CheckIcon, CopyIcon, GasIcon } from "@/components/icons";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Loader } from "@/components/loader";

// Format balance: "0" if zero, otherwise up to 3 decimal places
const formatBalance = (value: number): string => {
  if (value === 0) return "0";
  // Remove trailing zeros after formatting to 3 decimals
  return parseFloat(value.toFixed(3)).toString();
};

// Ethereum address: 0x followed by 40 hex characters
const ETHEREUM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

// Solana address: base58 encoded, 32-44 characters (no 0, O, I, l)
const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export default function Home() {
  const { ready, authenticated, login, logout, user, getAccessToken } = usePrivy();
  const { data: balances, isLoading: loading, refetch: refetchBalances } = useBalance(authenticated);
  
  const [networkMode, setNetworkMode] = useState<NetworkMode>("testnet");
  const [selectedChainId, setSelectedChainId] = useState<ChainId>(CHAIN_IDS[0]);
  const [selectedToken, setSelectedToken] = useState<TokenType>("native");
  const [walletAddress, setWalletAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [copiedAddress, setCopiedAddress] = useState<"ethereum" | "solana" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingTx, setPendingTx] = useState<PendingTransaction | null>(null);
  const [txResult, setTxResult] = useState<{ hash: string; explorerUrl: string; status: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get the selected chain config
  const selectedChain = CHAINS[selectedChainId];
  const supportedTokens = getSupportedTokens(selectedChainId, networkMode);
  const currentToken = supportedTokens.find(t => t.type === selectedToken) || supportedTokens[0];

  // Reset token selection when chain/network changes (if selected token not supported)
  useEffect(() => {
    const tokens = getSupportedTokens(selectedChainId, networkMode);
    if (!tokens.find(t => t.type === selectedToken)) {
      setSelectedToken("native");
    }
  }, [selectedChainId, networkMode, selectedToken]);

  // Poll for transaction status
  const { data: txStatus } = useTransactionStatus(pendingTx?.id ?? null);

  // Handle transaction status updates
  useEffect(() => {
    if (txStatus?.isFinal && pendingTx) {
      // Use hash/explorerUrl from status if available, otherwise use initial values
      const finalHash = txStatus.hash || pendingTx.hash;
      const finalExplorerUrl = txStatus.explorerUrl || pendingTx.explorerUrl;
      
      setTxResult({
        hash: finalHash,
        explorerUrl: finalExplorerUrl,
        status: txStatus.status,
      });
      setPendingTx(null); // Stop polling
      
      // Refetch balances when transaction is confirmed
      if (isTransactionSuccessful(txStatus.status)) {
        refetchBalances();
      }
    }
  }, [txStatus, pendingTx, refetchBalances]);

  const copyToClipboard = (address: string, type: "ethereum" | "solana") => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(type);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const getBalanceForChain = (chainId: ChainId, mode: NetworkMode, tokenType: TokenType = "native", includeSymbol: boolean = true) => {
    if (!balances) return "—";
    
    const chain = CHAINS[chainId];
    if (!chain) return "—";

    const balanceKeyStr = getBalanceKey(chainId, mode);
    const symbol = tokenType === "native" ? chain.tokens.native.symbol : "USDC";
    const assetKey = tokenType === "native" 
      ? chain.tokens.native.symbol.toLowerCase() 
      : "usdc";

    let value = 0;

    if (chain.type === "ethereum" && balances.ethereum?.balances) {
      // Find balance matching both chain and asset
      const balance = balances.ethereum.balances.find(
        b => b.chain === balanceKeyStr && b.asset === assetKey
      );
      if (balance) {
        const decimals = balance.raw_value_decimals;
        value = parseFloat(balance.raw_value) / Math.pow(10, decimals);
      }
    }

    if (chain.type === "solana" && balances.solana?.balances) {
      const balance = balances.solana.balances.find(
        b => b.chain === balanceKeyStr && b.asset === assetKey
      );
      if (balance) {
        const decimals = balance.raw_value_decimals;
        value = parseFloat(balance.raw_value) / Math.pow(10, decimals);
      }
    }

    const formatted = formatBalance(value);
    return includeSymbol ? `${formatted} ${symbol}` : formatted;
  };

  const getRawBalanceForChain = (chainId: ChainId, mode: NetworkMode, tokenType: TokenType = "native"): number => {
    if (!balances) return 0;
    
    const chain = CHAINS[chainId];
    if (!chain) return 0;

    const balanceKeyStr = getBalanceKey(chainId, mode);
    const assetKey = tokenType === "native" 
      ? chain.tokens.native.symbol.toLowerCase() 
      : "usdc";

    if (chain.type === "ethereum" && balances.ethereum?.balances) {
      const balance = balances.ethereum.balances.find(
        b => b.chain === balanceKeyStr && b.asset === assetKey
      );
      if (balance) {
        const decimals = balance.raw_value_decimals;
        return parseFloat(balance.raw_value) / Math.pow(10, decimals);
      }
    }

    if (chain.type === "solana" && balances.solana?.balances) {
      const balance = balances.solana.balances.find(
        b => b.chain === balanceKeyStr && b.asset === assetKey
      );
      if (balance) {
        const decimals = balance.raw_value_decimals;
        return parseFloat(balance.raw_value) / Math.pow(10, decimals);
      }
    }

    return 0;
  };

  const validateAddress = (address: string, chainType: string): boolean => {
    if (chainType === "ethereum") {
      return ETHEREUM_ADDRESS_REGEX.test(address);
    }
    if (chainType === "solana") {
      return SOLANA_ADDRESS_REGEX.test(address);
    }
    return false;
  };

  const handleRequest = async () => {
    setError(null);
    setTxResult(null);
    setPendingTx(null);

    if (!walletAddress.trim()) {
      setError("Please enter a wallet address");
      return;
    }

    if (!validateAddress(walletAddress, selectedChain.type)) {
      if (selectedChain.type === "ethereum") {
        setError("Invalid Ethereum address. Must be 0x followed by 40 hex characters.");
      } else {
        setError("Invalid Solana address. Must be 32-44 base58 characters.");
      }
      return;
    }

    const requestedAmount = parseFloat(amount);
    if (!amount.trim() || isNaN(requestedAmount) || requestedAmount <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }

    // Check balance for the selected token
    const availableBalance = getRawBalanceForChain(selectedChainId, networkMode, selectedToken);
    if (requestedAmount > availableBalance) {
      const formatted = selectedToken === "usdc" ? availableBalance.toFixed(2) : availableBalance.toFixed(4);
      setError(`Insufficient faucet balance. Available: ${formatted} ${currentToken.symbol}`);
      return;
    }

    // Get access token and make transfer request
    setSubmitting(true);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        setError("Failed to get access token. Please try logging in again.");
        return;
      }

      const response = await fetch("/api/faucet/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          walletAddress,
          amount: requestedAmount,
          chainId: selectedChainId,
          networkMode,
          token: selectedToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Transfer failed");
        return;
      }

      // Transaction submitted! Start polling for status
      if (data.transactionId) {
        setPendingTx({
          id: data.transactionId,
          hash: data.hash,
          explorerUrl: data.explorerUrl,
        });
      }
    } catch (err) {
      console.error("Transfer error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Show loader while Privy is initializing
  if (!ready) {
    return <Loader />;
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl sm:text-2xl font-bold">Testnet Faucet</CardTitle>
            <CardDescription>
              Sign in to request testnet tokens for multiple chains
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={login} className="w-full" size="lg">
              Sign in with Privy
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Please sign in with your Privy email
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sidebar content (reused for mobile and desktop)
  const SidebarContent = ({ onChainSelect }: { onChainSelect?: () => void }) => (
    <>
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Chains</h2>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <GasIcon size={12} />
            Gas Sponsored
          </span>
        </div>
        <p className="text-sm text-muted-foreground">Select a network</p>
      </div>

      {/* Network Mode Toggle */}
      <div className="mb-4 p-1 bg-muted rounded-lg flex">
        <button
          onClick={() => setNetworkMode("testnet")}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            networkMode === "testnet"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Testnet
        </button>
        <button
          onClick={() => setNetworkMode("mainnet")}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            networkMode === "mainnet"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Mainnet
        </button>
      </div>

      <nav className="space-y-1">
        {CHAIN_IDS.map((chainId) => {
          const chain = CHAINS[chainId];
          const isSelected = selectedChainId === chainId;
          const showUsdc = hasUsdcSupport(chainId, networkMode);
          return (
            <button
              key={chainId}
              onClick={() => {
                setSelectedChainId(chainId);
                setError(null);
                onChainSelect?.();
              }}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer ${
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-foreground"
              }`}
            >
              <div className="flex items-center gap-2 shrink-0">
                {chain.icon && (
                  <Image
                    src={chain.icon}
                    alt={chain.name}
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                )}
                <span className="font-medium">{chain.name}</span>
                {hasGasSponsorship(chainId, networkMode) && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help">
                        <GasIcon 
                          size={12} 
                          className={isSelected ? "text-primary-foreground/60" : "text-muted-foreground/70"} 
                        />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      Gas Sponsored
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {/* Native token balance chip */}
                <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                  isSelected 
                    ? "bg-primary-foreground/20 text-primary-foreground" 
                    : "bg-muted text-foreground"
                }`}>
                  {loading ? "..." : getBalanceForChain(chainId, networkMode, "native")}
                </span>
                {/* USDC balance chip */}
                {showUsdc && (
                  <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                    isSelected 
                      ? "bg-blue-500/30 text-primary-foreground" 
                      : "bg-blue-500/20 text-blue-400"
                  }`}>
                    {loading ? "..." : getBalanceForChain(chainId, networkMode, "usdc")}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      <div className="mt-8 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">
          Signed in as {user?.email?.address || "User"}
        </p>
        <Button variant="outline" size="sm" onClick={logout} className="w-full">
          Sign out
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg cursor-pointer"
          >
            {selectedChain.icon && (
              <Image
                src={selectedChain.icon}
                alt={selectedChain.name}
                width={20}
                height={20}
                className="rounded-full"
              />
            )}
            <span className="font-medium">{selectedChain.name}</span>
            <span className="text-xs text-muted-foreground">
              {networkMode === "mainnet" ? "Mainnet" : "Testnet"}
            </span>
            <ChevronDownIcon />
          </button>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Slide-up Panel */}
          <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="sticky top-0 bg-card px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold">Select Chain</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 -mr-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <XIcon />
              </button>
            </div>
            <div className="p-4">
              <SidebarContent onChainSelect={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-96 border-r border-border bg-card p-4 shrink-0">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-xl mx-auto md:mx-0">
          {/* Deposit Addresses */}
          <div className="mb-6 p-3 sm:p-4 rounded-lg bg-muted/50 border border-border">
            <div className="mb-3">
              <h3 className="text-sm font-medium">Deposit Addresses</h3>
              <p className="text-xs text-muted-foreground">Add funds to the faucet wallets</p>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Ethereum</span>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-background px-2 py-1.5 rounded font-mono break-all">
                    {balances?.ethereum?.wallet?.address || "Loading..."}
                  </code>
                  {balances?.ethereum?.wallet?.address && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 shrink-0"
                      onClick={() => copyToClipboard(balances.ethereum!.wallet.address, "ethereum")}
                    >
                      {copiedAddress === "ethereum" ? (
                        <CheckIcon className="text-green-500" />
                      ) : (
                        <CopyIcon />
                      )}
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Solana</span>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-background px-2 py-1.5 rounded font-mono break-all">
                    {balances?.solana?.wallet?.address || "Loading..."}
                  </code>
                  {balances?.solana?.wallet?.address && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 shrink-0"
                      onClick={() => copyToClipboard(balances.solana!.wallet.address, "solana")}
                    >
                      {copiedAddress === "solana" ? (
                        <CheckIcon className="text-green-500" />
                      ) : (
                        <CopyIcon />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {selectedChain.name} Faucet
              </CardTitle>
              <CardDescription>
                Request tokens on {selectedChain.name} {networkMode === "mainnet" ? "" : "(Testnet)"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Token Selector */}
              {supportedTokens.length > 1 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Token</label>
                  <div className="flex gap-2">
                    {supportedTokens.map((token) => (
                      <button
                        key={token.type}
                        onClick={() => setSelectedToken(token.type)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors border cursor-pointer ${
                          selectedToken === token.type
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                        }`}
                      >
                        {token.symbol}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-muted-foreground">Faucet Balance ({currentToken.symbol})</p>
                  {networkMode === "mainnet" && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-bg-warning)] text-[var(--color-text-warning)] border border-[var(--color-border-warning)]">
                      ⚠️ Real money!
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold">
                  {loading ? "Loading..." : getBalanceForChain(selectedChainId, networkMode, selectedToken)}
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="wallet" className="text-sm font-medium">
                  Recipient Wallet Address
                </label>
                <Input
                  id="wallet"
                  placeholder={selectedChain.type === "solana" 
                    ? "Enter Solana address..." 
                    : "0x..."
                  }
                  value={walletAddress}
                  onChange={(e) => {
                    setWalletAddress(e.target.value);
                    setError(null);
                  }}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium">
                  Amount ({currentToken.symbol})
                </label>
                <Input
                  id="amount"
                  type="number"
                  step={currentToken.decimals === 6 ? "0.01" : "0.0001"}
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError(null);
                  }}
                />
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>

              <Button 
                className="w-full" 
                size="lg" 
                onClick={handleRequest}
                disabled={submitting || !!pendingTx || !walletAddress.trim() || !amount.trim()}
              >
                {submitting ? "Submitting..." : pendingTx ? "Confirming..." : `Request ${currentToken.symbol}`}
              </Button>

              {/* Pending transaction status */}
              {pendingTx && (
                <div className="p-3 rounded-lg bg-[var(--color-bg-info)] border border-[var(--color-border-info)]">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    <p className="text-sm font-medium">
                      Transaction {txStatus?.status || "pending"}...
                    </p>
                  </div>
                  <a
                    href={pendingTx.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[var(--color-text-interactive)] hover:underline break-all mt-1 block"
                  >
                    View transaction: {pendingTx.hash.slice(0, 10)}...{pendingTx.hash.slice(-8)}
                  </a>
                </div>
              )}

              {/* Completed transaction result */}
              {txResult && !pendingTx && (
                <div className={`p-3 rounded-lg ${
                  isTransactionSuccessful(txResult.status as any)
                    ? "bg-[var(--color-bg-success)] border border-[var(--color-border-success)]"
                    : "bg-[var(--color-bg-error)] border border-[var(--color-border-error)]"
                }`}>
                  <p className={`text-sm font-medium mb-1 ${
                    isTransactionSuccessful(txResult.status as any)
                      ? "text-[var(--color-text-success)]"
                      : "text-[var(--color-text-error)]"
                  }`}>
                    {isTransactionSuccessful(txResult.status as any) 
                      ? "Transfer successful!" 
                      : `Transfer ${txResult.status}`}
                  </p>
                  <a
                    href={txResult.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[var(--color-text-interactive)] hover:underline break-all"
                  >
                    View transaction: {txResult.hash.slice(0, 10)}...{txResult.hash.slice(-8)}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
