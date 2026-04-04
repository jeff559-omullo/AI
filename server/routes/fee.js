// routes/fee.js
import express from "express";
import protect from "../middleware/authMiddleware.js";
import Fee from "../models/Fee.js";

const router = express.Router();


// CREATE / INITIALIZE FEE
router.post("/init", protect, async (req, res) => {
  try {
    const { totalFees } = req.body;

    const fee = new Fee({
      student: req.student._id,
      totalFees,
      balance: totalFees
    });

    await fee.save();

    res.json(fee);

  } catch (error) {
    res.status(500).json({ message: "Error initializing fee" });
  }
});


// GET FEE DETAILS
router.get("/", protect, async (req, res) => {
  try {
    const fee = await Fee.findOne({ student: req.student._id });

    res.json(fee);

  } catch (error) {
    res.status(500).json({ message: "Error fetching fee" });
  }
});


// PAY FEES
router.post("/pay", protect, async (req, res) => {
  try {
    const { amount } = req.body;

    const fee = await Fee.findOne({ student: req.student._id });

    if (!fee) {
      return res.status(404).json({ message: "Fee record not found" });
    }

    fee.amountPaid += amount;
    fee.balance = fee.totalFees - fee.amountPaid;

    await fee.save();

    res.json(fee);

  } catch (error) {
    res.status(500).json({ message: "Payment error" });
  }
});

export default router;