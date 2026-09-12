# Frontend Integration Guide: Persona Engine

## Overview

This guide explains how to integrate the ShothikGPT Persona Engine into your React/Next.js frontend components. The integration follows a **backend-driven architecture** where all persona logic runs server-side, and the frontend simply renders instructions received from the backend.

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Frontend      │         │   Backend API    │         │  Persona Engine │
│  (React/Next)   │ ◄────►  │  (/api/persona)  │ ◄────►  │  (@shothik/     │
│                 │         │                  │         │   persona-engine)│
└─────────────────┘         └──────────────────┘         └─────────────────┘
       │                            │                            │
       │ 1. Send user signals       │                            │
       ├───────────────────────────►│                            │
       │                            │ 2. Detect persona          │
       │                            ├───────────────────────────►│
       │                            │                            │
       │                            │ 3. Return cue + triggers   │
       │                            │◄───────────────────────────┤
       │ 4. Render UI               │                            │
       │◄───────────────────────────┤                            │
```

## Quick Start

### 1. Import Components

```tsx
import { 
  usePersona, 
  HEDECueBanner, 
  RevenueTriggerModal,
  incrementSessionUsage 
} from '@/components/persona';
```

### 2. Basic Usage in Page Component

```tsx
'use client';

import { usePersona, HEDECueBanner, RevenueTriggerModal } from '@/components/persona';

export default function DashboardPage({ userId }: { userId: string }) {
  const { 
    persona, 
    currentCue, 
    revenueTriggers, 
    sendSignal,
    isLoading 
  } = usePersona(userId);

  const handleGenerateClick = async () => {
    // Track user action
    await sendSignal({
      action: 'generating_pitch_deck',
      feature: 'genoffice_sheets',
      duration: 2500
    });

    // Your existing logic
    await generatePitchDeck();
    
    // Increment usage counter
    incrementSessionUsage();
  };

  if (isLoading) return <div>Loading persona...</div>;

  return (
    <div className="space-y-4">
      {/* Display HE-DE Cue */}
      {currentCue && (
        <HEDECueBanner cue={currentCue} variant="default" />
      )}

      {/* Your main content */}
      <button onClick={handleGenerateClick}>
        Generate Pitch Deck
      </button>

      {/* Revenue Trigger Modal (if any) */}
      {revenueTriggers.length > 0 && (
        <RevenueTriggerModal
          triggers={revenueTriggers}
          onDismiss={() => {}} // Handle dismiss
          onPayment={async (trigger) => {
            // Handle payment via bKash/Nagad
            await initiatePayment(trigger);
          }}
        />
      )}
    </div>
  );
}
```

## Component Reference

### `usePersona(userId: string)`

React hook that manages persona state and communication with backend.

**Returns:**
- `persona: PersonaData | null` - Detected persona information
- `currentCue: HEDECue | null` - Current HE-DE collaboration cue
- `revenueTriggers: RevenueTrigger[]` - Active payment prompts
- `isLoading: boolean` - Loading state
- `error: string | null` - Error message if detection failed
- `sendSignal(signal: PersonaSignal) => Promise<void>` - Send behavior signal
- `refreshPersona() => Promise<void>` - Re-detect persona

**Example Signals:**
```tsx
// Normal action
await sendSignal({
  action: 'downloading_report',
  feature: 'research_export'
});

// Awaiting approval (triggers supervisory cue)
await sendSignal({
  action: 'draft_ready',
  actionType: 'awaiting_approval'
});

// Goal update (triggers team_goal cue)
await sendSignal({
  action: 'cod_reduction_achieved',
  actionType: 'goal_update',
  variables: { reduction: '15%' }
});
```

### `<HEDECueBanner />`

Displays contextual status messages showing HE-DE collaboration.

**Props:**
- `cue: HEDECue` - Cue object from `usePersona`
- `variant?: 'default' | 'compact' | 'prominent'` - Size variant
- `showIcon?: boolean` - Show/hide icon (default: true)
- `className?: string` - Additional CSS classes

**Example:**
```tsx
<HEDECueBanner 
  cue={currentCue} 
  variant="prominent"
  className="mb-6"
/>
```

### `<RevenueTriggerModal />`

Displays payment prompts at moments of peak operational pain.

**Props:**
- `triggers: RevenueTrigger[]` - Array of triggers from `usePersona`
- `onDismiss: () => void` - Dismiss modal handler
- `onPayment: (trigger) => Promise<void>` - Payment handler

**Example:**
```tsx
{revenueTriggers.length > 0 && (
  <RevenueTriggerModal
    triggers={revenueTriggers}
    onDismiss={() => setTriggers([])}
    onPayment={async (trigger) => {
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        body: JSON.stringify({ triggerId: trigger.triggerId })
      });
      // Handle payment flow
    }}
  />
)}
```

## API Endpoints

### `POST /api/persona/detect`

Initial persona detection.

**Request:**
```json
{
  "userId": "user_123",
  "signals": {
    "userAgent": "Mozilla/5.0...",
    "language": "bn-BD",
    "entryPath": "/dashboard"
  },
  "sessionId": "session_abc"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "persona": {
      "personaId": "f_commerce_operator",
      "clusterId": "digital_cod_merchant",
      "confidence": 0.92,
      "name": "Digital/COD Merchant"
    },
    "cue": {
      "type": "coordination",
      "text": "I have verified the bKash TrxID. Triggering Steadfast API...",
      "lang": "en"
    },
    "revenueTriggers": []
  }
}
```

### `POST /api/persona/signal`

Real-time behavior signal.

**Request:**
```json
{
  "userId": "user_123",
  "personaId": "f_commerce_operator",
  "signal": {
    "action": "verifying_trxid",
    "actionType": "normal",
    "feature": "bkash_integration",
    "duration": 1200
  },
  "sessionState": {
    "usageCount": 5
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cue": {
      "type": "coordination",
      "text": "I have verified the 10-digit bKash TrxID. I am now triggering the Steadfast Courier API to dispatch the order.",
      "lang": "en"
    },
    "revenueTriggers": [
      {
        "triggerId": "cod_protection_monthly",
        "title": "Automated Reconciliation & COD Protection",
        "message": "Stop losing money to unmatched payments. Get automated TrxID verification and dispatch.",
        "amount": 499,
        "currency": "BDT",
        "paymentMethod": "bkash",
        "urgency": "high"
      }
    ]
  }
}
```

## Best Practices

### 1. Send Signals Strategically

Don't spam signals. Send them at meaningful interaction points:
- ✅ Feature usage start/end
- ✅ Task completion
- ✅ User waiting periods
- ❌ Every keystroke
- ❌ Mouse movements

### 2. Handle Loading States

```tsx
if (isLoading) {
  return <HEDECueSkeleton />;
}
```

### 3. Respect User Context

Use persona information to tailor UI:
```tsx
{persona?.personaId === 'academic_researcher' && (
  <AcademicToolbar features={['citation', 'latex_export']} />
)}

{persona?.personaId === 'f_commerce_operator' && (
  <MerchantToolbar features=['bkash_verify', 'courier_dispatch']} />
)}
```

### 4. Mobile-First Design

All components are optimized for mobile. Test on 320px width screens.

### 5. Payment Flow

Always route payments through secure backend endpoints. Never expose payment logic to frontend.

## Troubleshooting

### Persona not detecting correctly
- Check that signals contain sufficient data (referrer, entry path, language)
- Verify backend API is receiving requests (check logs)
- Ensure user has performed enough actions for confident detection

### Cues not updating
- Verify `sendSignal` is called before major actions
- Check that signal `actionType` matches intended cue type
- Review backend logs for cue generation errors

### Revenue triggers not appearing
- Confirm user has exhausted free limits or hit trigger conditions
- Check persona-specific trigger configuration
- Verify backend revenue trigger logic

## Next Steps

1. **Context Engine Integration**: Connect persona to context profiles for personalized RAG
2. **A/B Testing**: Experiment with different cue variants and pricing
3. **Analytics**: Track conversion rates by persona and trigger type
4. **Localization**: Add more Bangla/Banglish cue templates

## Support

For issues or questions, refer to:
- `/workspace/docs/context-engineering/` - Context architecture docs
- `/workspace/packages/persona-engine/README.md` - Backend API reference
- `/workspace/docs/personas/` - Complete persona documentation
