import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Student from "../models/Student.js";
import Officer from "../models/Officer.js";

const router = express.Router();

/* =======================
   STUDENT REGISTER
======================= */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, regNo, course, year } = req.body;

    // Check if student exists
    const existing = await Student.findOne({
      $or: [{ email }, { regNo }],
    });

    if (existing) {
      return res.status(400).json({ message: "Student already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create student
    const student = new Student({
      name,
      email,
      password: hashedPassword,
      regNo,
      course: course || "Not Assigned",
      year: year || 1,
      feesBalance: 0,
    });

    await student.save();

    // Generate token
    const token = jwt.sign(
      { id: student._id, role: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        regNo: student.regNo,
        course: student.course,
        year: student.year,
        feesBalance: student.feesBalance,
      },
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* =======================
   STUDENT LOGIN (ADMISSION)
======================= */
router.post("/login", async (req, res) => {
  try {
    const { admission, password } = req.body;

    // 🔥 Match admission to regNo
    const student = await Student.findOne({ regNo: admission });

    if (!student) {
      return res.status(401).json({ message: "Invalid admission or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, student.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid admission or password" });
    }

    // Generate token
    const token = jwt.sign(
      { id: student._id, role: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        regNo: student.regNo,
        course: student.course,
        year: student.year,
        feesBalance: student.feesBalance,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* =======================
   GET STUDENT PROFILE
======================= */
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const student = await Student.findById(decoded.id).select("-password");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);

  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Not authorized" });
  }
});

/* =======================
   OFFICER LOGIN
======================= */
router.post("/officer/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const officer = await Officer.findOne({ email });

    if (!officer) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, officer.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        id: officer._id,
        role: "officer",
        department: officer.department,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      officer: {
        id: officer._id,
        name: officer.name,
        email: officer.email,
        department: officer.department,
      },
    });

  } catch (error) {
    console.error("Officer login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;