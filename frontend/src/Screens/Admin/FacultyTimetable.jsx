import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { baseApiURL } from "../../baseUrl";
import ViewFacultyTimetable from "./ViewFacultyTimetable.jsx";

const FacultyTimetable = () => {
  const [selectedTab, setSelectedTab] = useState("view");
  const [faculties, setFaculties] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [branches, setBranches] = useState([]);
  const [timetable, setTimetable] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
  });
  const [loading, setLoading] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    getFacultyData();
    getSubjectData();
    getBranchData();
  }, []);

  useEffect(() => {
    if (selectedFaculty) {
      loadFacultyTimetable();
    }
  }, [selectedFaculty]);

  const getFacultyData = () => {
    setLoading(true);
    axios
      .get(`${baseApiURL()}/faculty/details/getDetails2`)
      .then((res) => {
        if (res.data.success) {
          setFaculties(res.data.faculties);
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to fetch faculty data");
      })
      .finally(() => setLoading(false));
  };

  const getSubjectData = () => {
    axios
      .get(`${baseApiURL()}/subject/getSubject`)
      .then((res) => {
        if (res.data.success) {
          setSubjects(res.data.subject);
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to fetch subjects");
      });
  };

  const getBranchData = () => {
    axios
      .get(`${baseApiURL()}/branch/getBranch`)
      .then((res) => {
        if (res.data.success) {
          setBranches(res.data.branches);
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to fetch branches");
      });
  };

  const loadFacultyTimetable = () => {
    setLoading(true);
    axios
      .post(`${baseApiURL()}/faculty/details/getDetails`, { employeeId: selectedFaculty })
      .then((res) => {
        if (res.data.success && res.data.user[0]?.timetable) {
          const newTimetable = {
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
            Saturday: [],
          };

          res.data.user[0].timetable.forEach(dayData => {
            newTimetable[dayData.day] = dayData.periods;
          });

          setTimetable(newTimetable);
        } else {
          setTimetable({
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
            Saturday: [],
          });
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load faculty timetable");
      })
      .finally(() => setLoading(false));
  };

  const addPeriod = (day) => {
    setTimetable(prev => ({
      ...prev,
      [day]: [...prev[day], {
        periodNumber: prev[day].length + 1,
        subject: "",
        branch: "",
        semester: "",
        section: "",
        startTime: "",
        endTime: ""
      }]
    }));
  };

  const removePeriod = (day, index) => {
    setTimetable(prev => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index).map((period, i) => ({
        ...period,
        periodNumber: i + 1
      }))
    }));
  };

  const updatePeriod = (day, index, field, value) => {
    setTimetable(prev => {
      const daySchedule = [...prev[day]];
      daySchedule[index] = {
        ...daySchedule[index],
        [field]: value
      };
      return {
        ...prev,
        [day]: daySchedule
      };
    });
  };

  const saveFacultyTimetable = () => {
    if (!selectedFaculty) {
      toast.error("Please select a faculty member");
      return;
    }

    // Convert to backend format
    const timetableToSave = Object.entries(timetable)
      .filter(([_, periods]) => periods.length > 0)
      .map(([day, periods]) => ({
        day,
        periods: periods.filter(period => 
          period.subject && 
          period.startTime && 
          period.endTime
        )
      }));

    // Validate all required fields
    const hasEmptyFields = timetableToSave.some(dayData => 
      dayData.periods.some(period => {
        // For special periods, only subject, startTime and endTime are required
        const isSpecialPeriod = ["Break", "Sports", "Library", "Other"].includes(period.subject);
        
        if (isSpecialPeriod) {
          return !period.subject || !period.startTime || !period.endTime;
        } else {
          return !period.subject || 
                 !period.branch || 
                 !period.semester || 
                 !period.section || 
                 !period.startTime || 
                 !period.endTime;
        }
      })
    );

    if (hasEmptyFields) {
      toast.error("Please fill all required fields for all active periods");
      return;
    }

    toast.loading("Saving Faculty Timetable");
    axios
      .put(`${baseApiURL()}/faculty/details/updateTimetable/${selectedFaculty}`, { 
        timetable: timetableToSave 
      })
      .then((res) => {
        toast.dismiss();
        if (res.data.success) {
          toast.success("Faculty timetable updated successfully");
          // Reload the timetable to ensure consistency
          loadFacultyTimetable();
          // Switch back to view mode
          setSelectedTab("view");
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((err) => {
        toast.dismiss();
        console.error(err);
        toast.error(err.response?.data?.message || "Failed to save faculty timetable");
      });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <svg className="text-white text-xl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Faculty Timetable Management</h1>
                  <p className="text-blue-100 text-sm">View and manage faculty timetables</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center items-center w-full border-b border-gray-200">
            <div className="flex space-x-1 p-4">
              {["view", "edit"].map((tab) => (
                <button
                  key={tab}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    selectedTab === tab
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                  onClick={() => setSelectedTab(tab)}
                >
                  {tab === "view" ? "View Timetable" : "Edit Timetable"}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="mb-6">
              <label htmlFor="faculty" className="block text-sm font-medium text-gray-700 mb-2">
                Select Faculty
              </label>
              <select
                id="faculty"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                disabled={loading}
              >
                <option value="">Select Faculty</option>
                {faculties.map((faculty) => (
                  <option key={faculty._id} value={faculty.employeeId}>
                    {faculty.firstName} {faculty.middleName} {faculty.lastName} ({faculty.employeeId})
                  </option>
                ))}
              </select>
            </div>

            {selectedTab === "view" && selectedFaculty && (
              <ViewFacultyTimetable facultyId={selectedFaculty} />
            )}

            {selectedTab === "edit" && selectedFaculty && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">{day}</h3>
                        <button
                          onClick={() => addPeriod(day)}
                          className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
                        >
                          Add Period
                        </button>
                      </div>
                      
                      {timetable[day].length === 0 ? (
                        <div className="text-center py-6 text-gray-500">
                          No periods scheduled for {day}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {timetable[day].map((period, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                              <div className="flex justify-between items-center mb-3">
                                <span className="font-medium text-gray-700">Period {period.periodNumber}</span>
                                <button
                                  onClick={() => removePeriod(day, index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                              
                              <div className="space-y-3">
                                {/* Subject Dropdown - including special periods */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                  <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={period.subject || ""}
                                    onChange={(e) => updatePeriod(day, index, "subject", e.target.value)}
                                  >
                                    <option value="">Select Subject</option>
                                    {/* Special periods */}
                                    <option value="Break">Break</option>
                                    <option value="Sports">Sports</option>
                                    <option value="Library">Library</option>
                                    <option value="Other">Other</option>
                                    {/* Academic subjects */}
                                    {subjects.map((subj) => (
                                      <option key={subj._id} value={subj.name}>
                                        {subj.name} ({subj.code})
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Branch Dropdown - disabled for special periods */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                                  <select
                                    className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                      ["Break", "Sports", "Library", "Other"].includes(period.subject)
                                        ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                        : "border-gray-300"
                                    }`}
                                    value={period.branch || ""}
                                    onChange={(e) => updatePeriod(day, index, "branch", e.target.value)}
                                    disabled={["Break", "Sports", "Library", "Other"].includes(period.subject)}
                                  >
                                    <option value="">Select Branch</option>
                                    {branches.map((branch) => (
                                      <option key={branch._id} value={branch.name}>
                                        {branch.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  {/* Semester Dropdown - disabled for special periods */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                                    <select
                                      className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        ["Break", "Sports", "Library", "Other"].includes(period.subject)
                                          ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                          : "border-gray-300"
                                      }`}
                                      value={period.semester || ""}
                                      onChange={(e) => updatePeriod(day, index, "semester", e.target.value)}
                                      disabled={["Break", "Sports", "Library", "Other"].includes(period.subject)}
                                    >
                                      <option value="">Semester</option>
                                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                        <option key={sem} value={sem}>
                                          {sem}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  {/* Section Dropdown - disabled for special periods */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                                    <select
                                      className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        ["Break", "Sports", "Library", "Other"].includes(period.subject)
                                          ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                          : "border-gray-300"
                                      }`}
                                      value={period.section || ""}
                                      onChange={(e) => updatePeriod(day, index, "section", e.target.value)}
                                      disabled={["Break", "Sports", "Library", "Other"].includes(period.subject)}
                                    >
                                      <option value="">Section</option>
                                      {["A", "B", "C", "D"].map((sec) => (
                                        <option key={sec} value={sec}>
                                          {sec}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  {/* Time Inputs */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                    <input
                                      type="time"
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      value={period.startTime || ""}
                                      onChange={(e) => updatePeriod(day, index, "startTime", e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                    <input
                                      type="time"
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      value={period.endTime || ""}
                                      onChange={(e) => updatePeriod(day, index, "endTime", e.target.value)}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Save Button */}
                <div className="flex justify-center pt-6">
                  <button
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    onClick={saveFacultyTimetable}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Faculty Timetable'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyTimetable;