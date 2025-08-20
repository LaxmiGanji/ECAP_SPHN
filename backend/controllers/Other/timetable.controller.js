const Timetable = require("../../models/Other/timetable.model");

const getTimetable = async (req, res) => {
    try {
        const { branch, semester, section } = req.body;

        if (!branch || !semester || !section) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        let timetable = await Timetable.findOne({ branch, semester, section }).sort({ createdAt: -1 });

        if (timetable) {
            res.json({ success: true, timetable: [timetable] }); // Wrap in array to match frontend expectation
        } else {
            res.status(404).json({ success: false, message: "Timetable Not Found" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


const addTimetable = async (req, res) => {
    const { semester, branch, section, schedule } = req.body;
    try {
        let timetable = await Timetable.findOne({ semester, branch, section });
        if (timetable) {
            await Timetable.findByIdAndUpdate(timetable._id, {
                semester,
                branch,
                section,
                schedule: JSON.parse(schedule)
            });
            const data = {
                success: true,
                message: "Timetable Updated!",
            };
            res.json(data);
        } else {
            await Timetable.create({
                semester,
                branch,
                section,
                schedule: JSON.parse(schedule)
            });
            const data = {
                success: true,
                message: "Timetable Added!",
            };
            res.json(data);
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const deleteTimetable = async (req, res) => {
    try {
        let timetable = await Timetable.findByIdAndDelete(req.params.id);
        if (!timetable) {
            return res
                .status(400)
                .json({ success: false, message: "No Timetable Exists!" });
        }
        const data = {
            success: true,
            message: "Timetable Deleted!",
        };
        res.json(data);
    } catch (error) {
        console.error(error.message);
        console.log(error)
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const editTimetable = async (req, res) => {
    try {
        const { id } = req.params;
        const { semester, branch, section, schedule } = req.body;

        if (!id || !semester || !branch || !section || !schedule) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const updatedTimetable = await Timetable.findByIdAndUpdate(
            id,
            {
                semester,
                branch,
                section,
                schedule: JSON.parse(schedule)
            },
            { new: true }
        );

        if (!updatedTimetable) {
            return res.status(404).json({ success: false, message: "Timetable not found" });
        }

        res.json({ 
            success: true, 
            message: "Timetable updated successfully",
            timetable: updatedTimetable
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = { getTimetable, addTimetable, deleteTimetable, editTimetable }