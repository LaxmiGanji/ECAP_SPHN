import { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { baseApiURL } from "../../baseUrl";

const ViewTotalAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [subjectTotals, setSubjectTotals] = useState({});
  const [studentSubjectSummary, setStudentSubjectSummary] = useState({});
  const [allSubjects, setAllSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [enrollmentNumbers, setEnrollmentNumbers] = useState([]);
  const [branches, setBranches] = useState([]);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [enrollmentSearch, setEnrollmentSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sections = ['A', 'B', 'C', 'D', 'SOC', 'WIPRO TRAINING', 'ATT'];

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await axios.get(`${baseApiURL()}/attendence/getAll`);
        if (response.data.success) {
          setAttendanceRecords(response.data.attendance);

          const uniqueEnrollments = [
            ...new Set(response.data.attendance.map((item) => item.enrollmentNo)),
          ];
          
          uniqueEnrollments.sort((a, b) => {
            const numA = parseInt(a, 10);
            const numB = parseInt(b, 10);
            
            if (!isNaN(numA) && !isNaN(numB)) {
              return numA - numB;
            }
            return String(a).localeCompare(String(b), undefined, { numeric: true });
          });
          
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

    const fetchBranches = async () => {
      try {
        const response = await axios.get(`${baseApiURL()}/branch/getBranch`);
        if (response.data.success) {
          const branchNames = response.data.branches.map((b) => b.name);
          setBranches(branchNames);
        }
      } catch (err) {
        console.error("Error fetching branches:", err);
      }
    };

    fetchAttendance();
    fetchBranches();
  }, []);

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
    if (selectedBranch && selectedSemester) {
      const filtered = allSubjects.filter(
        (subject) =>
          subject.branch?.name === selectedBranch &&
          String(subject.semester) === String(selectedSemester)
      );
      setFilteredSubjects(filtered);
      
      const subjectData = filtered.reduce((acc, item) => {
        acc[item.name] = item.total;
        return acc;
      }, {});
      setSubjectTotals(subjectData);
    } else {
      setFilteredSubjects([]);
      setSubjectTotals({});
    }
  }, [selectedBranch, selectedSemester, allSubjects]);

  useEffect(() => {
    if (attendanceRecords.length > 0 && Object.keys(subjectTotals).length > 0) {
      const summary = {};

      attendanceRecords.forEach((record) => {
        const { enrollmentNo, subject, branch, semester, section } = record;
        if (
          (!selectedBranch || branch === selectedBranch) &&
          (!selectedSemester || String(semester) === String(selectedSemester)) &&
          (!selectedSection || section === selectedSection)
        ) {
          if (!summary[enrollmentNo]) summary[enrollmentNo] = {};
          if (!summary[enrollmentNo][subject]) summary[enrollmentNo][subject] = 0;
          summary[enrollmentNo][subject] += 1;
        }
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
          percentage:
            totalClassesAllSubjects > 0
              ? ((totalAttendedAllSubjects / totalClassesAllSubjects) * 100).toFixed(2)
              : 0,
        };
      });

      setStudentSubjectSummary(summary);
    } else {
      setStudentSubjectSummary({});
    }
  }, [attendanceRecords, subjectTotals, selectedBranch, selectedSemester, selectedSection]);

  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
  };

  const handleBranchChange = (e) => {
    setSelectedBranch(e.target.value);
  };

  const handleSemesterChange = (e) => {
    setSelectedSemester(e.target.value);
  };

  const handleSectionChange = (e) => {
    setSelectedSection(e.target.value);
  };

  const handleExportToExcel = () => {
    const dataToExport = [];

    Object.entries(studentSubjectSummary).forEach(([student, subjectsData]) => {
      const studentRecords = Object.entries(subjectsData)
        .filter(([key]) => key !== "overallTotal")
        .map(([subject, data]) => {
          const studentRecord = attendanceRecords.find(
            (rec) =>
              rec.enrollmentNo === student &&
              rec.subject === subject &&
              (!selectedBranch || rec.branch === selectedBranch) &&
              (!selectedSemester || String(rec.semester) === String(selectedSemester)) &&
              (!selectedSection || rec.section === selectedSection)
          );
          return {
            "Enrollment No": student,
            Branch: studentRecord?.branch || "",
            Semester: studentRecord?.semester || "",
            Section: studentRecord?.section || "",
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
          (rec) =>
            rec.enrollmentNo === student &&
            (!selectedBranch || rec.branch === selectedBranch) &&
            (!selectedSemester || String(rec.semester) === String(selectedSemester)) &&
            (!selectedSection || rec.section === selectedSection)
        );
        dataToExport.push({
          "Enrollment No": student,
          Branch: studentRecord?.branch || "",
          Semester: studentRecord?.semester || "",
          Section: studentRecord?.section || "",
          Subject: "TOTAL",
          "Attended Classes": subjectsData.overallTotal.attended,
          "Total Classes": subjectsData.overallTotal.total,
          "Subject Percentage": "N/A",
          "Total Attendance Percentage": `${subjectsData.overallTotal.percentage}%`,
        });
      }
    });

    const filteredData = dataToExport
      .filter(
        (item) =>
          (selectedSubject ? item.Subject === selectedSubject : true) &&
          (enrollmentSearch
            ? item["Enrollment No"].toLowerCase().includes(enrollmentSearch.toLowerCase())
            : true) &&
          (selectedBranch ? item.Branch === selectedBranch : true) &&
          (selectedSemester ? item.Semester === parseInt(selectedSemester) : true) &&
          (selectedSection ? item.Section === selectedSection : true)
      )
      .sort((a, b) => {
        const numA = parseInt(a["Enrollment No"], 10);
        const numB = parseInt(b["Enrollment No"], 10);

        if (isNaN(numA) && isNaN(numB)) {
          return a["Enrollment No"].localeCompare(b["Enrollment No"]);
        }
        if (isNaN(numA)) {
          return 1;
        }
        if (isNaN(numB)) {
          return -1;
        }
        return numA - numB;
      });

    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");
    XLSX.writeFile(wb, "Attendance_Report.xlsx");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading attendance records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md w-full">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Attendance Records</h1>
      
      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
            <select
              value={selectedBranch}
              onChange={handleBranchChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Branches</option>
              {branches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <select
              value={selectedSemester}
              onChange={handleSemesterChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  {sem}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
            <select
              value={selectedSection}
              onChange={handleSectionChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Sections</option>
              {sections.map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={handleSubjectChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Subjects</option>
              {filteredSubjects.map((subject) => (
                <option key={subject._id} value={subject.name}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment No</label>
            <input
              type="text"
              value={enrollmentSearch}
              onChange={(e) => setEnrollmentSearch(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search enrollment"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleExportToExcel}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Export to Excel
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Enrollment No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Branch</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Semester</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Section</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Attended</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Subject %</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Overall %</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(studentSubjectSummary)
                .flatMap(([student, subjectsData]) => {
                  const rows = [];
                  Object.entries(subjectsData)
                    .filter(([key]) => key !== "overallTotal")
                    .forEach(([subject, data]) => {
                      const studentRecord = attendanceRecords.find(
                        (rec) =>
                          rec.enrollmentNo === student &&
                          rec.subject === subject &&
                          (!selectedBranch || rec.branch === selectedBranch) &&
                          (!selectedSemester || String(rec.semester) === String(selectedSemester)) &&
                          (!selectedSection || rec.section === selectedSection)
                      );
                      rows.push({
                        student,
                        subject,
                        branch: studentRecord?.branch || "",
                        semester: studentRecord?.semester || "",
                        section: studentRecord?.section || "",
                        attended: data.attended,
                        total: data.total,
                        subjectPercentage: data.percentage,
                        totalAttendancePercentage: "N/A",
                        isTotalRow: false,
                      });
                    });

                  if (subjectsData.overallTotal) {
                    const studentRecord = attendanceRecords.find(
                      (rec) =>
                        rec.enrollmentNo === student &&
                        (!selectedBranch || rec.branch === selectedBranch) &&
                        (!selectedSemester || String(rec.semester) === String(selectedSemester)) &&
                        (!selectedSection || rec.section === selectedSection)
                    );
                    rows.push({
                      student,
                      subject: "TOTAL",
                      branch: studentRecord?.branch || "",
                      semester: studentRecord?.semester || "",
                      section: studentRecord?.section || "",
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
                    (enrollmentSearch
                      ? item.student.toLowerCase().includes(enrollmentSearch.toLowerCase())
                      : true) &&
                    (selectedBranch ? item.branch === selectedBranch : true) &&
                    (selectedSemester ? item.semester === parseInt(selectedSemester) : true) &&
                    (selectedSection ? item.section === selectedSection : true)
                )
                .sort((a, b) => {
                  const cmp = a.student.localeCompare(b.student, undefined, {
                    numeric: true,
                    sensitivity: "base",
                  });
                  if (cmp !== 0) return cmp;

                  if (a.isTotalRow !== b.isTotalRow) {
                    return a.isTotalRow ? 1 : -1;
                  }

                  return String(a.subject).localeCompare(String(b.subject), undefined, {
                    numeric: true,
                    sensitivity: "base",
                  });
                })
                .map((item, index) => (
                  <tr
                    key={index}
                    className={item.isTotalRow ? "bg-blue-50 font-semibold" : index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.student}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.branch}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.semester}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.section}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.attended}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.total}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {item.subjectPercentage !== "N/A" ? `${item.subjectPercentage}%` : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {item.totalAttendancePercentage !== "N/A" ? `${item.totalAttendancePercentage}%` : "N/A"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        
        {Object.keys(studentSubjectSummary).length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No attendance records found for the selected filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewTotalAttendance;