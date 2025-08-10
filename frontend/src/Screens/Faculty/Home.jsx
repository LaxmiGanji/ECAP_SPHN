// Home.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Notice from "../../components/Notice";
import Profile from "./Profile";
import Timetable from "./Timetable";
import { Toaster } from "react-hot-toast";
import Material from "./Material";
import Marks from "./Marks";
import Student from "./Student";
import Attendence from "./Attendence";
import EditFaculty from "./EditFaculty";

const Home = () => {
  const router = useLocation();
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState("My Profile");
  const [load, setLoad] = useState(false);

  useEffect(() => {
    if (router.state === null) {
      navigate("/");
    }
    setLoad(true);
  }, [navigate, router.state]);

  const renderContent = () => {
    switch (selectedMenu) {
      case "My Profile":
        return <Profile />;
      case "Student Info":
        return <Student />;
      case "Upload Marks":
        return <Marks />;
      case "Timetable":
        return <Timetable />;
      case "Notice":
        return <Notice />;
      case "Material":
        return <Material />;
      case "Attendence":
        return <Attendence />;
      case "Edit Faculty":
        return <EditFaculty />; // ✅ Added case for EditFaculty
      default:
        return <Profile />;
    }
  };

  return (
    <>
      {load && (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
          <Navbar />
          <Sidebar
            selectedMenu={selectedMenu}
            setSelectedMenu={setSelectedMenu}
            userType="Faculty"
          />

          {/* Main Content Area */}
          <div className="ml-64 transition-all duration-300">
            <div className="p-8">
              {/* Dashboard Header */}
              {selectedMenu === "My Profile" && (
                <div className="mb-8">
                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
                      <h1 className="text-3xl font-bold text-white">Faculty Dashboard</h1>
                      <p className="text-purple-100 mt-2">
                        Welcome to your academic management portal
                      </p>
                    </div>

                    <div className="p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Quick Actions */}
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-blue-100 text-sm font-medium">Upload Marks</p>
                              <p className="text-lg font-semibold">Manage Grades</p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                              <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Attendance */}
                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-green-100 text-sm font-medium">Attendance</p>
                              <p className="text-lg font-semibold">Track Students</p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                              <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Materials */}
                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-orange-100 text-sm font-medium">Materials</p>
                              <p className="text-lg font-semibold">Share Resources</p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                              <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Content Area */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      )}
      <Toaster position="bottom-center" />
    </>
  );
};

export default Home;