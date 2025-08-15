const mongoose = require("mongoose");

const facultyDetails = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: false,
  },
  middleName: {
    type: String,
    required: false,
  },
  lastName: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  experience: {
    type: Number,
    required: false,
  },
  post: {
    type: String,
    required: false,
  },
  panCard: {
    type: String,
    required: false,
  },
  jntuId: {
    type: String,
    required: false,
  },
  aicteId: {
    type: String,
    required: false,
  },
  profile: {
    type: String,
    required: false,
  }
}, { timestamps: true });

module.exports = mongoose.model("Faculty Detail", facultyDetails);
