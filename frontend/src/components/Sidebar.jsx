import { useState } from "react";
import { 
  FiHome, 
  FiUsers, 
  FiUserCheck, 
  FiBookOpen, 
  FiSettings, 
  FiFileText, 
  FiCalendar,
  FiGrid,
  FiChevronLeft,
  FiChevronRight,
  FiCode
} from "react-icons/fi";
import { MdOutlineSchool, MdOutlineSubject } from "react-icons/md";

const Sidebar = ({ selectedMenu, setSelectedMenu, userType }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getMenuItems = () => {
    switch (userType) {
      case "Admin":
        return [
          { id: "Profile", label: "Profile", icon: FiHome, color: "from-blue-500 to-blue-600" },
          { id: "Student", label: "Student", icon: FiUsers, color: "from-green-500 to-green-600" },
          { id: "Faculty", label: "Faculty", icon: FiUserCheck, color: "from-purple-500 to-purple-600" },
          { id: "Library", label: "Library", icon: FiBookOpen, color: "from-orange-500 to-orange-600" },
          { id: "Branch", label: "Branch", icon: MdOutlineSchool, color: "from-indigo-500 to-indigo-600" },
          { id: "Notice", label: "Notice", icon: FiFileText, color: "from-pink-500 to-pink-600" },
          { id: "Subjects", label: "Subjects", icon: MdOutlineSubject, color: "from-teal-500 to-teal-600" },
          { id: "Timetables", label: "Timetables", icon: FiCalendar, color: "from-red-500 to-red-600" },
          { id: "Admin", label: "Admins", icon: FiSettings, color: "from-gray-500 to-gray-600" },
          { id: "Attendance", label: "Attendance", icon: FiGrid, color: "from-yellow-500 to-yellow-600" },
          { id: "Section", label: "Section", icon: FiGrid, color: "from-cyan-500 to-cyan-600" },
          { id: "Reports", label: "Reports", icon: FiFileText, color: "from-emerald-500 to-emerald-600" }
        ];
      case "Faculty":
        return [
          { id: "My Profile", label: "My Profile", icon: FiHome, color: "from-blue-500 to-blue-600" },
          { id: "Student Info", label: "Student Info", icon: FiUsers, color: "from-green-500 to-green-600" },
          { id: "Upload Marks", label: "Upload Marks", icon: FiFileText, color: "from-purple-500 to-purple-600" },
          { id: "Timetable", label: "Timetable", icon: FiCalendar, color: "from-orange-500 to-orange-600" },
          { id: "Notice", label: "Notice", icon: FiFileText, color: "from-pink-500 to-pink-600" },
          { id: "Material", label: "Material", icon: FiBookOpen, color: "from-teal-500 to-teal-600" },
          { id: "Attendence", label: "Attendance", icon: FiGrid, color: "from-red-500 to-red-600" },
          { id: "Edit Faculty", label: "Edit Faculty", icon: FiGrid, color: "from-red-500 to-red-600" }
        ];
      case "Student":
        return [
          { id: "My Profile", label: "My Profile", icon: FiHome, color: "from-blue-500 to-blue-600" },
          { id: "Timetable", label: "Timetable", icon: FiCalendar, color: "from-green-500 to-green-600" },
          { id: "Marks", label: "Marks", icon: FiFileText, color: "from-purple-500 to-purple-600" },
          { id: "Material", label: "Material", icon: FiBookOpen, color: "from-orange-500 to-orange-600" },
          { id: "Notice", label: "Notice", icon: FiFileText, color: "from-pink-500 to-pink-600" },
          { id: "ViewAttendance", label: "View Attendance", icon: FiGrid, color: "from-teal-500 to-teal-600" },
          { id: "Certifications", label: "Certifications", icon: FiFileText, color: "from-red-500 to-red-600" },
          { id: "Fees", label: "Fees", icon: FiFileText, color: "from-yellow-500 to-yellow-600" },
          { id: "OnlineCompiler", label: "Online Compiler", icon: FiCode, color: "from-indigo-500 to-indigo-600" },
          { id: "Edit Student", label: "Edit Student", icon: FiGrid, color: "from-red-500 to-red-600" }
        ];
      default:
        return [];
    }
  };

  
  const menuItems = getMenuItems();

  return (
    <div
      className={`fixed left-0 top-20 h-[calc(100vh-5rem)] bg-white shadow-2xl border-r border-gray-200 transition-all duration-300 z-40 ${
        isCollapsed ? "w-16" : "w-64"
      } flex flex-col`}
    >
      {/* Toggle Button */}
      <div className="absolute -right-3 top-6">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
        >
          {isCollapsed ? (
            <FiChevronRight className="w-3 h-3" />
          ) : (
            <FiChevronLeft className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Menu Items */}
      <div className="p-4 space-y-2 flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = selectedMenu === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setSelectedMenu(item.id)}
              className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r " +
                    item.color +
                    " text-white shadow-lg transform scale-105"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center px-4 py-3">
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 group-hover:bg-gradient-to-r " +
                        item.color +
                        " group-hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                {!isCollapsed && (
                  <span className="ml-3 font-medium text-sm">{item.label}</span>
                )}
              </div>

              {/* Active Indicator */}
              {isActive && !isCollapsed && (
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Section */}
      {!isCollapsed && (
        <div className="p-4">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">S</span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700">Sphoorthy</p>
                <p className="text-xs text-gray-500">Engineering College</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;