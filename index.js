const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const http = require("http"); // Import HTTP module to integrate with socket.io
const socketIo = require("socket.io"); // Import socket.io
const app = express();
const server = http.createServer(app); // Create an HTTP server
const io = socketIo(server); // Pass the server to socket.io
// const corsOptions = {
//   origin: 'http://localhost:3000',  // Your frontend URL
//   methods: 'GET, POST', // Allow GET and POST requests
//   allowedHeaders: 'Content-Type, Authorization',  // Allowed headers
// };
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:5500'],  // Allow both URLs
  methods: 'GET, POST',
  allowedHeaders: 'Content-Type, Authorization',
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));  // Allow pre-flight requests


// Apply the CORS configuration to the express app
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Allow pre-flight requests


app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/test")
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

//API to Save User Data
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




app.post("/api/login", async (req, res) => {
  console.log("Login data received:", req.body);
  const { loginId, password } = req.body;

  try {
    // You might want to hash passwords, but for now assuming plain text for simplicity
    const user = await User.findOne({ loginId, password });
    
    if (!user) {
      return res.status(400).send("Invalid login credentials");
    }
    // Successful login logic here
    res.status(200).send({ message: "Login successful!" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send({ error: "Failed to process login" });
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
