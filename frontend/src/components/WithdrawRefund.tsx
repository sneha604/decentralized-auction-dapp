import React from 'react';
import { Download, ShieldCheck, RefreshCw } from 'lucide-react';
import { WalletState } from '../types/auction';

interface WithdrawRefundProps {
  pendingReturn: string;
  wallet: WalletState;
  isLoading: boolean;
  onWithdraw: () => Promise<void>;
}

export const WithdrawRefund: React.FC<WithdrawRefundProps> = ({
  pendingReturn,
  wallet,
  isLoading,
  onWithdraw,
}) => {
  const hasRefund = parseFloat(pendingReturn) > 0;

  return (
    <div className="glass-panel" style={{ 
      padding: '24px', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '16px',
      border: hasRefund ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-glass)',
      background: hasRefund ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-card)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Download style={{ width: '18px', height: '18px', color: '#10b981' }} />
          Outbid Refund Vault
        </h3>

        <span style={{ 
          fontSize: '0.75rem', 
          fontWeight: 600, 
          padding: '3px 10px', 
          borderRadius: '12px', 
          background: hasRefund ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
          color: hasRefund ? '#34d399' : 'var(--text-muted)'
        }}>
          {hasRefund ? 'Refund Available' : 'No Claimable Balance'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.5)' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Claimable Outbid Funds:</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontSize: '1.6rem', fontWeight: 800, color: hasRefund ? '#34d399' : '#ffffff' }}>
            {pendingReturn}
          </span>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#818cf8' }}>ETH</span>
        </div>
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
        When you are outbid by another user, your previous bid is automatically credited to your secure pull payment vault to prevent reentrancy attacks.
      </p>

      <button
        onClick={onWithdraw}
        disabled={!wallet.isConnected || !hasRefund || isLoading}
        className={hasRefund ? "btn-success" : "btn-secondary"}
        style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
      >
        {isLoading ? (
          <>
            <RefreshCw style={{ animation: 'spin 1s linear infinite', width: '16px', height: '16px' }} />
            Processing Withdrawal...
          </>
        ) : (
          <>
            <Download style={{ width: '16px', height: '16px' }} />
            {hasRefund ? `Withdraw ${pendingReturn} ETH to Wallet` : 'No Refund Balance to Withdraw'}
          </>
        )}
      </button>

      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <ShieldCheck style={{ width: '14px', height: '14px', color: '#10b981' }} />
        <span>Protected by Solidity Checks-Effects-Interactions (CEI) pull payment standard.</span>
      </div>
    </div>
  );
};
