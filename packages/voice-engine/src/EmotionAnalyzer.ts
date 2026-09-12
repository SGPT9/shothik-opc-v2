/**
 * Shothik Voice Engine - Emotion & Tone Analyzer
 * 
 * Analyzes user voice input for sentiment, urgency, and emotional state.
 * Adjusts AI response tone based on detected emotion.
 * Critical for building trust with skeptical South Asian users.
 * 
 * Features:
 * - Sentiment analysis (Positive/Negative/Neutral)
 * - Urgency detection (Critical for F-commerce emergencies)
 * - Frustration tracking (Triggers human handover if threshold exceeded)
 * - Persona-specific emotional calibration
 */

import { EventEmitter } from 'events';

export enum EmotionType {
  NEUTRAL = 'neutral',
  HAPPY = 'happy',
  FRUSTRATED = 'frustrated',
  URGENT = 'urgent',
  CONFUSED = 'confused',
  SATISFIED = 'satisfied',
}

export interface EmotionAnalysis {
  primaryEmotion: EmotionType;
  confidence: number; // 0.0 - 1.0
  intensity: number; // 0.0 - 1.0
  sentimentScore: number; // -1.0 (negative) to 1.0 (positive)
  urgencyLevel: number; // 0-10 scale
  keywords: string[];
  languageMix: {
    bangla: number; // percentage
    english: number; // percentage
    banglish: number; // percentage
  };
}

export interface ToneAdjustment {
  speed: number; // 0.5x - 2.0x
  pitch: number; // Adjustment factor
  volume: number; // 0.0 - 1.0
  warmth: number; // Friendliness factor
  formality: 'casual' | 'professional' | 'empathetic';
}

export class EmotionAnalyzer extends EventEmitter {
  private frustrationCounter: number = 0;
  private readonly FRUSTRATION_THRESHOLD = 3; // Consecutive frustrated interactions
  
  /**
   * Analyze text transcript for emotional content
   * Uses keyword matching + heuristics optimized for Bangla/Banglish
   */
  analyzeText(transcript: string, personaId?: string): EmotionAnalysis {
    const lowerTranscript = transcript.toLowerCase();
    
    // Bangla/Banglish urgency keywords
    const urgencyKeywords = [
      'জরুরি', 'joruri', 'emergency', 'quickly', 'তাড়াতাড়ি', 'taratari',
      'ASAP', 'immediately', 'দ্রুত', 'druto', 'সমস্যা', 'somossa', 'problem'
    ];
    
    // Frustration indicators
    const frustrationKeywords = [
      'হাল ছেড়ে দিলাম', 'hal chere dilam', 'giving up', 'waste of time',
      'কাজ করছে না', 'kaj korche na', 'not working', 'বাজে', 'baje', 'terrible',
      'ভুল', 'bhul', 'wrong', 'error', 'failed', 'বারবার', 'barbar', 'again and again'
    ];
    
    // Satisfaction indicators
    const satisfactionKeywords = [
      'চমৎকার', 'chomotkar', 'excellent', 'দারুণ', 'darun', 'great',
      'ধন্যবাদ', 'dhonnobad', 'thank you', 'perfect', 'সাহায্য', 'shahojjo', 'helpful'
    ];

    let urgencyScore = 0;
    let frustrationScore = 0;
    let satisfactionScore = 0;
    const foundKeywords: string[] = [];

    // Count keyword matches
    urgencyKeywords.forEach(keyword => {
      if (lowerTranscript.includes(keyword)) {
        urgencyScore++;
        foundKeywords.push(keyword);
      }
    });

    frustrationKeywords.forEach(keyword => {
      if (lowerTranscript.includes(keyword)) {
        frustrationScore++;
        foundKeywords.push(keyword);
      }
    });

    satisfactionKeywords.forEach(keyword => {
      if (lowerTranscript.includes(keyword)) {
        satisfactionScore++;
        foundKeywords.push(keyword);
      }
    });

    // Detect language mix (simplified heuristic)
    const hasBanglaScript = /[\u0980-\u09FF]/.test(transcript);
    const hasEnglishWords = /[a-zA-Z]{3,}/.test(transcript);
    const languageMix = {
      bangla: hasBanglaScript ? 60 : 10,
      english: hasEnglishWords ? 50 : 10,
      banglish: (hasBanglaScript && hasEnglishWords) ? 80 : 0,
    };

    // Determine primary emotion
    let primaryEmotion = EmotionType.NEUTRAL;
    let sentimentScore = 0;
    let intensity = 0.3;

    if (urgencyScore >= 2 || (urgencyScore >= 1 && transcript.includes('!'))) {
      primaryEmotion = EmotionType.URGENT;
      intensity = Math.min(0.5 + (urgencyScore * 0.15), 1.0);
      sentimentScore = -0.3; // Slightly negative due to stress
    } else if (frustrationScore >= 1) {
      primaryEmotion = EmotionType.FRustrated;
      intensity = Math.min(0.4 + (frustrationScore * 0.2), 1.0);
      sentimentScore = -0.6;
      
      this.frustrationCounter++;
      if (this.frustrationCounter >= this.FRUSTRATION_THRESHOLD) {
        this.emit('escalation-needed', {
          reason: 'high-frustration',
          count: this.frustrationCounter,
          transcript
        });
      }
    } else if (satisfactionScore >= 1) {
      primaryEmotion = EmotionType.SATISFIED;
      intensity = Math.min(0.5 + (satisfactionScore * 0.15), 1.0);
      sentimentScore = 0.7;
      this.frustrationCounter = Math.max(0, this.frustrationCounter - 1); // Reset frustration
    } else if (lowerTranscript.includes('?') || lowerTranscript.includes('কিভাবে') || lowerTranscript.includes('how')) {
      primaryEmotion = EmotionType.CONFUSED;
      intensity = 0.5;
      sentimentScore = -0.1;
    }

    return {
      primaryEmotion,
      confidence: 0.75, // Would be higher with ML model
      intensity,
      sentimentScore,
      urgencyLevel: Math.min(urgencyScore * 2, 10),
      keywords: foundKeywords,
      languageMix
    };
  }

  /**
   * Generate tone adjustment recommendations based on emotion
   */
  getToneAdjustment(emotion: EmotionAnalysis, personaId?: string): ToneAdjustment {
    const baseAdjustment: ToneAdjustment = {
      speed: 1.0,
      pitch: 1.0,
      volume: 0.8,
      warmth: 0.5,
      formality: 'professional',
    };

    switch (emotion.primaryEmotion) {
      case EmotionType.URGENT:
        return {
          ...baseAdjustment,
          speed: 1.3, // Faster response
          volume: 0.9,
          warmth: 0.3,
          formality: 'professional',
        };
      
      case EmotionType.FRustrated:
        return {
          ...baseAdjustment,
          speed: 0.8, // Slower, calmer
          pitch: 0.9, // Lower, soothing
          volume: 0.7,
          warmth: 0.9, // High empathy
          formality: 'empathetic',
        };
      
      case EmotionType.HAPPY:
      case EmotionType.SATISFIED:
        return {
          ...baseAdjustment,
          speed: 1.1,
          warmth: 0.8,
          formality: personaId === 'academic' ? 'professional' : 'casual',
        };
      
      case EmotionType.CONFUSED:
        return {
          ...baseAdjustment,
          speed: 0.7, // Very slow for clarity
          volume: 0.85,
          warmth: 0.7,
          formality: 'empathetic',
        };
      
      default:
        return baseAdjustment;
    }
  }

  resetFrustrationCounter() {
    this.frustrationCounter = 0;
  }

  getFrustrationLevel(): number {
    return this.frustrationCounter;
  }
}
