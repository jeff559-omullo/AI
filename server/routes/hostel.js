import express from "express";
import protect from "../middleware/authMiddleware.js";
import Hostel from "../models/Hostel.js";
import Booking from "../models/Booking.js";

const router = express.Router();


// ➤ CREATE HOSTEL (admin use)
router.post("/create", async (req, res) => {
  const { name, capacity } = req.body;

  const hostel = new Hostel({ name, capacity });
  await hostel.save();

  res.json(hostel);
});


// ➤ GET ALL HOSTELS
router.get("/", protect, async (req, res) => {
  const hostels = await Hostel.find();
  res.json(hostels);
});


// ➤ BOOK HOSTEL
router.post("/book", protect, async (req, res) => {
  const { hostelId } = req.body;

  const hostel = await Hostel.findById(hostelId);

  if (!hostel) {
    return res.status(404).json({ message: "Hostel not found" });
  }

  if (hostel.occupied >= hostel.capacity) {
    return res.status(400).json({ message: "Hostel full" });
  }

  const existingBooking = await Booking.findOne({ student: req.student._id });

  if (existingBooking) {
    return res.status(400).json({ message: "Already booked hostel" });
  }

  const booking = new Booking({
    student: req.student._id,
    hostel: hostelId
  });

  hostel.occupied += 1;

  await hostel.save();
  await booking.save();

  res.json({ message: "Hostel booked successfully", booking });
});


// ➤ GET MY BOOKING
router.get("/my", protect, async (req, res) => {
  const booking = await Booking.findOne({ student: req.student._id }).populate("hostel");
  res.json(booking);
});

export default router;