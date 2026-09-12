# @shothik/persona-engine

**ShothikGPT Persona Engine** - 50-Persona Demographic Library with HE-DE Behavioral Framework

## Overview

The Persona Engine is the core intelligence layer that powers ShothikGPT's user understanding, GTM strategy, and HE-DE (Human-Digital Employee) collaboration system. It encodes the complete 50-persona demographic library synthesized from extensive market research in Bangladesh.

## Key Features

### 🎯 7 Strategic Persona Clusters
- **Academic & Student** (10 personas) - AI-detection safety, seasonal spikes
- **Founder & OPC** (5 personas) - High LTV, clear ROI
- **Digital & COD Merchant** (6 personas) - Highest stickiness, daily frequency
- **Freelancer & Creator** (5 personas) - Project-based cycles
- **Professional & Institutional** (8 personas) - Higher ARPU, team seats
- **Service SME & Field** (12 personas) - Mobile-first, vertical packs
- **Special / Emerging** (4 personas) - Strategic narrative value

### 👑 Top 5 Revenue Engine Personas
1. **Academic Climber** (Persona 1) - Trigger: AI detection scare before submission
2. **Thesis Researcher** (Persona 2) - Trigger: Complex paper parsing needs
3. **Side-Hustle Founder** (Persona 4) - Trigger: Investor meeting in 48-72h
4. **Digital/COD Merchant** (Persona 6) - Trigger: Reconciliation pain (22% COD returns)
5. **Freelancer/Gig Worker** (Persona 8) - Trigger: Client deadline + style memory

### 🤝 HE-DE Collaboration Framework
Built-in support for Interdependence Theory-based behavioral cues:
- **Coordination Cues** - Visible task handovers
- **Team Goal Cues** - Shared objective alignment
- **Supervisory Cues** - Human oversight confirmation
- **Process Transparency** - Activity summaries and metrics

### 💰 Revenue Trigger System
Pre-configured monetization triggers with:
- Urgency levels (critical/high/medium/low)
- Time-to-decision estimates
- BDT price points optimized for Bangladesh market
- Local payment methods (bKash, Nagad)

## Installation

```bash
pnpm add @shothik/persona-engine
```

## Usage

### Import Cluster Configurations

```typescript
import { 
  PERSONA_CLUSTERS, 
  getP0Clusters, 
  getClusterByPersonaId 
} from '@shothik/persona-engine';

// Get all P0 priority clusters (highest leverage)
const p0Clusters = getP0Clusters();
// Returns: academic_student, founder_opc, digital_cod_merchant

// Find cluster for a specific persona
const cluster = getClusterByPersonaId(6);
// Returns: digital_cod_merchant cluster
```

### Access Top 5 Personas

```typescript
import { 
  TOP_5_PERSONAS, 
  getTopPersonaById,
  digitalCodMerchant 
} from '@shothik/persona-engine';

// Get specific persona
const merchant = getTopPersonaById(6);
console.log(merchant?.archetype); // "F-commerce Hustler"
console.log(merchant?.stickinessScore); // 10 (highest)

// Access revenue triggers
merchant.revenueTriggers.forEach(trigger => {
  console.log(`${trigger.scenario}: ${trigger.suggestedOffer}`);
});
```

### HE-DE Collaboration Cues

```typescript
import { heDeCuesForTopPersonas } from '@shothik/persona-engine';

// Get cues for Digital/COD Merchant
const cues = heDeCuesForTopPersonas[6];

// Coordination cue example
const coordinationCue = cues.find(cue => cue.type === 'coordination');
console.log(coordinationCue?.messageTemplate);
// "I have verified the 10-digit bKash TrxID in your merchant ledger. 
//  I am now triggering the Steadfast Courier API to dispatch the order."
```

### Type-Safe Persona Data

```typescript
import type { Persona, RevenueTrigger, HeDeCue } from '@shothik/persona-engine';

function displayPersonaInfo(persona: Persona) {
  console.log(`Archetype: ${persona.archetype}`);
  console.log(`JTBD: ${persona.jtbd.statement}`);
  
  persona.revenueTriggers.forEach((trigger: RevenueTrigger) => {
    console.log(`Trigger: ${trigger.scenario} - ${trigger.pricePointBdt} BDT`);
  });
}
```

## API Reference

### Clusters

| Function | Description | Returns |
|----------|-------------|---------|
| `getCluster(id)` | Get cluster by ID | `PersonaCluster \| undefined` |
| `getP0Clusters()` | Get all P0 priority clusters | `PersonaCluster[]` |
| `getClusterByPersonaId(id)` | Find cluster containing persona | `PersonaCluster \| undefined` |
| `getAllClusterIds()` | Get all cluster IDs | `string[]` |
| `getTotalPersonaCount()` | Total personas across clusters | `number` |

### Top 5 Personas

| Function | Description | Returns |
|----------|-------------|---------|
| `getTopPersonaById(id)` | Get persona by ID (1,2,4,6,8) | `Persona \| undefined` |
| `getTopPersonaIds()` | Get all top persona IDs | `number[]` |
| `heDeCuesForTopPersonas[id]` | HE-DE cues for persona | `HeDeCue[]` |

### Types

All types are exported from `@shothik/persona-engine/types`:
- `Persona` - Complete persona definition
- `PersonaCluster` - Cluster metadata
- `EntryPoint` - User acquisition channel
- `RevenueTrigger` - Monetization trigger
- `HeDeCue` - HE-DE collaboration cue
- `GtmPlaybook` - Go-to-market strategy
- `PersonaContextProfile` - Context engine integration

## Architecture

```
packages/persona-engine/
├── src/
│   ├── types/
│   │   └── index.ts          # Core type definitions
│   ├── config/
│   │   ├── clusters.ts       # 7 strategic clusters
│   │   └── personas-top5.ts  # Top 5 revenue personas
│   └── index.ts              # Main entry point
├── tests/
│   └── persona-config.test.ts # Comprehensive test suite
├── package.json
└── tsconfig.json
```

## Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Type checking
pnpm typecheck
```

## Integration Points

### Context Engine
```typescript
import type { PersonaContextProfile } from '@shothik/persona-engine';

const profile: PersonaContextProfile = {
  personaId: 6,
  tokenBudget: { shortTerm: 4000, mediumTerm: 16000, longTerm: 32000 },
  contextSources: [
    { source: 'merchant_ledger', priority: 1, retentionDays: 90 },
    { source: 'order_history', priority: 2, retentionDays: 30 },
  ],
  languagePreference: 'banglish',
};
```

### UI/UX Components
```tsx
import { getTopPersonaById, heDeCuesForTopPersonas } from '@shothik/persona-engine';

function StatusDisplay({ personaId }: { personaId: number }) {
  const cues = heDeCuesForTopPersonas[personaId];
  const activeCue = cues.find(cue => cue.type === 'coordination');
  
  return (
    <div className="he-de-cue">
      {interpolate(activeCue?.messageTemplate, variables)}
    </div>
  );
}
```

### GTM Campaigns
```typescript
import { getCluster, TOP_5_PERSONAS } from '@shothik/persona-engine';

function generateCampaign(clusterId: string) {
  const cluster = getCluster(clusterId);
  const personas = TOP_5_PERSONAS.filter(p => p.clusterId === clusterId);
  
  return {
    targetAudience: cluster.name,
    messaging: personas.map(p => p.entryPoints[0].message),
    pricing: personas.flatMap(p => p.revenueTriggers.map(t => t.pricePointBdt)),
  };
}
```

## Classification

**Strictly Confidential | Internal Use Only**

This package contains proprietary market research and behavioral frameworks developed for ShothikGPT's Series A preparation. Do not distribute externally.

## License

PROPRIETARY - All rights reserved to Shothik AI

## Version

2.7.0 (September 2026)

## Contributing

Internal team members only. All changes must:
1. Maintain type safety
2. Include comprehensive tests
3. Align with 50-persona research findings
4. Preserve HE-DE behavioral framework integrity

## Support

Internal documentation available at: `docs/personas/`
