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
      const { phoneNumber, email } = data;
  
      if (!validatePhoneNumber(phoneNumber)) {
        return res.status(400).json({ success: false, message: "Invalid phone number. Must be 10 digits starting with 6-9." });
      }
  
      let user = await facultyDetails.findOne({ employeeId: data.employeeId });
      if (user) {
        return res.status(400).json({
          success: false,
          message: "Faculty With This EmployeeId Already Exists",
        });
      }
  
      // Handle profile picture - use default if not provided
      const profileData = req.file 
        ? { ...data, profile: req.file.filename }
        : { ...data, profile: 'default-profile.png' };
  
      user = await facultyDetails.create(profileData);
      
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
        const { phoneNumber, email } = req.body;
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
  
      const user = await facultyDetails.findOneAndUpdate(
        { employeeId },
        { timetable },
        { new: true }
      );
  
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "No Faculty Found",
        });
      }
  
      const data = {
        success: true,
        message: "Timetable Updated Successfully!",
        user,
      };
      res.json(data);
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  };

module.exports = { getDetails, addDetails, updateDetails, deleteDetails, getCount, updateTimetable}