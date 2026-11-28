import React, { useState } from "react";
import { Sliders, RotateCcw, X, Sparkles, Check, Info } from "lucide-react";

export interface ChatParameters {
  temperature: number; // 0.0 - 2.0
  topP: number; // 0.0 - 1.0
  maxTokens: number; // 256 - 32768
  systemPrompt?: string;
  frequencyPenalty?: number; // 0.0 - 2.0
  presencePenalty?: number; // 0.0 - 2.0
  presetName?: string;
}

export const DEFAULT_CHAT_PARAMETERS: ChatParameters = {
  temperature: 0.7,
  topP: 0.95,
  maxTokens: 4096,
  systemPrompt: "",
  frequencyPenalty: 0.0,
  presencePenalty: 0.0,
  presetName: "balanced",
};

export const PARAMETER_PRESETS: Record<
  string,
  { label: string; description: string; params: Partial<ChatParameters> }
> = {
  precise: {
    label: "Precise",
    description: "Low variance, high factual fidelity. Best for code, math, and contracts.",
    params: { temperature: 0.2, topP: 0.8, maxTokens: 4096, frequencyPenalty: 0.0, presencePenalty: 0.0 },
  },
  balanced: {
    label: "Balanced",
    description: "Versatile harmony of creativity, speed, and accuracy.",
    params: { temperature: 0.7, topP: 0.95, maxTokens: 4096, frequencyPenalty: 0.0, presencePenalty: 0.0 },
  },
  creative: {
    label: "Creative",
    description: "High variance for ideation, Bengali literature, copywriting, and marketing.",
    params: { temperature: 1.2, topP: 0.98, maxTokens: 8192, frequencyPenalty: 0.2, presencePenalty: 0.1 },
  },
  coding: {
    label: "Code Gen",
    description: "Deterministic AST generation, minimal hallucinations, large token headroom.",
    params: { temperature: 0.1, topP: 0.95, maxTokens: 16384, frequencyPenalty: 0.0, presencePenalty: 0.0 },
  },
};

export interface ParametersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  parameters: ChatParameters;
  onChange: (parameters: ChatParameters) => void;
  activeModel?: string;
}

export function ParametersPanel({
  isOpen,
  onClose,
  parameters,
  onChange,
  activeModel = "Gemini 2.5 Flash",
}: ParametersPanelProps) {
  if (!isOpen) return null;

  const handlePresetSelect = (presetKey: string) => {
    const preset = PARAMETER_PRESETS[presetKey];
    if (!preset) return;
    onChange({
      ...parameters,
      ...preset.params,
      presetName: presetKey,
    });
  };

  const handleReset = () => {
    onChange({ ...DEFAULT_CHAT_PARAMETERS });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="parameters-panel-title"
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-950/95 dark:bg-black/95 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col transition-all duration-300 select-none animate-in slide-in-from-right-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 id="parameters-panel-title" className="text-sm font-semibold text-white">
              Inference Parameters
            </h3>
            <p className="text-[11px] text-zinc-400">
              Tune runtime generation for <span className="text-zinc-200 font-medium">{activeModel}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleReset}
            title="Reset to defaults"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close parameters"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 custom-scrollbar text-xs">
        {/* Preset Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Persona Presets</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(PARAMETER_PRESETS).map(([key, preset]) => {
              const isSelected = parameters.presetName === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handlePresetSelect(key)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    isSelected
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-xs"
                      : "bg-white/[0.03] border-white/5 hover:bg-white/[0.06] text-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between font-medium text-xs">
                    <span>{preset.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2 leading-tight">
                    {preset.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Temperature Slider */}
        <div className="space-y-2 bg-white/[0.02] p-3.5 rounded-xl border border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-zinc-200">Temperature</span>
              <span title="Higher values make output more random, lower values more focused and deterministic.">
                <Info className="w-3.5 h-3.5 text-zinc-500" />
              </span>
            </div>
            <span className="font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-xs">
              {parameters.temperature.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="2"
            step="0.05"
            value={parameters.temperature}
            onChange={(e) =>
              onChange({
                ...parameters,
                temperature: parseFloat(e.target.value),
                presetName: undefined,
              })
            }
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[10px] text-zinc-500">
            <span>Deterministic (0.0)</span>
            <span>Balanced (0.7)</span>
            <span>Unconstrained (2.0)</span>
          </div>
        </div>

        {/* Top-P Slider */}
        <div className="space-y-2 bg-white/[0.02] p-3.5 rounded-xl border border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-zinc-200">Top-P (Nucleus Sampling)</span>
              <span title="Considers the results of the tokens with top_p probability mass.">
                <Info className="w-3.5 h-3.5 text-zinc-500" />
              </span>
            </div>
            <span className="font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-xs">
              {parameters.topP.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={parameters.topP}
            onChange={(e) =>
              onChange({
                ...parameters,
                topP: parseFloat(e.target.value),
                presetName: undefined,
              })
            }
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[10px] text-zinc-500">
            <span>Strict (0.1)</span>
            <span>Standard (0.95)</span>
            <span>Complete Pool (1.0)</span>
          </div>
        </div>

        {/* Max Output Tokens Slider */}
        <div className="space-y-2 bg-white/[0.02] p-3.5 rounded-xl border border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-zinc-200">Max Output Tokens</span>
              <span title="Maximum number of tokens to generate in response.">
                <Info className="w-3.5 h-3.5 text-zinc-500" />
              </span>
            </div>
            <span className="font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-xs">
              {parameters.maxTokens.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min="256"
            max="32768"
            step="256"
            value={parameters.maxTokens}
            onChange={(e) =>
              onChange({
                ...parameters,
                maxTokens: parseInt(e.target.value, 10),
                presetName: undefined,
              })
            }
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[10px] text-zinc-500">
            <span>256</span>
            <span>4,096</span>
            <span>32,768</span>
          </div>
        </div>

        {/* Frequency & Presence Penalties */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5 bg-white/[0.02] p-3 rounded-xl border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-zinc-300">Freq Penalty</span>
              <span className="font-mono text-emerald-400 text-[10px]">
                {(parameters.frequencyPenalty || 0).toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={parameters.frequencyPenalty || 0}
              onChange={(e) =>
                onChange({
                  ...parameters,
                  frequencyPenalty: parseFloat(e.target.value),
                  presetName: undefined,
                })
              }
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div className="space-y-1.5 bg-white/[0.02] p-3 rounded-xl border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-zinc-300">Presence Penalty</span>
              <span className="font-mono text-emerald-400 text-[10px]">
                {(parameters.presencePenalty || 0).toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={parameters.presencePenalty || 0}
              onChange={(e) =>
                onChange({
                  ...parameters,
                  presencePenalty: parseFloat(e.target.value),
                  presetName: undefined,
                })
              }
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>

        {/* Custom System Prompt Override */}
        <div className="space-y-2 bg-white/[0.02] p-3.5 rounded-xl border border-white/5">
          <label
            htmlFor="system-prompt-override"
            className="block font-semibold text-zinc-200 text-xs"
          >
            Custom System Instructions (Override)
          </label>
          <textarea
            id="system-prompt-override"
            rows={4}
            value={parameters.systemPrompt || ""}
            onChange={(e) =>
              onChange({
                ...parameters,
                systemPrompt: e.target.value,
              })
            }
            placeholder="e.g. You are a senior enterprise architect. Always answer in concise Bengali with structured JSON payloads and citations..."
            className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-emerald-500/50 transition font-sans resize-none"
          />
          <p className="text-[10px] text-zinc-500">
            Injected at the root turn to steer tone, formatting, and behavioral boundaries.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
        <span className="text-[11px] text-zinc-500 font-mono">
          State autosaved per chat
        </span>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs transition cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  );
}
