import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useEffect, useState } from "react";
import axios from "axios";
import { baseApiURL } from "../../../baseUrl";
import toast from "react-hot-toast";
import { FiDownload, FiUsers, FiSearch } from "react-icons/fi";

const ViewStudents = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [semester, setSemester] = useState("-- Select --");
  const [sortOrder, setSortOrder] = useState("Ascending");
  const [branch, setBranch] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("-- Select --");
  const [searchTerm, setSearchTerm] = useState("");

  const getBranchData = () => {
    const headers = {
      "Content-Type": "application/json",
    };
    axios
      .get(`${baseApiURL()}/branch/getBranch`, { headers })
      .then((response) => {
        if (response.data.success) {
          setBranch(response.data.branches);
          console.log(response.data.branches);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.message);
      });
  };

  const downloadExcel = () => {
    if (filteredStudents.length === 0) {
      toast.error("No students to export!");
      return;
    }

    const dataToExport = filteredStudents.map((student) => ({
      "Enrollment No": student.enrollmentNo,
      "Name": `${student.firstName} ${student.middleName} ${student.lastName}`,
      "Email": student.email,
      "Phone": student.phoneNumber,
      "Father Name": student.FatherName,
      "Mother Name": student.MotherName,
      "Father Phone": student.FatherPhoneNumber,
      "Mother Phone": student.MotherPhoneNumber,
      "Semester": student.semester,
      "Branch": student.branch,
      "Gender": student.gender,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(data, "students_data.xlsx");
    toast.success("Excel file downloaded successfully!");
  };

  useEffect(() => {
    getBranchData();
    const headers = { "Content-Type": "application/json" };
    axios
      .get(`${baseApiURL()}/student/details/getDetails2`, { headers })
      .then((response) => {
        if (response.data.success) {
          setStudents(response.data.students);
          setFilteredStudents(response.data.students);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.message);
      });
  }, []);

  // ...existing code...
useEffect(() => {
  let filtered = students.filter((student) => {
    const matchesBranch = selectedBranch === "-- Select --" || student.branch === selectedBranch;
    const matchesSemester =
      semester === "-- Select --" ||
      String(student.semester) === semester; // Ensure both are strings for comparison
    const matchesSearch =
      searchTerm === "" ||
      student.enrollmentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${student.firstName} ${student.middleName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesBranch && matchesSemester && matchesSearch;
  });

  // Sort by enrollment number
  filtered.sort((a, b) => {
    const aNum = parseInt(a.enrollmentNo);
    const bNum = parseInt(b.enrollmentNo);
    return sortOrder === "Ascending" ? aNum - bNum : bNum - aNum;
  });

  setFilteredStudents(filtered);
}, [students, selectedBranch, semester, sortOrder, searchTerm]);
// ...existing code...

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <FiUsers className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Student Management</h1>
                  <p className="text-blue-100 text-sm">View and manage student information</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-white text-sm">
                  {filteredStudents.length} students found
                </span>
                <button
                  onClick={downloadExcel}
                  className="flex items-center space-x-2 bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <FiDownload className="text-sm" />
                  <span>Export Excel</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="p-8 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Students
                </label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, enrollment, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Branch Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Branch
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="-- Select --">All Branches</option>
                  {branch &&
                    branch.map((branch) => (
                      <option value={branch.name} key={branch.name}>
                        {branch.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Semester Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="-- Select --">All Semesters</option>
                  {[...Array(8).keys()].map((i) => (
                    <option key={i + 1} value={String(i + 1)}>
                      Semester {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort Order
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="Ascending">Ascending</option>
                  <option value="Descending">Descending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="p-8">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-50 rounded-lg p-8">
                  <FiUsers className="mx-auto text-gray-400 text-4xl mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                  <p className="text-gray-500">Try adjusting your filters or search criteria.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-lg">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      <th className="py-4 px-6 text-left font-semibold">Enrollment No</th>
                      <th className="py-4 px-6 text-left font-semibold">Name</th>
                      <th className="py-4 px-6 text-left font-semibold">Email</th>
                      <th className="py-4 px-6 text-left font-semibold">Phone</th>
                      <th className="py-4 px-6 text-left font-semibold">Father Name</th>
                      <th className="py-4 px-6 text-left font-semibold">Mother Name</th>
                      <th className="py-4 px-6 text-left font-semibold">Father Phone</th>
                      <th className="py-4 px-6 text-left font-semibold">Mother Phone</th>
                      <th className="py-4 px-6 text-left font-semibold">Semester</th>
                      <th className="py-4 px-6 text-left font-semibold">Branch</th>
                      <th className="py-4 px-6 text-left font-semibold">Gender</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student, index) => (
                      <tr 
                        key={student.enrollmentNo} 
                        className={`border-b hover:bg-blue-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="py-4 px-6 font-medium">{student.enrollmentNo}</td>
                        <td className="py-4 px-6">
                          {student.firstName} {student.middleName} {student.lastName}
                        </td>
                        <td className="py-4 px-6">{student.email}</td>
                        <td className="py-4 px-6">{student.phoneNumber}</td>
                        <td className="py-4 px-6">{student.FatherName || "Not provided"}</td>
                        <td className="py-4 px-6">{student.MotherName || "Not provided"}</td>
                        <td className="py-4 px-6">{student.FatherPhoneNumber || "Not provided"}</td>
                        <td className="py-4 px-6">{student.MotherPhoneNumber || "Not provided"}</td>
                        <td className="py-4 px-6">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {student.semester}
                          </span>
                        </td>
                        <td className="py-4 px-6">{student.branch}</td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            student.gender === 'Male' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-pink-100 text-pink-800'
                          }`}>
                            {student.gender}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewStudents;
