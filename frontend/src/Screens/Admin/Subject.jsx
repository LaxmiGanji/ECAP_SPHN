import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { MdOutlineDelete, MdEdit } from "react-icons/md";
import { baseApiURL } from "../../baseUrl";
import { FiBook, FiHash, FiCalendar, FiUsers, FiGitBranch } from "react-icons/fi";

const Subjects = () => {
  const [data, setData] = useState({ 
    name: "", 
    code: "", 
    total: "", 
    semester: "",
    branch: ""
  });
  const [editData, setEditData] = useState(null);
  const [selected, setSelected] = useState("add");
  const [subject, setSubject] = useState([]);
  const [branches, setBranches] = useState([]);

  // Semester options
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  useEffect(() => {
    getSubjectHandler();
    getBranchesHandler();
  }, []);

  const getBranchesHandler = () => {
    axios
      .get(`${baseApiURL()}/branch/getBranch`)
      .then((response) => {
        if (response.data.success) {
          setBranches(response.data.branches);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const getSubjectHandler = () => {
    axios
      .get(`${baseApiURL()}/subject/getSubject`)
      .then((response) => {
        if (response.data.success) {
          setSubject(response.data.subject);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const addSubjectHandler = () => {
    if (!data.name || !data.code || !data.total || !data.semester || !data.branch) {
      toast.error("Please fill all fields");
      return;
    }
    axios
      .post(`${baseApiURL()}/subject/addSubject`, data)
      .then((response) => {
        if (response.data.success) {
          toast.success(response.data.message);
          setData({ name: "", code: "", total: "", semester: "", branch: "" });
          getSubjectHandler();
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error(error.response?.data?.message || error.message);
      });
  };

  const deleteSubjectHandler = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this subject?");
    if (!confirmDelete) return;

    toast.loading("Deleting Subject");
    axios
      .delete(`${baseApiURL()}/subject/deleteSubject/${id}`)
      .then((response) => {
        toast.dismiss();
        if (response.data.success) {
          toast.success(response.data.message);
          getSubjectHandler();
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        toast.error(error.response?.data?.message || error.message);
      });
  };

  const updateSubjectHandler = () => {
    if (!editData.name || !editData.code || !editData.total || !editData.semester || !editData.branch) {
      toast.error("Please fill all fields");
      return;
    }

    if (!editData) return;
    toast.loading("Updating Subject");
    axios
      .put(`${baseApiURL()}/subject/updateSubject/${editData._id}`, editData)
      .then((response) => {
        toast.dismiss();
        if (response.data.success) {
          toast.success(response.data.message);
          setEditData(null);
          setSelected("view");
          getSubjectHandler();
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        toast.error(error.response?.data?.message || error.message);
      });
  };

  const resetForm = () => {
    setData({ name: "", code: "", total: "", semester: "", branch: "" });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Subject Management</h1>
            <p className="text-gray-600 mt-2">Add, edit, and manage academic subjects by branch</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-200 ${
              selected === "add"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
            onClick={() => setSelected("add")}
          >
            <div className="flex items-center justify-center space-x-2">
              <FiBook className="w-5 h-5" />
              <span>Add Subject</span>
            </div>
          </button>
          <button
            className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-200 ${
              selected === "view"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
            onClick={() => setSelected("view")}
          >
            <div className="flex items-center justify-center space-x-2">
              <FiUsers className="w-5 h-5" />
              <span>View Subjects</span>
            </div>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {selected === "add" && (
          <div className="p-8">
            <div className="max-w-2xl mx-auto">
              <div className="space-y-8">
                {/* Subject Information Section */}
                <div>
                  <div className="flex items-center space-x-2 mb-6">
                    <FiBook className="text-blue-600 text-lg" />
                    <h2 className="text-xl font-semibold text-gray-800">Subject Information</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject Code *
                      </label>
                      <input
                        type="text"
                        id="code"
                        required
                        value={data.code}
                        onChange={(e) => setData({ ...data, code: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter subject code"
                      />
                    </div>
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={data.name}
                        onChange={(e) => setData({ ...data, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter subject name"
                      />
                    </div>
                    <div>
                      <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-2">
                        Branch *
                      </label>
                      <select
                        id="branch"
                        required
                        value={data.branch}
                        onChange={(e) => setData({ ...data, branch: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="">Select Branch</option>
                        {branches.map((branch) => (
                          <option key={branch._id} value={branch._id}>
                            {branch.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-2">
                        Semester *
                      </label>
                      <select
                        id="semester"
                        required
                        value={data.semester}
                        onChange={(e) => setData({ ...data, semester: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="">Select Semester</option>
                        {semesters.map((sem) => (
                          <option key={sem} value={sem}>
                            Semester {sem}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="total" className="block text-sm font-medium text-gray-700 mb-2">
                        Total Classes *
                      </label>
                      <input
                        type="number"
                        id="total"
                        required
                        min="1"
                        value={data.total}
                        onChange={(e) => setData({ ...data, total: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter total classes"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Reset Form
                </button>
                <button
                  type="button"
                  onClick={addSubjectHandler}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Add Subject
                </button>
              </div>
            </div>
          </div>
        )}

        {selected === "view" && (
          <div className="p-8">
            <div className="space-y-4">
              {subject.length > 0 ? (
                subject.map((item) => (
                  <div
                    key={item.code}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <FiBook className="text-white text-xl" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {item.code} - {item.name}
                          </h3>
                          <div className="flex items-center space-x-6 mt-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <FiGitBranch className="text-green-500" />
                              <span>{item.branch?.name || 'N/A'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FiCalendar className="text-blue-500" />
                              <span>Semester {item.semester}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FiUsers className="text-blue-500" />
                              <span>{item.total} Classes</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          onClick={() => {
                            setEditData(item);
                            setSelected("edit");
                          }}
                          title="Edit"
                        >
                          <MdEdit size={20} />
                        </button>
                        <button
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          onClick={() => deleteSubjectHandler(item._id)}
                          title="Delete"
                        >
                          <MdOutlineDelete size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <FiBook className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No Subjects Found</h3>
                  <p className="text-gray-500">Add your first subject to get started</p>
                </div>
              )}
            </div>
          </div>
        )}

        {selected === "edit" && editData && (
          <div className="p-8">
            <div className="max-w-2xl mx-auto">
              <div className="space-y-8">
                {/* Subject Information Section */}
                <div>
                  <div className="flex items-center space-x-2 mb-6">
                    <FiBook className="text-blue-600 text-lg" />
                    <h2 className="text-xl font-semibold text-gray-800">Edit Subject Information</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="editCode" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject Code *
                      </label>
                      <input
                        type="text"
                        id="editCode"
                        required
                        value={editData.code}
                        onChange={(e) => setEditData({ ...editData, code: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter subject code"
                      />
                    </div>
                    <div>
                      <label htmlFor="editName" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject Name *
                      </label>
                      <input
                        type="text"
                        id="editName"
                        required
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter subject name"
                      />
                    </div>
                    <div>
                      <label htmlFor="editBranch" className="block text-sm font-medium text-gray-700 mb-2">
                        Branch *
                      </label>
                      <select
                        id="editBranch"
                        required
                        value={editData.branch?._id || editData.branch || ""}
                        onChange={(e) => setEditData({ ...editData, branch: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="">Select Branch</option>
                        {branches.map((branch) => (
                          <option key={branch._id} value={branch._id}>
                            {branch.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="editSemester" className="block text-sm font-medium text-gray-700 mb-2">
                        Semester *
                      </label>
                      <select
                        id="editSemester"
                        required
                        value={editData.semester}
                        onChange={(e) => setEditData({ ...editData, semester: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="">Select Semester</option>
                        {semesters.map((sem) => (
                          <option key={sem} value={sem}>
                            Semester {sem}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="editTotal" className="block text-sm font-medium text-gray-700 mb-2">
                        Total Classes *
                      </label>
                      <input
                        type="number"
                        id="editTotal"
                        required
                        min="1"
                        value={editData.total}
                        onChange={(e) => setEditData({ ...editData, total: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter total classes"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setEditData(null);
                    setSelected("view");
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={updateSubjectHandler}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Update Subject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subjects;