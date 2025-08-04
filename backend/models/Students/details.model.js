//students/details.model.js
const mongoose = require("mongoose");

const studentDetails = new mongoose.Schema({
  enrollmentNo: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
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
    required: false,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  FatherName: {
    type: String,
    required: false,
  },
  MotherName: {
    type: String,
    required: false,
  },
  FatherPhoneNumber: {
    type: Number,
    required: false,
  },
  MotherPhoneNumber: {
    type: Number,
    required: false,
  },
  semester: {
    type: Number,
    required: true,
  },
  branch: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: false,
  },
  profile: {
    type: String,
    required: false,
  },
  section: {
    type: String,
    required: false,
  },
  certifications: {
    type: [String],
    required: false,
    default: [],
  },
  books: {
    type: [{
      bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Library",
        required: true
      },
      issueDate: {
        type: Date,
        default: Date.now
      },
      returnDate: {
        type: Date
      },
      status: {
        type: String,
        enum: ['issued', 'returned'],
        default: 'issued'
      }
    }],
    default: []
  }

}, { timestamps: true });

module.exports = mongoose.model("Student Detail", studentDetails);
