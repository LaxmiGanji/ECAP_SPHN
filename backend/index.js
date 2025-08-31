//index.js
const connectToMongo = require("./Database/db");
const express = require("express");
const app = express();
const path = require("path")
connectToMongo();
const port = process.env.PORT || 10000;

const cors = require("cors");

app.use(cors({
  origin: process.env.FRONTEND_URL || "https://ecap-sphn-frontend.onrender.com",
  credentials: true
}));

app.use(express.json()); //to convert request data to json

app.get("/", (req, res) => {
  res.json({
    message: "Hello 👋 I am Working Fine 🚀",
    status: "running",
    timestamp: new Date().toISOString(),
    endpoints: {
      compiler: "/api/compiler",
      health: "/api/compiler/health"
    }
  });
})


app.use('/media', express.static(path.join(__dirname, 'media')));


// Credential Apis
app.use("/api/student/auth", require("./routes/Student Api/credential.route"));
app.use("/api/faculty/auth", require("./routes/Faculty Api/credential.route"));
app.use("/api/admin/auth", require("./routes/Admin Api/credential.route"));
app.use("/api/library/auth", require("./routes/Library Api/credential.route"));
// Details Apis
app.use("/api/student/details", require("./routes/Student Api/details.route"));
app.use("/api/faculty/details", require("./routes/Faculty Api/details.route"));
app.use("/api/admin/details", require("./routes/Admin Api/details.route"));
app.use("/api/library/details", require("./routes/Library Api/details.route"));
// Compiler Api
app.use("/api/compiler", require("./routes/Student Api/compiler.route"));

// Other Apis
app.use("/api/timetable", require("./routes/Other Api/timetable.route"));
app.use("/api/material", require("./routes/Other Api/material.route"));
app.use("/api/notice", require("./routes/Other Api/notice.route"));
app.use("/api/subject", require("./routes/Other Api/subject.route"));
app.use("/api/marks", require("./routes/Other Api/marks.route"));
app.use("/api/branch", require("./routes/Other Api/branch.route"));
app.use("/api/library", require("./routes/Other Api/library.route"));
app.use("/api/attendence", require("./routes/Other Api/attedence.route"));


app.listen(port, () => {
  console.log(`Server Listening On http://localhost:${port}`);
});