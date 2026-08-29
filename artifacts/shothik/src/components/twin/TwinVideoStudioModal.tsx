"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Video,
  Play,
  Download,
  Sparkles,
  RefreshCw,
  Film,
  Mic,
  Music,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Clapperboard,
} from "lucide-react";
import TemplateSelector from "@/components/animation/TemplateSelector";
import VoiceSettingsPanel from "@/components/animation/VoiceSettingsPanel";
import MusicSettingsPanel from "@/components/animation/MusicSettingsPanel";
import VideoProgress from "@/components/animation/VideoProgress";
import { useAnimationGeneration } from "@/hooks/useAnimationGeneration";

const VIDEO_TEMPLATES = [
  {
    id: "product_launch",
    name: "Product Launch Reel",
    description: "High-impact announcement for F-Commerce and startups",
    previewUrl: "/templates/product-launch.jpg",
  },
  {
    id: "explainer",
    name: "Explainer Video",
    description: "Clean, authoritative overview of your product or service",
    previewUrl: "/templates/explainer.jpg",
  },
  {
    id: "tutorial",
    name: "Customer Walkthrough",
    description: "Step-by-step guidance and onboarding for users",
    previewUrl: "/templates/tutorial.jpg",
  },
  {
    id: "data_presentation",
    name: "Investor Pitch Deck",
    description: "Traction charts, unit economics, and growth metrics",
    previewUrl: "/templates/data.jpg",
  },
  {
    id: "storytelling",
    name: "Founder Journey",
    description: "Cinematic narrative crafted with the founder persona",
    previewUrl: "/templates/storytelling.jpg",
  },
  {
    id: "minimal",
    name: "Minimalist Social",
    description: "Sleek typography for TikTok and Instagram Reels",
    previewUrl: "/templates/minimal.jpg",
  },
];

export interface TwinVideoStudioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName?: string;
  twinPersona?: string;
  defaultTopic?: string;
}

export function TwinVideoStudioModal({
  open,
  onOpenChange,
  companyName = "My Digital Twin",
  twinPersona = "Founder & CEO",
  defaultTopic,
}: TwinVideoStudioModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState("product_launch");
  const [activeTab, setActiveTab] = useState("script");
  const [scriptTopic, setScriptTopic] = useState(
    defaultTopic || `${companyName} — Official Product Launch`
  );
  const [scriptContent, setScriptContent] = useState(
    `Welcome to ${companyName}. We are revolutionizing the market with autonomous intelligence, fast logistics, and seamless commerce.\n\nOur customers enjoy instant fulfillment, automated customer support, and uncompromised quality.\n\nOrder today or visit our storefront to experience the next generation of commerce.`
  );

  const {
    isGenerating,
    progress,
    status,
    error,
    videoUrl,
    jobId,
    generateVideo,
    exportVideo,
    reset,
  } = useAnimationGeneration();

  const handleGenerate = async () => {
    if (!scriptTopic.trim()) return;

    const paragraphs = scriptContent.trim()
      ? scriptContent.trim().split(/\n\n+/).filter(Boolean)
      : [scriptTopic];

    const slideDeck = {
      id: `deck-${Date.now()}`,
      title: scriptTopic,
      slides: paragraphs.map((para, i) => ({
        id: `slide-${i + 1}`,
        title: i === 0 ? scriptTopic : `Scene ${i + 1}`,
        content: para.trim(),
        speakerNotes: para.trim(),
        layout: i === 0 ? "title" : "content",
      })),
    };

    try {
      await generateVideo({
        slideDeck,
        template: selectedTemplate,
        resolution: "1080p",
        frameRate: "30fps",
        voice: {
          provider: "elevenlabs",
          voiceId: "professional-presenter",
          stability: 0.5,
          similarityBoost: 0.75,
          useSpeakerBoost: true,
        },
        music: {
          provider: "suno",
          mood: "professional",
          instrumental: true,
        },
        subtitles: true,
        watermark: false,
      });
      setActiveTab("render");
    } catch (err) {
      console.error("Twin video generation failed:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-2xl">
        <DialogHeader className="pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Clapperboard className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  Twin Video & Reels Studio
                  <Badge variant="outline" className="text-[10px] font-mono border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/5">
                    1080p 30fps
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-zinc-400">
                  Generate animated explainer reels and video presentations in {companyName}&apos;s founder voice.
                </DialogDescription>
              </div>
            </div>

            <Badge variant="secondary" className="text-xs font-mono">
              Persona: {twinPersona}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-4 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl">
            <TabsTrigger value="script" className="text-xs gap-1.5 cursor-pointer">
              <Film className="w-3.5 h-3.5" /> Script & Story
            </TabsTrigger>
            <TabsTrigger value="template" className="text-xs gap-1.5 cursor-pointer">
              <Sliders className="w-3.5 h-3.5" /> Template
            </TabsTrigger>
            <TabsTrigger value="voice" className="text-xs gap-1.5 cursor-pointer">
              <Mic className="w-3.5 h-3.5" /> Founder Voice
            </TabsTrigger>
            <TabsTrigger value="render" className="text-xs gap-1.5 cursor-pointer">
              <Video className="w-3.5 h-3.5" /> Render & Export
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Script */}
          <TabsContent value="script" className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Video Presentation Title
              </label>
              <input
                type="text"
                value={scriptTopic}
                onChange={(e) => setScriptTopic(e.target.value)}
                placeholder="e.g. Summer Collection Launch 2026"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Storyboard Script (Paragraphs become animated scenes)
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {scriptContent.split(/\n\n+/).filter(Boolean).length} Scenes
                </span>
              </div>
              <textarea
                value={scriptContent}
                onChange={(e) => setScriptContent(e.target.value)}
                rows={6}
                placeholder="Enter scene narrative here..."
                className="w-full p-3.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-500/50 leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("template")}
                className="text-xs cursor-pointer"
              >
                Next: Select Template &rarr;
              </Button>
            </div>
          </TabsContent>

          {/* Tab 2: Template */}
          <TabsContent value="template" className="space-y-4 pt-4">
            <TemplateSelector
              templates={VIDEO_TEMPLATES}
              selected={selectedTemplate}
              onSelect={setSelectedTemplate}
            />
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("script")}
                className="text-xs cursor-pointer"
              >
                &larr; Back to Script
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("voice")}
                className="text-xs cursor-pointer"
              >
                Next: Voice & Music &rarr;
              </Button>
            </div>
          </TabsContent>

          {/* Tab 3: Voice & Audio */}
          <TabsContent value="voice" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-purple-500" /> Twin Cloned Voice Model
                </h4>
                <VoiceSettingsPanel />
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-blue-500" /> Background Soundtrack
                </h4>
                <MusicSettingsPanel />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("template")}
                className="text-xs cursor-pointer"
              >
                &larr; Back to Template
              </Button>
              <Button
                size="sm"
                onClick={handleGenerate}
                disabled={isGenerating || !scriptTopic.trim()}
                className="text-xs cursor-pointer bg-purple-600 hover:bg-purple-700 text-white gap-1.5"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Rendering...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Start Twin Video Rendering
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Tab 4: Render & Export */}
          <TabsContent value="render" className="space-y-4 pt-4">
            {isGenerating && (
              <VideoProgress status={status} progress={progress} />
            )}

            {!isGenerating && !videoUrl && (
              <Card className="border border-dashed border-slate-200 dark:border-zinc-800 p-8 text-center">
                <CardContent className="flex flex-col items-center justify-center p-0 space-y-3">
                  <div className="p-3 rounded-full bg-slate-100 dark:bg-zinc-900 text-slate-400">
                    <Video className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
                    Ready to render video for {companyName}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Configure your script and template, then trigger high-definition rendering with AI narration.
                  </p>
                  <Button
                    size="sm"
                    onClick={handleGenerate}
                    disabled={!scriptTopic.trim()}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5 cursor-pointer mt-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Render 1080p Video Reel
                  </Button>
                </CardContent>
              </Card>
            )}

            {videoUrl && (
              <div className="space-y-4">
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-black aspect-video flex items-center justify-center relative">
                  <video
                    src={videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/40">
                  <div className="flex items-center gap-2 text-xs text-green-800 dark:text-green-300">
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span>Video generated successfully with {companyName} founder voiceover.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => reset()}
                      className="text-xs cursor-pointer"
                    >
                      Render Another
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => exportVideo("mp4")}
                      className="text-xs gap-1.5 cursor-pointer bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Download className="w-3.5 h-3.5" /> Download MP4 (1080p)
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default TwinVideoStudioModal;
