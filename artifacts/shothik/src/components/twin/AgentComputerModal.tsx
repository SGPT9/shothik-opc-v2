import React, { useState, useEffect } from "react";
import {
  Monitor,
  Terminal,
  Cpu,
  ShieldCheck,
  FileText,
  RotateCw,
  Play,
  Square,
  Globe,
  Send,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  X,
  Plus,
} from "lucide-react";
import { ActionProposalCard } from "../chat/ActionProposalCard";
import { useModalA11y } from "@/hooks/ui/useModalA11y";

export interface AgentComputerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AgentComputerModal: React.FC<AgentComputerModalProps> = ({ isOpen, onClose }) => {
  useModalA11y({ isOpen, onClose });
  const [activeTab, setActiveTab] = useState<"browser" | "tasks" | "actions" | "pdf">("browser");
  
  // Browser state
  const [browserUrl, setBrowserUrl] = useState("https://news.ycombinator.com");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [browserTitle, setBrowserTitle] = useState("Hacker News");
  const [textInput, setTextInput] = useState("");
  const [browserLoading, setBrowserLoading] = useState(false);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [controlHolder, setControlHolder] = useState<"agent" | "human">("agent");
  const [helpRequested, setHelpRequested] = useState(false);
  const [helpReason, setHelpReason] = useState<string | null>(null);

  // Tasks state
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTaskPrompt, setNewTaskPrompt] = useState("");
  const [taskLoading, setTaskLoading] = useState(false);

  // Action Proposals state
  const [proposals, setProposals] = useState<any[]>([]);

  // PDF state
  const [pdfTemplates, setPdfTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [pdfFormValues, setPdfFormValues] = useState<Record<string, string>>({});
  const [receipt, setReceipt] = useState<any | null>(null);

  // Keyboard shortcut ⌘U / Ctrl+U
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "u") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Initial load
  useEffect(() => {
    if (isOpen) {
      loadBrowserSession();
      loadTasks();
      loadProposals();
      loadPdfTemplates();
    }
  }, [isOpen]);

  const loadBrowserSession = async () => {
    try {
      const res = await fetch("/api/browser/sessions");
      const data = await res.json();
      if (data.sessions && data.sessions.length > 0) {
        setSessionId(data.sessions[0].id);
        setBrowserUrl(data.sessions[0].url);
        setBrowserTitle(data.sessions[0].title);
      } else {
        const createRes = await fetch("/api/browser/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: browserUrl }),
        });
        const createData = await createRes.json();
        if (createData.session) {
          setSessionId(createData.session.id);
          setBrowserTitle(createData.session.title);
        }
      }
    } catch {
      // Mock fallback
      setSessionId("mock-session-01");
    }
  };

  const loadTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      if (data.tasks) setTasks(data.tasks);
    } catch {
      setTasks([
        {
          id: "task-01",
          title: "Steadfast Courier Settlement Reconciliation",
          status: "running",
          leaseUntil: new Date(Date.now() + 45000).toISOString(),
          attempts: 1,
          plan: [
            { id: "1", title: "Fetch API parcel statuses", status: "succeeded" },
            { id: "2", title: "Reconcile COD bank deposits", status: "running" },
          ],
        },
      ]);
    }
  };

  const loadProposals = async () => {
    try {
      const res = await fetch("/api/action-proposals");
      const data = await res.json();
      if (data.proposals) setProposals(data.proposals);
    } catch {
      setProposals([
        {
          id: "prop-01",
          kind: "bkash.payout",
          title: "Authorize Supplier Payout for Chawkbazar Wholesale",
          data: { recipientPhone: "01711223344", amount: 45000, reference: "PO_SUPP_889" },
          status: "awaiting_review",
          hash: "a3f89e21bc894567ef89",
          expiresAt: new Date(Date.now() + 600000).toISOString(),
        },
        {
          id: "prop-02",
          kind: "courier.dispatch",
          title: "Steadfast Bulk Express Dispatch (12 Parcels)",
          data: { courier: "steadfast", recipientName: "Tanvir Ahmed", recipientPhone: "01822334455", deliveryAddress: "Mirpur-10, Dhaka", codAmount: 2450, itemDescription: "Handicrafts" },
          status: "awaiting_review",
          hash: "f88b321c890abce89912",
          expiresAt: new Date(Date.now() + 900000).toISOString(),
        },
      ]);
    }
  };

  const loadPdfTemplates = async () => {
    try {
      const res = await fetch("/api/pdf-forms/templates");
      const data = await res.json();
      if (data.documents) {
        setPdfTemplates(data.documents);
        setSelectedTemplate(data.documents[0]);
      }
    } catch {
      // Mock fallback
    }
  };

  const handleBrowserAction = async (action: any, explicitActor?: "agent" | "human") => {
    if (!sessionId) return;
    setBrowserLoading(true);
    try {
      const actor = explicitActor || controlHolder;
      const res = await fetch(`/api/browser/sessions/${sessionId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...action, actor }),
      });
      const data = await res.json();
      if (data.refused) {
        setActionLog((prev) => [`🚫 ${data.message}`, ...prev.slice(0, 15)]);
      } else if (data.message) {
        setActionLog((prev) => [`${actor === "human" ? "👤 Human" : "🤖 Twin"}: ${data.message}`, ...prev.slice(0, 15)]);
      }
    } catch {
      setActionLog((prev) => [`Simulated action: ${action.type}`, ...prev.slice(0, 15)]);
    } finally {
      setBrowserLoading(false);
    }
  };

  const handleTakeWheel = async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/browser/sessions/${sessionId}/take-wheel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actor: "Merchant (Human Operator)" }),
      });
      const data = await res.json();
      if (data.success) {
        setControlHolder("human");
        setHelpRequested(false);
        setActionLog((prev) => ["👤 Control Taken: You are now driving the browser. Autonomous agent actions are locked.", ...prev.slice(0, 15)]);
      }
    } catch {
      setControlHolder("human");
      setHelpRequested(false);
    }
  };

  const handleReleaseControl = async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/browser/sessions/${sessionId}/release-control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actor: "Merchant (Human Operator)" }),
      });
      const data = await res.json();
      if (data.success) {
        setControlHolder("agent");
        setHelpRequested(false);
        setHelpReason(null);
        setActionLog((prev) => ["🤖 Control Released: Returned control to Agent Twin. Autonomous execution safely resumed.", ...prev.slice(0, 15)]);
      }
    } catch {
      setControlHolder("agent");
      setHelpRequested(false);
      setHelpReason(null);
    }
  };

  const handleSimulateHelpRequest = async (reason = "bKash SMS OTP & PIN Verification Challenge Detected") => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/browser/sessions/${sessionId}/help-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (data.success) {
        setHelpRequested(true);
        setHelpReason(reason);
        setActionLog((prev) => [`⚠️ ${reason} — Autonomous loop halted. Human takeover requested.`, ...prev.slice(0, 15)]);
      }
    } catch {
      setHelpRequested(true);
      setHelpReason(reason);
    }
  };

  const handleCreateTask = async () => {
    if (!newTaskPrompt.trim()) return;
    setTaskLoading(true);
    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: newTaskPrompt }),
      });
      setNewTaskPrompt("");
      await loadTasks();
    } catch {
      // Ignore error
    } finally {
      setTaskLoading(false);
    }
  };

  const handleFillPdf = async () => {
    if (!selectedTemplate) return;
    try {
      const res = await fetch(`/api/pdf-forms/templates/${selectedTemplate.id}/fill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: pdfFormValues }),
      });
      const data = await res.json();
      if (data.document) {
        setSelectedTemplate(data.document);
      }

      // Generate receipt
      const receiptRes = await fetch(`/api/pdf-forms/templates/${selectedTemplate.id}/receipt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient: pdfFormValues.proprietor_name || "Dhaka Merchant" }),
      });
      const receiptData = await receiptRes.json();
      if (receiptData.receipt) {
        setReceipt(receiptData.receipt);
      }
    } catch {
      // Mock receipt
      setReceipt({
        receiptId: "RCPT-SHOTHIK-992",
        documentTitle: selectedTemplate.title,
        recipient: pdfFormValues.proprietor_name || "Dhaka Merchant",
        signedHash: "e43b890912abcf897654",
        timestamp: new Date().toISOString(),
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="agent-computer-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
    >
      <div className="flex flex-col w-full max-w-5xl h-[88vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="agent-computer-modal-title" className="font-semibold text-base text-slate-100">OpenMuse Agentic Computer</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live Harness
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Persistent Chromium · CAS Leased Worker · Protected Action Review
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
            <button
              onClick={() => setActiveTab("browser")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === "browser"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> Browser Takeover
            </button>
            <button
              onClick={() => setActiveTab("tasks")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === "tasks"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> CAS Tasks
            </button>
            <button
              onClick={() => setActiveTab("actions")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === "actions"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Protected Actions
            </button>
            <button
              onClick={() => setActiveTab("pdf")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === "pdf"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Nilkhet PDF Hub
            </button>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: BROWSER TAKEOVER */}
          {activeTab === "browser" && (
            <div className="grid grid-cols-3 gap-6 h-full">
              {/* Viewport */}
              <div className="col-span-2 flex flex-col bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                {/* Browser Address Bar */}
                <div className="flex items-center gap-2 p-2 bg-slate-900 border-b border-slate-800">
                  <div className="flex items-center gap-1 text-slate-500">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <input
                    type="text"
                    value={browserUrl}
                    onChange={(e) => setBrowserUrl(e.target.value)}
                    className="flex-1 px-3 py-1 text-xs bg-slate-950 rounded border border-slate-700 text-slate-200 font-mono"
                  />
                  <button
                    onClick={() => handleBrowserAction({ type: "navigate", url: browserUrl })}
                    className="px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium transition"
                  >
                    Go
                  </button>
                </div>

                {/* HITL "Take the Wheel" Handover Latch Banner */}
                {helpRequested ? (
                  <div className="flex items-center justify-between px-3 py-2 bg-amber-500/15 border-b border-amber-500/30 text-amber-300 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      <span className="font-semibold">⚠️ 2FA / CAPTCHA Latch:</span>
                      <span className="text-[11px] text-amber-200">{helpReason || "Challenge detected. Awaiting human takeover."}</span>
                    </div>
                    <button
                      onClick={handleTakeWheel}
                      className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1 shadow"
                    >
                      Take the Wheel 🎯
                    </button>
                  </div>
                ) : controlHolder === "human" ? (
                  <div className="flex items-center justify-between px-3 py-2 bg-indigo-500/20 border-b border-indigo-500/30 text-indigo-200 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                      <span className="font-semibold">👤 Human Driving (&apos;Take the Wheel&apos; Active):</span>
                      <span className="text-[11px] text-indigo-300">Autonomous agent commands are locked. Click below once solved.</span>
                    </div>
                    <button
                      onClick={handleReleaseControl}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1 shadow"
                    >
                      Release Control to Twin ✓
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-[11px]">🤖 Twin Autonomous Mode · Zero human intervention</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSimulateHelpRequest("bKash 2FA SMS Verification Challenge")}
                        className="text-[10px] text-slate-400 hover:text-amber-400 transition"
                      >
                        Simulate 2FA Challenge
                      </button>
                      <button
                        onClick={handleTakeWheel}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white text-[11px] font-medium border border-slate-700 transition"
                      >
                        Take the Wheel
                      </button>
                    </div>
                  </div>
                )}

                {/* Screenshot Interactive Surface */}
                <div
                  className="flex-1 relative bg-slate-950 flex items-center justify-center cursor-crosshair overflow-hidden"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = Math.floor(((e.clientX - rect.left) * 1280) / rect.width);
                    const y = Math.floor(((e.clientY - rect.top) * 800) / rect.height);
                    handleBrowserAction({ type: "click", x, y });
                  }}
                >
                  <div className="text-center p-6 text-slate-400">
                    <Monitor className="w-12 h-12 mx-auto mb-3 text-indigo-400 animate-pulse" />
                    <p className="text-sm font-semibold text-slate-200">{browserTitle}</p>
                    <p className="text-xs text-slate-500 mt-1 font-mono">{browserUrl}</p>
                    <p className="text-[11px] text-indigo-400 mt-4 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 inline-block">
                      Click anywhere on the viewport to send normalized (X, Y) coordinate clicks
                    </p>
                  </div>
                </div>

                {/* Remote Input Strip */}
                <div className="flex items-center gap-2 p-2.5 bg-slate-900 border-t border-slate-800">
                  <input
                    type="text"
                    placeholder="Type text into active remote input..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && textInput) {
                        handleBrowserAction({ type: "text", text: textInput });
                        setTextInput("");
                      }
                    }}
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-950 rounded-lg border border-slate-700 text-slate-100"
                  />
                  <button
                    onClick={() => {
                      if (textInput) {
                        handleBrowserAction({ type: "text", text: textInput });
                        setTextInput("");
                      }
                    }}
                    className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 font-medium transition"
                  >
                    Send Text
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleBrowserAction({ type: "key", key: "Enter" })}
                      className="px-2 py-1.5 text-[11px] bg-slate-800 text-slate-300 rounded border border-slate-700 hover:bg-slate-700"
                    >
                      Enter ↵
                    </button>
                    <button
                      onClick={() => handleBrowserAction({ type: "key", key: "Tab" })}
                      className="px-2 py-1.5 text-[11px] bg-slate-800 text-slate-300 rounded border border-slate-700 hover:bg-slate-700"
                    >
                      Tab ⇥
                    </button>
                    <button
                      onClick={() => handleBrowserAction({ type: "scroll", deltaY: -400 })}
                      className="p-1.5 text-[11px] bg-slate-800 text-slate-300 rounded border border-slate-700 hover:bg-slate-700"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleBrowserAction({ type: "scroll", deltaY: 400 })}
                      className="p-1.5 text-[11px] bg-slate-800 text-slate-300 rounded border border-slate-700 hover:bg-slate-700"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Log / Control Panel */}
              <div className="flex flex-col bg-slate-950 rounded-xl border border-slate-800 p-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Event Stream
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Zero-Trust Blitting</span>
                </div>
                <div className="flex-1 overflow-y-auto my-3 space-y-2 text-xs font-mono text-slate-400">
                  {actionLog.length === 0 ? (
                    <div className="text-slate-600 text-center py-8">No actions dispatched yet</div>
                  ) : (
                    actionLog.map((log, idx) => (
                      <div key={idx} className="p-2 rounded bg-slate-900/80 border border-slate-800/80 text-emerald-300/90">
                        {log}
                      </div>
                    ))
                  )}
                </div>
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs text-indigo-300">
                  ⚡ <strong>SSRF Protected:</strong> Loopback & internal network access is filtered at the gateway.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CAS TASKS */}
          {activeTab === "tasks" && (
            <div className="space-y-6">
              {/* Add Task Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex gap-3">
                <input
                  type="text"
                  placeholder="Ask agent for an autonomous outcome (e.g. 'Reconcile Steadfast COD returns with NBR ledger')..."
                  value={newTaskPrompt}
                  onChange={(e) => setNewTaskPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateTask();
                  }}
                  className="flex-1 px-4 py-2 bg-slate-900 rounded-lg border border-slate-700 text-sm text-slate-100"
                />
                <button
                  onClick={handleCreateTask}
                  disabled={taskLoading}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Dispatch Leased Task
                </button>
              </div>

              {/* Task Cards */}
              <div className="space-y-4">
                {tasks.map((t) => (
                  <div key={t.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-slate-100">{t.title}</h4>
                          <span className="text-xs text-slate-400 font-mono">Task ID: #{t.id.slice(0, 8)}</span>
                        </div>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 animate-pulse" /> {t.status}
                      </span>
                    </div>

                    {/* Steps */}
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      {t.plan?.map((step: any, sIdx: number) => (
                        <div key={sIdx} className="flex items-center justify-between text-xs p-2 rounded bg-slate-900 border border-slate-800/80">
                          <span className="text-slate-300 font-medium">Step {sIdx + 1}: {step.title}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            step.status === "succeeded" ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10"
                          }`}>
                            {step.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PROTECTED ACTIONS */}
          {activeTab === "actions" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="text-sm font-semibold text-slate-200">Human-In-The-Loop Protected Gates</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  High-risk operations (bKash transfers, COD courier dispatch, bulk broadcasts) require manual cryptographic authorization.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {proposals.map((p) => (
                  <ActionProposalCard
                    key={p.id}
                    id={p.id}
                    kind={p.kind}
                    title={p.title}
                    data={p.data}
                    status={p.status}
                    hash={p.hash}
                    expiresAt={p.expiresAt}
                  />
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: NILKHET PDF HUB */}
          {activeTab === "pdf" && (
            <div className="grid grid-cols-2 gap-6 h-full">
              {/* Form Input Side */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-100">{selectedTemplate?.title}</h4>
                  <p className="text-xs text-slate-400">Interactive AcroForm Field Filling & SHA-256 Seal</p>
                </div>

                <div className="space-y-3">
                  {selectedTemplate?.fields?.map((f: any) => (
                    <div key={f.name} className="space-y-1">
                      <label className="text-xs text-slate-300 font-medium">{f.label}</label>
                      {f.type === "dropdown" ? (
                        <select
                          value={pdfFormValues[f.name] || f.value}
                          onChange={(e) => setPdfFormValues({ ...pdfFormValues, [f.name]: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs bg-slate-900 rounded-lg border border-slate-700 text-slate-100"
                        >
                          {f.options?.map((opt: string) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={pdfFormValues[f.name] ?? f.value}
                          onChange={(e) => setPdfFormValues({ ...pdfFormValues, [f.name]: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs bg-slate-900 rounded-lg border border-slate-700 text-slate-100"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleFillPdf}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow transition"
                >
                  Fill Form & Generate Delivery Receipt
                </button>
              </div>

              {/* Receipt Preview */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h4 className="text-sm font-semibold text-slate-100">Nilkhet Delivery Receipt</h4>
                      <p className="text-xs text-slate-400">Cryptographically Sealed Form Delivery</p>
                    </div>
                  </div>

                  {receipt ? (
                    <div className="my-4 p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2 text-xs font-mono">
                      <div><span className="text-slate-500">Receipt ID:</span> <span className="text-emerald-400 font-bold">{receipt.receiptId}</span></div>
                      <div><span className="text-slate-500">Document:</span> <span className="text-slate-200">{receipt.documentTitle}</span></div>
                      <div><span className="text-slate-500">Recipient:</span> <span className="text-slate-300">{receipt.recipient}</span></div>
                      <div><span className="text-slate-500">Channel:</span> <span className="text-amber-400 uppercase">Nilkhet Print Hub</span></div>
                      <div className="pt-2 border-t border-slate-800">
                        <span className="text-slate-500">SHA-256 Seal:</span>
                        <div className="text-[10px] text-slate-400 break-all bg-slate-950 p-2 rounded mt-1 border border-slate-800">
                          {receipt.signedHash}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16 text-slate-500 text-xs">
                      Fill and submit form on the left to generate signed receipt
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
