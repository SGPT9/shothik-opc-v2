'use client';

import React from 'react';
import { HEDECue } from './use-persona';

interface HEDECueBannerProps {
  cue: HEDECue;
  variant?: 'default' | 'compact' | 'prominent';
  showIcon?: boolean;
  className?: string;
}

/**
 * Renders HE-DE Collaboration Cue Banner
 * 
 * Displays contextual status messages that show coordination between
 * Human Employee (HE) and Digital Employee (DE) to build trust and
 * process fluency.
 * 
 * Examples:
 * - "I have verified the bKash TrxID. Triggering Steadfast API..."
 * - "Our joint goal: Reduce your 22% COD return rate"
 * - "Draft ready. Awaiting your approval before sending."
 */
export function HEDECueBanner({ 
  cue, 
  variant = 'default',
  showIcon = true,
  className = ''
}: HEDECueBannerProps) {
  // Icon mapping by cue type
  const icons = {
    coordination: '🔄',
    team_goal: '🎯',
    supervisory: '✅',
    process_transparency: '📊'
  };

  // Color mapping by cue type
  const colors = {
    coordination: 'bg-blue-50 border-blue-200 text-blue-900',
    team_goal: 'bg-green-50 border-green-200 text-green-900',
    supervisory: 'bg-orange-50 border-orange-200 text-orange-900',
    process_transparency: 'bg-purple-50 border-purple-200 text-purple-900'
  };

  // Size variants
  const variants = {
    default: 'px-4 py-3 text-sm',
    compact: 'px-3 py-2 text-xs',
    prominent: 'px-6 py-4 text-base'
  };

  const baseClasses = `border-l-4 rounded-r-lg shadow-sm ${colors[cue.type]} ${variants[variant]} ${className}`;

  return (
    <div className={baseClasses} role="status" aria-live="polite">
      <div className="flex items-start gap-3">
        {showIcon && (
          <span className="text-lg flex-shrink-0" aria-hidden="true">
            {icons[cue.type]}
          </span>
        )}
        <div className="flex-1">
          <p className="font-medium mb-1">
            {cue.type === 'coordination' && 'Processing'}
            {cue.type === 'team_goal' && 'Our Goal'}
            {cue.type === 'supervisory' && 'Awaiting Review'}
            {cue.type === 'process_transparency' && 'Activity Summary'}
          </p>
          <p className="opacity-90">{cue.text}</p>
          {cue.lang === 'bn' || cue.lang === 'banglish' ? (
            <p className="text-xs mt-1 opacity-75 italic">
              (বাংলা / Banglish)
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/**
 * Loading skeleton for HE-DE cues
 */
export function HEDECueSkeleton() {
  return (
    <div className="border-l-4 border-gray-200 bg-gray-50 rounded-r-lg px-4 py-3 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 bg-gray-200 rounded"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  );
}

export default HEDECueBanner;
