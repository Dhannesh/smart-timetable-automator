import { createBrowserRouter } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import FacultyLogin from "./pages/FacultyLogin";
import FacultyDashboard from "./pages/FacultyDashboard";
import StudentView from "./pages/StudentView";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";

export const router = createBrowserRouter([
  { path: "/", element: <StudentView /> },
  { path: "/admin/login", element: <AdminLogin /> },
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  { path: "/faculty/login", element: <FacultyLogin /> },
  {
    path: "/faculty/dashboard",
    element: (
      <ProtectedRoute requiredRole="faculty">
        <FacultyDashboard />
      </ProtectedRoute>
    ),
  },
  { path: "/student", element: <StudentView /> },
  { path: "*", element: <NotFound /> },
]);
