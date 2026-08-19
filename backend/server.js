const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const taskRoutes = require("./routes/taskRoutes");

const app = express();

const PORT = 5000;

// ===============================
// Middleware
// ===============================

// CORS - allows React to communicate
// with Express
app.use(cors());

// Allows Express to read JSON
app.use(express.json());

// ===============================
// MongoDB Connection
// ===============================

mongoose
  .connect("mongodb://127.0.0.1:27017/practical6")
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.log("MongoDB connection error:");
    console.log(error.message);
  });

// ===============================
// Routes
// ===============================

app.use("/tasks", taskRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// ===============================
// Start Server
// ===============================

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});