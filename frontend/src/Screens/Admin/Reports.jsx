import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import { toast } from "react-hot-toast";
import { baseApiURL } from "../../baseUrl";

const Reports = () => {
  const [branches, setBranches] = useState([]);
  const [filters, setFilters] = useState({ batch: "", branch: "" });
  const [students, setStudents] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [tab, setTab] = useState("students");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // load branches for dropdown
    axios
      .get(`${baseApiURL()}/branch/getBranch`)
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data?.branches)) {
          setBranches(res.data.branches);
        }
      })
      .catch(() => {});
  }, []);

  const fetchReport = async () => {
    if (!filters.batch && !filters.branch) {
      toast.error("Select at least batch or branch");
      return;
    }
    
    // Validate batch input is a number if provided
    if (filters.batch && isNaN(filters.batch)) {
      toast.error("Batch must be a valid year");
      return;
    }
    
    try {
      setLoading(true);
      const params = {};
      if (filters.batch) params.batch = parseInt(filters.batch);
      if (filters.branch) params.branch = filters.branch;
      const url = tab === "students"
        ? `${baseApiURL()}/student/details/reports/byBatchBranch`
        : `${baseApiURL()}/faculty/details/reports/byBatchBranch`;
      const res = await axios.get(url, { params });
      if (res.data?.success) {
        if (tab === "students") setStudents(res.data.students || []);
        else setFaculties(res.data.faculties || []);
      }
      else toast.error(res.data?.message || "Failed to load report");
    } catch (e) {
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const total = tab === "students" ? students.length : faculties.length;

  const batchesPreset = useMemo(() => {
    const current = new Date().getFullYear();
    const list = [];
    for (let y = current; y >= current - 6; y--) list.push(y);
    return list;
  }, []);

  return (
    <div className="p-6">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800">Reports</h2>
        <p className="text-sm text-gray-500">Filter by batch and branch</p>
        <div className="mt-4 inline-flex rounded-lg overflow-hidden border">
          <button
            className={`px-4 py-2 text-sm ${tab === 'students' ? 'bg-blue-600 text-white' : 'bg-white'}`}
            onClick={() => setTab('students')}
          >
            Students
          </button>
          <button
            className={`px-4 py-2 text-sm ${tab === 'faculty' ? 'bg-blue-600 text-white' : 'bg-white'}`}
            onClick={() => setTab('faculty')}
          >
            Faculty
          </button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Batch</label>
          <input
            type="text"
            value={filters.batch}
            onChange={(e) => {
              // Allow only numbers and empty string
              if (e.target.value === '' || /^\d+$/.test(e.target.value)) {
                setFilters({ ...filters, batch: e.target.value });
              }
            }}
            placeholder="Enter batch year"
            className="w-full border rounded-lg px-3 py-2"
          />
          <div className="text-xs text-gray-500 mt-1">
            Suggested: {batchesPreset.join(", ")}
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Branch</label>
          <select
            value={filters.branch}
            onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Any</option>
            {branches.map((b) => (
              <option key={b._id || b.name} value={b.name}>{b.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button onClick={fetchReport} className="bg-emerald-600 text-white px-4 py-2 rounded-lg w-full md:w-auto">
            {loading ? "Loading..." : "Generate Report"}
          </button>
        </div>
        <div className="flex items-end">
          <div className="w-full md:w-auto bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg">
            Total: {total}
          </div>
        </div>
        <div className="flex items-end">
          <button
            onClick={() => {
              const hasData = tab === 'students' ? students.length : faculties.length;
              if (!hasData) {
                toast.error("No data to export");
                return;
              }
              const exportRows = (tab === 'students' ? students : faculties).map((item, idx) => {
                if (tab === 'students') {
                  return {
                    SNo: idx + 1,
                    EnrollmentNo: item.enrollmentNo,
                    FirstName: item.firstName || "",
                    MiddleName: item.middleName || "",
                    LastName: item.lastName || "",
                    Branch: item.branch || "",
                    Batch: item.batch || "",
                    Semester: item.semester || "",
                    Section: item.section || "",
                    Email: item.email || "",
                    Phone: item.phoneNumber || "",
                  };
                }
                return {
                  SNo: idx + 1,
                  EmployeeId: item.employeeId,
                  FirstName: item.firstName || "",
                  MiddleName: item.middleName || "",
                  LastName: item.lastName || "",
                  Department: item.department || "",
                  Batch: item.batch || "",
                  Email: item.email || "",
                  Phone: item.phoneNumber || "",
                  Post: item.post || "",
                };
              });
              const ws = XLSX.utils.json_to_sheet(exportRows);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, tab === 'students' ? "Student Report" : "Faculty Report");
              const nameParts = [];
              if (filters.batch) nameParts.push(`Batch-${filters.batch}`);
              if (filters.branch) nameParts.push(`Branch-${filters.branch}`);
              const fileName = `${tab === 'students' ? 'Student' : 'Faculty'}_Report${nameParts.length ? `_${nameParts.join("_")}` : ""}.xlsx`;
              XLSX.writeFile(wb, fileName);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full md:w-auto"
          >
            Export to Excel
          </button>
        </div>
      </div>

      <div className="p-6 overflow-x-auto">
        {tab === 'students' && (
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="px-3 py-2">Enrollment</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Branch</th>
              <th className="px-3 py-2">Batch</th>
              <th className="px-3 py-2">Semester</th>
              <th className="px-3 py-2">Section</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id} className="border-t">
                <td className="px-3 py-2">{s.enrollmentNo}</td>
                <td className="px-3 py-2">{[s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ")}</td>
                <td className="px-3 py-2">{s.branch}</td>
                <td className="px-3 py-2">{s.batch || "-"}</td>
                <td className="px-3 py-2">{s.semester}</td>
                <td className="px-3 py-2">{s.section || "-"}</td>
              </tr>
            ))}
            {!students.length && (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 py-8">No data</td>
              </tr>
            )}
          </tbody>
        </table>
        )}

        {tab === 'faculty' && (
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="px-3 py-2">Employee ID</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Department</th>
              <th className="px-3 py-2">Batch</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Phone</th>
            </tr>
          </thead>
          <tbody>
            {faculties.map((f) => (
              <tr key={f._id} className="border-t">
                <td className="px-3 py-2">{f.employeeId}</td>
                <td className="px-3 py-2">{[f.firstName, f.middleName, f.lastName].filter(Boolean).join(" ")}</td>
                <td className="px-3 py-2">{f.department}</td>
                <td className="px-3 py-2">{f.batch || "-"}</td>
                <td className="px-3 py-2">{f.email}</td>
                <td className="px-3 py-2">{f.phoneNumber}</td>
              </tr>
            ))}
            {!faculties.length && (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 py-8">No data</td>
              </tr>
            )}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
};

export default Reports;