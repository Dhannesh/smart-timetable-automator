import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Navbar({ title }) {
  const { facultyName, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {facultyName && (
          <p className="text-slate-400 text-sm">Logged in as {facultyName}</p>
        )}
      </div>
      <button
        onClick={handleLogout}
        className="bg-slate-800 hover:bg-slate-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
      >
        Logout
      </button>
    </div>
  );
}
