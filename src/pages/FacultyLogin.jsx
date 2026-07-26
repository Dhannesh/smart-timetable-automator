import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function FacultyLogin() {
  const { loginWithPassword, session, role, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session && role === "faculty") {
      navigate("/faculty/dashboard");
    }
  }, [loading, session, role, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await loginWithPassword(email, password);
      // Navigation happens automatically via the useEffect above once role resolves.
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-8">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 p-8 rounded-lg w-full max-w-sm"
      >
        <h1 className="text-xl font-bold mb-6">Faculty Login</h1>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <label className="block text-sm text-slate-400 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 mb-4 text-white"
          placeholder="sharma@timetable.test"
        />

        <label className="block text-sm text-slate-400 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 mb-6 text-white"
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-semibold py-2 rounded-lg transition-colors"
        >
          {submitting ? "Logging in..." : "Log In"}
        </button>
      </form>
    </div>
  );
}
