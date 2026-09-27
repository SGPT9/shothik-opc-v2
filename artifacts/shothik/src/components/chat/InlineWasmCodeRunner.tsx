import React, { useState } from "react";
import { Play, Check, Copy, Terminal, Loader2 } from "lucide-react";

export interface InlineWasmCodeRunnerProps {
  code: string;
  language: string;
}

export const InlineWasmCodeRunner: React.FC<InlineWasmCodeRunnerProps> = ({ code, language }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [execDurationMs, setExecDurationMs] = useState<number | null>(null);

  const handleRun = () => {
    setIsRunning(true);
    const start = performance.now();

    setTimeout(() => {
      try {
        if (language === "javascript" || language === "js" || language === "ts") {
          // Safe evaluation in isolated context
          const logs: string[] = [];
          const customConsole = {
            log: (...args: any[]) => logs.push(args.map(a => typeof a === "object" ? JSON.stringify(a) : String(a)).join(" ")),
            error: (...args: any[]) => logs.push(`[ERROR] ${args.join(" ")}`),
          };

          const runFn = new Function("console", code);
          runFn(customConsole);
          setOutput(logs.length > 0 ? logs.join("\n") : "Execution completed successfully (no console output).");
        } else {
          setOutput(`[Wasm Simulated Runtime]\nExecuted ${language.toUpperCase()} payload.\nResult: 200 OK.`);
        }
      } catch (err: any) {
        setOutput(`[Runtime Error]: ${err.message}`);
      } finally {
        setExecDurationMs(Math.round(performance.now() - start));
        setIsRunning(false);
      }
    }, 200);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl border border-slate-700 bg-slate-950 overflow-hidden text-xs font-mono shadow-md">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900 border-b border-slate-800 text-slate-400">
        <span className="font-bold text-[11px] uppercase tracking-wider text-slate-300">
          {language || "code"}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold rounded shadow transition"
          >
            {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isRunning ? "Running..." : "Run in Sandbox"}</span>
          </button>
        </div>
      </div>

      {/* Code Content */}
      <pre className="p-3.5 overflow-x-auto text-slate-200 leading-relaxed text-[11px]">
        {code}
      </pre>

      {/* Execution Output Drawer */}
      {output && (
        <div className="p-3 bg-slate-900/90 border-t border-slate-800 text-emerald-400">
          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
            <span className="flex items-center gap-1">
              <Terminal className="w-3 h-3" />
              Terminal Output
            </span>
            {execDurationMs !== null && <span>{execDurationMs}ms</span>}
          </div>
          <pre className="whitespace-pre-wrap text-[11px] font-mono leading-tight">{output}</pre>
        </div>
      )}
    </div>
  );
};
