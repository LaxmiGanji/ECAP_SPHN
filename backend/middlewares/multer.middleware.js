const fs = require("fs");
const path = require("path");
const multer = require("multer");

const mediaPath = path.join(__dirname, "../media");

// Ensure folder exists
if (!fs.existsSync(mediaPath)) {
  fs.mkdirSync(mediaPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, mediaPath);
  },
  filename: function (req, file, cb) {
    let filename = "";
    const ext = path.extname(file.originalname);

    if (req.body?.type === "timetable") {
      filename = `Timetable_${req.body.semester}_Semester_${req.body.branch}.png`;
    } else if (req.body?.type === "profile") {
      filename = req.body.enrollmentNo
        ? `Student_Profile_${req.body.enrollmentNo}_Semester_${req.body.branch}.png`
        : `Faculty_Profile_${req.body.employeeId}.png`;
    } else if (req.body?.type === "material") {
      filename = `${req.body.title}_Subject_${req.body.subject}.pdf`;
    } else if (req.body?.type === "certification") {
      const title = req.body.certificationTitle || "Certification";
      filename = `Certification_${title}_${Date.now()}${ext}`;
    } else {
      filename = `File_${Date.now()}${ext}`;
    }

    cb(null, filename);
  },
});

const upload = multer({ storage });

module.exports = upload;
