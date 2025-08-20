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
          period.branch && 
          period.semester && 
          period.section && 
          period.startTime && 
          period.endTime
        )
      }));

    // Validate all required fields
    const hasEmptyFields = timetableToSave.some(dayData => 
      dayData.periods.some(period => 
        !period.subject || 
        !period.branch || 
        !period.semester || 
        !period.section || 
        !period.startTime || 
        !period.endTime
      )
    );

    if (hasEmptyFields) {
      toast.error("Please fill all fields for all active periods");
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
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900 border-b">
                            Day/Period
                          </th>
                          {Array.from({ length: Math.max(...daysOfWeek.map(day => timetable[day].length), 1) }).map((_, i) => (
                            <th key={i} className="py-4 px-6 text-center text-sm font-semibold text-gray-900 border-b">
                              Period {i + 1}
                            </th>
                          ))}
                          <th className="py-4 px-6 text-center text-sm font-semibold text-gray-900 border-b">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {daysOfWeek.map((day) => (
                          <tr key={day} className="hover:bg-gray-50">
                            <td className="py-4 px-6 font-semibold text-gray-900 text-center">
                              {day}
                            </td>
                            {Array.from({ length: Math.max(timetable[day].length, 1) }).map((_, index) => (
                              <td key={index} className="py-4 px-6">
                                <div className="space-y-2">
                                  {/* Subject Dropdown */}
                                  <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={timetable[day][index]?.subject || ""}
                                    onChange={(e) => updatePeriod(day, index, "subject", e.target.value)}
                                  >
                                    <option value="">Select Subject</option>
                                    {subjects.map((subj) => (
                                      <option key={subj._id} value={subj.name}>
                                        {subj.name} ({subj.code})
                                      </option>
                                    ))}
                                  </select>

                                  {/* Branch Dropdown */}
                                  <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={timetable[day][index]?.branch || ""}
                                    onChange={(e) => updatePeriod(day, index, "branch", e.target.value)}
                                  >
                                    <option value="">Select Branch</option>
                                    {branches.map((branch) => (
                                      <option key={branch._id} value={branch.name}>
                                        {branch.name}
                                      </option>
                                    ))}
                                  </select>

                                  {/* Semester Dropdown */}
                                  <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={timetable[day][index]?.semester || ""}
                                    onChange={(e) => updatePeriod(day, index, "semester", e.target.value)}
                                  >
                                    <option value="">Select Semester</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                      <option key={sem} value={sem}>
                                        Semester {sem}
                                      </option>
                                    ))}
                                  </select>

                                  {/* Section Dropdown */}
                                  <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={timetable[day][index]?.section || ""}
                                    onChange={(e) => updatePeriod(day, index, "section", e.target.value)}
                                  >
                                    <option value="">Select Section</option>
                                    {["A", "B", "C", "D"].map((sec) => (
                                      <option key={sec} value={sec}>
                                        Section {sec}
                                      </option>
                                    ))}
                                  </select>

                                  {/* Time Inputs */}
                                  <div className="grid grid-cols-2 gap-2">
                                    <input
                                      type="time"
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      value={timetable[day][index]?.startTime || ""}
                                      onChange={(e) => updatePeriod(day, index, "startTime", e.target.value)}
                                      placeholder="Start Time"
                                    />
                                    <input
                                      type="time"
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      value={timetable[day][index]?.endTime || ""}
                                      onChange={(e) => updatePeriod(day, index, "endTime", e.target.value)}
                                      placeholder="End Time"
                                    />
                                  </div>

                                  {/* Remove Button */}
                                  {timetable[day][index] && (
                                    <button
                                      className="w-full px-3 py-2 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition-colors"
                                      onClick={() => removePeriod(day, index)}
                                    >
                                      Remove
                                    </button>
                                  )}
                                </div>
                              </td>
                            ))}
                            <td className="py-4 px-6 text-center">
                              <button
                                className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
                                onClick={() => addPeriod(day)}
                              >
                                Add Period
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-center">
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