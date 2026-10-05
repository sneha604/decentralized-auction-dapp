import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { AUCTION_ABI, DEFAULT_CONTRACT_ADDRESS } from '../contracts/AuctionABI';
import { AuctionDetails, TransactionStatus } from '../types/auction';

// Sample fallback state for instant preview before contract deployment
const INITIAL_DEMO_DETAILS: AuctionDetails = {
  title: "Patek Philippe Vintage Chronograph 1970",
  description: "Ultra-rare 18k yellow gold vintage chronograph with manual wind movement, original cream dial, and documented provenance.",
  seller: "0x8626f69A00E2eb1F1f107b541437116F907A9099",
  highestBidder: "0x3C44CdD459693451D7898d40a0b614125b290940",
  highestBid: "1.5000",
  highestBidWei: ethers.parseEther("1.5"),
  auctionEndTime: Math.floor(Date.now() / 1000) + 7200, // 2 hours from now
  isEnded: false,
  remainingSeconds: 7200,
};

export function useAuction(contractAddress: string = DEFAULT_CONTRACT_ADDRESS, userAddress: string | null = null) {
  const [details, setDetails] = useState<AuctionDetails>(INITIAL_DEMO_DETAILS);
  const [pendingReturn, setPendingReturn] = useState<string>("0.0000");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isContractConnected, setIsContractConnected] = useState<boolean>(false);
  const [txStatus, setTxStatus] = useState<TransactionStatus>({
    state: 'idle',
    message: '',
  });

  // Fetch auction state from contract
  const fetchAuctionState = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const code = await provider.getCode(contractAddress);
      
      // If no code deployed at contractAddress, keep using interactive demo state
      if (code === '0x' || code === '0x0') {
        setIsContractConnected(false);
        return;
      }

      setIsContractConnected(true);
      const contract = new ethers.Contract(contractAddress, AUCTION_ABI, provider);
      const [title, desc, seller, highestBidder, highestBidWei, endTimeBN, ended] = await contract.getAuctionDetails();
      const remainingBN = await contract.getRemainingTime();

      const highestBidETH = ethers.formatEther(highestBidWei);

      setDetails({
        title: title || INITIAL_DEMO_DETAILS.title,
        description: desc || INITIAL_DEMO_DETAILS.description,
        seller: seller,
        highestBidder: highestBidder,
        highestBid: highestBidETH,
        highestBidWei: highestBidWei,
        auctionEndTime: Number(endTimeBN),
        isEnded: ended,
        remainingSeconds: Number(remainingBN),
      });

      // Fetch pending return balance for connected account
      if (userAddress) {
        const returnWei = await contract.pendingReturns(userAddress);
        setPendingReturn(ethers.formatEther(returnWei));
      }
    } catch (err) {
      console.warn("Contract query fallback to active local state:", err);
    }
  }, [contractAddress, userAddress]);

  useEffect(() => {
    fetchAuctionState();
    const interval = setInterval(() => {
      fetchAuctionState();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchAuctionState]);

  // Live seconds countdown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setDetails((prev) => {
        if (prev.remainingSeconds <= 0) return { ...prev, remainingSeconds: 0, isEnded: true };
        return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Place Bid Action
  const placeBid = async (amountETH: string) => {
    if (!window.ethereum) {
      setTxStatus({ state: 'error', message: 'MetaMask is required to place bids.' });
      return;
    }

    try {
      setTxStatus({ state: 'pending', message: 'Broadcasting bid transaction to network...' });
      setIsLoading(true);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const code = await provider.getCode(contractAddress);

      if (code !== '0x' && code !== '0x0') {
        // Contract is deployed on chain
        const contract = new ethers.Contract(contractAddress, AUCTION_ABI, signer);
        const tx = await contract.bid({ value: ethers.parseEther(amountETH) });
        setTxStatus({ state: 'pending', message: 'Transaction submitted. Waiting for confirmation...', hash: tx.hash });
        await tx.wait();
        setTxStatus({ state: 'success', message: `Successfully placed bid of ${amountETH} ETH!`, hash: tx.hash });
        await fetchAuctionState();
      } else {
        // Local interactive preview simulation
        await new Promise((res) => setTimeout(res, 1200)); // simulated latency
        const bidWei = ethers.parseEther(amountETH);
        if (bidWei <= details.highestBidWei) {
          throw new Error(`Bid must be higher than current highest bid (${details.highestBid} ETH).`);
        }
        
        // Simulating outbid return for demo
        if (details.highestBidder !== ethers.ZeroAddress && userAddress && details.highestBidder.toLowerCase() === userAddress.toLowerCase()) {
          // self outbid demo
        } else if (userAddress) {
          // set demo state
        }

        setDetails((prev) => ({
          ...prev,
          highestBidder: userAddress || "0xYourConnectedAddress",
          highestBid: amountETH,
          highestBidWei: bidWei,
        }));
        setTxStatus({ state: 'success', message: `[Demo Mode] Bid of ${amountETH} ETH placed successfully!` });
      }
    } catch (err: any) {
      console.error("Bid error:", err);
      let errorMsg = err.reason || err.message || "Failed to place bid.";
      if (err.code === 'ACTION_REJECTED' || err.code === 4001) {
        errorMsg = "Transaction cancelled by user.";
      }
      setTxStatus({ state: 'error', message: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  // Withdraw Refund Action
  const withdrawRefund = async () => {
    if (!window.ethereum) return;
    try {
      setTxStatus({ state: 'pending', message: 'Initiating withdrawal request...' });
      setIsLoading(true);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const code = await provider.getCode(contractAddress);

      if (code !== '0x' && code !== '0x0') {
        const contract = new ethers.Contract(contractAddress, AUCTION_ABI, signer);
        const tx = await contract.withdraw();
        setTxStatus({ state: 'pending', message: 'Processing ETH transfer...', hash: tx.hash });
        await tx.wait();
        setTxStatus({ state: 'success', message: 'Successfully withdrawn outbid refund to your wallet!', hash: tx.hash });
        await fetchAuctionState();
      } else {
        await new Promise((res) => setTimeout(res, 1000));
        setPendingReturn("0.0000");
        setTxStatus({ state: 'success', message: '[Demo Mode] Outbid funds withdrawn successfully!' });
      }
    } catch (err: any) {
      console.error("Withdraw error:", err);
      let errorMsg = err.reason || err.message || "Withdrawal failed.";
      if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
        errorMsg = "Transaction cancelled by user.";
      }
      setTxStatus({ state: 'error', message: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  // End Auction Action
  const endAuction = async () => {
    if (!window.ethereum) return;
    try {
      setTxStatus({ state: 'pending', message: 'Finalizing auction on blockchain...' });
      setIsLoading(true);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const code = await provider.getCode(contractAddress);

      if (code !== '0x' && code !== '0x0') {
        const contract = new ethers.Contract(contractAddress, AUCTION_ABI, signer);
        const tx = await contract.endAuction();
        setTxStatus({ state: 'pending', message: 'Finalizing winning bid transfer...', hash: tx.hash });
        await tx.wait();
        setTxStatus({ state: 'success', message: 'Auction successfully finalized!', hash: tx.hash });
        await fetchAuctionState();
      } else {
        await new Promise((res) => setTimeout(res, 1000));
        setDetails((prev) => ({ ...prev, isEnded: true, remainingSeconds: 0 }));
        setTxStatus({ state: 'success', message: '[Demo Mode] Auction finalized by owner!' });
      }
    } catch (err: any) {
      console.error("End auction error:", err);
      let errorMsg = err.reason || err.message || "Failed to end auction.";
      if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
        errorMsg = "Transaction cancelled by user.";
      }
      setTxStatus({ state: 'error', message: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  const clearTxStatus = () => setTxStatus({ state: 'idle', message: '' });

  return {
    details,
    pendingReturn,
    isLoading,
    isContractConnected,
    txStatus,
    placeBid,
    withdrawRefund,
    endAuction,
    clearTxStatus,
    refreshState: fetchAuctionState,
  };
}
