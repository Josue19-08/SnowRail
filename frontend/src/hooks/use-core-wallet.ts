/**
 * Hook to manage Core Wallet connection state
 * Provides centralized wallet state management
 */

import { useCallback, useEffect, useState } from 'react';
import type { CoreWalletProvider } from '../types/core-wallet';

type WalletStatus = 'idle' | 'connecting' | 'connected' | 'error';

const getProvider = (): CoreWalletProvider | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.avalanche ?? window.core ?? null;
};

export function useCoreWallet() {
  const [provider, setProvider] = useState<CoreWalletProvider | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [status, setStatus] = useState<WalletStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  // Function to check for existing connection
  const checkExistingConnection = useCallback(async (providerInstance: CoreWalletProvider | null) => {
    if (!providerInstance) {
      setAccount(null);
      setStatus('idle');
      return;
    }

    try {
      // Try to get accounts without requesting permission (reads from cache)
      const accounts = (await providerInstance.request({ method: 'eth_accounts' })) as string[];
      const connectedAccount = accounts?.[0] ?? null;
      
      if (connectedAccount) {
        setAccount(connectedAccount);
        setStatus('connected');
      } else {
        setAccount(null);
        setStatus('idle');
      }
    } catch (err) {
      // If there's an error, assume not connected
      setAccount(null);
      setStatus('idle');
    }
  }, []);

  // Initialize provider and check for existing connection
  useEffect(() => {
    const providerInstance = getProvider();
    setProvider(providerInstance);
    
    // Check immediately for existing connection
    checkExistingConnection(providerInstance);
  }, [checkExistingConnection]);

  // Re-check connection when provider changes
  useEffect(() => {
    if (provider) {
      // Re-check connection status
      checkExistingConnection(provider);
    }
  }, [provider, checkExistingConnection]);

  // Re-check connection when window gains focus (handles cache issues)
  useEffect(() => {
    const handleFocus = () => {
      if (provider) {
        checkExistingConnection(provider);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [provider, checkExistingConnection]);

  // Listen for account changes
  useEffect(() => {
    if (!provider?.on) {
      return;
    }

    const handleAccountsChanged = (accounts: string[]) => {
      const nextAccount = accounts[0] ?? null;
      setAccount(nextAccount);
      setStatus(nextAccount ? 'connected' : 'idle');
      setError(null);
    };

    // Also listen for connect/disconnect events if available
    const handleConnect = (connectInfo: any) => {
      if (connectInfo.chainId) {
        // Re-check accounts when connected
        checkExistingConnection(provider);
      }
    };

    const handleDisconnect = () => {
      setAccount(null);
      setStatus('idle');
      setError(null);
    };

    provider.on('accountsChanged', handleAccountsChanged);
    
    // Listen for connect/disconnect events if available
    if (typeof provider.on === 'function') {
      try {
        provider.on('connect', handleConnect);
        provider.on('disconnect', handleDisconnect);
      } catch {
        // Provider may not support these events
      }
    }

    return () => {
      provider.removeListener?.('accountsChanged', handleAccountsChanged);
      try {
        provider.removeListener?.('connect', handleConnect);
        provider.removeListener?.('disconnect', handleDisconnect);
      } catch {
        // Ignore errors
      }
    };
  }, [provider, checkExistingConnection]);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    setError(null);
    if (!provider) {
      setStatus('error');
      setError('Core Wallet no detectada.');
      return;
    }

    try {
      setStatus('connecting');
      const accounts = (await provider.request({
        method: 'eth_requestAccounts',
      })) as string[];
      const connectedAccount = accounts?.[0];

      if (!connectedAccount) {
        setStatus('idle');
        return;
      }

      setAccount(connectedAccount);
      setStatus('connected');
    } catch (err) {
      setStatus('error');
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo conectar con Core Wallet.',
      );
    }
  }, [provider]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    // Clear state immediately
    setAccount(null);
    setStatus('idle');
    setError(null);
    
    // Optionally try to disconnect from provider if it has a disconnect method
    if (provider && typeof (provider as any).disconnect === 'function') {
      try {
        (provider as any).disconnect();
      } catch (err) {
        // Ignore disconnect errors
      }
    }
    
    // Force re-check to ensure state is cleared (in case of cache issues)
    setTimeout(() => {
      checkExistingConnection(provider);
    }, 100);
  }, [provider, checkExistingConnection]);

  return {
    account,
    status,
    error,
    isConnected: status === 'connected' && !!account,
    isConnecting: status === 'connecting',
    connectWallet,
    disconnectWallet,
    checkConnection: () => checkExistingConnection(provider),
  };
}
