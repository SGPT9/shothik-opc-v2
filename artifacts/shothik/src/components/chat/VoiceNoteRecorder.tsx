import React, { useState, useEffect, useRef } from "react";
import { Mic, Square, Send, Trash2, Volume2 } from "lucide-react";

export interface VoiceNoteRecorderProps {
  onAudioRecorded: (audioBlob: Blob, durationSec: number, transcript: string) => void;
  onCancel?: () => void;
}

export const VoiceNoteRecorder: React.FC<VoiceNoteRecorderProps> = ({ onAudioRecorded, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>([15, 30, 45, 20, 60, 80, 40, 25, 70, 50]);
  const timerRef = useRef<any>(null);

  const startRecording = () => {
    setIsRecording(true);
    setDuration(0);
    timerRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
      // Simulate live audio waveform levels
      setWaveformData(Array.from({ length: 12 }, () => Math.floor(15 + Math.random() * 70)));
    }, 1000);
  };

  const stopRecordingAndSend = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    const mockBlob = new Blob(["mock_audio_data"], { type: "audio/webm" });
    onAudioRecorded(mockBlob, duration, "আমি আজকের সেলস এবং ডেলিভারি স্ট্যাটাস জানতে চাই।");
  };

  const cancelRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setDuration(0);
    if (onCancel) onCancel();
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${mins}:${remaining < 10 ? "0" : ""}${remaining}`;
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-lg">
      {!isRecording ? (
        <button
          onClick={startRecording}
          title="Hold or click to record Bangla voice note"
          className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl transition shadow-md shadow-emerald-500/20 flex items-center gap-1.5 text-xs font-bold"
        >
          <Mic className="w-4 h-4" />
          <span>Voice Note</span>
        </button>
      ) : (
        <div className="flex items-center gap-3 w-full animate-fadeIn">
          {/* Recording indicator */}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <span className="text-xs font-mono font-bold text-rose-400">{formatTime(duration)}</span>
          </div>

          {/* Audio Waveform visualization */}
          <div className="flex items-center gap-1 h-6 flex-1 px-2">
            {waveformData.map((h, i) => (
              <span
                key={i}
                style={{ height: `${h}%` }}
                className="w-1 bg-emerald-400 rounded-full transition-all duration-300"
              />
            ))}
          </div>

          {/* Action buttons */}
          <button
            onClick={cancelRecording}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={stopRecordingAndSend}
            className="p-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl transition shadow-md shadow-emerald-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
