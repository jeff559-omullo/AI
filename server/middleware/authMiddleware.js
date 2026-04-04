import jwt from "jsonwebtoken";
import Student from "../models/Student.js";

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("🔍 Auth header present?", !!authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ No token or invalid format");
      return res.status(401).json({ message: "Not authorized, no token" });
    }
    const token = authHeader.split(" ")[1];
    console.log("🔑 Token (first 20 chars):", token.substring(0, 20) + "...");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("📦 Decoded token:", decoded);

    if (decoded.role !== "student") {
      console.log("❌ Role mismatch – expected 'student', got", decoded.role);
      return res.status(401).json({ message: "Not authorized as student" });
    }

    const student = await Student.findById(decoded.id).select("-password");
    if (!student) {
      console.log("❌ Student not found for ID:", decoded.id);
      return res.status(401).json({ message: "User not found" });
    }

    req.user = student;
    console.log("✅ Authenticated student:", student.email);
    next();
  } catch (error) {
    console.error("❌ Auth middleware error:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default protect;