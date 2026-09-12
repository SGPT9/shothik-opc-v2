import { NextRequest, NextResponse } from 'next/server';
import { PersonaEngine } from '@shothik/persona-engine';

const engine = new PersonaEngine();

/**
 * POST /api/persona/signal
 * 
 * Receives real-time user behavior signals and returns:
 * - Updated HE-DE cues based on current action
 * - Revenue trigger checks (e.g., free limit exhausted)
 * - Persona confidence updates
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, personaId, signal, sessionState } = body;

    if (!userId || !signal) {
      return NextResponse.json(
        { error: 'Missing userId or signal' },
        { status: 400 }
      );
    }

    // Update persona state with new signal
    const updatedState = await engine.updatePersonaSignal(userId, signal);

    // Get context-aware HE-DE cue for this action
    let cueType = 'coordination';
    if (signal.actionType === 'awaiting_approval') {
      cueType = 'supervisory';
    } else if (signal.actionType === 'goal_update') {
      cueType = 'team_goal';
    }

    const cue = engine.getCue(personaId, cueType, {
      action: signal.action,
      result: signal.result,
      ...signal.variables
    });

    // Check for revenue triggers
    const triggers = engine.checkRevenueTriggers(personaId, {
      eventType: signal.eventType,
      metadata: {
        usageCount: sessionState?.usageCount || 0,
        featureUsed: signal.feature,
        timeOnTask: signal.duration
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        cue: {
          type: cueType,
          text: cue.text,
          lang: cue.lang,
          variables: cue.variables
        },
        revenueTriggers: triggers,
        state: updatedState,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[Persona API] Signal processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process signal' },
      { status: 500 }
    );
  }
}
