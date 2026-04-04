import mongoose from "mongoose";

const officerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    department: {
      type: String,
      enum: ["admissions", "finance", "ict", "general"],
      required: true,
    },
    role: { type: String, default: "officer" },
  },
  { timestamps: true }
);

export default mongoose.model("Officer", officerSchema);