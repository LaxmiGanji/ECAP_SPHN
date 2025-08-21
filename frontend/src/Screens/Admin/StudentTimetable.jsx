import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { baseApiURL } from "../../baseUrl";
import ViewTimetable from "../Common/ViewTimetable";

const StudentTimetable = () => {
  const [selectedTab, setSelectedTab] = useState("create");
  const [selected, setSelected] = useState({ branch: "", semester: "", section: "" });
  const [branch, setBranch] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [faculties, setFaculties] = useState([]);

  const [schedule, setSchedule] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    getBranchData();
    getSubjectData();
    getFacultyData();
  }, []);

  // Filter subjects when branch or semester changes
  useEffect(() => {
    if (selected.branch && selected.semester) {
      const filtered = subjects.filter(
        (subject) => 
          subject.semester === parseInt(selected.semester) && 
          subject.branch?.name === selected.branch
      );
      setFilteredSubjects(filtered);
      setSchedule(prev => {
        const newSchedule = { ...prev };
        Object.keys(newSchedule).forEach(day => {
          newSchedule[day] = newSchedule[day].map(period => ({
            ...period,
            subject: ""
          }));
        });
        return newSchedule;
      });
    } else {
      setFilteredSubjects([]);
    }
  }, [selected.branch, selected.semester, subjects]);

  const getBranchData = () => {
    axios
      .get(`${baseApiURL()}/branch/getBranch`)
      .then((res) => {
        if (res.data.success) {
          setBranch(res.data.branches);
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to fetch branches");
      });
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

  const getFacultyData = () => {
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
      });
  };

  const addPeriod = (day) => {
    setSchedule(prev => ({
      ...prev,
      [day]: [...prev[day], {
        periodNumber: prev[day].length + 1,
        subject: "",
        faculty: "",
        startTime: "",
        endTime: ""
      }]
    }));
  };

  const removePeriod = (day, index) => {
    setSchedule(prev => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index).map((period, i) => ({
        ...period,
        periodNumber: i + 1
      }))
    }));
  };

  const updatePeriod = (day, index, field, value) => {
    setSchedule(prev => {
      const daySchedule = [...prev[day]];
      while (daySchedule.length <= index) {
        daySchedule.push({
          periodNumber: daySchedule.length + 1,
          subject: "",
          faculty: "",
          startTime: "",
          endTime: ""
        });
      }
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

  const addTimetableHandler = () => {
    if (!selected.branch || !selected.semester || !selected.section) {
      toast.error("Please select branch, semester and section");
      return;
    }

    const periodsToSave = {};
    let allPeriodsValid = true;

    Object.entries(schedule).forEach(([day, periods]) => {
      const activePeriods = periods.filter(period =>
        period.subject || period.faculty || period.startTime || period.endTime
      );

      if (activePeriods.length > 0) {
        activePeriods.forEach(period => {
          // For Break, Sports, Library, faculty can be empty
          const isSpecialPeriod = ["Break", "Sports", "Library"].includes(period.subject);
          
          if (
            !period.subject ||
            (!isSpecialPeriod && !period.faculty) ||
            !period.startTime ||
            !period.endTime
          ) {
            allPeriodsValid = false;
            toast.error(`Please fill all fields for active periods on ${day}.`);
            return;
          }
        });
        periodsToSave[day] = activePeriods;
      }
    });

    if (!allPeriodsValid) return;

    const hasAnyPeriods = Object.values(periodsToSave).some(dayPeriods => dayPeriods.length > 0);
    if (!hasAnyPeriods) {
      toast.error("No periods entered. Please add at least one period.");
      return;
    }

    // Prepare schedule data for backend
    const formattedSchedule = Object.entries(periodsToSave).map(([day, periods]) => ({
      day,
      periods: periods.map(period => ({
        ...period,
        // Set faculty to empty string for special periods
        faculty: ["Break", "Sports", "Library"].includes(period.subject) ? "" : period.faculty
      }))
    }));

    toast.loading("Adding Timetable");
    axios
      .post(`${baseApiURL()}/timetable/addTimetable`, {
        branch: selected.branch,
        semester: selected.semester,
        section: selected.section,
        schedule: JSON.stringify(formattedSchedule)
      })
      .then((res) => {
        toast.dismiss();
        if (res.data.success) {
          toast.success(res.data.message);
          setSelected({ branch: "", semester: "", section: "" });
          setSchedule({
            Monday: [], Tuesday: [], Wednesday: [],
            Thursday: [], Friday: [], Saturday: [],
          });
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((err) => {
        toast.dismiss();
        console.error(err);
        toast.error(err.response?.data?.message || "Error adding timetable");
      });
  };

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
                  <h1 className="text-2xl font-bold text-white">Timetable Management</h1>
                  <p className="text-blue-100 text-sm">Create and manage academic timetables</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center items-center w-full border-b border-gray-200">
            <div className="flex space-x-1 p-4">
              {["create", "view"].map((tab) => (
                <button
                  key={tab}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    selectedTab === tab
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                  onClick={() => setSelectedTab(tab)}
                >
                  {tab === "create" ? "Create Timetable" : "View Timetable"}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {selectedTab === "create" && (
              <div className="space-y-8">
                {/* Selection Controls */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-2">
                      Select Branch
                    </label>
                    <select
                      id="branch"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={selected.branch}
                      onChange={(e) => setSelected({ ...selected, branch: e.target.value })}
                    >
                      <option value="">Select Branch</option>
                      {branch.map((b) => (
                        <option key={b.name} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-2">
                      Select Semester
                    </label>
                    <select
                      id="semester"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={selected.semester}
                      onChange={(e) => setSelected({ ...selected, semester: e.target.value })}
                    >
                      <option value="">Select Semester</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <option key={sem} value={sem}>{sem} Semester</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-2">
                      Select Section
                    </label>
                    <select
                      id="section"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={selected.section}
                      onChange={(e) => setSelected({ ...selected, section: e.target.value })}
                    >
                      <option value="">Select Section</option>
                      {["A", "B", "C", "D"].map((sec) => (
                        <option key={sec} value={sec}>Section {sec}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Help Text */}
                {selected.branch && selected.semester && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-green-700">
                        <strong>Branch and Semester Selected:</strong> Subjects will be filtered automatically based on your selection. 
                        Only subjects assigned to {selected.branch} - Semester {selected.semester} will be available in the timetable.
                      </span>
                    </div>
                  </div>
                )}

                {/* Timetable Grid */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {/* Filter Status */}
                  {selected.branch && selected.semester && (
                    <div className="bg-blue-50 border-b border-gray-200 p-4">
                      <div className="flex items-center space-x-2">
                        <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                        </svg>
                        <span className="text-sm text-blue-700">
                          Showing subjects for {selected.branch} - Semester {selected.semester} 
                          {filteredSubjects.length > 0 ? ` (${filteredSubjects.length} subjects available)` : ' (No subjects available)'}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="sticky left-0 z-10 border-b bg-gray-50 py-4 px-6 text-left text-sm font-semibold text-gray-900">
                            Day/Period
                          </th>
                          {Array.from({ length: Math.max(...daysOfWeek.map(day => schedule[day].length), 1) }).map((_, i) => (
                            <th key={i} className="min-w-[280px] border-b py-4 px-6 text-center text-sm font-semibold text-gray-900">
                              Period {i + 1}
                            </th>
                          ))}
                          <th className="sticky right-0 z-10 border-b bg-gray-50 py-4 px-6 text-center text-sm font-semibold text-gray-900">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {daysOfWeek.map((day) => (
                          <tr key={day} className="hover:bg-gray-50">
                            <td className="sticky left-0 z-10 bg-white py-4 px-6 text-center font-semibold text-gray-900 hover:bg-gray-50">
                              {day}
                            </td>
                            {Array.from({ length: Math.max(schedule[day].length, 1) }).map((_, index) => (
                              <td key={index} className="py-4 px-6">
                                <div className="space-y-2">
                                  {/* Subject Dropdown */}
                                  <select
                                    className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                      !selected.branch || !selected.semester || filteredSubjects.length === 0
                                        ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                        : "border-gray-300"
                                    }`}
                                    value={schedule[day][index]?.subject || ""}
                                    onChange={(e) => updatePeriod(day, index, "subject", e.target.value)}
                                    disabled={!selected.branch || !selected.semester || filteredSubjects.length === 0}
                                  >
                                    <option value="">
                                      {!selected.branch || !selected.semester 
                                        ? "Select Branch & Semester First" 
                                        : filteredSubjects.length === 0 
                                          ? "No Subjects Available" 
                                          : "Select Subject"}
                                    </option>
                                    {/* Special periods */}
                                    <option value="Break">Break</option>
                                    <option value="Sports">Sports</option>
                                    <option value="Library">Library</option>
                                    {/* Academic subjects */}
                                    {filteredSubjects.map((subj) => (
                                      <option key={subj._id} value={subj.name}>
                                        {subj.name} ({subj.code})
                                      </option>
                                    ))}
                                  </select>

                                  {/* Faculty Dropdown */}
                                  <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={schedule[day][index]?.faculty || ""}
                                    onChange={(e) => updatePeriod(day, index, "faculty", e.target.value)}
                                    disabled={
                                      ["Break", "Sports", "Library"].includes(schedule[day][index]?.subject)
                                    }
                                  >
                                    <option value="">Select Faculty</option>
                                    {faculties.map((f) => (
                                      <option key={f._id} value={f.firstName}>
                                        {f.firstName} {f.lastName} ({f.employeeId})
                                      </option>
                                    ))}
                                  </select>

                                  {/* Time Inputs */}
                                  <div className="grid grid-cols-2 gap-2">
                                    <input
                                      type="time"
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      value={schedule[day][index]?.startTime || ""}
                                      onChange={(e) => updatePeriod(day, index, "startTime", e.target.value)}
                                      placeholder="Start Time"
                                    />
                                    <input
                                      type="time"
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      value={schedule[day][index]?.endTime || ""}
                                      onChange={(e) => updatePeriod(day, index, "endTime", e.target.value)}
                                      placeholder="End Time"
                                    />
                                  </div>

                                  {/* Remove Button */}
                                  {schedule[day][index] && (
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
                            <td className="sticky right-0 z-10 bg-white py-4 px-6 text-center hover:bg-gray-50">
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
                    onClick={addTimetableHandler}
                  >
                    Save Timetable
                  </button>
                </div>
              </div>
            )}

            {selectedTab === "view" && <ViewTimetable />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTimetable;