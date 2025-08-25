import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { baseApiURL } from "../../baseUrl";

const ViewTimetable = () => {
  const [selected, setSelected] = useState({ branch: "", semester: "", section: "" });
  const [branches, setBranches] = useState([]);
  const [timetable, setTimetable] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedTimetable, setEditedTimetable] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [availableDays, setAvailableDays] = useState([]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    axios
      .get(`${baseApiURL()}/branch/getBranch`)
      .then((res) => {
        if (res.data.success) {
          setBranches(res.data.branches);
        }
      })
      .catch(() => {
        toast.error("Failed to fetch branches");
      });

    // Fetch subjects and faculties
    axios.get(`${baseApiURL()}/subject/getSubject`)
      .then((res) => {
        if (res.data.success) {
          setSubjects(res.data.subject);
        }
      })
      .catch(() => {
        toast.error("Failed to fetch subjects");
      });

    axios.get(`${baseApiURL()}/faculty/details/getDetails2`)
      .then((res) => {
        if (res.data.success) {
          setFaculties(res.data.faculties);
        }
      })
      .catch(() => {
        toast.error("Failed to fetch faculty data");
      });
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
    } else {
      setFilteredSubjects([]);
    }
  }, [selected.branch, selected.semester, subjects]);

  // Update available days when timetable changes
  useEffect(() => {
    if (timetable && timetable.schedule) {
      const currentDays = timetable.schedule.map(day => day.day);
      setAvailableDays(currentDays);
    }
  }, [timetable]);

  const fetchTimetable = () => {
    if (!selected.branch || !selected.semester || !selected.section) {
      toast.error("Please select all fields");
      return;
    }

    toast.loading("Fetching timetable...");
    axios
      .post(`${baseApiURL()}/timetable/getTimetable`, {
        branch: selected.branch,
        semester: selected.semester,
        section: selected.section,
      })
      .then((res) => {
        toast.dismiss();
        if (res.data.success && res.data.timetable.length > 0) {
          const fetchedTimetable = res.data.timetable[0];
          setTimetable(fetchedTimetable);
          setEditedTimetable(JSON.parse(JSON.stringify(fetchedTimetable)));
          
          // Set available days
          const currentDays = fetchedTimetable.schedule.map(day => day.day);
          setAvailableDays(currentDays);
        } else {
          setTimetable(null);
          setEditedTimetable(null);
          setAvailableDays([]);
          toast.error("No timetable found");
        }
      })
      .catch(() => {
        toast.dismiss();
        toast.error("Error fetching timetable");
      });
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditedTimetable(JSON.parse(JSON.stringify(timetable)));
    
    // Reset available days to original
    if (timetable) {
      const currentDays = timetable.schedule.map(day => day.day);
      setAvailableDays(currentDays);
    }
  };

  const handleSave = () => {
    toast.loading("Saving timetable...");
    axios
      .put(`${baseApiURL()}/timetable/editTimetable/${editedTimetable._id}`, {
        semester: editedTimetable.semester,
        branch: editedTimetable.branch,
        section: editedTimetable.section,
        schedule: JSON.stringify(editedTimetable.schedule)
      })
      .then((res) => {
        toast.dismiss();
        if (res.data.success) {
          toast.success(res.data.message);
          setTimetable(res.data.timetable);
          setEditedTimetable(JSON.parse(JSON.stringify(res.data.timetable)));
          setEditMode(false);
          
          // Update available days
          const currentDays = res.data.timetable.schedule.map(day => day.day);
          setAvailableDays(currentDays);
        } else {
          toast.error(res.data.message);
        }
      })
      .catch(() => {
        toast.dismiss();
        toast.error("Error updating timetable");
      });
  };

  const updatePeriod = (dayIndex, periodIndex, field, value) => {
    const updatedSchedule = [...editedTimetable.schedule];
    updatedSchedule[dayIndex].periods[periodIndex][field] = value;
    setEditedTimetable({
      ...editedTimetable,
      schedule: updatedSchedule
    });
  };

  const addPeriod = (dayIndex) => {
    const updatedSchedule = [...editedTimetable.schedule];
    updatedSchedule[dayIndex].periods.push({
      periodNumber: updatedSchedule[dayIndex].periods.length + 1,
      subject: "",
      faculty: "",
      startTime: "",
      endTime: ""
    });
    setEditedTimetable({
      ...editedTimetable,
      schedule: updatedSchedule
    });
  };

  const removePeriod = (dayIndex, periodIndex) => {
    const updatedSchedule = [...editedTimetable.schedule];
    updatedSchedule[dayIndex].periods.splice(periodIndex, 1);
    
    // Update period numbers
    updatedSchedule[dayIndex].periods = updatedSchedule[dayIndex].periods.map((period, idx) => ({
      ...period,
      periodNumber: idx + 1
    }));
    
    setEditedTimetable({
      ...editedTimetable,
      schedule: updatedSchedule
    });
  };

  const addDay = (day) => {
    const updatedSchedule = [...editedTimetable.schedule];
    updatedSchedule.push({
      day: day,
      periods: [{
        periodNumber: 1,
        subject: "",
        faculty: "",
        startTime: "",
        endTime: ""
      }]
    });
    
    setEditedTimetable({
      ...editedTimetable,
      schedule: updatedSchedule
    });
    
    // Update available days
    setAvailableDays([...availableDays, day]);
  };

  const removeDay = (dayIndex) => {
    const updatedSchedule = [...editedTimetable.schedule];
    const removedDay = updatedSchedule[dayIndex].day;
    updatedSchedule.splice(dayIndex, 1);
    
    setEditedTimetable({
      ...editedTimetable,
      schedule: updatedSchedule
    });
    
    // Update available days
    setAvailableDays(availableDays.filter(day => day !== removedDay));
  };

  const maxPeriods = () => {
    const currentTimetable = editMode ? editedTimetable : timetable;
    if (!currentTimetable) return 0;
    return Math.max(...currentTimetable.schedule.map(day => day.periods.length));
  };

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <div className="w-3/4 flex flex-col gap-4">
        <select
          className="px-4 py-2 border rounded-md"
          value={selected.branch}
          onChange={(e) => setSelected({ ...selected, branch: e.target.value })}
          disabled={editMode}
        >
          <option value="">Select Branch</option>
          {branches.map((b) => (
            <option key={b.name} value={b.name}>{b.name}</option>
          ))}
        </select>

        <select
          className="px-4 py-2 border rounded-md"
          value={selected.semester}
          onChange={(e) => setSelected({ ...selected, semester: e.target.value })}
          disabled={editMode}
        >
          <option value="">Select Semester</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
            <option key={sem} value={sem}>{sem} Semester</option>
          ))}
        </select>

        <select
          className="px-4 py-2 border rounded-md"
          value={selected.section}
          onChange={(e) => setSelected({ ...selected, section: e.target.value })}
          disabled={editMode}
        >
          <option value="">Select Section</option>
          {["A", "B", "C", "D", "SOC", "WIPRO TRAINING", "ATT"].map((sec) => (
            <option key={sec} value={sec}>Section {sec}</option>
          ))}
        </select>

        <div className="flex gap-4">
          <button
            onClick={fetchTimetable}
            className="px-6 py-2 bg-blue-600 text-white rounded-md w-max"
            disabled={editMode}
          >
            View Timetable
          </button>
          
          {timetable && !editMode && (
            <button
              onClick={handleEdit}
              className="px-6 py-2 bg-yellow-500 text-white rounded-md w-max"
            >
              Edit Timetable
            </button>
          )}
        </div>
      </div>

      {editMode && (
        <div className="w-3/4 bg-blue-50 p-4 rounded-md">
          <h3 className="font-semibold mb-2">Add Days:</h3>
          <div className="flex flex-wrap gap-2">
            {daysOfWeek.map(day => (
              !availableDays.includes(day) && (
                <button
                  key={day}
                  onClick={() => addDay(day)}
                  className="px-3 py-1 bg-green-500 text-white rounded-md text-sm"
                >
                  Add {day}
                </button>
              )
            ))}
          </div>
        </div>
      )}

      {timetable && (
        <div className="overflow-x-auto w-full mt-6">
          <h2 className="text-xl font-semibold mb-4 text-center">Timetable</h2>
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Day</th>
                {Array.from({ length: maxPeriods() }).map((_, i) => (
                  <th key={i} className="px-4 py-2 border">Period {i + 1}</th>
                ))}
                {editMode && <th className="px-4 py-2 border">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {(editMode ? editedTimetable.schedule : timetable.schedule).map((dayEntry, dayIndex) => (
                <tr key={dayEntry.day}>
                  <td className="px-4 py-2 border font-semibold text-center">
                    {dayEntry.day}
                    {editMode && (
                      <button
                        className="ml-2 px-2 py-1 bg-red-500 text-white rounded-md text-xs"
                        onClick={() => removeDay(dayIndex)}
                      >
                        Remove
                      </button>
                    )}
                  </td>
                  {Array.from({ length: maxPeriods() }).map((_, periodIndex) => {
                    const period = dayEntry.periods[periodIndex];
                    return (
                      <td key={periodIndex} className="px-4 py-2 border text-sm text-center">
                        {period ? (
                          editMode ? (
                            <div className="flex flex-col gap-2 p-1">
                              {/* Subject Dropdown */}
                              <select
                                className="px-2 py-1 border rounded-md text-sm"
                                value={period.subject}
                                onChange={(e) => updatePeriod(dayIndex, periodIndex, 'subject', e.target.value)}
                              >
                                <option value="">Select Subject</option>
                                <option value="Break">Break</option>
                                <option value="Sports">Sports</option>
                                <option value="Library">Library</option>
                                {filteredSubjects.map((subj) => (
                                  <option key={subj._id} value={subj.name}>
                                    {subj.name} ({subj.code})
                                  </option>
                                ))}
                              </select>

                              {/* Faculty Dropdown */}
                              <select
                                className="px-2 py-1 border rounded-md text-sm"
                                value={period.faculty}
                                onChange={(e) => updatePeriod(dayIndex, periodIndex, 'faculty', e.target.value)}
                                disabled={["Break", "Sports", "Library"].includes(period.subject)}
                              >
                                <option value="">Select Faculty</option>
                                {faculties.map((f) => (
                                  <option key={f._id} value={`${f.firstName} ${f.lastName}`}>
                                    {f.firstName} {f.middleName} {f.lastName} ({f.employeeId})
                                  </option>
                                ))}
                              </select>

                              <input
                                type="time"
                                className="px-2 py-1 border rounded-md text-sm"
                                value={period.startTime}
                                onChange={(e) => updatePeriod(dayIndex, periodIndex, 'startTime', e.target.value)}
                              />
                              <input
                                type="time"
                                className="px-2 py-1 border rounded-md text-sm"
                                value={period.endTime}
                                onChange={(e) => updatePeriod(dayIndex, periodIndex, 'endTime', e.target.value)}
                              />
                              
                              <button
                                className="px-2 py-1 bg-red-500 text-white rounded-md text-sm"
                                onClick={() => removePeriod(dayIndex, periodIndex)}
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <>
                              <div><strong>{period.subject}</strong></div>
                              <div>{period.faculty}</div>
                              <div>{period.startTime} - {period.endTime}</div>
                            </>
                          )
                        ) : (
                          "-"
                        )}
                      </td>
                    );
                  })}
                  {editMode && (
                    <td className="px-4 py-2 border text-center">
                      <button
                        className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm"
                        onClick={() => addPeriod(dayIndex)}
                      >
                        Add Period
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          
          {editMode && (
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-green-500 text-white rounded-md"
              >
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-2 bg-red-500 text-white rounded-md"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ViewTimetable;