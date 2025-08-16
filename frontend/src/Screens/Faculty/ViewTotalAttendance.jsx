import { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { baseApiURL } from "../../baseUrl";

const ViewTotalAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [subjectTotals, setSubjectTotals] = useState({});
  const [studentSubjectSummary, setStudentSubjectSummary] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [enrollmentNumbers, setEnrollmentNumbers] = useState([]);
  const [branches, setBranches] = useState([]);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedEnrollment, setSelectedEnrollment] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [allSubjects, setAllSubjects] = useState([]); // Store all subjects
  const [filteredSubjects, setFilteredSubjects] = useState([]); // Store filtered subjects


  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await axios.get(`${baseApiURL()}/attendence/getAll`);
        if (response.data.success) {
          setAttendanceRecords(response.data.attendance);


          const uniqueEnrollments = [
            ...new Set(response.data.attendance.map((item) => item.enrollmentNo)),
          ];
          setEnrollmentNumbers(uniqueEnrollments);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError("Failed to fetch attendance records. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
    
  }, []);

  useEffect(() => {
  // Filter subjects by branch and semester
  if (selectedBranch && selectedSemester) {
    const filtered = allSubjects.filter(
      (subject) =>
        subject.branch?.name === selectedBranch &&
        String(subject.semester) === String(selectedSemester)
    );
    setFilteredSubjects(filtered);
    setSubjects(filtered.map((item) => item.name));
    // Also update subjectTotals for filtered subjects only
    const subjectData = filtered.reduce((acc, item) => {
      acc[item.name] = item.total;
      return acc;
    }, {});
    setSubjectTotals(subjectData);
  } else {
    setFilteredSubjects([]);
    setSubjects([]);
    setSubjectTotals({});
  }
}, [selectedBranch, selectedSemester, allSubjects]);

  useEffect(() => {
    const fetchSubjectData = async () => {
    try {
      const response = await axios.get(`${baseApiURL()}/subject/getSubject`);
      if (response.data && response.data.success) {
        setAllSubjects(response.data.subject);
      }
    } catch (error) {
      console.error("Error fetching subject totals:", error);
    }
  };
  fetchSubjectData();
}, []);

  useEffect(() => {
    if (attendanceRecords.length > 0 && Object.keys(subjectTotals).length > 0) {
      const summary = {};

      attendanceRecords.forEach((record) => {
        const { enrollmentNo, subject } = record;
        if (!summary[enrollmentNo]) summary[enrollmentNo] = {};
        if (!summary[enrollmentNo][subject]) summary[enrollmentNo][subject] = 0;
        summary[enrollmentNo][subject] += 1;
      });

      Object.keys(summary).forEach((student) => {
        let totalAttendedAllSubjects = 0;
        let totalClassesAllSubjects = 0;

        Object.keys(summary[student]).forEach((subject) => {
          const attended = summary[student][subject];
          const total = subjectTotals[subject] || 0;
          const percentage = total > 0 ? ((attended / total) * 100).toFixed(2) : 0;

          totalAttendedAllSubjects += attended;
          totalClassesAllSubjects += total;

          summary[student][subject] = {
            attended,
            total,
            percentage,
          };
        });

        summary[student].overallTotal = {
          attended: totalAttendedAllSubjects,
          total: totalClassesAllSubjects,
          percentage: totalClassesAllSubjects > 0 ? ((totalAttendedAllSubjects / totalClassesAllSubjects) * 100).toFixed(2) : 0,
        };
      });

      setStudentSubjectSummary(summary);
    }
  }, [attendanceRecords, subjectTotals]);

  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
  };

  const handleEnrollmentChange = (e) => {
    setSelectedEnrollment(e.target.value);
  };

  const handleBranchChange = (e) => {
    setSelectedBranch(e.target.value);
  };

  const handleSemesterChange = (e) => {
    setSelectedSemester(e.target.value);
  };

  const handleExportToExcel = () => {
    const dataToExport = [];

    Object.entries(studentSubjectSummary).forEach(([student, subjectsData]) => {
      const studentRecords = Object.entries(subjectsData)
        .filter(([key]) => key !== 'overallTotal')
        .map(([subject, data]) => {
          const studentRecord = attendanceRecords.find(
            (rec) => rec.enrollmentNo === student && rec.subject === subject
          );
          return {
            "Enrollment No": student,
            Branch: studentRecord?.branch || "",
            Semester: studentRecord?.semester || "",
            Subject: subject,
            "Attended Classes": data.attended,
            "Total Classes": data.total,
            "Subject Percentage": `${data.percentage}%`,
            "Total Attendance Percentage": "N/A",
          };
        });

      dataToExport.push(...studentRecords);

      if (subjectsData.overallTotal) {
        const studentRecord = attendanceRecords.find(
          (rec) => rec.enrollmentNo === student
        ); // Find a record for branch/semester info
        dataToExport.push({
          "Enrollment No": student,
          Branch: studentRecord?.branch || "",
          Semester: studentRecord?.semester || "",
          Subject: "TOTAL",
          "Attended Classes": subjectsData.overallTotal.attended,
          "Total Classes": subjectsData.overallTotal.total,
          "Subject Percentage": "N/A",
          "Total Attendance Percentage": `${subjectsData.overallTotal.percentage}%`,
        });
      }
    });

    const filteredData = dataToExport.filter((item) =>
      (selectedSubject ? item.Subject === selectedSubject : true) &&
      (selectedEnrollment ? item["Enrollment No"] === selectedEnrollment : true) &&
      (selectedBranch ? item.Branch === selectedBranch : true) &&
      (selectedSemester ? item.Semester === parseInt(selectedSemester) : true)
    ).sort((a, b) => {
      const numA = parseInt(a["Enrollment No"], 10);
      const numB = parseInt(b["Enrollment No"], 10);

      if (isNaN(numA) && isNaN(numB)) {
        return a["Enrollment No"].localeCompare(b["Enrollment No"]); // Both are non-numeric, sort as strings
      }
      if (isNaN(numA)) {
        return 1; // Push non-numeric A to the end
      }
      if (isNaN(numB)) {
        return -1; // Push non-numeric B to the end
      }
      return numA - numB; // Both are numeric, sort numerically
    });

    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");
    XLSX.writeFile(wb, "Attendance_Report.xlsx");
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
      <div className="flex flex-col sm:flex-row justify-start gap-4 mb-4">
        <div>
          <label className="mr-2">Branch:</label>
          <select
            value={selectedBranch}
            onChange={handleBranchChange}
            className="border rounded px-2 py-1"
          >
            <option value="">-- Select --</option>
            {branches.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mr-2">Semester:</label>
          <select
            value={selectedSemester}
            onChange={handleSemesterChange}
            className="border rounded px-2 py-1"
          >
            <option value="">-- Select --</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mr-2">Subject:</label>
          <select
            value={selectedSubject}
            onChange={handleSubjectChange}
            className="border rounded px-2 py-1"
          >
            <option value="">-- Select --</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mr-2">Enrollment No:</label>
          <select
            value={selectedEnrollment}
            onChange={handleEnrollmentChange}
            className="border rounded px-2 py-1"
          >
            <option value="">-- Select --</option>
            {enrollmentNumbers.map((enrollment) => (
              <option key={enrollment} value={enrollment}>
                {enrollment}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleExportToExcel}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Add to Excel Sheet
        </button>
      </div>

      <table className="min-w-full table-auto">
        <thead className="bg-gray-200">
          <tr>
            <th className="py-2 px-4 text-left">Enrollment No</th>
            <th className="py-2 px-4 text-left">Branch</th>
            <th className="py-2 px-4 text-left">Semester</th>
            <th className="py-2 px-4 text-left">Subject</th>
            <th className="py-2 px-4 text-left">Attended Classes</th>
            <th className="py-2 px-4 text-left">Total Classes</th>
            <th className="py-2 px-4 text-left">Subject Percentage</th>
            <th className="py-2 px-4 text-left">Total Attendance %</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(studentSubjectSummary)
            .sort(([studentA], [studentB]) => {
              const numA = parseInt(studentA, 10);
              const numB = parseInt(studentB, 10);

              if (isNaN(numA) && isNaN(numB)) {
                return studentA.localeCompare(studentB); // Both are non-numeric, sort as strings
              }
              if (isNaN(numA)) {
                return 1; // studentA is non-numeric, push to end
              }
              if (isNaN(numB)) {
                return -1; // studentB is non-numeric, push to end
              }
              return numA - numB; // Both are numeric, sort numerically
            })
            .flatMap(([student, subjectsData]) => {
              const rows = [];
              // Add individual subject rows
              Object.entries(subjectsData)
                .filter(([key]) => key !== 'overallTotal')
                .forEach(([subject, data]) => {
                  const studentRecord = attendanceRecords.find(
                    (rec) => rec.enrollmentNo === student && rec.subject === subject
                  );
                  rows.push({
                    student,
                    subject,
                    branch: studentRecord?.branch || "",
                    semester: studentRecord?.semester || "",
                    attended: data.attended,
                    total: data.total,
                    subjectPercentage: data.percentage,
                    totalAttendancePercentage: "N/A",
                    isTotalRow: false,
                  });
                });

              // Add overall total row
              if (subjectsData.overallTotal) {
                const studentRecord = attendanceRecords.find(
                  (rec) => rec.enrollmentNo === student
                ); // Find a record for branch/semester info
                rows.push({
                  student,
                  subject: "TOTAL",
                  branch: studentRecord?.branch || "",
                  semester: studentRecord?.semester || "",
                  attended: subjectsData.overallTotal.attended,
                  total: subjectsData.overallTotal.total,
                  subjectPercentage: "N/A",
                  totalAttendancePercentage: subjectsData.overallTotal.percentage,
                  isTotalRow: true,
                });
              }
              return rows;
            })
            .filter(
              (item) =>
                (selectedSubject ? item.subject === selectedSubject : true) &&
                (selectedEnrollment ? item.student === selectedEnrollment : true) &&
                (selectedBranch ? item.branch === selectedBranch : true) &&
                (selectedSemester ? item.semester === parseInt(selectedSemester) : true)
            )
            .map((item, index) => (
              <tr key={index} className={`border-b ${item.isTotalRow ? "bg-gray-100 font-bold" : ""}`}>
                <td className="py-2 px-4">{item.student}</td>
                <td className="py-2 px-4">{item.branch}</td>
                <td className="py-2 px-4">{item.semester}</td>
                <td className="py-2 px-4">{item.subject}</td>
                <td className="py-2 px-4">{item.attended}</td>
                <td className="py-2 px-4">{item.total}</td>
                <td className="py-2 px-4">{item.subjectPercentage}%</td>
                <td className="py-2 px-4">{item.totalAttendancePercentage}%</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewTotalAttendance;
