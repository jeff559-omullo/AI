// routes/student.js
import express from "express";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// GET STUDENT PROFILE (Protected)
router.get("/profile", protect, async (req, res) => {
  res.json(req.student);
});

export default router;