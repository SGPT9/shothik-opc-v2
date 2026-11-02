import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import {
  Headphones,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sparkles,
  Sliders,
  Compass,
  Radio,
  Layers,
  Wind,
  CloudRain,
  Car,
  Ship,
  Coffee,
  Trees,
  Check,
  RefreshCw,
  Share2
} from "lucide-react";

export interface SpatialCoordinates {
  x: number;
  y: number;
  z: number;
}

export interface SoundscapeLayerConfig {
  foleyId: string;
  name: string;
  volume: number;
  position: SpatialCoordinates;
  azimuthDeg: number;
  distanceMeters: number;
  elevationMeters: number;
  reverbDecaySeconds: number;
  isMuted?: boolean;
}

export interface SceneSoundscapeMix {
  projectId: string;
  sceneTitle: string;
  atmosphereProfile: string;
  layers: SoundscapeLayerConfig[];
  detectedAcousticCues: string[];
  totalAmbienceDurationSeconds: number;
  binauralAudioBase64?: string;
  updatedAt: string;
}

interface BinauralSoundscapeModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  currentManuscriptText?: string;
}

export const BinauralSoundscapeModal: React.FC<BinauralSoundscapeModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  currentManuscriptText = "",
}) => {
  const [mix, setMix] = useState<SceneSoundscapeMix | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(0);
  const [isScanningCues, setIsScanningCues] = useState(false);
  const [masterVolume, setMasterVolume] = useState<number>(0.8);
  const [copiedPreset, setCopiedPreset] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load soundscape mix
  const loadSoundscape = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/soundscape`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) setMix(json.data);
      }
    } catch (err) {
      console.warn("[Soundscape] Load failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadSoundscape();
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
    }
  }, [isOpen, projectId]);

  // Sensory manuscript scan
  const handleAnalyzeCues = async () => {
    setIsScanningCues(true);
    const textToScan =
      currentManuscriptText ||
      "রাত তখন আড়াইটা। ঢাকার রাজপথ ধোঁয়াটে বৃষ্টির চাদরে মোড়া। বুড়িগঙ্গার তীরে সদরঘাটের লঞ্চগুলো নিশ্চল দাঁড়িয়ে আছে। চায়ের দোকানে কেটলির বাষ্প উঠছে।";

    try {
      const res = await fetch(`/api/v1/projects/${projectId}/soundscape/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sceneText: textToScan,
          sceneTitle: projectTitle || "Active Scene",
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setMix(json.data);
          setSelectedLayerIndex(0);
        }
      }
    } catch (err) {
      console.error("[Soundscape] Analysis failed", err);
    } finally {
      setIsScanningCues(false);
    }
  };

  // Play / Pause Binaural 3D Master
  const togglePlayBinaural = () => {
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    if (!mix?.binauralAudioBase64) return;
    const audioUrl = `data:audio/wav;base64,${mix.binauralAudioBase64}`;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.loop = true;
    audio.volume = masterVolume;

    audio.onended = () => setIsPlaying(false);
    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch((e) => {
        console.warn("Audio play prevented", e);
        setIsPlaying(true);
      });
  };

  // Update Layer Config
  const handleUpdateLayer = (
    index: number,
    updates: Partial<SoundscapeLayerConfig>
  ) => {
    if (!mix) return;
    const updatedLayers = [...mix.layers];
    updatedLayers[index] = { ...updatedLayers[index], ...updates };

    // Update X/Z from azimuth and distance
    if (updates.azimuthDeg !== undefined || updates.distanceMeters !== undefined) {
      const azRad = ((updates.azimuthDeg ?? updatedLayers[index].azimuthDeg) * Math.PI) / 180;
      const dist = updates.distanceMeters ?? updatedLayers[index].distanceMeters;
      updatedLayers[index].position = {
        x: Number((Math.sin(azRad) * dist).toFixed(1)),
        y: updatedLayers[index].elevationMeters,
        z: Number((Math.cos(azRad) * dist).toFixed(1)),
      };
    }

    setMix({ ...mix, layers: updatedLayers });
  };

  // Layer Icon & Theme Helper
  const getLayerIcon = (foleyId: string) => {
    if (foleyId.includes("rain")) return <CloudRain className="w-4 h-4 text-cyan-400" />;
    if (foleyId.includes("traffic")) return <Car className="w-4 h-4 text-amber-400" />;
    if (foleyId.includes("river")) return <Ship className="w-4 h-4 text-blue-400" />;
    if (foleyId.includes("tea")) return <Coffee className="w-4 h-4 text-orange-400" />;
    if (foleyId.includes("cicadas")) return <Trees className="w-4 h-4 text-emerald-400" />;
    return <Wind className="w-4 h-4 text-purple-400" />;
  };

  const selectedLayer = mix?.layers[selectedLayerIndex];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[88vh] flex flex-col p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/80 shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border/60 bg-muted/20 flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-xs">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <span>3D Binaural Soundscape & Audio Foley Engine</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-mono font-normal">
                  HRTF Spatializer
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Automated environmental sound generator reading sensory scene cues to layer 3D rain, river, and traffic.
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleAnalyzeCues}
              disabled={isScanningCues}
              className="h-8 text-xs font-semibold gap-1.5 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isScanningCues ? "Reading Manuscript..." : "Scan Scene Cues"}</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Atmosphere Banner & Detected Cues */}
        <div className="px-6 py-2.5 bg-muted/30 border-b border-border/40 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-semibold">Atmosphere:</span>
            <span className="font-bold text-foreground">{mix?.atmosphereProfile || "Monsoon Night"}</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[10px] text-muted-foreground uppercase font-mono mr-1">Cues:</span>
            {mix?.detectedAcousticCues.map((cue, idx) => (
              <span
                key={idx}
                className="text-[10px] bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-medium"
              >
                {cue}
              </span>
            ))}
          </div>
        </div>

        {/* Main 3D Spatial Canvas + Mixer Area */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-12 gap-5 custom-scrollbar">
          {/* Left Column: 3D Polar Azimuth Radar (5 Cols) */}
          <div className="md:col-span-5 flex flex-col items-center justify-between p-4 rounded-xl border border-border/80 bg-card">
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>3D Spatial Soundfield (HRTF Top-Down)</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">Listener Center (0,0)</span>
            </div>

            {/* Circular Radar Graphic */}
            <div className="relative w-56 h-56 rounded-full border border-cyan-500/30 bg-radial from-cyan-950/20 to-background flex items-center justify-center my-3 shadow-inner">
              {/* Concentric rings */}
              <div className="absolute w-44 h-44 rounded-full border border-border/40" />
              <div className="absolute w-28 h-28 rounded-full border border-border/30" />
              <div className="absolute w-14 h-14 rounded-full border border-border/20" />

              {/* Crosshair axes */}
              <div className="absolute w-full h-[1px] bg-border/40" />
              <div className="absolute h-full w-[1px] bg-border/40" />

              {/* Cardinal directions */}
              <span className="absolute top-1 text-[9px] font-mono text-muted-foreground">FRONT (0°)</span>
              <span className="absolute bottom-1 text-[9px] font-mono text-muted-foreground">BEHIND (180°)</span>
              <span className="absolute left-1 text-[9px] font-mono text-muted-foreground">L (-90°)</span>
              <span className="absolute right-1 text-[9px] font-mono text-muted-foreground">R (+90°)</span>

              {/* Center Listener Head */}
              <div className="w-5 h-5 rounded-full bg-cyan-500 border-2 border-background flex items-center justify-center shadow-lg z-10">
                <span className="text-[8px] font-bold text-black">👤</span>
              </div>

              {/* Layer Sound Sources */}
              {mix?.layers.map((layer, idx) => {
                const azRad = (layer.azimuthDeg * Math.PI) / 180;
                // Scale distance into 0..95px radius
                const radius = Math.min(95, (layer.distanceMeters / 6) * 95);
                const posX = Math.sin(azRad) * radius;
                const posY = -Math.cos(azRad) * radius;
                const isSelected = selectedLayerIndex === idx;

                return (
                  <button
                    key={layer.foleyId}
                    type="button"
                    onClick={() => setSelectedLayerIndex(idx)}
                    style={{
                      transform: `translate(${posX}px, ${posY}px)`,
                    }}
                    className={`absolute w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
                      isSelected
                        ? "bg-cyan-500 text-black ring-4 ring-cyan-500/30 scale-110 z-20"
                        : "bg-secondary text-secondary-foreground hover:scale-105 z-10 border border-border"
                    }`}
                    title={`${layer.name} (${layer.azimuthDeg}°, ${layer.distanceMeters}m)`}
                  >
                    {getLayerIcon(layer.foleyId)}
                  </button>
                );
              })}
            </div>

            {/* Selected Layer Coordinates HUD */}
            {selectedLayer && (
              <div className="w-full bg-muted/40 p-2.5 rounded-lg border border-border/60 text-xs font-mono space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-cyan-400">
                  <span>{selectedLayer.name}</span>
                  <span>{selectedLayer.volume * 100}% Vol</span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-[10px] text-muted-foreground">
                  <div>Azimuth: <span className="text-foreground">{selectedLayer.azimuthDeg}°</span></div>
                  <div>Distance: <span className="text-foreground">{selectedLayer.distanceMeters}m</span></div>
                  <div>Elevation: <span className="text-foreground">+{selectedLayer.elevationMeters}m</span></div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Multi-Track Mixer & Spatial Controls (7 Cols) */}
          <div className="md:col-span-7 space-y-4">
            {/* Layers List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Active 3D Foley Layers ({mix?.layers.length || 0})</span>
              </span>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                {mix?.layers.map((layer, idx) => {
                  const isSelected = selectedLayerIndex === idx;

                  return (
                    <div
                      key={layer.foleyId}
                      onClick={() => setSelectedLayerIndex(idx)}
                      className={`p-3 rounded-xl border text-xs transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-cyan-500/10 border-cyan-500/50 shadow-xs"
                          : "bg-card border-border/80 hover:border-border"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-muted text-foreground">
                          {getLayerIcon(layer.foleyId)}
                        </div>
                        <div>
                          <h5 className="font-bold text-foreground text-xs">{layer.name}</h5>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono mt-0.5">
                            <span>Azimuth: {layer.azimuthDeg}°</span>
                            <span>•</span>
                            <span>Distance: {layer.distanceMeters}m</span>
                            <span>•</span>
                            <span>Reverb: {layer.reverbDecaySeconds}s</span>
                          </div>
                        </div>
                      </div>

                      {/* Volume Slider */}
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={layer.volume}
                          onChange={(e) => handleUpdateLayer(idx, { volume: Number(e.target.value) })}
                          className="w-20 h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                        <span className="font-mono text-[10px] w-7 text-right">
                          {Math.round(layer.volume * 100)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Spatial Soundstage Fine-Tuner for Selected Layer */}
            {selectedLayer && (
              <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-500/5 space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-border/40">
                  <span className="text-xs font-bold text-cyan-400">
                    Spatial Tuner: {selectedLayer.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">Binaural Coordinates</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1 font-semibold">
                      <span>Azimuth Angle</span>
                      <span className="font-mono text-cyan-400">{selectedLayer.azimuthDeg}°</span>
                    </div>
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      step={5}
                      value={selectedLayer.azimuthDeg}
                      onChange={(e) =>
                        handleUpdateLayer(selectedLayerIndex, { azimuthDeg: Number(e.target.value) })
                      }
                      className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1 font-semibold">
                      <span>Distance</span>
                      <span className="font-mono text-cyan-400">{selectedLayer.distanceMeters}m</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={0.5}
                      value={selectedLayer.distanceMeters}
                      onChange={(e) =>
                        handleUpdateLayer(selectedLayerIndex, { distanceMeters: Number(e.target.value) })
                      }
                      className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1 font-semibold">
                      <span>Elevation</span>
                      <span className="font-mono text-cyan-400">+{selectedLayer.elevationMeters}m</span>
                    </div>
                    <input
                      type="range"
                      min={-2}
                      max={6}
                      step={0.5}
                      value={selectedLayer.elevationMeters}
                      onChange={(e) =>
                        handleUpdateLayer(selectedLayerIndex, { elevationMeters: Number(e.target.value) })
                      }
                      className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Master Playback Bar */}
        <div className="px-6 py-3 border-t border-border/60 bg-muted/20 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={togglePlayBinaural}
              className={`h-8 px-4 text-xs font-bold gap-2 cursor-pointer ${
                isPlaying
                  ? "bg-rose-500 hover:bg-rose-600 text-white animate-pulse"
                  : "bg-cyan-500 hover:bg-cyan-600 text-black"
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? "Pause 3D Soundscape" : "Preview 3D Binaural Mix"}</span>
            </Button>

            <div className="flex items-center gap-2 pl-2 border-l border-border/60">
              <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={masterVolume}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMasterVolume(val);
                  if (audioRef.current) audioRef.current.volume = val;
                }}
                className="w-24 h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <span className="font-mono text-[10px] text-muted-foreground">
                {Math.round(masterVolume * 100)}% Master
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
              HRTF 3D Spatial Matrix Active
            </span>
            <Button size="sm" variant="outline" onClick={onClose} className="h-7 text-xs px-3">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BinauralSoundscapeModal;
