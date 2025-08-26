const facultyDetails = require("../../models/Faculty/details.model.js")
const { validatePhoneNumber } = require("../../utils/validation.js");

const getDetails = async (req, res) => {
    try {
        let user = await facultyDetails.find(req.body);
        if (!user) {
            return res
                .status(400)
                .json({ success: false, message: "No Faculty Found" });
        }
        const data = {
            success: true,
            message: "Faculty Details Found!",
            user,
        };
        res.json(data);
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const addDetails = async (req, res) => {
    try {
      const data = req.body;
      const employeeId = (data.employeeId || data.loginid || "").toString().trim();
      if (!employeeId) {
        return res.status(400).json({ success: false, message: "employeeId is required" });
      }

      // Normalize optional batch
      if (typeof data.batch !== 'undefined' && data.batch !== null && data.batch !== '') {
        const parsedBatch = parseInt(data.batch, 10);
        if (!Number.isFinite(parsedBatch)) {
          return res.status(400).json({ success: false, message: "Batch must be a valid year" });
        }
        data.batch = parsedBatch;
      }

      const { phoneNumber } = data;
      if (!validatePhoneNumber(phoneNumber)) {
        return res.status(400).json({ success: false, message: "Invalid phone number. Must be 10 digits starting with 6-9." });
      }

      const rawType = (data?.type || "").toString().toLowerCase();
      const rawOverwrite = (data?.overwrite ?? "").toString().toLowerCase();
      const isExcelImport = rawType === "excel-import" || rawType === "excel" || rawType === "import";
      const allowOverwrite = rawOverwrite === "true" || rawOverwrite === "1" || rawOverwrite === "yes" || rawOverwrite === "on";

      let existing = await facultyDetails.findOne({ employeeId });
      if (existing) {
        if (isExcelImport && allowOverwrite) {
          const updatePayload = { ...data };
          delete updatePayload.type;
          delete updatePayload.overwrite;
          if (req.file?.filename) updatePayload.profile = req.file.filename;
          await facultyDetails.updateOne({ employeeId }, { $set: updatePayload });
          return res.json({ success: true, message: "Faculty Details Updated (Import Overwrite)!" });
        }
        return res.status(400).json({
          success: false,
          message: "Faculty With This EmployeeId Already Exists",
        });
      }

      // Handle profile picture - use default if not provided
      const profileData = req.file 
        ? { ...data, employeeId, profile: req.file.filename }
        : { ...data, employeeId, profile: 'default-profile.png' };

      const user = await facultyDetails.create(profileData);
      const response = {
        success: true,
        message: "Faculty Details Added!",
        user,
      };
      res.json(response);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const updateDetails = async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
            return res.status(400).json({ success: false, message: "Invalid phone number. Must be 10 digits starting with 6-9." });
        }
        let user;
        if (req.file) {
            user = await facultyDetails.findByIdAndUpdate(req.params.id, { ...req.body, profile: req.file.filename });
        } else {
            user = await facultyDetails.findByIdAndUpdate(req.params.id, req.body);
        }
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "No Faculty Found",
            });
        }
        const data = {
            success: true,
            message: "Updated Successfull!",
        };
        res.json(data);
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}


const deleteDetails = async (req, res) => {
    try {
        let user = await facultyDetails.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "No Faculty Found",
            });
        }
        const data = {
            success: true,
            message: "Deleted Successfull!",
        };
        res.json(data);
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const getCount = async (req, res) => {
    try {
        let user = await facultyDetails.count(req.body);
        const data = {
            success: true,
            message: "Count Successfull!",
            user,
        };
        res.json(data);
    } catch (error) {
        res
            .status(500)
            .json({ success: false, message: "Internal Server Error", error });
    }
}

const updateTimetable = async (req, res) => {
  try {
    const { timetable } = req.body;
    const employeeId = req.params.id;

    // Validate input
    if (!timetable || !Array.isArray(timetable)) {
      return res.status(400).json({
        success: false,
        message: "Invalid timetable data format",
      });
    }

    // Find and update the faculty's timetable
    const updatedFaculty = await facultyDetails.findOneAndUpdate(
      { employeeId },
      { $set: { timetable } },
      { new: true }
    );

    if (!updatedFaculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    res.json({
      success: true,
      message: "Timetable updated successfully",
      faculty: updatedFaculty,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getFacultyByBatchAndBranch = async (req, res) => {
  try {
    const { batch, branch } = req.query;
    const filter = {};
    if (batch) {
      const parsed = parseInt(batch, 10);
      if (!Number.isFinite(parsed)) {
        return res.status(400).json({ success: false, message: "Invalid batch" });
      }
      filter.batch = parsed;
    }
    if (branch) {
      // Map branch to department for faculty
      filter.department = branch;
    }
    if (Object.keys(filter).length === 0) {
      return res.status(400).json({ success: false, message: "Provide at least batch or branch" });
    }
    const faculties = await facultyDetails.find(filter);
    return res.json({ success: true, count: faculties.length, faculties });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

module.exports = { getDetails, addDetails, updateDetails, deleteDetails, getCount, updateTimetable, getFacultyByBatchAndBranch }