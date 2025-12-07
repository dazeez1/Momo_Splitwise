const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { createServer } = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const groupRoutes = require("./routes/groupRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const invitationRoutes = require("./routes/invitationRoutes");
const balanceRoutes = require("./routes/balanceRoutes");

// Import middleware
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5174"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5174",
      "http://localhost:5173",
      "http://158.158.49.253:5001",
      "http://68.221.206.80",
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Origin",
      "X-Requested-With",
      "Accept",
    ],
    optionsSuccessStatus: 200,
  })
);

// Rate limiting - more lenient for development
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // limit each IP to 1000 requests per minute
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(morgan("combined"));

// Health check endpoint
const healthCheckHandler = (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStates = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  res.status(200).json({
    status: "OK",
    message: "Momo Splitwise API is running",
    timestamp: new Date().toISOString(),
    service: "MoMo Split API",
    database: dbStates[dbState] === "connected" ? "Connected" : "Disconnected",
    databaseName: mongoose.connection.db?.databaseName || "Unknown",
    host: mongoose.connection.host || "Unknown",
  });
};

app.get("/health", healthCheckHandler);
app.get("/api/health", healthCheckHandler); // Also support /api/health for Application Gateway

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/balances", balanceRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// MongoDB connection
const connectDatabase = async () => {
  try {
    // Prioritize MONGODB_URI (Atlas) over MONGODB_URL (local)
    const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL;

    if (!mongoUri) {
      throw new Error(
        "MongoDB URI not found in environment variables. Please set MONGODB_URI or MONGODB_URL"
      );
    }

    console.log("🔌 Attempting MongoDB connection...");
    console.log("💡 MongoDB URI format:", mongoUri ? mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : 'Not set');

    // Enhanced connection options for MongoDB
    const connectionOptions = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
      retryWrites: true,
    };

    await mongoose.connect(mongoUri, connectionOptions);

    console.log("✅ MongoDB connected successfully");
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    console.error("💡 MongoDB URI:", mongoUri ? mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : 'Not set');
    console.error("💡 Error details:", error);
    // Don't exit immediately - let the server start and retry
    // The depends_on in docker-compose should ensure MongoDB is ready
    throw error;
  }
};

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("👤 User connected:", socket.id);

  // Join user-specific room for notifications
  socket.on("join", (userId) => {
    if (userId) {
      socket.join(`user:${userId}`);
      console.log(`✅ User ${userId} joined their notification room`);
    }
  });

  socket.on("disconnect", () => {
    console.log("👋 User disconnected:", socket.id);
  });
});

// Helper function to emit notifications
const emitNotification = (userId, event, data) => {
  io.to(`user:${userId}`).emit(event, data);
};

// Make io and emitNotification available to routes
app.set("io", io);
app.set("emitNotification", emitNotification);

// Start server
const startServer = async () => {
  try {
    await connectDatabase();

    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
      console.log(`👥 Group endpoints: http://localhost:${PORT}/api/groups`);
      console.log(
        `💰 Expense endpoints: http://localhost:${PORT}/api/expenses`
      );
      console.log(
        `💳 Payment endpoints: http://localhost:${PORT}/api/payments`
      );
      console.log(
        `🎫 Invitation endpoints: http://localhost:${PORT}/api/invitations`
      );
      console.log(
        `⚖️ Balance endpoints: http://localhost:${PORT}/api/balances`
      );
      console.log(`⚡ Socket.io enabled for real-time updates`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, _promise) => {
  console.log("❌ Unhandled Promise Rejection:", err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log("❌ Uncaught Exception:", err.message);
  process.exit(1);
});

if (process.env.NODE_ENV !== "test") {
  startServer();
}

module.exports = app;
module.exports.startServer = startServer;
module.exports.io = io;
module.exports.emitNotification = emitNotification;
