import { createBrowserRouter } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import FacultyLogin from "./pages/FacultyLogin";
import FacultyDashboard from "./pages/FacultyDashboard";
import StudentView from "./pages/StudentView";

export const router = createBrowserRouter([
  { path: "/", element: <StudentView /> },
  { path: "/admin/login", element: <AdminLogin /> },
  { path: "/admin/dashboard", element: <AdminDashboard /> },
  { path: "/faculty/login", element: <FacultyLogin /> },
  { path: "/faculty/dashboard", element: <FacultyDashboard /> },
  { path: "/student", element: <StudentView /> },
]);
