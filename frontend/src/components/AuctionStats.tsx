import React from 'react';
import { Clock, TrendingUp, Crown, AlertTriangle } from 'lucide-react';
import { AuctionDetails } from '../types/auction';

interface AuctionStatsProps {
  details: AuctionDetails;
  userAddress: string | null;
}

export const AuctionStats: React.FC<AuctionStatsProps> = ({ details, userAddress }) => {
  const formatTime = (seconds: number) => {
    if (seconds <= 0) return { hours: '00', minutes: '00', secs: '00' };
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return {
      hours: h.toString().padStart(2, '0'),
      minutes: m.toString().padStart(2, '0'),
      secs: s.toString().padStart(2, '0'),
    };
  };

  const timeRemaining = formatTime(details.remainingSeconds);
  const isWinning = !!(
    userAddress &&
    details.highestBidder &&
    details.highestBidder.toLowerCase() === userAddress.toLowerCase()
  );

  const formatAddress = (addr: string) => {
    if (!addr || addr === '0x0000000000000000000000000000000000000000') return 'No bids placed yet';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Approx USD rate conversion ($3,200 / ETH demo rate)
  const ethPriceUSD = 3200;
  const bidUSD = (parseFloat(details.highestBid) * ethPriceUSD).toLocaleString('en-US', {
    maximumFractionDigits: 2,
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
      
      {/* Highest Bid Card */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <span>Highest Bid</span>
          <TrendingUp style={{ width: '16px', height: '16px', color: '#10b981' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
            {details.highestBid}
          </span>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#818cf8' }}>ETH</span>
        </div>

        <div style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>≈ ${bidUSD} USD</span>
          {isWinning && (
            <span style={{ padding: '2px 8px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontSize: '0.7rem', fontWeight: 700 }}>
              Winning
            </span>
          )}
        </div>
      </div>

      {/* Highest Bidder Card */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <span>Highest Bidder</span>
          <Crown style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
        </div>

        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: isWinning ? '#34d399' : '#f3f4f6', fontFamily: 'monospace', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {formatAddress(details.highestBidder)}
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {isWinning ? (
            <span style={{ color: '#34d399', fontWeight: 600 }}>You currently hold the highest bid!</span>
          ) : details.highestBidder !== '0x0000000000000000000000000000000000000000' ? (
            <span>Outbid users can withdraw funds anytime</span>
          ) : (
            <span>Be the first bidder to set the price</span>
          )}
        </div>
      </div>

      {/* Countdown Timer Card */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <span>Time Remaining</span>
          <Clock style={{ width: '16px', height: '16px', color: details.remainingSeconds <= 300 ? '#f43f5e' : '#6366f1' }} />
        </div>

        {details.isEnded || details.remainingSeconds <= 0 ? (
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle style={{ width: '20px', height: '20px' }} />
            Auction Expired
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', background: 'rgba(15, 23, 42, 0.6)', padding: '2px 8px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                {timeRemaining.hours}
              </div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>HRS</span>
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#818cf8' }}>:</span>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', background: 'rgba(15, 23, 42, 0.6)', padding: '2px 8px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                {timeRemaining.minutes}
              </div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>MIN</span>
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#818cf8' }}>:</span>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: details.remainingSeconds <= 300 ? '#f43f5e' : '#38bdf8', background: 'rgba(15, 23, 42, 0.6)', padding: '2px 8px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                {timeRemaining.secs}
              </div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>SEC</span>
            </div>
          </div>
        )}

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {details.isEnded ? 'Finalized or ready for owner claim' : 'Bids disabled after countdown ends'}
        </div>
      </div>

    </div>
  );
};
