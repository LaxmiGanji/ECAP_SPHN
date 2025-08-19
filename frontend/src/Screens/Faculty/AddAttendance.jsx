import React, { useEffect, useState } from "react";
import axios from "axios";
import { baseApiURL } from "../../baseUrl";
import toast from "react-hot-toast";

const AddAttendance = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [markedAttendance, setMarkedAttendance] = useState({});
  const [semester, setSemester] = useState("-- Select --");
  const [branch, setBranch] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("-- Select --");
  const [selectedBranch, setSelectedBranch] = useState("-- Select --");
  const [selectedSection, setSelectedSection] = useState("-- Select --");
  const [selectedPeriod, setSelectedPeriod] = useState("-- Select --");
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [range, setRange] = useState({ start: "", end: "" });
  const [totalClasses, setTotalClasses] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [canAddAttendance, setCanAddAttendance] = useState(false);

  // Sections available for filtering
  const sections = ['A', 'B', 'C', 'D'];

  // Fetch branch data
  const getBranchData = () => {
    axios
      .get(`${baseApiURL()}/branch/getBranch`)
      .then((response) => {
        if (response.data.success) {
          setBranch(response.data.branches);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.message);
      });
  };

  // Fetch subject data
  const getSubjectData = () => {
    setLoading(true);
    toast.loading("Loading Subjects");
    axios
      .get(`${baseApiURL()}/subject/getSubject`)
      .then((response) => {
        toast.dismiss();
        setLoading(false);
        if (response.data.success) {
          setSubjects(response.data.subject);
          filterSubjectsBySemester(semester, response.data.subject);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        setLoading(false);
        toast.error(error.message);
      });
  };

  // Function to filter subjects based on semester and branch
  const filterSubjectsBySemester = (selectedSemester, subjectsList = subjects) => {
    if (selectedSemester === "-- Select --" || selectedBranch === "-- Select --") {
      setFilteredSubjects([]);
      setSelectedSubject("-- Select --");
      setSelectedSubjectId(null);
      setTotalClasses("");
      setCanAddAttendance(false);
      return;
    }

    const semesterSubjects = subjectsList.filter(
      (subject) => 
        String(subject.semester) === String(selectedSemester) &&
        subject.branch?.name === selectedBranch
    );
    setFilteredSubjects(semesterSubjects);
    
    // If we had a subject selected before, try to preserve it
    if (selectedSubject !== "-- Select --") {
      const preservedSubject = semesterSubjects.find(sub => sub.name === selectedSubject);
      if (preservedSubject) {
        setSelectedSubjectId(preservedSubject._id);
        setTotalClasses(preservedSubject.total);
        setCanAddAttendance(false);
      } else {
        setSelectedSubject("-- Select --");
        setSelectedSubjectId(null);
        setTotalClasses("");
        setCanAddAttendance(false);
      }
    } else {
      setSelectedSubject("-- Select --");
      setSelectedSubjectId(null);
      setTotalClasses("");
      setCanAddAttendance(false);
    }
  };

  // Handle semester change
  const handleSemesterChange = (e) => {
    const newSemester = e.target.value;
    setSemester(newSemester);
    filterSubjectsBySemester(newSemester);
  };

  // Handle branch change
  const handleBranchChange = (e) => {
    const newBranch = e.target.value;
    setSelectedBranch(newBranch);
    filterSubjectsBySemester(semester);
  };

  // Handle section change
  const handleSectionChange = (e) => {
    setSelectedSection(e.target.value);
  };

  // Handle subject change
  const handleSubjectChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedSubject(selectedValue);
    
    if (selectedValue === "-- Select --") {
      setSelectedSubjectId(null);
      setTotalClasses("");
      setCanAddAttendance(false);
      return;
    }

    const subject = filteredSubjects.find(sub => sub.name === selectedValue);
    if (subject) {
      setSelectedSubjectId(subject._id);
      setTotalClasses(subject.total);
      setCanAddAttendance(false);
    } else {
      setSelectedSubjectId(null);
      setTotalClasses("");
      setCanAddAttendance(false);
    }
  };

  // Update total classes and enable attendance marking
  const updateTotalClasses = (newTotal) => {
    if (!selectedSubjectId || newTotal === undefined) {
      toast.error("Please select a subject and enter total classes");
      return;
    }
    
    const subject = filteredSubjects.find(sub => sub._id === selectedSubjectId);
    if (!subject) {
      toast.error("Subject not found");
      return;
    }
    
    setLoading(true);
    toast.loading("Updating total classes...");
    axios
      .put(`${baseApiURL()}/subject/updateSubject/${selectedSubjectId}`, {
        name: subject.name,
        code: subject.code,
        total: Number(newTotal),
        semester: subject.semester,
        branch: subject.branch
      })
      .then((response) => {
        toast.dismiss();
        setLoading(false);
        if (response.data.success) {
          toast.success("Total classes updated successfully!");
          setCanAddAttendance(true);
          
          // Update the local state without refetching all subjects
          const updatedSubjects = subjects.map(sub => 
            sub._id === selectedSubjectId ? {...sub, total: Number(newTotal)} : sub
          );
          setSubjects(updatedSubjects);
          
          const updatedFilteredSubjects = filteredSubjects.map(sub => 
            sub._id === selectedSubjectId ? {...sub, total: Number(newTotal)} : sub
          );
          setFilteredSubjects(updatedFilteredSubjects);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        setLoading(false);
        toast.error("Failed to update total classes");
        console.error("Update error:", error.response?.data || error.message);
      });
  };

  // Increment total classes and enable attendance
  const incrementTotalClasses = () => {
    if (!selectedSubjectId) {
      toast.error("Please select a subject first");
      return;
    }
    
    const newTotal = Number(totalClasses) + 1;
    setTotalClasses(newTotal);
    updateTotalClasses(newTotal);
  };

  // Decrement total classes and disable attendance if needed
  const decrementTotalClasses = () => {
    if (!selectedSubjectId || Number(totalClasses) <= 0) {
      return;
    }
    
    const newTotal = Number(totalClasses) - 1;
    setTotalClasses(newTotal);
    updateTotalClasses(newTotal);
    
    // If we're decrementing to 0, disable attendance
    if (newTotal === 0) {
      setCanAddAttendance(false);
    }
  };

  // Fetch student data
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseApiURL()}/student/details/getDetails2`);
        setLoading(false);
        if (response.data.success) {
          setStudents(response.data.students);
        } else {
          toast.error("Failed to load students");
        }
      } catch (error) {
        setLoading(false);
        toast.error("Error fetching students");
        console.error(error);
      }
    };

    fetchStudents();
  }, []);

  // Initial data fetch
  useEffect(() => {
    getBranchData();
    getSubjectData();
  }, []);


  // Filter students based on filters
  useEffect(() => {
    filterStudents();
  }, [students, selectedBranch, semester, selectedSection, range]);

  const filterStudents = () => {
    let filtered = students;

    if (selectedBranch && selectedBranch !== "-- Select --") {
      filtered = filtered.filter(
        (student) => student.branch.toLowerCase() === selectedBranch.toLowerCase()
      );
    }

    if (semester && semester !== "-- Select --") {
      filtered = filtered.filter((student) => String(student.semester) === semester);
    }

    if (selectedSection && selectedSection !== "-- Select --") {
      filtered = filtered.filter((student) => student.section === selectedSection);
    }

    if (range.start && range.end) {
      filtered = filtered.filter(
        (student) =>
          student.enrollmentNo >= Number(range.start) &&
          student.enrollmentNo <= Number(range.end)
      );
    }

    // Sort enrollment numbers in ascending order
    filtered.sort((a, b) => {
      // If enrollmentNo is string, compare as numbers if possible
      const aNum = Number(a.enrollmentNo);
      const bNum = Number(b.enrollmentNo);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      // Otherwise, compare as strings
      return String(a.enrollmentNo).localeCompare(String(b.enrollmentNo));
    });

    setFilteredStudents(filtered);
  };


  // Toggle individual attendance (local state only)
  const toggleAttendance = (student) => {
    if (!canAddAttendance) {
      toast.error("Please increment total classes first to enable attendance marking");
      return;
    }
    if (selectedSubject === "-- Select --" || selectedPeriod === "-- Select --") {
      toast.error("Please select both a subject and period.");
      return;
    }
    setMarkedAttendance((prev) => {
      const newState = { ...prev };
      if (newState[student.enrollmentNo]) {
        delete newState[student.enrollmentNo];
      } else {
        newState[student.enrollmentNo] = {
          enrollmentNo: student.enrollmentNo,
          name: `${student.firstName} ${student.lastName}`,
          branch: student.branch,
          section: student.section,
          subject: selectedSubject,
          period: selectedPeriod,
          semester: semester,
          date: selectedDate,
        };
      }
      return newState;
    });
  };

  // Mark/unmark all locally
  const toggleSelectAll = () => {
    if (!canAddAttendance) {
      toast.error("Please increment total classes first to enable attendance marking");
      return;
    }
    if (selectedSubject === "-- Select --" || selectedPeriod === "-- Select --") {
      toast.error("Please select both a subject and period.");
      return;
    }
    const newSelectAllChecked = !selectAllChecked;
    setSelectAllChecked(newSelectAllChecked);
    if (newSelectAllChecked) {
      const attendanceDataForBulk = {};
      filteredStudents.forEach((student) => {
        attendanceDataForBulk[student.enrollmentNo] = {
          enrollmentNo: student.enrollmentNo,
          name: `${student.firstName} ${student.lastName}`,
          branch: student.branch,
          section: student.section,
          subject: selectedSubject,
          period: selectedPeriod,
          semester: semester,
          date: selectedDate,
        };
      });
      setMarkedAttendance(attendanceDataForBulk);
    } else {
      setMarkedAttendance({});
    }
  };

  // Submit attendance to backend
  const handleSubmitAttendance = async () => {
    if (!canAddAttendance) {
      toast.error("Please increment total classes first to enable attendance marking");
      return;
    }
    if (selectedSubject === "-- Select --" || selectedPeriod === "-- Select --") {
      toast.error("Please select both a subject and period.");
      return;
    }
    const attendanceArray = Object.values(markedAttendance);
    if (attendanceArray.length === 0) {
      toast.error("No students selected for attendance.");
      return;
    }
    setLoading(true);
    toast.loading("Submitting attendance...");
    try {
      const response = await axios.post(
        `${baseApiURL()}/attendence/addBulk`,
        attendanceArray
      );
      toast.dismiss();
      setLoading(false);
      if (response.data.success) {
        toast.success("Attendance submitted successfully!");
        setMarkedAttendance({});
        setSelectAllChecked(false);
      } else {
        toast.error(response.data.message || "Failed to submit attendance.");
      }
    } catch (error) {
      toast.dismiss();
      setLoading(false);
      toast.error("Failed to submit attendance.");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-center mb-6">Add Attendance</h2>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-6">
        <div>
          <label className="block font-medium text-gray-700">Branch</label>
          <select
            value={selectedBranch}
            onChange={handleBranchChange}
            className="w-full px-4 py-2 border rounded"
          >
            <option>-- Select --</option>
            {branch.map((b) => (
              <option key={b._id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium text-gray-700">Semester</label>
          <select
            value={semester}
            onChange={handleSemesterChange}
            className="w-full px-4 py-2 border rounded"
          >
            <option>-- Select --</option>
            {[...Array(8).keys()].map((i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium text-gray-700">Section</label>
          <select
            value={selectedSection}
            onChange={handleSectionChange}
            className="w-full px-4 py-2 border rounded"
          >
            <option>-- Select --</option>
            {sections.map((section) => (
              <option key={section} value={section}>
                {section}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium text-gray-700">Subject</label>
          <select
            value={selectedSubject}
            onChange={handleSubjectChange}
            className="w-full px-4 py-2 border rounded"
            disabled={semester === "-- Select --"}
          >
            <option>-- Select --</option>
            {filteredSubjects.map((subject) => (
              <option key={subject._id} value={subject.name}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium text-gray-700">Period</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          >
            <option>-- Select --</option>
            {[...Array(7).keys()].map((i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium text-gray-700">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Enrollment Range</label>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Start"
              value={range.start}
              onChange={(e) => setRange({ ...range, start: e.target.value })}
              className="w-full px-4 py-2 border rounded"
            />
            <input
              type="number"
              placeholder="End"
              value={range.end}
              onChange={(e) => setRange({ ...range, end: e.target.value })}
              className="w-full px-4 py-2 border rounded"
            />
          </div>
        </div>
      </div>

      {/* Total Classes Input */}
      <div className="mb-6 flex items-end space-x-4">
        <div className="flex-1">
          <label className="block font-medium text-gray-700">Total Classes</label>
          <input
            type="number"
            value={totalClasses}
            onChange={(e) => setTotalClasses(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            placeholder="Enter total classes"
            disabled={!selectedSubjectId}
          />
        </div>
        <div className="flex flex-col space-y-2">
          <button
            onClick={incrementTotalClasses}
            disabled={!selectedSubjectId || loading}
            className={`px-3 py-2 rounded text-white ${!selectedSubjectId || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
          >
            +
          </button>
          <button
            onClick={decrementTotalClasses}
            disabled={!selectedSubjectId || loading || Number(totalClasses) <= 0}
            className={`px-3 py-2 rounded text-white ${!selectedSubjectId || loading || Number(totalClasses) <= 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
          >
            −
          </button>
        </div>
      </div>

      {/* Status indicator */}
      {canAddAttendance && (
        <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">
          ✓ Attendance marking is enabled. You can now mark attendance for students.
        </div>
      )}

      {/* Bulk Actions */}
      <div className="mb-6 flex space-x-4">
        <button
          onClick={toggleSelectAll}
          disabled={!canAddAttendance || selectedSubject === "-- Select --" || selectedPeriod === "-- Select --" || loading}
          className={`px-4 py-2 rounded text-white ${!canAddAttendance || selectedSubject === "-- Select --" || selectedPeriod === "-- Select --" || loading ? 'bg-gray-400 cursor-not-allowed' : selectAllChecked ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {loading ? 'Processing...' : selectAllChecked ? 'Unmark All' : 'Mark All'}
        </button>
      </div>

      {/* Students Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">
                <input
                  type="checkbox"
                  checked={selectAllChecked}
                  onChange={toggleSelectAll}
                  disabled={!canAddAttendance || selectedSubject === "-- Select --" || selectedPeriod === "-- Select --"}
                />
              </th>
              <th className="border border-gray-300 px-4 py-2">Enrollment No</th>
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Branch</th>
              <th className="border border-gray-300 px-4 py-2">Section</th>
              <th className="border border-gray-300 px-4 py-2">Semester</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student._id}>
                <td className="border border-gray-300 px-4 py-2">
                  <input
                    type="checkbox"
                    checked={!!markedAttendance[student.enrollmentNo]}
                    onChange={() => toggleAttendance(student)}
                    disabled={!canAddAttendance || selectedSubject === "-- Select --" || selectedPeriod === "-- Select --"}
                  />
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {student.enrollmentNo}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {student.firstName} {student.middleName} {student.lastName}
                </td>
                <td className="border border-gray-300 px-4 py-2">{student.branch}</td>
                <td className="border border-gray-300 px-4 py-2">{student.section}</td>
                <td className="border border-gray-300 px-4 py-2">{student.semester}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Submit Button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={handleSubmitAttendance}
          disabled={!canAddAttendance || Object.keys(markedAttendance).length === 0 || loading}
          className={`px-8 py-3 rounded-lg text-white font-semibold ${!canAddAttendance || Object.keys(markedAttendance).length === 0 || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? "Submitting..." : "Submit Attendance"}
        </button>
      </div>
    </div>
  );
};

export default AddAttendance;