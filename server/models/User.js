import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  admission: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // ⚠️ plain text in your example – use bcrypt in production!
  role: { type: String, enum: ["student", "officer", "admin"], default: "student" },
  userFullName: { type: String, unique: true, sparse: true }, // matches your unique index
  email: String,
  department: String,
  // ... any other fields your app needs
}, { timestamps: true });

export default mongoose.model("User", userSchema);