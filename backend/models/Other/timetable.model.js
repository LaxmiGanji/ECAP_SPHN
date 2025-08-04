const mongoose = require("mongoose");

const TimeTable = new mongoose.Schema({
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
    required: true,
  },
  schedule: [{
    day: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    },
    periods: [{
      periodNumber: {
        type: Number,
        required: true
      },
      subject: {
        type: String,
        required: true
      },
      faculty: {
        type: String,
        required: true
      },
      startTime: {
        type: String,
        required: true
      },
      endTime: {
        type: String,
        required: true
      }
    }]
  }]
}, { timestamps: true });

module.exports = mongoose.model("Timetable", TimeTable);
