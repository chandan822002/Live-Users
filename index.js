const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const http = require("http"); // Import HTTP module to integrate with socket.io
const socketIo = require("socket.io"); // Import socket.io
const corsOptions = {
  origin: 'https://cks-ih15.onrender.com',  // Replace with your frontend URL
  methods: 'GET, POST', // Allow specific methods
  allowedHeaders: 'Content-Type, Authorization',  // Allow specific headers
};

const app = express();
const server = http.createServer(app); // Create an HTTP server
const io = socketIo(server); // Pass the server to socket.io

app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://chandankumarsingh1345:s1PQVeKlPusi1kaf@cluster0user.0z5dq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0User")
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch((err) => console.error("MongoDB Connection Error:", err));

// Static Files Serve
app.use(express.static(path.join(__dirname, "public")));

// Home Page Route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Display Page Route
app.get("/users", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "display.html"));
});

// Fixed Mongoose Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  mobile: { type: String, match: /^[0-9]{10}$/, required: true },
  email: { type: String, match: /\S+@\S+\.\S+/, required: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
  },
  loginId: { type: String, minlength: 8, maxlength: 12, required: true },
  password: { type: String, minlength: 6, required: true },
  creationTime: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// API to Save User Data
app.post("/api/users", async (req, res) => {
  console.log("Received Data:", req.body); // Debugging

  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).send(user);

    // Emit an event to notify clients about the new user (real-time update)
    io.emit("newUser", user); // This will emit 'newUser' event with the user data
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(400).send(error);
  }
});

// API to Get All Users
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (error) {
    console.log("Error fetching users:", error);
    res.status(500).send({ error: "Failed to fetch users" });
  }
});

// Socket.IO event: listening for connections from clients
io.on("connection", (socket) => {
  console.log("A user connected");

  // Example of receiving a message from the client
  socket.on("message", (msg) => {
    console.log("Received message:", msg);
  });

  // When a user disconnects
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Start the server with Socket.IO
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
