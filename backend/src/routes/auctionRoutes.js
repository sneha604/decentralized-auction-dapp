const express = require("express");
const router = express.Router();
const { getMetadata, getHistory, getStats } = require("../controllers/auctionController");

// REST API Endpoints
router.get("/metadata", getMetadata);
router.get("/history", getHistory);
router.get("/stats", getStats);

module.exports = router;
