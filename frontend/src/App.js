
import Login from "./components/Login";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import mystore from "./redux/store";
import StudentHome from "./Screens/Student/Home";
import FacultyHome from "./Screens/Faculty/Home";
import AdminHome from "./Screens/Admin/Home";
import LibraryHome from "./Screens/Library/Home";
import Payment from "./Screens/Student/Payment";

const App = () => {
  return (
    <>
      <Provider store={mystore}>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="student" element={<StudentHome />} />
            <Route path="faculty" element={<FacultyHome />} />
            <Route path="admin" element={<AdminHome />} />
            <Route path="library" element={<LibraryHome />} />
            <Route path="payment" element={<Payment />} />
          </Routes>
        </Router>
      </Provider>
      {/* Watermark */}
      <div
        style={{
          position: "fixed",
          right: "20px",
          bottom: "10px",
          opacity: 0.25,
          fontSize: "1.2rem",
          color: "#1e293b",
          pointerEvents: "none",
          zIndex: 50,
          fontWeight: "bold",
          fontFamily: "monospace",
        }}
      >
        Developed by Laxmi
      </div>
    </>
  );
};


export default App;
