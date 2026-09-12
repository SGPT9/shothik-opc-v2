'use client';

import { useState, useEffect, useCallback } from 'react';

export interface PersonaData {
  personaId: string;
  clusterId: string;
  confidence: number;
  name: string;
  description: string;
}

export interface HEDECue {
  type: 'coordination' | 'team_goal' | 'supervisory' | 'process_transparency';
  text: string;
  lang: 'en' | 'bn' | 'banglish';
  variables?: Record<string, string>;
}

export interface RevenueTrigger {
  triggerId: string;
  title: string;
  message: string;
  amount: number;
  currency: 'BDT';
  paymentMethod: 'bkash' | 'nagad' | 'card';
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

interface UsePersonaReturn {
  persona: PersonaData | null;
  currentCue: HEDECue | null;
  revenueTriggers: RevenueTrigger[];
  isLoading: boolean;
  error: string | null;
  sendSignal: (signal: PersonaSignal) => Promise<void>;
  refreshPersona: () => Promise<void>;
}

export interface PersonaSignal {
  action: string;
  actionType?: 'normal' | 'awaiting_approval' | 'goal_update';
  eventType?: string;
  feature?: string;
  duration?: number;
  variables?: Record<string, string>;
}

/**
 * React hook for integrating with ShothikGPT Persona Engine
 * 
 * Usage:
 * ```tsx
 * const { persona, currentCue, sendSignal } = usePersona(userId);
 * 
 * // Send signal on user action
 * const handleGenerateClick = async () => {
 *   await sendSignal({
 *     action: 'generating_content',
 *     feature: 'pitch_deck',
 *     duration: 2500
 *   });
 * };
 * ```
 */
export function usePersona(userId: string): UsePersonaReturn {
  const [persona, setPersona] = useState<PersonaData | null>(null);
  const [currentCue, setCurrentCue] = useState<HEDECue | null>(null);
  const [revenueTriggers, setRevenueTriggers] = useState<RevenueTrigger[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initial persona detection on mount
   */
  const refreshPersona = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Collect initial signals from DOM/user behavior
      const signals = collectInitialSignals();

      const response = await fetch('/api/persona/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          signals,
          sessionId: getSessionId()
        })
      });

      if (!response.ok) throw new Error('Failed to detect persona');

      const result = await response.json();
      setPersona(result.data.persona);
      setCurrentCue(result.data.cue);
      setRevenueTriggers(result.data.revenueTriggers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  /**
   * Send real-time behavior signal to backend
   */
  const sendSignal = useCallback(async (signal: PersonaSignal) => {
    if (!persona) return;

    try {
      const response = await fetch('/api/persona/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          personaId: persona.personaId,
          signal,
          sessionState: { usageCount: getSessionUsageCount() }
        })
      });

      if (!response.ok) throw new Error('Failed to send signal');

      const result = await response.json();
      
      // Update cue based on action context
      setCurrentCue(result.data.cue);
      
      // Check and display revenue triggers if any
      if (result.data.revenueTriggers?.length > 0) {
        setRevenueTriggers(result.data.revenueTriggers);
      }
    } catch (err) {
      console.error('[usePersona] Signal error:', err);
    }
  }, [userId, persona]);

  // Initial detection on mount
  useEffect(() => {
    refreshPersona();
  }, [refreshPersona]);

  return {
    persona,
    currentCue,
    revenueTriggers,
    isLoading,
    error,
    sendSignal,
    refreshPersona
  };
}

/**
 * Collect initial signals from user behavior and environment
 */
function collectInitialSignals(): Record<string, any> {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    referrer: document.referrer,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timeOnPage: 0,
    entryPath: window.location.pathname,
    // Add more behavioral signals as needed
  };
}

/**
 * Get or create session ID for tracking
 */
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('shothik_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('shothik_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Get current session usage count
 */
function getSessionUsageCount(): number {
  const count = sessionStorage.getItem('shothik_usage_count');
  return count ? parseInt(count, 10) : 0;
}

/**
 * Increment session usage count
 */
export function incrementSessionUsage(): void {
  const current = getSessionUsageCount();
  sessionStorage.setItem('shothik_usage_count', String(current + 1));
}
