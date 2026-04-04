import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hostel",
    required: true
  }
}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);