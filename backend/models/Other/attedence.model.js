//attendence.model.js
const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  enrollmentNo: {
    type: String,
    required: true,
  },
  name:{
    type: String,
    reuired:true,
  },
  branch: {
    type: String,
    required: true,
  },
  semester: {
    type: Number,
    required: true,
  },
  section: {
    type: String,
    required: false,
  },
  subject: {
    type: String,
    required: true,
  },
  period: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });



module.exports = mongoose.model("Attendance", attendanceSchema);
