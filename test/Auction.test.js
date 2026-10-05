const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Auction Smart Contract", function () {
  let Auction;
  let auction;
  let owner;
  let bidder1;
  let bidder2;
  let bidder3;

  const ITEM_TITLE = "Vintage Rolex Watch";
  const ITEM_DESC = "Authentic 1970s Vintage Submariner in excellent condition.";
  const BIDDING_TIME = 3600; // 1 hour in seconds
  const STARTING_BID = ethers.parseEther("0.1");

  beforeEach(async function () {
    [owner, bidder1, bidder2, bidder3] = await ethers.getSigners();
    Auction = await ethers.getContractFactory("Auction");
    auction = await Auction.deploy(
      BIDDING_TIME,
      ITEM_TITLE,
      ITEM_DESC,
      STARTING_BID
    );
    await auction.waitForDeployment();
  });

  describe("Deployment & Initialization", function () {
    it("should set the correct owner, item title, description, and starting bid", async function () {
      expect(await auction.owner()).to.equal(owner.address);
      expect(await auction.itemTitle()).to.equal(ITEM_TITLE);
      expect(await auction.itemDescription()).to.equal(ITEM_DESC);
      expect(await auction.highestBid()).to.equal(STARTING_BID);
      expect(await auction.highestBidder()).to.equal(ethers.ZeroAddress);
      expect(await auction.ended()).to.equal(false);
    });

    it("should calculate the correct auction end time", async function () {
      const latestBlockTime = await time.latest();
      const endTime = await auction.auctionEndTime();
      expect(endTime).to.be.closeTo(latestBlockTime + BIDDING_TIME, 5);
    });

    it("should revert if bidding time is zero", async function () {
      await expect(
        Auction.deploy(0, ITEM_TITLE, ITEM_DESC, STARTING_BID)
      ).to.be.revertedWith("Bidding time must be greater than zero");
    });
  });

  describe("Bidding Functionality", function () {
    it("should allow a valid higher bid", async function () {
      const bidAmount = ethers.parseEther("0.5");
      
      await expect(auction.connect(bidder1).bid({ value: bidAmount }))
        .to.emit(auction, "BidPlaced")
        .withArgs(bidder1.address, bidAmount);

      expect(await auction.highestBidder()).to.equal(bidder1.address);
      expect(await auction.highestBid()).to.equal(bidAmount);
    });

    it("should revert if bid is less than or equal to current highest bid", async function () {
      const lowBid = ethers.parseEther("0.05"); // below starting bid of 0.1
      await expect(
        auction.connect(bidder1).bid({ value: lowBid })
      ).to.be.revertedWithCustomError(auction, "BidNotHighEnough");

      // Place a valid bid first
      const bid1 = ethers.parseEther("0.5");
      await auction.connect(bidder1).bid({ value: bid1 });

      // Try bidding equal or lower amount
      await expect(
        auction.connect(bidder2).bid({ value: bid1 })
      ).to.be.revertedWithCustomError(auction, "BidNotHighEnough");
    });

    it("should queue refund for outbid bidder in pendingReturns", async function () {
      const bid1 = ethers.parseEther("0.5");
      const bid2 = ethers.parseEther("1.0");

      await auction.connect(bidder1).bid({ value: bid1 });
      await auction.connect(bidder2).bid({ value: bid2 });

      expect(await auction.highestBidder()).to.equal(bidder2.address);
      expect(await auction.highestBid()).to.equal(bid2);
      expect(await auction.pendingReturns(bidder1.address)).to.equal(bid1);
    });

    it("should revert bids placed after auction expiration", async function () {
      await time.increase(BIDDING_TIME + 1);

      await expect(
        auction.connect(bidder1).bid({ value: ethers.parseEther("0.5") })
      ).to.be.revertedWithCustomError(auction, "AuctionAlreadyEnded");
    });
  });

  describe("Withdrawal Functionality", function () {
    it("should allow outbid bidder to withdraw their refund", async function () {
      const bid1 = ethers.parseEther("0.5");
      const bid2 = ethers.parseEther("1.0");

      await auction.connect(bidder1).bid({ value: bid1 });
      await auction.connect(bidder2).bid({ value: bid2 });

      const initialBalance = await ethers.provider.getBalance(bidder1.address);

      const tx = await auction.connect(bidder1).withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalBalance = await ethers.provider.getBalance(bidder1.address);

      expect(finalBalance + gasUsed - initialBalance).to.equal(bid1);
      expect(await auction.pendingReturns(bidder1.address)).to.equal(0);
    });

    it("should revert withdrawal if user has no pending returns", async function () {
      await expect(
        auction.connect(bidder1).withdraw()
      ).to.be.revertedWithCustomError(auction, "NoFundsToWithdraw");
    });
  });

  describe("Auction Ending Functionality", function () {
    it("should revert if non-owner tries to end auction", async function () {
      await time.increase(BIDDING_TIME + 1);

      await expect(
        auction.connect(bidder1).endAuction()
      ).to.be.revertedWithCustomError(auction, "OnlyOwnerAllowed");
    });

    it("should revert if owner tries to end auction before duration elapses", async function () {
      await expect(
        auction.connect(owner).endAuction()
      ).to.be.revertedWithCustomError(auction, "AuctionNotYetEnded");
    });

    it("should allow owner to end auction after expiration and transfer winning proceeds", async function () {
      const winningBid = ethers.parseEther("2.0");
      await auction.connect(bidder1).bid({ value: winningBid });

      await time.increase(BIDDING_TIME + 1);

      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

      const tx = await auction.connect(owner).endAuction();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

      expect(ownerBalanceAfter + gasUsed - ownerBalanceBefore).to.equal(winningBid);
      expect(await auction.ended()).to.equal(true);
    });

    it("should revert if ending auction twice", async function () {
      await time.increase(BIDDING_TIME + 1);
      await auction.connect(owner).endAuction();

      await expect(
        auction.connect(owner).endAuction()
      ).to.be.revertedWithCustomError(auction, "AuctionEndAlreadyCalled");
    });
  });

  describe("Helper Functions", function () {
    it("should return remaining time correctly", async function () {
      const remaining = await auction.getRemainingTime();
      expect(remaining).to.be.gt(0).and.to.be.lte(BIDDING_TIME);

      await time.increase(BIDDING_TIME + 10);
      expect(await auction.getRemainingTime()).to.equal(0);
    });

    it("should return complete auction details", async function () {
      const details = await auction.getAuctionDetails();
      expect(details.title).to.equal(ITEM_TITLE);
      expect(details.description).to.equal(ITEM_DESC);
      expect(details.seller).to.equal(owner.address);
      expect(details.currentHighestBidder).to.equal(ethers.ZeroAddress);
      expect(details.currentHighestBid).to.equal(STARTING_BID);
      expect(details.isEnded).to.equal(false);
    });
  });
});
