import React, { useEffect, useState } from "react";
import axios from "axios";
import { baseApiURL } from "../../baseUrl";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";

const AddAttendance = () => {
  const router = useLocation();
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
  const [selectedDay, setSelectedDay] = useState("-- Select --");
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [range, setRange] = useState({ start: "", end: "" });
  const [totalClasses, setTotalClasses] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [canAddAttendance, setCanAddAttendance] = useState(false);
  const [absenteesInput, setAbsenteesInput] = useState("");
  const [presenteesInput, setPresenteesInput] = useState("");
  const [facultyData, setFacultyData] = useState(null);

  // Days available for selection
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Sections available for filtering
  const sections = ['A', 'B', 'C', 'D', 'SOC','WIPRO TRAINING', 'ATT'];

  // Fetch faculty data including timetable
  const getFacultyData = () => {
    if (!router.state?.loginid) {
      toast.error("Faculty ID not found");
      return;
    }

    setLoading(true);
    axios
      .post(
        `${baseApiURL()}/faculty/details/getDetails`,
        { employeeId: router.state.loginid }
      )
      .then((response) => {
        setLoading(false);
        if (response.data.success) {
          const faculty = response.data.user[0];
          setFacultyData(faculty);
          
          // Check if faculty has timetable
          if (!faculty.timetable || faculty.timetable.length === 0) {
            toast.error("No timetable found for this faculty. Please contact administrator to set up your timetable.");
          } else {
            toast.success("Timetable loaded successfully! You can now select day and period to auto-populate fields.");
          }
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        setLoading(false);
        console.error(error);
        toast.error("Failed to fetch faculty data");
      });
  };

  // Function to get timetable entry for selected day and period
  const getTimetableEntry = (day, period) => {
    if (!facultyData?.timetable) {
      console.log("No faculty data or timetable available");
      return null;
    }
    
    const dayEntry = facultyData.timetable.find(entry => entry.day === day);
    if (!dayEntry) {
      console.log(`No timetable entry found for day: ${day}`);
      return null;
    }
    
    const periodEntry = dayEntry.periods.find(p => p.periodNumber === Number(period));
    if (!periodEntry) {
      console.log(`No period entry found for period: ${period} on ${day}`);
      return null;
    }
    
    console.log("Found timetable entry:", periodEntry);
    return periodEntry;
  };

  // Handle day change
  const handleDayChange = (e) => {
    const newDay = e.target.value;
    setSelectedDay(newDay);
    
    // Reset period and clear auto-populated fields
    setSelectedPeriod("-- Select --");
    setSelectedSubject("-- Select --");
    setSelectedBranch("-- Select --");
    setSelectedSection("-- Select --");
    setSemester("-- Select --");
    setSelectedSubjectId(null);
    setTotalClasses("");
    setCanAddAttendance(false);
    setMarkedAttendance({});
    setSelectAllChecked(false);
    setAbsenteesInput("");
    setPresenteesInput("");
  };

  // Handle period change
  const handlePeriodChange = (e) => {
    const newPeriod = e.target.value;
    setSelectedPeriod(newPeriod);
    
    if (newPeriod === "-- Select --" || selectedDay === "-- Select --") {
      // Reset auto-populated fields
      setSelectedSubject("-- Select --");
      setSelectedBranch("-- Select --");
      setSelectedSection("-- Select --");
      setSemester("-- Select --");
      setSelectedSubjectId(null);
      setTotalClasses("");
      setCanAddAttendance(false);
      setMarkedAttendance({});
      setSelectAllChecked(false);
      setAbsenteesInput("");
      setPresenteesInput("");
      return;
    }

    // Auto-populate fields from timetable
    const timetableEntry = getTimetableEntry(selectedDay, newPeriod);
    if (timetableEntry) {
      // Check if all required timetable fields are present
      if (!timetableEntry.subject || !timetableEntry.branch || !timetableEntry.section || !timetableEntry.semester) {
        toast.error(`Incomplete timetable data for ${selectedDay} Period ${newPeriod}. Please contact administrator to complete the timetable.`);
        setSelectedSubject("-- Select --");
        setSelectedBranch("-- Select --");
        setSelectedSection("-- Select --");
        setSemester("-- Select --");
        setSelectedSubjectId(null);
        setTotalClasses("");
        setCanAddAttendance(false);
        setMarkedAttendance({});
        setSelectAllChecked(false);
        setAbsenteesInput("");
        setPresenteesInput("");
        return;
      }

      setSelectedSubject(timetableEntry.subject);
      setSelectedBranch(timetableEntry.branch);
      setSelectedSection(timetableEntry.section);
      setSemester(timetableEntry.semester);
      
      // Find the subject ID and total classes from the subjects array
      console.log("Looking for subject:", {
        name: timetableEntry.subject,
        branch: timetableEntry.branch,
        semester: timetableEntry.semester
      });
      console.log("Available subjects:", subjects);
      
      const subject = subjects.find(sub => 
        sub.name === timetableEntry.subject && 
        sub.branch?.name === timetableEntry.branch &&
        String(sub.semester) === String(timetableEntry.semester)
      );
      
      if (subject) {
        setSelectedSubjectId(subject._id);
        setTotalClasses(subject.total || 0);
        setCanAddAttendance(false); // Still need to increment total classes
        toast.success(`Timetable data loaded: ${timetableEntry.subject} - ${timetableEntry.branch} Sem ${timetableEntry.semester} Sec ${timetableEntry.section}`);
        console.log("Found matching subject:", subject);
      } else {
        setSelectedSubjectId(null);
        setTotalClasses("");
        setCanAddAttendance(false);
        
        // Check if subjects are loaded
        if (subjects.length === 0) {
          toast.error("Subjects not loaded yet. Please wait for subjects to load.");
        } else {
          toast.warning(`Subject "${timetableEntry.subject}" not found in subjects list. Please ensure the subject is properly configured.`);
          console.log("No matching subject found. Available subjects:", subjects.map(s => ({ name: s.name, branch: s.branch?.name, semester: s.semester })));
        }
      }
      
      // Clear attendance selections
      setMarkedAttendance({});
      setSelectAllChecked(false);
      setAbsenteesInput("");
      setPresenteesInput("");
    } else {
      // No timetable entry found for this day/period combination
      toast.error(`No class scheduled for ${selectedDay} Period ${newPeriod}`);
      setSelectedSubject("-- Select --");
      setSelectedBranch("-- Select --");
      setSelectedSection("-- Select --");
      setSemester("-- Select --");
      setSelectedSubjectId(null);
      setTotalClasses("");
      setCanAddAttendance(false);
      setMarkedAttendance({});
      setSelectAllChecked(false);
      setAbsenteesInput("");
      setPresenteesInput("");
    }
  };

  // Retry finding subject when subjects are loaded
  const retryFindSubject = () => {
    if (selectedDay === "-- Select --" || selectedPeriod === "-- Select --") {
      toast.error("Please select day and period first");
      return;
    }
    
    const timetableEntry = getTimetableEntry(selectedDay, selectedPeriod);
    if (!timetableEntry) {
      toast.error("No timetable entry found");
      return;
    }
    
    const subject = subjects.find(sub => 
      sub.name === timetableEntry.subject && 
      sub.branch?.name === timetableEntry.branch &&
      String(sub.semester) === String(timetableEntry.semester)
    );
    
    if (subject) {
      setSelectedSubjectId(subject._id);
      setTotalClasses(subject.total || 0);
      setCanAddAttendance(false);
      toast.success(`Subject found: ${subject.name}`);
    } else {
      toast.error("Subject still not found. Please check if the subject is properly configured in the system.");
    }
  };

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
      return;
    }

    const semesterSubjects = subjectsList.filter(
      (subject) => 
        String(subject.semester) === String(selectedSemester) &&
        subject.branch?.name === selectedBranch
    );
    setFilteredSubjects(semesterSubjects);
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
    getFacultyData();
  }, []);


  // Filter students based on filters
  useEffect(() => {
    filterStudents();
  }, [students, selectedBranch, semester, selectedSection, range, selectedDay]);

  // Update filtered subjects when semester or branch changes
  useEffect(() => {
    if (semester !== "-- Select --" && selectedBranch !== "-- Select --") {
      filterSubjectsBySemester(semester);
    }
  }, [semester, selectedBranch, subjects]);

  // Auto-retry finding subject when subjects are loaded
  useEffect(() => {
    if (subjects.length > 0 && selectedDay !== "-- Select --" && selectedPeriod !== "-- Select --" && 
        selectedSubject !== "-- Select --" && !selectedSubjectId) {
      // Wait a bit for the state to settle, then retry
      const timer = setTimeout(() => {
        retryFindSubject();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [subjects, selectedDay, selectedPeriod, selectedSubject, selectedSubjectId]);

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

  // Handle presentees input
  const handlePresenteesInput = (input) => {
    setPresenteesInput(input);
    
    if (!input.trim()) {
      return; // If input is empty, don't change anything
    }
    
    // Clear absentees input when using presentees
    if (absenteesInput) {
      setAbsenteesInput("");
    }
    
    // Split by comma and clean up whitespace
    const presentees = input.split(',').map(enrollment => enrollment.trim()).filter(enrollment => enrollment);
    
    // Create new attendance state with only presentees
    const newAttendance = {};
    
    // Add all presentees to attendance
    filteredStudents.forEach((student) => {
      if (presentees.includes(student.enrollmentNo)) {
        newAttendance[student.enrollmentNo] = {
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
    });
    
    setMarkedAttendance(newAttendance);
    
    // Update select all checkbox state
    const allPresenteesSelected = presentees.length > 0 && 
      presentees.every(enrollment => newAttendance[enrollment]);
    setSelectAllChecked(allPresenteesSelected);
  };

  // Handle absentees input
  const handleAbsenteesInput = (input) => {
    setAbsenteesInput(input);
    
    if (!input.trim()) {
      return; // If input is empty, don't change anything
    }
    
    // Clear presentees input when using absentees
    if (presenteesInput) {
      setPresenteesInput("");
    }
    
    // Split by comma and clean up whitespace
    const absentees = input.split(',').map(enrollment => enrollment.trim()).filter(enrollment => enrollment);
    
    // Create new attendance state excluding absentees
    const newAttendance = {};
    Object.keys(markedAttendance).forEach(enrollmentNo => {
      if (!absentees.includes(enrollmentNo)) {
        newAttendance[enrollmentNo] = markedAttendance[enrollmentNo];
      }
    });
    
    setMarkedAttendance(newAttendance);
    
    // Update select all checkbox state
    const remainingStudents = filteredStudents.filter(student => !absentees.includes(student.enrollmentNo));
    const allRemainingSelected = remainingStudents.length > 0 && 
      remainingStudents.every(student => newAttendance[student.enrollmentNo]);
    setSelectAllChecked(allRemainingSelected);
  };

  // Toggle individual attendance (local state only)
  const toggleAttendance = (student) => {
    if (!canAddAttendance) {
      toast.error("Please increment total classes first to enable attendance marking");
      return;
    }
    if (selectedSubject === "-- Select --" || selectedPeriod === "-- Select --" || selectedDay === "-- Select --") {
      toast.error("Please select day, subject, and period.");
      return;
    }
    
    // Check if all timetable data is complete
    if (!selectedBranch || selectedBranch === "-- Select --" || !selectedSection || selectedSection === "-- Select --" || !semester || semester === "-- Select --") {
      toast.error("Incomplete timetable data. Cannot mark attendance until all fields are properly populated.");
      return;
    }
    
    // Check if student is marked as absent
    const absentees = absenteesInput.split(',').map(enrollment => enrollment.trim()).filter(enrollment => enrollment);
    if (absentees.includes(student.enrollmentNo)) {
      toast.error("Cannot mark attendance for absent student. Remove from absentees list first.");
      return;
    }
    
    // Clear presentees input when manually toggling attendance
    if (presenteesInput) {
      setPresenteesInput("");
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
    if (selectedSubject === "-- Select --" || selectedPeriod === "-- Select --" || selectedDay === "-- Select --") {
      toast.error("Please select day, subject, and period.");
      return;
    }
    
    // Check if all timetable data is complete
    if (!selectedBranch || selectedBranch === "-- Select --" || !selectedSection || selectedSection === "-- Select --" || !semester || semester === "-- Select --") {
      toast.error("Incomplete timetable data. Cannot mark attendance until all fields are properly populated.");
      return;
    }
    
    // Clear presentees input when using select all
    if (presenteesInput) {
      setPresenteesInput("");
    }
    
    const newSelectAllChecked = !selectAllChecked;
    setSelectAllChecked(newSelectAllChecked);
    if (newSelectAllChecked) {
      const attendanceDataForBulk = {};
      // Get absentees from input
      const absentees = absenteesInput.split(',').map(enrollment => enrollment.trim()).filter(enrollment => enrollment);
      
      filteredStudents.forEach((student) => {
        // Skip absentees when marking all
        if (!absentees.includes(student.enrollmentNo)) {
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
        }
      });
      setMarkedAttendance(attendanceDataForBulk);
    } else {
      setMarkedAttendance({});
    }
  };

  // Get day name from date
  const getDayFromDate = (dateString) => {
    const date = new Date(dateString);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  // Auto-select day based on selected date
  useEffect(() => {
    if (selectedDate) {
      const dayName = getDayFromDate(selectedDate);
      if (days.includes(dayName)) {
        setSelectedDay(dayName);
      }
    }
  }, [selectedDate]);

  // Submit attendance to backend
  const handleSubmitAttendance = async () => {
    if (!canAddAttendance) {
      toast.error("Please increment total classes first to enable attendance marking");
      return;
    }
    if (selectedSubject === "-- Select --" || selectedPeriod === "-- Select --" || selectedDay === "-- Select --") {
      toast.error("Please select day, subject, and period.");
      return;
    }
    
    // Check if all timetable data is complete
    if (!selectedBranch || selectedBranch === "-- Select --" || !selectedSection || selectedSection === "-- Select --" || !semester || semester === "-- Select --") {
      toast.error("Incomplete timetable data. Cannot submit attendance until all fields are properly populated.");
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
        setAbsenteesInput("");
        setPresenteesInput("");
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

      {/* Instructions */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>How to use:</strong> First select a Day and Period. The Subject, Branch, Semester, and Section will be automatically populated from your timetable. 
          <br /><strong>Note:</strong> All timetable fields (Subject, Branch, Semester, Section) must be complete to mark attendance.
          <br />Then increment the total classes to enable attendance marking.
        </p>
      </div>

      {/* Warning if no timetable */}
      {facultyData && (!facultyData.timetable || facultyData.timetable.length === 0) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>Warning:</strong> No timetable found for this faculty. Please contact the administrator to set up your timetable before marking attendance.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-8 gap-4 mb-6">
        <div>
          <label className="block font-medium text-gray-700">Day</label>
          <select
            value={selectedDay}
            onChange={handleDayChange}
            className="w-full px-4 py-2 border rounded"
          >
            <option>-- Select --</option>
            {days.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium text-gray-700">Period</label>
          <select
            value={selectedPeriod}
            onChange={handlePeriodChange}
            className="w-full px-4 py-2 border rounded"
            disabled={selectedDay === "-- Select --"}
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
          <label className="block font-medium text-gray-700">Subject</label>
          <select
            value={selectedSubject}
            onChange={handleSubjectChange}
            className="w-full px-4 py-2 border rounded"
            disabled={selectedPeriod === "-- Select --"}
          >
            <option>-- Select --</option>
            {filteredSubjects.map((subject) => (
              <option key={subject._id} value={subject.name}>
                {subject.name}
              </option>
            ))}
          </select>
          {selectedSubject !== "-- Select --" && selectedPeriod !== "-- Select --" && selectedDay !== "-- Select --" && (
            <p className="text-xs text-green-600 mt-1">✓ Auto-populated from timetable</p>
          )}
        </div>

        <div>
          <label className="block font-medium text-gray-700">Branch</label>
          <select
            value={selectedBranch}
            onChange={handleBranchChange}
            className="w-full px-4 py-2 border rounded"
            disabled={selectedPeriod === "-- Select --"}
          >
            <option>-- Select --</option>
            {branch.map((b) => (
              <option key={b._id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
          {selectedBranch !== "-- Select --" && selectedPeriod !== "-- Select --" && selectedDay !== "-- Select --" && (
            <p className="text-xs text-green-600 mt-1">✓ Auto-populated from timetable</p>
          )}
        </div>

        <div>
          <label className="block font-medium text-gray-700">Semester</label>
          <select
            value={semester}
            onChange={handleSemesterChange}
            className="w-full px-4 py-2 border rounded"
            disabled={selectedPeriod === "-- Select --"}
          >
            <option>-- Select --</option>
            {[...Array(8).keys()].map((i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
          {semester !== "-- Select --" && selectedPeriod !== "-- Select --" && selectedDay !== "-- Select --" && (
            <p className="text-xs text-green-600 mt-1">✓ Auto-populated from timetable</p>
          )}
        </div>

        <div>
          <label className="block font-medium text-gray-700">Section</label>
          <select
            value={selectedSection}
            onChange={handleSectionChange}
            className="w-full px-4 py-2 border rounded"
            disabled={selectedPeriod === "-- Select --"}
          >
            <option>-- Select --</option>
            {sections.map((section) => (
              <option key={section} value={section}>
                {section}
              </option>
            ))}
          </select>
          {selectedSection !== "-- Select --" && selectedPeriod !== "-- Select --" && selectedDay !== "-- Select --" && (
            <p className="text-xs text-green-600 mt-1">✓ Auto-populated from timetable</p>
          )}
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

      {/* Presentees Input */}
      <div className="mb-4">
        <label className="block font-medium text-gray-700 mb-2">Presentees (Comma Separated)</label>
        <input
          type="text"
          value={presenteesInput}
          onChange={(e) => handlePresenteesInput(e.target.value)}
          placeholder="e.g., 22N81A0501, 22N81A0502"
          className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-sm text-gray-500 mt-1">Enter enrollment numbers separated by commas to automatically select only these students</p>
      </div>

      {/* Absentees Input */}
      <div className="mb-6">
        <label className="block font-medium text-gray-700 mb-2">Absentees (Comma Separated)</label>
        <input
          type="text"
          value={absenteesInput}
          onChange={(e) => handleAbsenteesInput(e.target.value)}
          placeholder="e.g., 22N81A0501, 22N81A0502"
          className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-sm text-gray-500 mt-1">Enter enrollment numbers separated by commas to automatically deselect absent students</p>
      </div>

      {/* Status indicators */}
      {canAddAttendance && (
        <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">
          ✓ Attendance marking is enabled. You can now mark attendance for students.
        </div>
      )}
      
      {selectedDay !== "-- Select --" && selectedPeriod !== "-- Select --" && 
       (selectedBranch === "-- Select --" || selectedSection === "-- Select --" || semester === "-- Select --") && (
        <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 rounded">
          ⚠ Incomplete timetable data. Please contact administrator to complete the timetable for {selectedDay} Period {selectedPeriod}.
        </div>
      )}
      
      {selectedDay !== "-- Select --" && selectedPeriod !== "-- Select --" && selectedSubject !== "-- Select --" && !selectedSubjectId && subjects.length > 0 && (
        <div className="mb-4 p-3 bg-orange-100 text-orange-800 rounded border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">⚠ Subject not found in system</p>
              <p className="text-sm">The subject "{selectedSubject}" from your timetable was not found in the subjects list.</p>
            </div>
            <button
              onClick={retryFindSubject}
              className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      <div className="mb-6 flex space-x-4">
        <button
          onClick={toggleSelectAll}
          disabled={!canAddAttendance || selectedSubject === "-- Select --" || selectedPeriod === "-- Select --" || selectedDay === "-- Select --" || selectedBranch === "-- Select --" || selectedSection === "-- Select --" || semester === "-- Select --" || loading}
          className={`px-4 py-2 rounded text-white ${!canAddAttendance || selectedSubject === "-- Select --" || selectedPeriod === "-- Select --" || selectedDay === "-- Select --" || selectedBranch === "-- Select --" || selectedSection === "-- Select --" || semester === "-- Select --" || loading ? 'bg-gray-400 cursor-not-allowed' : selectAllChecked ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
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
                  disabled={!canAddAttendance || selectedSubject === "-- Select --" || selectedPeriod === "-- Select --" || selectedDay === "-- Select --" || selectedBranch === "-- Select --" || selectedSection === "-- Select --" || semester === "-- Select --"}
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
            {filteredStudents.map((student) => {
              const isAbsent = absenteesInput.split(',').map(e => e.trim()).filter(e => e).includes(student.enrollmentNo);
              return (
                <tr key={student._id} className={isAbsent ? 'bg-red-50' : ''}>
                <td className="border border-gray-300 px-4 py-2">
                  <input
                    type="checkbox"
                    checked={!!markedAttendance[student.enrollmentNo]}
                    onChange={() => toggleAttendance(student)}
                    disabled={!canAddAttendance || selectedSubject === "-- Select --" || selectedPeriod === "-- Select --" || selectedDay === "-- Select --" || selectedBranch === "-- Select --" || selectedSection === "-- Select --" || semester === "-- Select --" || absenteesInput.split(',').map(e => e.trim()).filter(e => e).includes(student.enrollmentNo)}
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
                );
              })}
          </tbody>
        </table>
      )}

      {/* Submit Button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={handleSubmitAttendance}
          disabled={!canAddAttendance || Object.keys(markedAttendance).length === 0 || loading || selectedDay === "-- Select --" || selectedBranch === "-- Select --" || selectedSection === "-- Select --" || semester === "-- Select --"}
          className={`px-8 py-3 rounded-lg text-white font-semibold ${!canAddAttendance || Object.keys(markedAttendance).length === 0 || loading || selectedDay === "-- Select --" || selectedBranch === "-- Select --" || selectedSection === "-- Select --" || semester === "-- Select --" ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? "Submitting..." : "Submit Attendance"}
        </button>
      </div>
    </div>
  );
};

export default AddAttendance;