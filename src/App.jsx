import { useState } from "react";
import {
  parseAbsenceRequest,
  validateAbsenceAction,
} from "./services/agentService.js";

function App() {
  const [result, setResult] = useState("Click the button to test");

  async function runTest() {
    setResult("Thinking...");
    try {
      const parsed = await parseAbsenceRequest(
        "Dr. Sharma is absent Monday period 1",
      );
      const validated = await validateAbsenceAction(parsed);
      setResult(JSON.stringify(validated, null, 2));
    } catch (err) {
      setResult("ERROR: " + err.message);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4 p-8">
      <button
        onClick={runTest}
        className="bg-emerald-600 text-white px-4 py-2 rounded-lg"
      >
        Test Agent Parsing
      </button>
      <pre className="text-white text-sm bg-slate-800 p-4 rounded-lg max-w-xl overflow-auto">
        {result}
      </pre>
    </div>
  );
}

export default App;
