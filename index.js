const express = require("express");

const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://jatoliyabrijesh:Jatoliya1611@cluster0.3qxib.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
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

//Fixed Mongoose Schema
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

const PORT = process.env.PORT ||3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
