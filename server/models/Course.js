import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  code: String,
  name: String,
  units: Number
});

export default mongoose.model("Course", courseSchema);