const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const auctionRoutes = require("./routes/auctionRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS allowing React frontend communication
app.use(cors({
  origin: "*", // Allows requests from React/Vite dev server
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "Decentralized Auction Backend"
  });
});

// Auction Routes
app.use("/api/auction", auctionRoutes);

// Catch-all 404 Route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[Backend] Decentralized Auction API running on port ${PORT}`);
  console.log(`[Backend] Health check available at http://localhost:${PORT}/health`);
});

module.exports = app;
