import React from 'react';
import { ShieldAlert, CheckCircle2, RefreshCw, Lock } from 'lucide-react';
import { AuctionDetails, WalletState } from '../types/auction';

interface OwnerControlsProps {
  details: AuctionDetails;
  wallet: WalletState;
  isLoading: boolean;
  onEndAuction: () => Promise<void>;
}

export const OwnerControls: React.FC<OwnerControlsProps> = ({
  details,
  wallet,
  isLoading,
  onEndAuction,
}) => {
  const isOwner = !!(
    wallet.address &&
    details.seller &&
    wallet.address.toLowerCase() === details.seller.toLowerCase()
  );

  const canFinalize = (details.remainingSeconds <= 0 || details.isEnded) && !details.isEnded;

  return (
    <div className="glass-panel" style={{ 
      padding: '24px', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '16px',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      background: 'rgba(245, 158, 11, 0.04)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock style={{ width: '18px', height: '18px' }} />
          Auction Owner Console
        </h3>

        <span style={{ 
          fontSize: '0.75rem', 
          fontWeight: 700, 
          padding: '3px 10px', 
          borderRadius: '12px', 
          background: isOwner ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
          color: isOwner ? '#fbbf24' : 'var(--text-muted)'
        }}>
          {isOwner ? 'Seller Recognized' : 'Restricted Access'}
        </span>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
        Only the smart contract owner can invoke <code>endAuction()</code> after the bidding duration expires to finalize the auction and claim winning ETH proceeds.
      </p>

      {details.isEnded ? (
        <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: '10px', color: '#34d399', fontSize: '0.9rem' }}>
          <CheckCircle2 style={{ width: '20px', height: '20px' }} />
          <span>Auction has been officially finalized! Winner: <strong style={{ fontFamily: 'monospace' }}>{details.highestBidder}</strong></span>
        </div>
      ) : (
        <button
          onClick={onEndAuction}
          disabled={!wallet.isConnected || (!isOwner && !canFinalize) || isLoading}
          className="btn-danger"
          style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
        >
          {isLoading ? (
            <>
              <RefreshCw style={{ animation: 'spin 1s linear infinite', width: '16px', height: '16px' }} />
              Finalizing Auction...
            </>
          ) : (
            <>
              <ShieldAlert style={{ width: '16px', height: '16px' }} />
              End Auction & Claim Proceeds
            </>
          )}
        </button>
      )}

      {!isOwner && !details.isEnded && (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center' }}>
          Note: Non-owner calls will be reverted by contract modifier <code>onlyOwner</code>.
        </span>
      )}
    </div>
  );
};
