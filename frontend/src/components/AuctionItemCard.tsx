import React from 'react';
import { ShieldCheck, Award, User } from 'lucide-react';
import { AuctionDetails } from '../types/auction';

interface AuctionItemCardProps {
  details: AuctionDetails;
  isContractConnected: boolean;
}

export const AuctionItemCard: React.FC<AuctionItemCardProps> = ({ details, isContractConnected }) => {
  const formatAddress = (addr: string) => {
    if (!addr || addr === '0x0000000000000000000000000000000000000000') return 'N/A';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="glass-panel" style={{ padding: '28px', height: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Item Artwork Container */}
      <div style={{ 
        position: 'relative', 
        borderRadius: '16px', 
        overflow: 'hidden', 
        aspectRatio: '1/1',
        maxHeight: '380px',
        width: '100%',
        background: '#030712',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <img 
          src="/item.jpg" 
          alt={details.title} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            transition: 'transform 0.5s ease'
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />

        {/* Overlay Badges */}
        <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {details.isEnded ? (
            <span style={{ 
              padding: '6px 14px', 
              borderRadius: '20px', 
              fontSize: '0.75rem', 
              fontWeight: 700, 
              background: 'rgba(239, 68, 68, 0.2)', 
              color: '#f87171', 
              border: '1px solid rgba(248, 113, 113, 0.4)',
              backdropFilter: 'blur(8px)'
            }}>
              Auction Ended
            </span>
          ) : (
            <div className="pulse-badge" style={{ backdropFilter: 'blur(8px)' }}>
              <span className="pulse-dot" />
              Live Auction
            </div>
          )}

          <span style={{ 
            padding: '6px 14px', 
            borderRadius: '20px', 
            fontSize: '0.75rem', 
            fontWeight: 600, 
            background: 'rgba(99, 102, 241, 0.2)', 
            color: '#a5b4fc', 
            border: '1px solid rgba(165, 180, 252, 0.3)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <ShieldCheck style={{ width: '13px', height: '13px' }} />
            {isContractConnected ? 'On-Chain Validated' : 'Verified Smart Contract'}
          </span>
        </div>
      </div>

      {/* Details & Specs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#818cf8' }}>
            Horology & Fine Collectibles
          </span>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <User style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
            Seller: <span style={{ fontFamily: 'monospace', color: '#d1d5db' }}>{formatAddress(details.seller)}</span>
          </div>
        </div>

        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.25 }}>
          {details.title}
        </h2>

        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          {details.description}
        </p>

        {/* Verification Guarantee Pill */}
        <div style={{ 
          marginTop: '8px', 
          padding: '12px 16px', 
          borderRadius: '12px', 
          background: 'rgba(255, 255, 255, 0.03)', 
          border: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.85rem',
          color: '#9ca3af'
        }}>
          <Award style={{ width: '18px', height: '18px', color: '#f59e0b', flexShrink: 0 }} />
          <span>Non-custodial ETH bidding with instant automated pull refunds for outbid participants.</span>
        </div>
      </div>

    </div>
  );
};
