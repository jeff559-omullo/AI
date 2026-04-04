import mongoose from "mongoose";

const hostelSchema = new mongoose.Schema({
  name: String,
  capacity: Number,
  occupied: {
    type: Number,
    default: 0
  }
});

export default mongoose.model("Hostel", hostelSchema);