// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Decentralized Auction Contract
 * @notice Implements a decentralized auction system where users can place ETH bids,
 * previous bidders can safely withdraw outbid funds, and the owner can finalize the auction.
 */
contract Auction {
    // --- State Variables ---

    /// @notice Address of the auction owner (seller)
    address payable public immutable owner;

    /// @notice Title or name of the item being auctioned
    string public itemTitle;

    /// @notice Description of the item being auctioned
    string public itemDescription;

    /// @notice Unix timestamp (in seconds) when the auction will end
    uint256 public auctionEndTime;

    /// @notice Address of the current highest bidder
    address public highestBidder;

    /// @notice Current highest bid amount in wei
    uint256 public highestBid;

    /// @notice Mapping to track refundable bid balances for outbid participants
    mapping(address => uint256) public pendingReturns;

    /// @notice Flag indicating if the auction has been officially finalized
    bool public ended;

    // --- Events ---

    /// @notice Emitted when the auction contract is deployed and created
    event AuctionCreated(
        address indexed owner,
        string itemTitle,
        uint256 auctionEndTime,
        uint256 startingBid
    );

    /// @notice Emitted when a new valid higher bid is placed
    event BidPlaced(address indexed bidder, uint256 amount);

    /// @notice Emitted when an outbid participant withdraws their funds
    event Withdrawal(address indexed bidder, uint256 amount);

    /// @notice Emitted when the auction is officially ended by the owner
    event AuctionEnded(address indexed winner, uint256 amount);

    // --- Custom Errors ---

    error OnlyOwnerAllowed();
    error AuctionAlreadyEnded();
    error AuctionNotYetEnded();
    error BidNotHighEnough(uint256 currentHighestBid);
    error AuctionEndAlreadyCalled();
    error NoFundsToWithdraw();
    error TransferFailed();

    // --- Modifiers ---

    /// @dev Restricts execution to only the auction owner
    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwnerAllowed();
        _;
    }

    /// @dev Ensures the function can only be called while the auction is active
    modifier onlyBeforeEnd() {
        if (block.timestamp >= auctionEndTime || ended) revert AuctionAlreadyEnded();
        _;
    }

    /// @dev Ensures the function can only be called after the auction duration has elapsed
    modifier onlyAfterEnd() {
        if (block.timestamp < auctionEndTime) revert AuctionNotYetEnded();
        if (ended) revert AuctionEndAlreadyCalled();
        _;
    }

    /**
     * @notice Initializes the auction with duration, item metadata, and a starting bid.
     * @param _biddingTime Duration of the auction in seconds from deployment.
     * @param _itemTitle Name or title of the item being auctioned.
     * @param _itemDescription Detailed description of the item.
     * @param _startingBid Minimum starting bid amount in wei.
     */
    constructor(
        uint256 _biddingTime,
        string memory _itemTitle,
        string memory _itemDescription,
        uint256 _startingBid
    ) {
        require(_biddingTime > 0, "Bidding time must be greater than zero");
        owner = payable(msg.sender);
        itemTitle = _itemTitle;
        itemDescription = _itemDescription;
        auctionEndTime = block.timestamp + _biddingTime;
        highestBid = _startingBid;

        emit AuctionCreated(owner, _itemTitle, auctionEndTime, _startingBid);
    }

    /**
     * @notice Place a bid on the auction item by sending ETH.
     * @dev The value sent (msg.value) must strictly exceed the current highest bid.
     * Outbid ETH is recorded in pendingReturns for secure pull-withdrawal.
     */
    function bid() external payable onlyBeforeEnd {
        if (msg.value <= highestBid) {
            revert BidNotHighEnough(highestBid);
        }

        // If a previous highest bidder exists, queue their refund
        if (highestBidder != address(0)) {
            pendingReturns[highestBidder] += highestBid;
        }

        highestBidder = msg.sender;
        highestBid = msg.value;

        emit BidPlaced(msg.sender, msg.value);
    }

    /**
     * @notice Withdraw outbid funds safely.
     * @dev Implements the Checks-Effects-Interactions pattern to prevent reentrancy attacks.
     * @return Success boolean indicating successful transfer.
     */
    function withdraw() external returns (bool) {
        uint256 amount = pendingReturns[msg.sender];
        if (amount == 0) revert NoFundsToWithdraw();

        // 1. Checks & Effects: zero out balance before interaction
        pendingReturns[msg.sender] = 0;

        // 2. Interaction: transfer ETH to caller
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            // Revert state change if ETH transfer fails
            pendingReturns[msg.sender] = amount;
            revert TransferFailed();
        }

        emit Withdrawal(msg.sender, amount);
        return true;
    }

    /**
     * @notice Finalizes the auction and transfers winning bid proceeds to the owner.
     * @dev Can only be invoked by the contract owner once the auction duration has elapsed.
     */
    function endAuction() external onlyOwner onlyAfterEnd {
        ended = true;
        emit AuctionEnded(highestBidder, highestBid);

        // If there was a winning bidder, send highest bid proceeds to the owner
        if (highestBidder != address(0)) {
            (bool success, ) = owner.call{value: highestBid}("");
            if (!success) revert TransferFailed();
        }
    }

    /**
     * @notice Helper function to check remaining auction duration in seconds.
     * @return Time remaining in seconds, or 0 if auction duration has passed.
     */
    function getRemainingTime() external view returns (uint256) {
        if (block.timestamp >= auctionEndTime) {
            return 0;
        }
        return auctionEndTime - block.timestamp;
    }

    /**
     * @notice Helper function to retrieve all key auction details in a single view query.
     * @return title Name of item
     * @return description Description of item
     * @return seller Owner of the auction
     * @return currentHighestBidder Address of highest bidder
     * @return currentHighestBid Current winning bid amount in wei
     * @return endTime Unix timestamp when auction expires
     * @return isEnded Finalization status of auction
     */
    function getAuctionDetails()
        external
        view
        returns (
            string memory title,
            string memory description,
            address seller,
            address currentHighestBidder,
            uint256 currentHighestBid,
            uint256 endTime,
            bool isEnded
        )
    {
        return (
            itemTitle,
            itemDescription,
            owner,
            highestBidder,
            highestBid,
            auctionEndTime,
            ended
        );
    }
}
