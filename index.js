const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const parentRoutes = require("./Routes/ParentRoute");
const babysitterRoutes = require("./Routes/BabysitterRoute");
const reservationRoutes = require("./Routes/ReservationRoute");
const searchRoutes = require("./Routes/SearchRoute");
const authRoutes = require("./Routes/authRoute");
const reviewRoutes = require('./Routes/ReviewRoute');
const profileRoutes = require('./Routes/ProfileRoute');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Define allowed origins
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];

// CORS configuration - must be before any routes
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/parents", parentRoutes);
app.use("/api/babysitters", babysitterRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/profile", profileRoutes);

// Debug route to test API
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working" });
});

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Babysitting API",
    endpoints: {
      auth: "/api/auth",
      parents: "/api/parents",
      babysitters: "/api/babysitters",
      reservations: "/api/reservations",
      search: "/api/search"
    }
  });
});

// Health check route
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date(),
    uptime: process.uptime(),
    mongodb: {
      status:
        mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
      database: process.env.MONGO_URL,
    },
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  // Drop the problematic index if it exists
  try {
    const Babysitter = mongoose.model('BabySitters');
    await Babysitter.collection.dropIndex('id_1');
    console.log('Dropped id_1 index');
  } catch (error) {
    // Index might not exist, which is fine
    if (error.code !== 27) {
      console.error('Error dropping index:', error);
    }
  }
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Handle MongoDB connection events
mongoose.connection.on("connected", () => {
  console.log("MongoDB connection established");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB connection disconnected");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed through app termination");
    process.exit(0);
  } catch (err) {
    console.error("Error during MongoDB connection closure:", err);
    process.exit(1);
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Available routes:');
  console.log('- /api/auth');
  console.log('- /api/parents');
  console.log('- /api/babysitters');
  console.log('- /api/reservations');
  console.log('- /api/search');
  console.log('- /api/reviews');
  console.log('- /api/profile');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler - must be last
app.use((req, res) => {
  console.log(`404: ${req.method} ${req.url} not found`);
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.url
  });
});
