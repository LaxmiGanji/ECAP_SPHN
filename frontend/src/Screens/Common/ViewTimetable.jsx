import React, { useEffect, useState } from "react";
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
        } else {
          setTimetable(null);
          setEditedTimetable(null);
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
          {["A", "B", "C", "D"].map((sec) => (
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
              </tr>
            </thead>
            <tbody>
              {(editMode ? editedTimetable.schedule : timetable.schedule).map((dayEntry, dayIndex) => (
                <tr key={dayEntry.day}>
                  <td className="px-4 py-2 border font-semibold text-center">{dayEntry.day}</td>
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
                                {subjects.map((subj) => (
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
                              >
                                <option value="">Select Faculty</option>
                                {faculties.map((f) => (
                                  <option key={f._id} value={`${f.firstName} ${f.lastName}`}>
                                    {f.firstName} {f.lastName} ({f.employeeId})
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