import { useEffect, useState, useCallback } from "react";
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
  const [selectedPeriod, setSelectedPeriod] = useState("-- Select --");
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [range, setRange] = useState({ start: "", end: "" });
  const [totalClasses, setTotalClasses] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  // ✅ FIX 1: Moved up and wrapped in useCallback
  const filterSubjectsBySemester = useCallback((selectedSemester, subjectsList = subjects) => {
    if (selectedSemester === "-- Select --" || selectedBranch === "-- Select --") {
      setFilteredSubjects([]);
      setSelectedSubject("-- Select --");
      setSelectedSubjectId(null);
      setTotalClasses("");
      return;
    }

    const semesterSubjects = subjectsList.filter(
      (subject) =>
        String(subject.semester) === String(selectedSemester) &&
        subject.branch?.name === selectedBranch
    );
    setFilteredSubjects(semesterSubjects);
    setSelectedSubject("-- Select --");
    setSelectedSubjectId(null);
    setTotalClasses("");
  }, [selectedBranch, subjects]);

  // ✅ FIX 2: Moved up
  const filterStudents = useCallback(() => {
    let filtered = students;

    if (selectedBranch && selectedBranch !== "-- Select --") {
      filtered = filtered.filter(
        (student) => student.branch.toLowerCase() === selectedBranch.toLowerCase()
      );
    }

    if (semester && semester !== "-- Select --") {
      filtered = filtered.filter((student) => String(student.semester) === semester);
    }

    if (range.start && range.end) {
      filtered = filtered.filter(
        (student) =>
          student.enrollmentNo >= Number(range.start) &&
          student.enrollmentNo <= Number(range.end)
      );
    }

    filtered.sort((a, b) => a.enrollmentNo - b.enrollmentNo);
    setFilteredStudents(filtered);
  }, [students, selectedBranch, semester, range]);

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

  const getSubjectData = useCallback(() => {
    setLoading(true);
    toast.loading("Loading Subjects");
    axios
      .get(`${baseApiURL()}/subject/getSubject`)
      .then((response) => {
        toast.dismiss();
        setLoading(false);
        if (response.data.success) {
          setSubjects(response.data.subject);
          filterSubjectsBySemester(semester, response.data.subject); // safe now
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        setLoading(false);
        toast.error(error.message);
      });
  }, [semester, filterSubjectsBySemester]);

  const handleSemesterChange = (e) => {
    const newSemester = e.target.value;
    setSemester(newSemester);
    filterSubjectsBySemester(newSemester);
  };

  const handleBranchChange = (e) => {
    const newBranch = e.target.value;
    setSelectedBranch(newBranch);
    filterSubjectsBySemester(semester);
  };

  const handleSubjectChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedSubject(selectedValue);

    if (selectedValue === "-- Select --") {
      setSelectedSubjectId(null);
      setTotalClasses("");
      return;
    }

    const subject = filteredSubjects.find(sub => sub.name === selectedValue);
    if (subject) {
      setSelectedSubjectId(subject._id);
      setTotalClasses(subject.total);
    } else {
      setSelectedSubjectId(null);
      setTotalClasses("");
    }
  };

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
      })
      .then((response) => {
        toast.dismiss();
        setLoading(false);
        if (response.data.success) {
          toast.success("Total classes updated successfully!");
          getSubjectData();
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

  useEffect(() => {
    getBranchData();
    getSubjectData();
  }, [getSubjectData]);

  useEffect(() => {
    filterStudents();
  }, [filterStudents]);

  // ... everything else in your component remains unchanged ...

  

  // Toggle individual attendance - FIXED VERSION
  const toggleAttendance = (student) => {
    if (selectedSubject === "-- Select --" || selectedPeriod === "-- Select --") {
      toast.error("Please select both a subject and period.");
      return;
    }

    const isCurrentlyMarked = !!markedAttendance[student.enrollmentNo];
    const url = isCurrentlyMarked
      ? `${baseApiURL()}/attendence/remove`
      : `${baseApiURL()}/attendence/add`;

    const attendanceData = {
      enrollmentNo: student.enrollmentNo,
      name: `${student.firstName} ${student.lastName}`,
      branch: student.branch,
      subject: selectedSubject,
      period: selectedPeriod,
      semester: semester,
      date: selectedDate,
    };

    setLoading(true);
    axios
      .post(url, attendanceData)
      .then((response) => {
        setLoading(false);
        if (response.data.success) {
          setMarkedAttendance((prev) => {
            const newState = { ...prev };
            if (isCurrentlyMarked) {
              // Remove from state
              delete newState[student.enrollmentNo];
            } else {
              // Add to state
              newState[student.enrollmentNo] = attendanceData;
            }
            return newState;
          });
          
          // Update selectAllChecked based on current state
          const allStudentsMarked = filteredStudents.every(s => 
            isCurrentlyMarked ? 
              (s.enrollmentNo !== student.enrollmentNo && markedAttendance[s.enrollmentNo]) :
              (s.enrollmentNo === student.enrollmentNo || markedAttendance[s.enrollmentNo])
          );
          setSelectAllChecked(allStudentsMarked);
          
          toast.success(
            `${isCurrentlyMarked ? "Removed" : "Added"} attendance for ${student.firstName}`
          );
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        setLoading(false);
        toast.error(`Failed to ${isCurrentlyMarked ? "remove" : "add"} attendance`);
        console.error(error);
      });
  };

  // Remove bulk attendance
  const removeBulkAttendance = () => {
    if (selectedSubject === "-- Select --" || selectedPeriod === "-- Select --") {
      toast.error("Please select both a subject and period.");
      return;
    }

    const attendanceData = filteredStudents.map((student) => ({
      enrollmentNo: student.enrollmentNo,
      branch: student.branch,
      subject: selectedSubject,
      period: selectedPeriod,
      semester: semester,
      date: selectedDate
    }));

    setLoading(true);
    axios
      .post(`${baseApiURL()}/attendence/removeBulk`, attendanceData)
      .then((response) => {
        setLoading(false);
        if (response.data.success) {
          setMarkedAttendance({});
          setSelectAllChecked(false);
          toast.success("Attendance removed for all filtered students.");
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        setLoading(false);
        toast.error("Failed to remove attendance for all students.");
        console.error(error);
      });
  };

  // Toggle select all attendance
  const toggleSelectAll = () => {
    if (selectedSubject === "-- Select --" || selectedPeriod === "-- Select --") {
      toast.error("Please select both a subject and period.");
      return;
    }

    const newSelectAllChecked = !selectAllChecked;
    setSelectAllChecked(newSelectAllChecked);

    if (newSelectAllChecked) {
      const attendanceDataForBulk = filteredStudents.map((student) => ({
        enrollmentNo: student.enrollmentNo,
        name: `${student.firstName} ${student.lastName}`,
        branch: student.branch,
        subject: selectedSubject,
        period: selectedPeriod,
        semester: semester,
        date: selectedDate,
      }));

      setLoading(true);
      axios
        .post(`${baseApiURL()}/attendence/addBulk`, attendanceDataForBulk)
        .then((response) => {
          setLoading(false);
          if (response.data.success) {
            const updatedAttendance = {};
            attendanceDataForBulk.forEach(
              (data) => (updatedAttendance[data.enrollmentNo] = data)
            );
            setMarkedAttendance(updatedAttendance);
            toast.success("Attendance marked for all students.");
          } else {
            toast.error(response.data.message);
          }
        })
        .catch((error) => {
          setLoading(false);
          toast.error("Failed to mark attendance for all.");
          console.error(error);
        });
    } else {
      removeBulkAttendance();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-center mb-6">Add Attendance</h2>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
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
            onClick={() => {
              if (selectedSubjectId) {
                setTotalClasses(prev => {
                  const newVal = Number(prev) + 1;
                  updateTotalClasses(newVal);
                  return newVal;
                });
              }
            }}
            disabled={!selectedSubjectId || loading}
            className={`px-3 py-2 rounded text-white ${!selectedSubjectId || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
          >
            +
          </button>
          <button
            onClick={() => {
              if (selectedSubjectId && Number(totalClasses) > 0) {
                setTotalClasses(prev => {
                  const newVal = Number(prev) - 1;
                  updateTotalClasses(newVal);
                  return newVal;
                });
              }
            }}
            disabled={!selectedSubjectId || loading || Number(totalClasses) <= 0}
            className={`px-3 py-2 rounded text-white ${!selectedSubjectId || loading || Number(totalClasses) <= 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
          >
            −
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="mb-6 flex space-x-4">
        <button
          onClick={toggleSelectAll}
          disabled={selectedSubject === "-- Select --" || selectedPeriod === "-- Select --" || loading}
          className={`px-4 py-2 rounded text-white ${selectedSubject === "-- Select --" || selectedPeriod === "-- Select --" || loading ? 'bg-gray-400 cursor-not-allowed' : selectAllChecked ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {loading ? 'Processing...' : selectAllChecked ? 'Unmark All' : 'Mark All'}
        </button>
        {selectAllChecked && (
          <button
            onClick={removeBulkAttendance}
            disabled={selectedSubject === "-- Select --" || selectedPeriod === "-- Select --" || loading}
            className={`px-4 py-2 rounded text-white ${selectedSubject === "-- Select --" || selectedPeriod === "-- Select --" || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {loading ? 'Removing...' : 'Remove All'}
          </button>
        )}
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
                  disabled={selectedSubject === "-- Select --" || selectedPeriod === "-- Select --"}
                />
              </th>
              <th className="border border-gray-300 px-4 py-2">Enrollment No</th>
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Branch</th>
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
                    disabled={selectedSubject === "-- Select --" || selectedPeriod === "-- Select --"}
                  />
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {student.enrollmentNo}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {student.firstName} {student.lastName}
                </td>
                <td className="border border-gray-300 px-4 py-2">{student.branch}</td>
                <td className="border border-gray-300 px-4 py-2">{student.semester}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AddAttendance;