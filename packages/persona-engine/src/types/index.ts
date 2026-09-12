/**
 * ShothikGPT Persona Engine - Core Type Definitions
 * 
 * Based on the 50-Persona Demographic Library and HE-DE Behavioral Framework
 * Classification: Strictly Confidential | Internal Use Only
 * Last Updated: September 2026
 */

// ============================================================================
// CLUSTER DEFINITIONS
// ============================================================================

export type PersonaClusterId = 
  | 'academic_student'
  | 'founder_opc'
  | 'digital_cod_merchant'
  | 'freelancer_creator'
  | 'professional_institutional'
  | 'service_sme_field'
  | 'special_emerging';

export interface PersonaCluster {
  id: PersonaClusterId;
  name: string;
  description: string;
  personaIds: number[];
  primaryValueProp: string;
  monetizationCharacter: string;
  priority: 'P0' | 'P1' | 'P2'; // P0 = Highest leverage (Top 5 personas)
}

// ============================================================================
// PERSONA CORE STRUCTURE
// ============================================================================

export interface Persona {
  id: number;
  clusterId: PersonaClusterId;
  
  // Identity
  archetype: string;
  name: string;
  ageRange: { min: number; max: number };
  location: string[];
  
  // Psychographics
  frustrations: string[];
  goals: string[];
  techComfortLevel: 'low' | 'medium' | 'high';
  primaryDevices: ('mobile' | 'desktop' | 'tablet')[];
  
  // Behavioral
  entryPoints: EntryPoint[];
  revenueTriggers: RevenueTrigger[];
  usageFrequency: 'daily' | 'weekly' | 'monthly' | 'seasonal';
  priceSensitivity: 'low' | 'medium' | 'high';
  
  // JTBD (Jobs-to-be-Done)
  jtbd: {
    statement: string;
    context: string;
    expectedOutcome: string;
  };
  
  // HE-DE Collaboration Preferences
  heDePreferences: {
    coordinationCueStyle: 'detailed' | 'concise' | 'minimal';
    teamGoalVisibility: 'always' | 'on-request' | 'never';
    supervisoryControlLevel: 'high' | 'medium' | 'low';
    processTransparencyNeed: 'high' | 'medium' | 'low';
  };
  
  // Shothik Solution Mapping
  shothikSolutions: string[];
  
  // Monetization
  arpuPotential: 'low' | 'medium' | 'high';
  ltvPotential: 'low' | 'medium' | 'high';
  stickinessScore: number; // 1-10
}

// ============================================================================
// ENTRY POINTS & REVENUE TRIGGERS
// ============================================================================

export interface EntryPoint {
  type: 'peer_recommendation' | 'search' | 'social_media' | 'ambassador' | 'paid_ad';
  channel: string;
  message: string; // Often in Bangla/Banglish
  effectiveness: number; // 1-10
}

export interface RevenueTrigger {
  id: string;
  scenario: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  timeToDecision: 'immediate' | '<24h' | '<72h' | '<1week';
  suggestedOffer: string;
  paymentMethod: 'bkash' | 'nagad' | 'card' | 'bank_transfer';
  pricePointBdt: number;
}

// ============================================================================
// HE-DE BEHAVIORAL CUES
// ============================================================================

export type CueType = 'coordination' | 'team_goal' | 'supervisory' | 'process_transparency';

export interface HeDeCue {
  type: CueType;
  context: string;
  messageTemplate: string;
  variables?: Record<string, string>;
  displayDuration?: 'transient' | 'persistent' | 'until_acknowledged';
  actionRequired?: boolean;
}

export interface HeDeCueConfig {
  personaId: number;
  cues: {
    coordination: HeDeCue[];
    teamGoal: HeDeCue[];
    supervisory: HeDeCue[];
    processTransparency: HeDeCue[];
  };
}

// ============================================================================
// GTM & MONETIZATION
// ============================================================================

export interface GtmPlaybook {
  clusterId: PersonaClusterId;
  
  acquisition: {
    strategies: AcquisitionStrategy[];
    channels: string[];
    messagingVariants: Record<'bangla' | 'english' | 'banglish', string[]>;
  };
  
  monetization: {
    triggerBasedOffers: RevenueTrigger[];
    subscriptionTiers: SubscriptionTier[];
    microTransactionOptions: MicroTransactionOption[];
  };
}

export interface AcquisitionStrategy {
  name: string;
  description: string;
  targetPersonas: number[];
  executionSteps: string[];
  successMetrics: string[];
}

export interface SubscriptionTier {
  name: string;
  priceBdt: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  targetPersonas: number[];
}

export interface MicroTransactionOption {
  name: string;
  priceBdt: number;
  credits: number;
  validityHours: number;
  triggerContext: string;
}

// ============================================================================
// CONTEXT ENGINE INTEGRATION
// ============================================================================

export interface PersonaContextProfile {
  personaId: number;
  
  // Token Budgets
  tokenBudget: {
    shortTerm: number; // Current session
    mediumTerm: number; // Last 7 days
    longTerm: number; // Persistent memory
  };
  
  // Context Priorities
  contextSources: {
    source: string;
    priority: 1 | 2 | 3 | 4 | 5; // 1 = highest
    retentionDays: number;
  }[];
  
  // Persona-Specific Defaults
  defaultIntentFilters: string[];
  preferredModels: string[];
  languagePreference: 'bangla' | 'english' | 'banglish';
}

// ============================================================================
// ANALYTICS & METRICS
// ============================================================================

export interface PersonaMetrics {
  personaId: number;
  
  // Acquisition
  totalUsers: number;
  activationRate: number; // % who complete first "win"
  
  // Engagement
  dau: number;
  wau: number;
  mau: number;
  avgSessionDurationMinutes: number;
  sessionsPerUserPerWeek: number;
  
  // Monetization
  conversionRate: number; // Free → Paid
  arpu: number; // Average Revenue Per User (BDT)
  ltv: number; // Lifetime Value (BDT)
  churnRate: number;
  
  // HE-DE Effectiveness
  cueEngagementRate: number; // % of users who interact with cues
  trustScore: number; // 1-10, derived from surveys/behavior
  processFluencyScore: number; // 1-10
  
  timestamp: Date;
}

// ============================================================================
// TYPE UTILITIES
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>;
};

export type PersonaId = number;
export type ClusterId = PersonaClusterId;

// Export all types for external consumption
export type {
  PersonaCluster,
  Persona,
  EntryPoint,
  RevenueTrigger,
  HeDeCue,
  HeDeCueConfig,
  GtmPlaybook,
  AcquisitionStrategy,
  SubscriptionTier,
  MicroTransactionOption,
  PersonaContextProfile,
  PersonaMetrics,
};
