const Subject = require("../../models/Other/subject.model");

const getSubject = async (req, res) => {
    try {
        let subject = await Subject.find().populate('branch', 'name').select('name code total semester branch _id');
        if (!subject || subject.length === 0) {
            return res
                .status(400)
                .json({ success: false, message: "No Subject Available" });
        }
        const data = {
            success: true,
            message: "All Subject Loaded!",
            subject,
        };
        res.json(data);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const getSubjectsByBranch = async (req, res) => {
    try {
        const { branchId } = req.params;
        let subjects = await Subject.find({ branch: branchId }).populate('branch', 'name').select('name code total semester branch _id');
        if (!subjects || subjects.length === 0) {
            return res
                .status(400)
                .json({ success: false, message: "No Subjects Available for this Branch" });
        }
        const data = {
            success: true,
            message: "Subjects Loaded for Branch!",
            subjects,
        };
        res.json(data);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const updateSubject = async (req, res) => {
    try {
        const { name, code, total, semester, branch } = req.body;
        
        // Find the existing subject first
        let subject = await Subject.findById(req.params.id);
        if (!subject) {
            return res.status(404).json({ 
                success: false, 
                message: "Subject not found!" 
            });
        }

        // Update only the provided fields
        if (name !== undefined) subject.name = name;
        if (code !== undefined) subject.code = code;
        if (total !== undefined) subject.total = Number(total);
        if (semester !== undefined) subject.semester = Number(semester);
        if (branch !== undefined) subject.branch = branch;

        // Save the updated subject
        const updatedSubject = await subject.save();
        
        res.json({
            success: true,
            message: "Subject Updated Successfully",
            subject: updatedSubject
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error",
            error: error.message 
        });
    }
}

const addSubject = async (req, res) => {
    console.log("Received Data:", req.body);
    let { name, code, total, semester, branch } = req.body;
   
    try {
        // Convert semester to Number
        semester = Number(semester);
        
        let existingSubject = await Subject.findOne({ code });
        if (existingSubject) {
            return res.status(400).json({ success: false, message: "Subject Already Exists" });
        }
        
        const subject = await Subject.create({ 
            name, 
            code, 
            total: Number(total), 
            semester,
            branch
        });
       
        res.json({ 
            success: true, 
            message: "Subject Added!",
            subject
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const deleteSubject = async (req, res) => {
    try {
        let subject = await Subject.findByIdAndDelete(req.params.id);
        if (!subject) {
            return res
                .status(400)
                .json({ success: false, message: "No Subject Exists!" });
        }
        const data = {
            success: true,
            message: "Subject Deleted!",
        };
        res.json(data);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports = { getSubject, getSubjectsByBranch, addSubject, deleteSubject, updateSubject }