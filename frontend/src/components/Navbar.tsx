import React from 'react';
import { Wallet, ShieldCheck, Gavel, RefreshCw } from 'lucide-react';
import { WalletState } from '../types/auction';

interface NavbarProps {
  wallet: WalletState;
  isConnecting: boolean;
  contractAddress: string;
  onConnect: () => void;
  onDisconnect: () => void;
  onAddressChange: (newAddress: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  wallet,
  isConnecting,
  contractAddress,
  onConnect,
  onDisconnect,
  onAddressChange,
}) => {
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="glass-panel" style={{ borderRadius: '0 0 20px 20px', borderTop: 'none', padding: '16px 32px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)'
          }}>
            <Gavel style={{ color: '#fff', width: '22px', height: '22px' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, background: 'linear-gradient(90deg, #fff 0%, #9ca3af 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AuraBids
            </h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck style={{ width: '12px', height: '12px', color: '#10b981' }} /> Decentralized Auction DApp
            </span>
          </div>
        </div>

        {/* Contract Address & Wallet Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          
          {/* Contract Address Input Pill */}
          <div className="glass-panel" style={{ padding: '6px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', background: 'rgba(15, 23, 42, 0.5)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Contract:</span>
            <input 
              type="text"
              value={contractAddress}
              onChange={(e) => onAddressChange(e.target.value)}
              title="Click to edit deployed contract address"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#818cf8',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                width: '130px',
                outline: 'none',
                textOverflow: 'ellipsis'
              }}
            />
          </div>

          {/* Wallet Connection Status */}
          {wallet.isConnected && wallet.address ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="glass-panel" style={{ padding: '8px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f3f4f6', fontFamily: 'monospace' }}>
                    {formatAddress(wallet.address)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>
                    {wallet.balance} ETH
                  </div>
                </div>
              </div>
              
              <button 
                onClick={onDisconnect}
                className="btn-secondary"
                style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                title="Disconnect Wallet"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              onClick={onConnect}
              disabled={isConnecting}
              className="btn-primary"
            >
              {isConnecting ? (
                <>
                  <RefreshCw style={{ animation: 'spin 1s linear infinite', width: '16px', height: '16px' }} />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet style={{ width: '18px', height: '18px' }} />
                  Connect Wallet
                </>
              )}
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
