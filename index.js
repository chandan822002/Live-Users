const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/userdata")
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log("DB Connection Error:", err));

// ✅ Static Files Serve (index.html, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

// ✅ Home Page Route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Display Page Route
app.get("/users", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "display.html"));
});

// ✅ API Routes (For Backend Data Handling)
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    mobile: { type: String, match: /^[0-9]{10}$/ },
    email: { type: String, match: /\S+@\S+\.\S+/ },
    address: {
        street: { type: String, default: "" },
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        country: { type: String, default: "" }
        },
    loginId: { type: String, minlength: 8, maxlength: 12 },
    password: { type: String, minlength: 6 },
    creationTime: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

// ✅ API to Save User Data (POST)
app.post("/api/users", async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).send(user);
    } catch (error) {
        console.error("Error saving user:", error);
        res.status(400).send(error);
    }
});

// ✅ API to Get All Users (GET)
app.get("/api/users", async (req, res) => {
    const users = await User.find();
    res.send(users);
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));