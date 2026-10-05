export interface AuctionDetails {
  title: string;
  description: string;
  seller: string;
  highestBidder: string;
  highestBid: string; // formatted in ETH
  highestBidWei: bigint;
  auctionEndTime: number; // unix timestamp in seconds
  isEnded: boolean;
  remainingSeconds: number;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null; // formatted in ETH
  chainId: string | null;
}

export type TxState = 'idle' | 'pending' | 'success' | 'error';

export interface TransactionStatus {
  state: TxState;
  message: string;
  hash?: string;
}
