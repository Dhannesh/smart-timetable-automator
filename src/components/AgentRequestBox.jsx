import { useState, useEffect, useRef } from "react";
import {
  parseAbsenceRequest,
  validateAbsenceAction,
} from "../services/agentService.js";
import {
  findSubstituteCandidates,
  confirmReassignment,
} from "../services/substituteService.js";
import { markLeaveRequestHandled } from "../services/leaveService.js";
import { useAuth } from "../auth/AuthContext.jsx";

const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function AgentRequestBox({
  onReassignmentComplete,
  initialContext,
  onInitialContextConsumed,
}) {
  const { adminId } = useAuth();
  const [message, setMessage] = useState("");
  const [stage, setStage] = useState("idle");
  const [error, setError] = useState(null);
  const [proposal, setProposal] = useState(null);
  const [relatedLeaveRequestId, setRelatedLeaveRequestId] = useState(null);
  const lastHandledContextId = useRef(null);

  useEffect(() => {
    if (
      initialContext &&
      initialContext.leaveRequestId !== lastHandledContextId.current
    ) {
      lastHandledContextId.current = initialContext.leaveRequestId;
      const prefilledMessage = `${initialContext.facultyName} is absent ${initialContext.dayLabel} period ${initialContext.period}`;
      setMessage(prefilledMessage);
      setRelatedLeaveRequestId(initialContext.leaveRequestId);
      runAgent(prefilledMessage);
      if (onInitialContextConsumed) onInitialContextConsumed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialContext]);

  async function runAgent(text) {
    setError(null);
    setStage("thinking");
    try {
      const parsed = await parseAbsenceRequest(text);
      const action = await validateAbsenceAction(parsed);
      const substitute = await findSubstituteCandidates({
        dayIndex: action.dayIndex,
        period: action.period,
        excludeFacultyId: action.facultyId,
      });

      if (!substitute.proposedFacultyId) {
        setError(substitute.reason);
        setStage("idle");
        return;
      }

      setProposal({ action, substitute });
      setStage("confirming");
    } catch (err) {
      setError(err.message);
      setStage("idle");
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setRelatedLeaveRequestId(null);
    runAgent(message);
  }

  async function handleConfirm() {
    setStage("applying");
    try {
      await confirmReassignment({
        slotId: proposal.action.slotId,
        newFacultyId: proposal.substitute.proposedFacultyId,
      });

      if (relatedLeaveRequestId && adminId) {
        await markLeaveRequestHandled(relatedLeaveRequestId, adminId);
      }

      setStage("done");
      setMessage("");
      if (onReassignmentComplete)
        onReassignmentComplete(proposal.action.slotId);
      setTimeout(() => {
        setStage("idle");
        setProposal(null);
        setRelatedLeaveRequestId(null);
      }, 3000);
    } catch (err) {
      setError(err.message);
      setStage("confirming");
    }
  }

  function handleCancel() {
    setProposal(null);
    setStage("idle");
    setRelatedLeaveRequestId(null);
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🤖</span>
        <h2 className="text-white font-semibold">AI Reassignment Agent</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder='e.g. "Dr. Sharma is absent Monday period 1"'
          disabled={
            stage === "thinking" ||
            stage === "confirming" ||
            stage === "applying"
          }
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
        />
        <button
          type="submit"
          disabled={
            !message ||
            stage === "thinking" ||
            stage === "confirming" ||
            stage === "applying"
          }
          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-800"
        >
          {stage === "thinking" ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
              Thinking
            </span>
          ) : (
            "Send"
          )}
        </button>
      </form>

      {relatedLeaveRequestId && stage !== "idle" && (
        <div className="text-amber-400 text-xs mb-3">
          📋 Resolving a pending leave request
        </div>
      )}

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 text-sm p-3 rounded-lg mb-3 animate-[fadeIn_0.2s_ease-in]">
          ⚠️ {error}
        </div>
      )}

      {stage === "done" && (
        <div className="bg-emerald-900/50 border border-emerald-700 text-emerald-300 text-sm p-3 rounded-lg mb-3 animate-[fadeIn_0.2s_ease-in]">
          ✅ Timetable updated successfully.
        </div>
      )}

      {stage === "confirming" && proposal && (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 animate-[fadeIn_0.2s_ease-in]">
          <p className="text-white mb-2">
            You're marking{" "}
            <span className="font-semibold">{proposal.action.facultyName}</span>{" "}
            absent for:
          </p>
          <p className="text-slate-300 mb-3">
            {proposal.action.sectionLabel} —{" "}
            {DAY_LABELS[proposal.action.dayIndex]}, Period{" "}
            {proposal.action.period} ({proposal.action.subjectName})
          </p>
          <p className="text-white mb-1">
            Suggested substitute:{" "}
            <span className="font-semibold text-emerald-400">
              {proposal.substitute.proposedFacultyName}
            </span>
          </p>
          <p className="text-slate-400 text-sm mb-4">
            ({proposal.substitute.reason})
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              disabled={stage === "applying"}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={stage === "applying"}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              {stage === "applying" ? "Applying..." : "Confirm & Update"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
