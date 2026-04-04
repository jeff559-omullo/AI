import express from "express";
import User from "../models/User.js";

const router = express.Router();

// GET all users (exclude passwords)
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}).select("-password"); // exclude password field
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a single user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create a new user (optional, but useful for registration)
router.post("/", async (req, res) => {
  try {
    // In production, hash the password before saving!
    const { admission, password, role, userFullName, email, department } = req.body;
    const newUser = new User({ admission, password, role, userFullName, email, department });
    await newUser.save();
    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser.toObject();
    res.status(201).json(userWithoutPassword);
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key error
      res.status(400).json({ error: "Admission number or full name already exists" });
    } else {
      res.status(400).json({ error: err.message });
    }
  }
});

export default router;