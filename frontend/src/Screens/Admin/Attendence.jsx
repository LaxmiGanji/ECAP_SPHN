import React, { useState } from "react";
import AddAttendance from "../Faculty/AddAttendance";
import ViewTotalAttendance from "../Faculty/ViewTotalAttendance";
import { FiUserCheck, FiEye } from "react-icons/fi";

const Attendence = () => {
  const [activeTab, setActiveTab] = useState('add');
  
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Attendance Management</h1>
            <p className="text-gray-600 mt-2">Add and view student attendance records</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-200 ${
              activeTab === "add"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("add")}
          >
            <div className="flex items-center justify-center space-x-2">
              <FiUserCheck className="w-5 h-5" />
              <span>Add Attendance</span>
            </div>
          </button>
          <button
            className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-200 ${
              activeTab === "view"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("view")}
          >
            <div className="flex items-center justify-center space-x-2">
              <FiEye className="w-5 h-5" />
              <span>View Total Attendance</span>
            </div>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {activeTab === "add" && <AddAttendance />}
        {activeTab === "view" && <ViewTotalAttendance />}
      </div>
    </div>
  );
};

export default Attendence;