// models/Student.js
import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  regNo: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  course: {
    type: String,
    default: "Not Assigned",
  },
  year: {
    type: Number,
    default: 1,
  },
  feesBalance: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

export default mongoose.model("Student", studentSchema);