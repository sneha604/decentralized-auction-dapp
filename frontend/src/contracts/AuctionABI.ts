export const AUCTION_ABI = [
  "constructor(uint256 _biddingTime, string _itemTitle, string _itemDescription, uint256 _startingBid)",
  "event AuctionCreated(address indexed owner, string itemTitle, uint256 auctionEndTime, uint256 startingBid)",
  "event AuctionEnded(address indexed winner, uint256 amount)",
  "event BidPlaced(address indexed bidder, uint256 amount)",
  "event Withdrawal(address indexed bidder, uint256 amount)",
  "error AuctionAlreadyEnded()",
  "error AuctionEndAlreadyCalled()",
  "error AuctionNotYetEnded()",
  "error BidNotHighEnough(uint256 currentHighestBid)",
  "error NoFundsToWithdraw()",
  "error OnlyOwnerAllowed()",
  "error TransferFailed()",
  "function auctionEndTime() view returns (uint256)",
  "function bid() payable",
  "function endAuction()",
  "function ended() view returns (bool)",
  "function getAuctionDetails() view returns (string title, string description, address seller, address currentHighestBidder, uint256 currentHighestBid, uint256 endTime, bool isEnded)",
  "function getRemainingTime() view returns (uint256)",
  "function highestBid() view returns (uint256)",
  "function highestBidder() view returns (address)",
  "function itemDescription() view returns (string)",
  "function itemTitle() view returns (string)",
  "function owner() view returns (address)",
  "function pendingReturns(address) view returns (uint256)"
] as const;

// Default address for local testing (Hardhat node deployed address)
export const DEFAULT_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
