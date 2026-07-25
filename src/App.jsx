import { useEffect, useState } from "react";
import { supabase } from "./services/supabaseClient";

function App() {
  const [status, setStatus] = useState("Checking connection...");

  useEffect(() => {
    async function checkConnection() {
      const { error } = await supabase.from("faculty").select("*").limit(1);
      if (error) {
        setStatus(`Connection error: ${error.message}`);
      } else {
        setStatus("✅ Supabase connected successfully!");
      }
    }
    checkConnection();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <h1 className="text-2xl font-bold text-white">{status}</h1>
    </div>
  );
}

export default App;
