# Voice Engine Implementation Roadmap

## Overview
This document outlines the 5-week implementation plan for enhancing Shothik's Unified Voice Agent to match ChatGPT-level conversational quality while maintaining South Asian cultural specificity.

---

## Week 1: Full-Duplex Audio ✅

**Status**: IMPLEMENTED

### Files Created
- `packages/voice-engine/src/FullDuplexStream.ts` (149 lines)

### Features Implemented
- ✅ **Interruption Detection**: Monitors audio dB levels in real-time
- ✅ **Barge-in Handling**: Immediately stops AI speech when user interrupts
- ✅ **Volume Ducking**: Reduces output volume during interruption
- ✅ **State Management**: Emits state changes (IDLE → LISTENING → SPEAKING → INTERRUPTED)
- ✅ **Configurable Thresholds**: Adjustable sensitivity for different environments

### Key Configuration
```typescript
const config = {
  interruptionThreshold: -45, // dB level to trigger
  duckingFactor: 0.2, // Volume reduction
  minInterruptionDuration: 300, // ms
  echoCancellation: true,
};
```

### Testing Checklist
- [ ] Test interruption during long AI responses
- [ ] Verify no false positives from background noise
- [ ] Measure latency from interruption to AI silence (<200ms target)
- [ ] Test with Bangla/Banglish code-switching

---

## Week 2: Emotion/Tone Analysis ✅

**Status**: IMPLEMENTED

### Files Created
- `packages/voice-engine/src/EmotionAnalyzer.ts` (221 lines)

### Features Implemented
- ✅ **Sentiment Analysis**: Positive/Negative/Neutral detection
- ✅ **6 Emotion Types**: Neutral, Happy, Frustrated, Urgent, Confused, Satisfied
- ✅ **Bangla/Banglish Keyword Detection**: Culturally-specific emotion indicators
- ✅ **Frustration Tracking**: Counts consecutive frustrated interactions
- ✅ **Escalation Triggers**: Emits event when frustration threshold exceeded
- ✅ **Tone Adjustment Recommendations**: Speed, pitch, volume, warmth, formality

### Emotion Keywords (Bangla/Banglish)
| Emotion | Keywords |
|---------|----------|
| **Urgent** | জরুরি, joruri, তাড়াতাড়ি, taratari, দ্রুত, druto |
| **Frustrated** | হাল ছেড়ে দিলাম, কাজ করছে না, বাজে, ভুল, barbar |
| **Satisfied** | চমৎকার, দারুণ, ধন্যবাদ, সাহায্য, excellent |

### Tone Adjustment Matrix
| Emotion | Speed | Pitch | Warmth | Formality |
|---------|-------|-------|--------|-----------|
| Urgent | 1.3x | 1.0x | 0.3 | Professional |
| Frustrated | 0.8x | 0.9x | 0.9 | Empathetic |
| Confused | 0.7x | 1.0x | 0.7 | Empathetic |
| Happy | 1.1x | 1.0x | 0.8 | Casual |

### Testing Checklist
- [ ] Test with real Bangla emotional phrases
- [ ] Verify escalation triggers after 3 frustrated interactions
- [ ] Measure accuracy vs manual labeling (target >75%)
- [ ] Test language mix detection (Bangla/English/Banglish)

---

## Week 3: Voice Memory Layer ⏳

**Status**: PENDING

### Planned Files
- `packages/voice-engine/src/VoiceMemoryService.ts`
- `packages/db/schema/voice-preferences.ts`

### Features to Implement
- [ ] **User Voice Preferences Persistence**
  - Preferred speed (0.5x - 2.0x)
  - Preferred pitch adjustment
  - Language mix ratios (Bangla/English/Banglish)
  - Formive preference (casual/professional)
  
- [ ] **Command History per Persona**
  - Track frequent commands
  - Predict next action based on time/context
  - Shortcut suggestions
  
- [ ] **Voice Print Storage** (Optional)
  - Speaker identification
  - Personalized wake words
  - Security authentication

### Database Schema (Planned)
```sql
CREATE TABLE voice_preferences (
  user_id UUID PRIMARY KEY,
  persona_id VARCHAR(50),
  preferred_speed FLOAT DEFAULT 1.0,
  preferred_pitch FLOAT DEFAULT 1.0,
  language_mix_bangla INT DEFAULT 40,
  language_mix_english INT DEFAULT 40,
  language_mix_banglish INT DEFAULT 20,
  formality_preference VARCHAR(20) DEFAULT 'professional',
  frequent_commands JSONB,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);
```

### Testing Checklist
- [ ] Verify preferences load on session start
- [ ] Test cross-device synchronization
- [ ] Validate privacy controls (opt-out options)
- [ ] Measure query performance (<50ms target)

---

## Week 4: Enhanced Noise Cancellation ⏳

**Status**: PENDING

### Planned Files
- `packages/voice-engine/src/NoiseCanceller.ts`
- `packages/voice-engine/tests/street-noise-samples/`

### Features to Implement
- [ ] **RNNoise Integration**
  - Real-time noise suppression
  - Adaptive filtering
  - Low CPU usage (<5% on mobile)
  
- [ ] **Bangladesh-Specific Noise Profiles**
  - Rickshaw horns
  - Street vendors
  - Construction sounds
  - Market crowd noise
  - Monsoon rain
  
- [ ] **Environment Detection**
  - Auto-detect noisy vs quiet environment
  - Adjust noise cancellation aggressiveness
  - Notify user if environment too noisy

### Testing Protocol
```bash
# Field testing locations
1. Mirpur Road (heavy traffic)
2. New Market (crowded bazaar)
3. Farmgate (bus stand)
4. Residential area (quiet baseline)
5. Coffee shop (moderate ambient)
```

### Testing Checklist
- [ ] Test in actual Bangladesh street conditions
- [ ] Measure SNR improvement (target >15dB)
- [ ] Verify no voice distortion
- [ ] Test on low-end Android devices
- [ ] Profile CPU/battery impact

---

## Week 5: Persona-Specific Voice Profiles ✅

**Status**: IMPLEMENTED

### Files Created
- `packages/voice-engine/src/PersonaVoiceProfiles.ts` (345 lines)

### Features Implemented
- ✅ **4 Complete Voice Profiles**
  - Rina (F-commerce): Fast, transactional, emoji-rich
  - Dr. Rahman (Academic): Formal, precise, citation-aware
  - Karim (Creator): Energetic, trendy, casual
  - Ahmed (SME): Professional, authoritative, compliance-focused

### Profile Characteristics

| Attribute | F-Commerce | Academic | Creator | SME |
|-----------|------------|----------|---------|-----|
| **Speed** | 1.2x | 0.9x | 1.3x | 1.0x |
| **Pitch** | 1.05 | 0.95 | 1.1 | 0.95 |
| **Warmth** | 0.7 | 0.5 | 0.9 | 0.5 |
| **Formality** | Casual | Professional | Casual | Authoritative |
| **Emojis** | ✅ | ❌ | ✅ | ❌ |
| **Bangla %** | 40 | 30 | 35 | 40 |
| **English %** | 30 | 60 | 35 | 50 |
| **Banglish %** | 30 | 10 | 30 | 10 |

### Sample Phrases Included
- 5 greetings per persona
- 5 confirmations per persona
- 5 apologies per persona
- 5 success messages per persona
- 5 error messages per persona

All phrases include authentic Bangla/Banglish code-switching patterns.

### Testing Checklist
- [ ] Verify correct profile loads with persona switch
- [ ] Test phrase selection in context
- [ ] Validate language mix matches persona
- [ ] User testing with representative users from each persona
- [ ] A/B test engagement metrics

---

## Integration Guide

### Using the Voice Engine

```typescript
import { FullDuplexStream } from '@shothik/voice-engine';
import { EmotionAnalyzer } from '@shothik/voice-engine';
import { getVoiceProfile, PersonaId } from '@shothik/voice-engine';

// Initialize
const voiceEngine = new FullDuplexStream({
  interruptionThreshold: -45,
  echoCancellation: true,
});

const emotionAnalyzer = new EmotionAnalyzer();

// Start session
await voiceEngine.startSession();

// Handle user speech
voiceEngine.on('transcript', async (transcript) => {
  // Analyze emotion
  const emotion = emotionAnalyzer.analyzeText(transcript, PersonaId.F_COMMERCE);
  
  // Get persona profile
  const profile = getVoiceProfile(PersonaId.F_COMMERCE);
  
  // Adjust tone based on emotion
  const adjustment = emotionAnalyzer.getToneAdjustment(emotion, PersonaId.F_COMMERCE);
  
  // Generate response with adjusted voice
  await voiceEngine.speak(response, {
    personaId: PersonaId.F_COMMERCE,
    speed: profile.baseSpeed * adjustment.speed,
    warmth: adjustment.warmth,
  });
});

// Handle interruptions
voiceEngine.on('interruption', () => {
  console.log('User interrupted! Adjusting response...');
});

// Handle frustration escalation
emotionAnalyzer.on('escalation-needed', (data) => {
  console.warn('User frustrated! Consider human handover:', data);
});
```

---

## Success Metrics

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Interruption Latency | N/A | <200ms | Time from speech to AI silence |
| Emotion Detection Accuracy | N/A | >75% | Vs manual labeling |
| Noise Reduction | N/A | >15dB SNR | Lab measurements |
| User Satisfaction | 3.2/5 | 4.5/5 | Post-call surveys |
| Session Duration | 2.1 min | 4.5 min | Analytics |
| Persona Switch Rate | N/A | >60% | Users trying multiple personas |

---

## Dependencies

### Required Packages
```json
{
  "dependencies": {
    "rnnoise-wasm": "^1.0.0",
    "@tensorflow-models/speech-commands": "^0.5.0",
    "node-audio-fingerprint": "^2.1.0"
  },
  "devDependencies": {
    "wav": "^1.0.2",
    "noise-reduction-data": "^1.0.0"
  }
}
```

### Hardware Requirements
- Microphone: Any standard mic (tested with smartphone mics)
- CPU: Minimum dual-core (optimized for low-end Android)
- RAM: 512MB minimum
- Network: 3G sufficient (audio compression optimized)

---

## Next Steps

1. **Week 3 Kickoff**: Begin Voice Memory Layer implementation
2. **Field Testing**: Schedule Week 4 noise testing in Dhaka locations
3. **User Research**: Recruit 4 users (one per persona) for Week 5 validation
4. **Performance Audit**: Profile CPU/memory usage of current implementation
5. **Security Review**: Ensure voice data encryption and privacy compliance

---

## Related Documentation

- [Context Engineering Specs](../context-engineering/)
- [Persona Documentation](../personas/)
- [UI/UX Design Philosophy](../design/README.md)
- [Architecture Audit](../architecture/ARCHITECTURE_AUDIT_AND_MIGRATION_PLAN.md)
