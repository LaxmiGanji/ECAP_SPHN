const mongoose = require("mongoose");

const facultyTimetableSchema = new mongoose.Schema({
  branch: { type: String, required: true },
  semester: { type: String, required: true },
  section: { type: String, required: true },
  days: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true
    },
    periods: [{
      periodNumber: { type: Number, required: true, min: 1 },
      subject: { type: String, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true }
    }]
  }]
});

const facultyDetails = new mongoose.Schema({
  employeeId: { type: String, required: true },
  firstName: { type: String, required: false },
  middleName: { type: String, required: false },
  lastName: { type: String, required: false },
  email: { type: String, required: true },
  phoneNumber: { type: Number, required: true },
  department: { type: String, required: true },
  gender: { type: String, required: false },
  experience: { type: Number, required: false },
  post: { type: String, required: false },
  panCard: { type: String, required: false },
  jntuId: { type: String, required: false },
  aicteId: { type: String, required: false },
  profile: { type: String, required: false },
  timetable: {
    type: [facultyTimetableSchema],
    required: false,
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model("Faculty Detail", facultyDetails);