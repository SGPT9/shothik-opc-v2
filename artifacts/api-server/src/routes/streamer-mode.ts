import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { logger } from "../lib/logger";

export const streamerModeRouter = Router();

export interface StreamPollOption {
  id: string;
  label: string;
  labelBn: string;
  votes: number;
  percentage: number;
  narrativeTrajectory: string;
}

export interface StreamPoll {
  pollId: string;
  question: string;
  questionBn: string;
  options: StreamPollOption[];
  totalVotes: number;
  status: "ACTIVE" | "CONCLUDED";
  secondsRemaining: number;
  winningOptionId?: string;
}

export interface StreamerChatIdea {
  id: string;
  username: string;
  badge: "VIP" | "MOD" | "FOUNDER" | "SUBSCRIBER";
  avatarColor: string;
  message: string;
  suggestedAction: string;
  upvotes: number;
}

export interface StreamerSessionResponse {
  projectId: string;
  isLive: boolean;
  platform: "twitch" | "youtube" | "kick" | "discord";
  channelName: string;
  streamTitle: string;
  viewerCount: number;
  chatVelocityMpm: number;
  activePoll: StreamPoll;
  chatHighlights: StreamerChatIdea[];
  coWritingPrompt: string;
  suggestedBranchProse: Record<string, string>;
}

export function generateStreamerSession(text: string, projectId: string): StreamerSessionResponse {
  const words = text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const isBengali = /[\u0980-\u09FF]/.test(text);

  const defaultPoll: StreamPoll = {
    pollId: `poll_${Date.now()}`,
    question: "How should the protagonist react to the sudden knock on the door?",
    questionBn: "দরজায় আচমকা করাঘাত শুনে প্রধান চরিত্রের পরবর্তী পদক্ষেপ কী হওয়া উচিত?",
    options: [
      {
        id: "opt_stealth",
        label: "Option A: Slip quietly out the back window into the rain",
        labelBn: "অপশন ক: পেছনের খোলা জানালা দিয়ে নিঃশব্দে বৃষ্টির মধ্যে পালিয়ে যাওয়া",
        votes: 624,
        percentage: 46,
        narrativeTrajectory: "Focuses on evasion, sensory atmosphere, and night pursuit across narrow alleyways."
      },
      {
        id: "opt_confront",
        label: "Option B: Open the door weapon in hand and demand answers",
        labelBn: "অপশন খ: হাতে ভারী বস্তু তুলে নিয়ে সরাসরি দরজা খুলে মুখোমুখি হওয়া",
        votes: 488,
        percentage: 36,
        narrativeTrajectory: "High-octane confrontation revealing a shocking identity behind the caller."
      },
      {
        id: "opt_misdirect",
        label: "Option C: Pretend the house is abandoned and whisper a fake name",
        labelBn: "অপশন গ: ঘর অন্ধকার করে মৃত মানুষের মতো নিশ্চুপ থাকা এবং ভুল নামে উত্তর দেওয়া",
        votes: 242,
        percentage: 18,
        narrativeTrajectory: "Psychological mind game testing whether the visitor knows their secret."
      }
    ],
    totalVotes: 1354,
    status: "ACTIVE",
    secondsRemaining: 48,
    winningOptionId: "opt_stealth"
  };

  const chatHighlights: StreamerChatIdea[] = [
    {
      id: "chat-1",
      username: "CyberBaul_99",
      badge: "VIP",
      avatarColor: "#f59e0b",
      message: "ভাই হিমুকে দিয়ে এক কাপ গরম চা চাইতে বলুন! পুলিশ অফিসার ভড়কে যাবে!",
      suggestedAction: "Incorporate absurd tea request to disarm tension.",
      upvotes: 142
    },
    {
      id: "chat-2",
      username: "DhakaNoirFan",
      badge: "FOUNDER",
      avatarColor: "#ec4899",
      message: "Don't let them escape too easily—make the rain knock out the corridor bulb!",
      suggestedAction: "Trigger an electrical short-circuit blackout.",
      upvotes: 98
    },
    {
      id: "chat-3",
      username: "PoeticCoder",
      badge: "SUBSCRIBER",
      avatarColor: "#06b6d4",
      message: "বাতাসে কাঁচা মাটির গন্ধের সাথে ভেজা কাঠের পোড়া গন্ধ মেশান।",
      suggestedAction: "Deepen sensory dread with smoky petrichor.",
      upvotes: 75
    }
  ];

  const suggestedBranchProse: Record<string, string> = {
    opt_stealth: isBengali
      ? "সে একমুহূর্তও দ্বিধা করল না। জুতোজোড়া হাতে তুলে নিয়ে খোলা জানালার কার্নিশে পা রাখল। নিচে কাদাপানি ছিটকে উঠল, আর ঠিক সেই মুহূর্তে সামনের সদর দরজাটা বিকট শব্দে ভেঙে পড়ল।"
      : "He didn't hesitate for a heartbeat. Slipping his shoes into one hand, he swung out onto the rain-slicked windowsill. Behind him, the front door splintered open under a heavy boot.",
    opt_confront: isBengali
      ? "দরজার হাতলে তার ভেজা আঙুল শক্ত হয়ে চেপে বসল। বুকের ভেতর হৃৎপিণ্ডের প্রতিটি ঘা স্পষ্ট শোনা যাচ্ছে। এক ঝটকায় ছিটকিনি নামিয়ে সে দরজা হাট করে খুলে দিল।"
      : "His damp fingers wrapped tight around the cold brass latch. With a single sharp motion, he threw the bolt open and faced whatever stood in the storm.",
    opt_misdirect: isBengali
      ? "সে নিঃশ্বাস আটকে দাঁড়িয়ে রইল। দেয়ালের গায়ে সেঁটে গিয়ে সে গলার স্বর বদলে অস্পষ্ট ভাঙা গলায় বলে উঠল, 'কে ওখানে? চৌধুরী সাহেব তো হাসপাতালে...'"
      : "Holding his breath flat against the peeling wallpaper, he pitched his voice into a cracked, unrecognizable rasp: 'Who's there? The master was taken to the hospital hours ago...'"
  };

  return {
    projectId,
    isLive: true,
    platform: "twitch",
    channelName: "shothik_author_live",
    streamTitle: "🔴 [LIVE] Interactive Story Crafting: Writing Chapter 5 with Twitch Chat",
    viewerCount: 1420,
    chatVelocityMpm: 48,
    activePoll: defaultPoll,
    chatHighlights,
    coWritingPrompt: "Audience favored Option A (Stealth Escape) with 46% majority vote.",
    suggestedBranchProse
  };
}

const SESSION_ROUTES = [
  "/v1/projects/:projectId/streamer-mode/session",
  "/api/v1/projects/:projectId/streamer-mode/session"
];

for (const path of SESSION_ROUTES) {
  streamerModeRouter.get(path, (req: Request, res: Response) => {
    try {
      const rawId = req.params.projectId;
      const projectId = (Array.isArray(rawId) ? rawId[0] : rawId) || "default";
      const sampleText = "বাইরে তখন মুষলধারে বৃষ্টি। সদর দরজায় হঠাৎ তিনবার ভারী করাঘাত পড়ল।";

      const session = generateStreamerSession(sampleText, projectId);
      res.status(200).json(session);
      return;
    } catch (err: any) {
      logger.error("[StreamerMode] Error fetching streamer session:", err);
      res.status(500).json({ error: "Failed to fetch streamer session", details: err.message });
      return;
    }
  });
}

const pollSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string().min(1)).min(2)
});

const CREATE_POLL_ROUTES = [
  "/v1/projects/:projectId/streamer-mode/create-poll",
  "/api/v1/projects/:projectId/streamer-mode/create-poll"
];

for (const path of CREATE_POLL_ROUTES) {
  streamerModeRouter.post(path, (req: Request, res: Response) => {
    try {
      const parsed = pollSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid poll payload", issues: parsed.error.issues });
        return;
      }

      const rawId = req.params.projectId;
      const projectId = (Array.isArray(rawId) ? rawId[0] : rawId) || "default";

      const total = 100;
      const perOption = Math.floor(total / parsed.data.options.length);

      const newPoll: StreamPoll = {
        pollId: `poll_${Date.now()}`,
        question: parsed.data.question,
        questionBn: parsed.data.question,
        options: parsed.data.options.map((opt, i) => ({
          id: `opt_${i + 1}`,
          label: opt,
          labelBn: opt,
          votes: perOption,
          percentage: perOption,
          narrativeTrajectory: `Branch leads deeper into chosen direction: ${opt}`
        })),
        totalVotes: total,
        status: "ACTIVE",
        secondsRemaining: 60,
        winningOptionId: "opt_1"
      };

      res.status(201).json({
        success: true,
        projectId,
        poll: newPoll
      });
      return;
    } catch (err: any) {
      logger.error("[StreamerMode] Error creating poll:", err);
      res.status(500).json({ error: "Failed to create poll", details: err.message });
      return;
    }
  });
}

const voteSchema = z.object({
  pollId: z.string(),
  optionId: z.string()
});

const VOTE_ROUTES = [
  "/v1/projects/:projectId/streamer-mode/vote",
  "/api/v1/projects/:projectId/streamer-mode/vote"
];

for (const path of VOTE_ROUTES) {
  streamerModeRouter.post(path, (req: Request, res: Response) => {
    try {
      const parsed = voteSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid vote payload", issues: parsed.error.issues });
        return;
      }

      const rawId = req.params.projectId;
      const projectId = (Array.isArray(rawId) ? rawId[0] : rawId) || "default";

      res.status(200).json({
        success: true,
        projectId,
        pollId: parsed.data.pollId,
        votedOptionId: parsed.data.optionId,
        newVoteCount: 625,
        updatedPercentage: 47
      });
      return;
    } catch (err: any) {
      logger.error("[StreamerMode] Error registering vote:", err);
      res.status(500).json({ error: "Failed to record vote", details: err.message });
      return;
    }
  });
}

export default streamerModeRouter;
