const { auctionData, initialHistory } = require("../data/auctionData");

/**
 * GET /api/auction/metadata
 * Returns off-chain auction item metadata and specifications.
 */
const getMetadata = (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: auctionData
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve auction metadata.",
      error: error.message
    });
  }
};

/**
 * GET /api/auction/history
 * Returns bid activity history log (ready for future blockchain event indexing).
 */
const getHistory = (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: {
        bids: initialHistory,
        totalBids: initialHistory.length,
        note: "Structured for seamless on-chain event integration."
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve auction history.",
      error: error.message
    });
  }
};

/**
 * GET /api/auction/stats
 * Returns overall auction statistics.
 */
const getStats = (req, res) => {
  try {
    const highestBid = initialHistory.length > 0 ? initialHistory[0].amountETH : auctionData.initialStartingBidETH;
    const highestBidder = initialHistory.length > 0 ? initialHistory[0].bidder : null;

    return res.status(200).json({
      success: true,
      data: {
        auctionId: auctionData.id,
        totalBidsPlaced: initialHistory.length,
        highestBidETH: highestBid,
        highestBidder: highestBidder,
        startingBidETH: auctionData.initialStartingBidETH,
        status: "active"
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve auction statistics.",
      error: error.message
    });
  }
};

module.exports = {
  getMetadata,
  getHistory,
  getStats
};
