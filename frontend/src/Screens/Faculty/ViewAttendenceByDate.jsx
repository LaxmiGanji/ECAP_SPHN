import { useEffect, useState } from "react";
import axios from "axios";
import { baseApiURL } from "../../baseUrl";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";

const ViewAttendenceByDate = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get(`${baseApiURL()}/subject/getSubject`);
        if (response.data.success) {
          setSubjects(response.data.subject.map(sub => sub.name));
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };

    fetchSubjects();
  }, []);

  const fetchAttendanceByDate = async () => {
    try {
      setLoading(true);
      let url = `${baseApiURL()}/attendence/getByDate`;
      
      const params = new URLSearchParams();
      if (selectedSubject) params.append('subject', selectedSubject);
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url);
      if (response.data.success) {
        setAttendanceRecords(response.data.attendance);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("Failed to fetch attendance records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceByDate();
  }, [selectedSubject, startDate, endDate]);

  const handleDeleteAttendance = async (id) => {
    if (window.confirm("Are you sure you want to delete this attendance record?")) {
      try {
        const response = await axios.delete(`${baseApiURL()}/attendence/delete/${id}`);
        
        if (response.data.success) {
          toast.success(response.data.message || "Attendance deleted successfully");
          
          // Update the state by filtering out the deleted record
          setAttendanceRecords(prevRecords => 
            prevRecords.filter(record => record._id !== id)
          );
        } else {
          toast.error(response.data.message || "Failed to delete attendance");
        }
      } catch (error) {
        console.error('Delete error:', error);
        toast.error(
          error.response?.data?.message || 
          error.message || 
          "Failed to delete attendance"
        );
      }
    }
  };

  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
    if (endDate && date && endDate < date) {
      setEndDate(null);
    }
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  const clearFilters = () => {
    setSelectedSubject("");
    setStartDate(null);
    setEndDate(null);
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading attendance records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center mt-5" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex flex-col sm:flex-row justify-start gap-4 mb-4 flex-wrap">
        <div>
          <label className="mr-2">Subject:</label>
          <select
            value={selectedSubject}
            onChange={handleSubjectChange}
            className="border rounded px-2 py-1"
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mr-2">From Date:</label>
          <DatePicker
            selected={startDate}
            onChange={handleStartDateChange}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            placeholderText="Select start date"
            className="border rounded px-2 py-1"
            maxDate={new Date()}
          />
        </div>

        <div>
          <label className="mr-2">To Date:</label>
          <DatePicker
            selected={endDate}
            onChange={handleEndDateChange}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            maxDate={new Date()}
            placeholderText="Select end date"
            className="border rounded px-2 py-1"
          />
        </div>

        <button
          onClick={clearFilters}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Clear Filters
        </button>
      </div>

      {attendanceRecords.length === 0 ? (
        <div className="text-center mt-5">
          <p>No attendance records found for the selected filters.</p>
        </div>
      ) : (
        <table className="min-w-full table-auto">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-4 text-left">Enrollment No</th>
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Branch</th>
              <th className="py-2 px-4 text-left">Subject</th>
              <th className="py-2 px-4 text-left">Period</th>
              <th className="py-2 px-4 text-left">Date</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {attendanceRecords.map((record) => (
              <tr key={record._id} className="border-b">
                <td className="py-2 px-4">{record.enrollmentNo}</td>
                <td className="py-2 px-4">{record.name}</td>
                <td className="py-2 px-4">{record.branch}</td>
                <td className="py-2 px-4">{record.subject}</td>
                <td className="py-2 px-4">{record.period}</td>
                <td className="py-2 px-4">
                  {new Date(record.date).toLocaleDateString()}
                </td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => handleDeleteAttendance(record._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ViewAttendenceByDate;