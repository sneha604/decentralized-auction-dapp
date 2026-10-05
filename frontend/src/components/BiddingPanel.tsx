import React, { useState } from 'react';
import { Gavel, RefreshCw, ArrowUpRight, AlertCircle, Info } from 'lucide-react';
import { AuctionDetails, WalletState } from '../types/auction';

interface BiddingPanelProps {
  details: AuctionDetails;
  wallet: WalletState;
  isLoading: boolean;
  onPlaceBid: (amountETH: string) => Promise<void>;
  onConnectWallet: () => void;
}

export const BiddingPanel: React.FC<BiddingPanelProps> = ({
  details,
  wallet,
  isLoading,
  onPlaceBid,
  onConnectWallet,
}) => {
  const currentHighestFloat = parseFloat(details.highestBid || '0');
  const defaultSuggestedBid = (currentHighestFloat + 0.1).toFixed(2);
  
  const [bidAmount, setBidAmount] = useState<string>(defaultSuggestedBid);
  const [inputError, setInputError] = useState<string | null>(null);

  const handleQuickAdd = (increment: number) => {
    const nextVal = (currentHighestFloat + increment).toFixed(2);
    setBidAmount(nextVal);
    validateBid(nextVal);
  };

  const validateBid = (val: string): boolean => {
    const parsed = parseFloat(val);
    if (isNaN(parsed) || parsed <= 0) {
      setInputError("Please enter a valid ETH amount.");
      return false;
    }
    if (parsed <= currentHighestFloat) {
      setInputError(`Bid must be strictly greater than current highest bid (${details.highestBid} ETH).`);
      return false;
    }
    setInputError(null);
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBidAmount(val);
    validateBid(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.isConnected) {
      onConnectWallet();
      return;
    }
    if (validateBid(bidAmount)) {
      await onPlaceBid(bidAmount);
    }
  };

  const isBiddingDisabled = details.isEnded || details.remainingSeconds <= 0;

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Gavel style={{ width: '20px', height: '20px', color: '#6366f1' }} />
          Place Your Bid
        </h3>

        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Min. Next Bid: <strong style={{ color: '#34d399' }}>&gt; {details.highestBid} ETH</strong>
        </span>
      </div>

      {!wallet.isConnected ? (
        <div style={{ 
          padding: '20px', 
          borderRadius: '14px', 
          background: 'rgba(99, 102, 241, 0.08)', 
          border: '1px dashed rgba(99, 102, 241, 0.3)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Info style={{ width: '28px', height: '28px', color: '#818cf8' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#ffffff' }}>Connect MetaMask Wallet to Bid</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Connect your Ethereum wallet to place live bids and participate in the auction.
            </div>
          </div>
          <button onClick={onConnectWallet} className="btn-primary" style={{ marginTop: '4px' }}>
            Connect Wallet
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Quick Increment Chips */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', alignSelf: 'center', marginRight: '4px' }}>Quick Add:</span>
            {[0.1, 0.25, 0.5, 1.0].map((inc) => (
              <button
                key={inc}
                type="button"
                onClick={() => handleQuickAdd(inc)}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '8px' }}
                disabled={isBiddingDisabled || isLoading}
              >
                + {inc} ETH
              </button>
            ))}
          </div>

          {/* Amount Input */}
          <div style={{ position: 'relative' }}>
            <input
              type="number"
              step="0.01"
              min="0"
              value={bidAmount}
              onChange={handleInputChange}
              placeholder={`Enter amount > ${details.highestBid}`}
              className="glass-input"
              disabled={isBiddingDisabled || isLoading}
              style={{ fontSize: '1.25rem', fontWeight: 700, paddingRight: '80px' }}
            />
            <span style={{ 
              position: 'absolute', 
              right: '16px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              fontWeight: 700, 
              color: '#818cf8',
              fontSize: '1rem',
              pointerEvents: 'none'
            }}>
              ETH
            </span>
          </div>

          {/* Validation Error Banner */}
          {inputError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171', fontSize: '0.8rem' }}>
              <AlertCircle style={{ width: '14px', height: '14px' }} />
              <span>{inputError}</span>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            className="btn-primary"
            disabled={isBiddingDisabled || isLoading || !!inputError}
            style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
          >
            {isLoading ? (
              <>
                <RefreshCw style={{ animation: 'spin 1s linear infinite', width: '18px', height: '18px' }} />
                Submitting Bid...
              </>
            ) : isBiddingDisabled ? (
              'Bidding Closed'
            ) : (
              <>
                <Gavel style={{ width: '18px', height: '18px' }} />
                Place Bid of {bidAmount || '0'} ETH
                <ArrowUpRight style={{ width: '16px', height: '16px' }} />
              </>
            )}
          </button>

          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center' }}>
            ETH sent as bids remain safely stored in the smart contract until outbid or finalized.
          </span>
        </form>
      )}

    </div>
  );
};
