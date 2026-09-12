import { NextRequest, NextResponse } from 'next/server';
import { PersonaEngine } from '@shothik/persona-engine';

// Initialize singleton engine instance
const engine = new PersonaEngine();

/**
 * POST /api/persona/detect
 * 
 * Detects user persona based on signals and returns:
 * - Detected persona ID and cluster
 * - Initial HE-DE cues to display
 * - Relevant revenue triggers
 * - Context profile for this persona
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, signals, sessionId } = body;

    if (!signals || typeof signals !== 'object') {
      return NextResponse.json(
        { error: 'Missing or invalid signals' },
        { status: 400 }
      );
    }

    // Detect persona from signals
    const detection = await engine.detectPersona(signals, userId);

    // Get initial HE-DE welcome cue
    const welcomeCue = engine.getCue(detection.personaId, 'coordination', {
      userName: signals.userName || 'User',
      context: 'initialization'
    });

    // Check for immediate revenue triggers
    const triggers = engine.checkRevenueTriggers(detection.personaId, {
      eventType: 'session_start',
      metadata: { isFirstSession: !sessionId }
    });

    // Return comprehensive response
    return NextResponse.json({
      success: true,
      data: {
        persona: detection,
        cue: {
          type: 'coordination',
          text: welcomeCue.text,
          lang: welcomeCue.lang,
          variables: welcomeCue.variables
        },
        revenueTriggers: triggers,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[Persona API] Detection error:', error);
    return NextResponse.json(
      { error: 'Failed to detect persona' },
      { status: 500 }
    );
  }
}
