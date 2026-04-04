import express from "express";
import protect from "../middleware/authMiddleware.js";
import Course from "../models/Course.js";
import Registration from "../models/Registration.js";

const router = express.Router();


// ➤ CREATE COURSE (admin)
router.post("/create", async (req, res) => {
  const { code, name, units } = req.body;

  const course = new Course({ code, name, units });
  await course.save();

  res.json(course);
});


// ➤ GET ALL COURSES
router.get("/", protect, async (req, res) => {
  const courses = await Course.find();
  res.json(courses);
});


// ➤ REGISTER COURSES
router.post("/register", protect, async (req, res) => {
  const { courseIds } = req.body;

  let registration = await Registration.findOne({ student: req.student._id });

  if (!registration) {
    registration = new Registration({
      student: req.student._id,
      courses: courseIds
    });
  } else {
    registration.courses = courseIds;
  }

  await registration.save();

  res.json({ message: "Courses registered", registration });
});


// ➤ GET MY COURSES
router.get("/my", protect, async (req, res) => {
  const registration = await Registration
    .findOne({ student: req.student._id })
    .populate("courses");

  res.json(registration);
});

export default router;