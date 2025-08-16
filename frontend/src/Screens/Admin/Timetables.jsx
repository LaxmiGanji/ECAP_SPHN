import { useState } from "react";
import { FiUserPlus, FiEdit } from "react-icons/fi";
import StudentTimetable from "./StudentTimetable";
import FacultyTimetable from "./FacultyTimetable";

const Timetables = () => {
  const [selected, setSelected] = useState("student-timetable");
  
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Student Management</h1>
            <p className="text-gray-600 mt-2">Time table for student and fcaulty</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-200 ${
              selected === "student-timetable"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
            onClick={() => setSelected("student-timetable")}
          >
            <div className="flex items-center justify-center space-x-2">
              <FiUserPlus className="w-5 h-5" />
              <span>Add Students TimeTable</span>
            </div>
          </button>
          <button
            className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-200 ${
              selected === "faculty-timetable"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
            onClick={() => setSelected("faculty-timetable")}
          >
            <div className="flex items-center justify-center space-x-2">
              <FiEdit className="w-5 h-5" />
              <span>Add Faculty Timetable</span>
            </div>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {selected === "student-timetable" && <StudentTimetable />}
        {selected === "faculty-timetable" && <FacultyTimetable />}
      </div>
    </div>
  );
};

export default Timetables;
