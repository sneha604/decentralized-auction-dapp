const auctionData = {
  id: "auction-001",
  title: "Patek Philippe Vintage Chronograph 1970",
  description: "Ultra-rare 18k yellow gold vintage chronograph with manual wind movement, original cream dial, and documented provenance.",
  category: "Horology & Fine Collectibles",
  image: "/item.jpg",
  seller: {
    name: "Aura Vaults",
    address: "0x8626f69A00E2eb1F1f107b541437116F907A9099",
    verified: true
  },
  specifications: {
    brand: "Patek Philippe",
    year: 1970,
    caseMaterial: "18k Yellow Gold",
    condition: "Mint (Vintage)",
    authenticityVerified: true
  },
  initialStartingBidETH: "0.1",
  durationSeconds: 3600
};

const initialHistory = [
  {
    txHash: "0xa1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
    bidder: "0x3C44CdD459693451D7898d40a0b614125b290940",
    amountETH: "1.5000",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    event: "BidPlaced"
  },
  {
    txHash: "0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0a",
    bidder: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    amountETH: "1.0000",
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    event: "BidPlaced"
  },
  {
    txHash: "0x89abcdef0123456789abcdef0123456789abcdef0123456789abcdef01234567",
    bidder: "0x3C44CdD459693451D7898d40a0b614125b290940",
    amountETH: "0.5000",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    event: "BidPlaced"
  }
];

module.exports = {
  auctionData,
  initialHistory
};
