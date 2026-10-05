import React, { useState } from 'react';
import { useMetaMask } from './hooks/useMetaMask';
import { useAuction } from './hooks/useAuction';
import { DEFAULT_CONTRACT_ADDRESS } from './contracts/AuctionABI';
import { Navbar } from './components/Navbar';
import { AuctionItemCard } from './components/AuctionItemCard';
import { AuctionStats } from './components/AuctionStats';
import { BiddingPanel } from './components/BiddingPanel';
import { WithdrawRefund } from './components/WithdrawRefund';
import { OwnerControls } from './components/OwnerControls';
import { TxStatusToast } from './components/TxStatusToast';
import { AlertCircle, RefreshCw, Layers } from 'lucide-react';

export const App: React.FC = () => {
  const [contractAddress, setContractAddress] = useState<string>(DEFAULT_CONTRACT_ADDRESS);

  const { wallet, isConnecting, error: walletError, connectWallet, disconnectWallet } = useMetaMask();
  const {
    details,
    pendingReturn,
    isLoading,
    isContractConnected,
    txStatus,
    placeBid,
    withdrawRefund,
    endAuction,
    clearTxStatus,
    refreshState,
  } = useAuction(contractAddress, wallet.address);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navbar */}
      <Navbar
        wallet={wallet}
        isConnecting={isConnecting}
        contractAddress={contractAddress}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
        onAddressChange={setContractAddress}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Wallet Error Alert Banner */}
        {walletError && (
          <div className="glass-panel" style={{ padding: '14px 20px', borderColor: 'rgba(244, 63, 94, 0.4)', background: 'rgba(244, 63, 94, 0.1)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
              <AlertCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
              <span>{walletError}</span>
            </div>
            <button onClick={connectWallet} className="btn-secondary" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>
              Retry
            </button>
          </div>
        )}

        {/* Contract Connection Banner */}
        {!isContractConnected && (
          <div className="glass-panel" style={{ padding: '12px 20px', background: 'rgba(99, 102, 241, 0.08)', borderColor: 'rgba(99, 102, 241, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#a5b4fc' }}>
              <Layers style={{ width: '16px', height: '16px', color: '#818cf8' }} />
              <span>
                Interactive Preview Mode active for contract address <code style={{ color: '#fff', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>{contractAddress.slice(0, 10)}...</code>
              </span>
            </div>
            <button onClick={refreshState} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
              <RefreshCw style={{ width: '12px', height: '12px' }} /> Refresh Contract State
            </button>
          </div>
        )}

        {/* Dashboard Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          
          {/* Left Column: Item Showcase */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <AuctionItemCard details={details} isContractConnected={isContractConnected} />
          </div>

          {/* Right Column: Live Bidding & Stats Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Live Metrics Grid */}
            <AuctionStats details={details} userAddress={wallet.address} />

            {/* Bidding Interaction Panel */}
            <BiddingPanel
              details={details}
              wallet={wallet}
              isLoading={isLoading}
              onPlaceBid={placeBid}
              onConnectWallet={connectWallet}
            />

            {/* Refund Vault Panel */}
            <WithdrawRefund
              pendingReturn={pendingReturn}
              wallet={wallet}
              isLoading={isLoading}
              onWithdraw={withdrawRefund}
            />

            {/* Owner Finalization Console */}
            <OwnerControls
              details={details}
              wallet={wallet}
              isLoading={isLoading}
              onEndAuction={endAuction}
            />

          </div>

        </div>

      </main>

      {/* Transaction Status Alert Toast */}
      <TxStatusToast status={txStatus} onDismiss={clearTxStatus} />

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-glass)', padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '40px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>© 2026 AuraBids DApp — Decentralized Auction & Bidding System</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Solidity ^0.8.20</span>
            <span>•</span>
            <span>Ethers.js v6</span>
            <span>•</span>
            <span>Vite + React + TS</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
