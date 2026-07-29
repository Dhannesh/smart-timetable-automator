import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null); // 'admin' | 'faculty' | null
  const [facultyId, setFacultyId] = useState(null);
  const [facultyName, setFacultyName] = useState(null);
  const [adminId, setAdminId] = useState(null);
  const [loading, setLoading] = useState(true);

  async function resolveRole(currentSession) {
    if (!currentSession) {
      setRole(null);
      setFacultyId(null);
      setFacultyName(null);
      setAdminId(null);
      return;
    }

    const userId = currentSession.user.id;

    const { data: adminRow } = await supabase
      .from("admin_users")
      .select("id, name")
      .eq("auth_user_id", userId)
      .maybeSingle();

    if (adminRow) {
      setRole("admin");
      setFacultyId(null);
      setFacultyName(adminRow.name);
      setAdminId(adminRow.id);
      return;
    }

    const { data: facultyRow } = await supabase
      .from("faculty")
      .select("id, name")
      .eq("auth_user_id", userId)
      .maybeSingle();

    if (facultyRow) {
      setRole("faculty");
      setFacultyId(facultyRow.id);
      setFacultyName(facultyRow.name);
      setAdminId(null);
      return;
    }

    setRole(null);
    setFacultyId(null);
    setFacultyName(null);
    setAdminId(null);
  }

  useEffect(() => {
    let isMounted = true;

    supabase.auth
      .getSession()
      .then(async ({ data: { session: currentSession } }) => {
        if (!isMounted) return;
        setSession(currentSession);
        await resolveRole(currentSession);
        if (isMounted) setLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        if (!isMounted) return;
        setLoading(true);
        setSession(currentSession);
        await resolveRole(currentSession);
        if (isMounted) setLoading(false);
      },
    );

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function loginWithPassword(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error(error.message);
    return data;
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  const value = {
    session,
    role,
    facultyId,
    facultyName,
    adminId,
    loading,
    loginWithPassword,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
