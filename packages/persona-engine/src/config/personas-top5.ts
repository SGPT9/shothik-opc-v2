/**
 * ShothikGPT Persona Engine - Top 5 Highest-Leverage Personas
 * 
 * Detailed configurations for the 5 core revenue engine personas
 * Classification: Strictly Confidential | Internal Use Only
 */

import type { Persona, RevenueTrigger, EntryPoint, HeDeCue } from '../types';

// ============================================================================
// PERSONA 1 & 2: THE ACADEMIC CLIMBER & THESIS RESEARCHER
// ============================================================================

export const academicClimber: Persona = {
  id: 1,
  clusterId: 'academic_student',
  
  // Identity
  archetype: 'The Academic Climber',
  name: 'Rahim/Farhana',
  ageRange: { min: 20, max: 24 },
  location: ['Dhaka', 'Chittagong', 'Sylhet'],
  
  // Psychographics
  frustrations: [
    'Fear of AI detection flagging work',
    'Fragmented tools (one for grammar, one for plagiarism)',
    'Western tools require credit cards',
    'Colonial language barriers',
    'AI hallucination in citations',
  ],
  goals: [
    'Produce original-sounding, academically safe English writing',
    'Complete research documents quickly and cheaply',
    'Avoid AI detection flags',
    'Maintain academic integrity',
  ],
  techComfortLevel: 'medium',
  primaryDevices: ['mobile', 'desktop'],
  
  // Behavioral
  entryPoints: [
    {
      type: 'peer_recommendation',
      channel: 'WhatsApp Class Group',
      message: 'Bhai, ei tool ta try koro, AI detect e dhore na',
      effectiveness: 9,
    },
    {
      type: 'search',
      channel: 'Google',
      message: 'paraphrase tool Bangladesh',
      effectiveness: 7,
    },
  ] as EntryPoint[],
  
  revenueTriggers: [
    {
      id: 'academic_deadline',
      scenario: 'Night before submission when free paraphrases exhausted',
      urgency: 'critical',
      timeToDecision: 'immediate',
      suggestedOffer: 'Unlock unlimited AI-detector-safe paraphrasing for 50 BDT',
      paymentMethod: 'bkash',
      pricePointBdt: 50,
    },
    {
      id: 'ai_detection_scare',
      scenario: 'Friend gets flagged by AI detector, user fears same fate',
      urgency: 'high',
      timeToDecision: '<24h',
      suggestedOffer: 'AI Detection Safety Pack - 100 BDT',
      paymentMethod: 'bkash',
      pricePointBdt: 100,
    },
  ] as RevenueTrigger[],
  
  usageFrequency: 'seasonal', // Peak during thesis/exam seasons
  priceSensitivity: 'high',
  
  // JTBD
  jtbd: {
    statement: 'Help me produce original-sounding, academically safe English writing and research documents quickly and cheaply.',
    context: 'Final year undergraduate or Master\'s student working on thesis/dissertation',
    expectedOutcome: 'Submission-ready document that passes AI detection and maintains academic integrity',
  },
  
  // HE-DE Collaboration Preferences
  heDePreferences: {
    coordinationCueStyle: 'detailed',
    teamGoalVisibility: 'always',
    supervisoryControlLevel: 'high',
    processTransparencyNeed: 'high',
  },
  
  // Shothik Solution Mapping
  shothikSolutions: [
    'Deep Research + LiteParse RAG',
    'GenOffice Docs',
    'AI Detector',
    'Citation Management',
    'Bangla-English Paraphrasing',
  ],
  
  // Monetization
  arpuPotential: 'low',
  ltvPotential: 'medium', // May become professional later
  stickinessScore: 6,
};

export const thesisResearcher: Persona = {
  id: 2,
  clusterId: 'academic_student',
  
  archetype: 'Thesis Researcher',
  name: 'Dr. Rahman (Junior)',
  ageRange: { min: 22, max: 28 },
  location: ['Dhaka', 'Chittagong'],
  
  frustrations: [
    'Multi-column STEM papers hard to parse',
    'Financial tables lose formatting',
    'Heavy multimodal API costs',
    'Citation hallucination',
  ],
  goals: [
    'Extract data from complex papers accurately',
    'Maintain spatial relationships in documents',
    'Generate properly formatted bibliographies',
  ],
  techComfortLevel: 'high',
  primaryDevices: ['desktop'],
  
  entryPoints: [
    {
      type: 'peer_recommendation',
      channel: 'University Lab Group',
      message: 'LiteParse diye paper parse korle bounding box thik thake',
      effectiveness: 8,
    },
  ] as EntryPoint[],
  
  revenueTriggers: [
    {
      id: 'paper_parsing_need',
      scenario: 'Need to extract data from 50+ page multi-column PDF',
      urgency: 'high',
      timeToDecision: '<24h',
      suggestedOffer: 'Advanced Document Parsing - 200 BDT',
      paymentMethod: 'bkash',
      pricePointBdt: 200,
    },
  ] as RevenueTrigger[],
  
  usageFrequency: 'monthly',
  priceSensitivity: 'medium',
  
  jtbd: {
    statement: 'Help me extract and analyze data from complex academic papers without losing formatting or context.',
    context: 'Graduate researcher working with STEM papers and financial documents',
    expectedOutcome: 'Accurately extracted data with preserved spatial relationships and citations',
  },
  
  heDePreferences: {
    coordinationCueStyle: 'detailed',
    teamGoalVisibility: 'always',
    supervisoryControlLevel: 'medium',
    processTransparencyNeed: 'high',
  },
  
  shothikSolutions: [
    'LiteParse Spatial RAG',
    'Multi-column Document Parser',
    'Citation Cross-referencing',
    'LaTeX Export',
  ],
  
  arpuPotential: 'medium',
  ltvPotential: 'high',
  stickinessScore: 7,
};

// ============================================================================
// PERSONA 4 & 5: THE SIDE-HUSTLE FOUNDER / OPC OPERATOR
// ============================================================================

export const sideHustleFounder: Persona = {
  id: 4,
  clusterId: 'founder_opc',
  
  archetype: 'Side-Hustle Founder',
  name: 'Nusrat/Imran',
  ageRange: { min: 24, max: 34 },
  location: ['Dhaka', 'Chittagong', 'Sylhet'],
  
  frustrations: [
    'Weeks spent on decks/research that could be compressed into days',
    'Generic AI lacks local market context',
    'Paying for 5 disconnected SaaS tools',
    'Cognitive overload from fragmented tools',
    'Manual admin work',
  ],
  goals: [
    'Compress idea-to-execution time',
    'Create professional artifacts quickly',
    'Run multiple small businesses without drowning in admin',
    'Validate business ideas with local data',
  ],
  techComfortLevel: 'high',
  primaryDevices: ['mobile', 'desktop'],
  
  entryPoints: [
    {
      type: 'peer_recommendation',
      channel: 'Facebook Startup Groups',
      message: 'Peer\'s polished pitch deck showcase',
      effectiveness: 9,
    },
    {
      type: 'search',
      channel: 'Google',
      message: 'pitch deck AI Bangladesh',
      effectiveness: 8,
    },
  ] as EntryPoint[],
  
  revenueTriggers: [
    {
      id: 'investor_meeting',
      scenario: 'Investor meeting or demo day in 48-72 hours',
      urgency: 'critical',
      timeToDecision: '<72h',
      suggestedOffer: 'Pitch Deck + Financial Model Pack - 999 BDT',
      paymentMethod: 'bkash',
      pricePointBdt: 999,
    },
    {
      id: 'scenario_planning',
      scenario: 'Need full financial model with multiple scenarios',
      urgency: 'high',
      timeToDecision: '<24h',
      suggestedOffer: 'ScenariosLab Pro - 500 BDT',
      paymentMethod: 'nagad',
      pricePointBdt: 500,
    },
  ] as RevenueTrigger[],
  
  usageFrequency: 'weekly',
  priceSensitivity: 'medium',
  
  jtbd: {
    statement: 'Give me a low-cost digital co-pilot that helps one person run multiple small businesses without drowning in admin.',
    context: 'Building venture while employed/studying, lives in WhatsApp, Canva, Google Drive',
    expectedOutcome: 'Professional pitch deck, financial model, and business artifacts ready for investors',
  },
  
  heDePreferences: {
    coordinationCueStyle: 'concise',
    teamGoalVisibility: 'always',
    supervisoryControlLevel: 'medium',
    processTransparencyNeed: 'medium',
  },
  
  shothikSolutions: [
    'Business Twin',
    'GenOffice Sheets for ledgers',
    'ScenariosLab for idea validation',
    'Local Market Research',
    'Pitch Deck Generator',
  ],
  
  arpuPotential: 'high',
  ltvPotential: 'high',
  stickinessScore: 8,
};

// ============================================================================
// PERSONA 6: THE DIGITAL / COD MERCHANT (HIGHEST STICKINESS)
// ============================================================================

export const digitalCodMerchant: Persona = {
  id: 6,
  clusterId: 'digital_cod_merchant',
  
  archetype: 'F-commerce Hustler',
  name: 'Karim/Laila',
  ageRange: { min: 25, max: 42 },
  location: ['Dhaka (Mirpur)', 'Chittagong', 'Nationwide'],
  
  frustrations: [
    'Manual bKash TrxID matching with orders (high error/time cost)',
    '22%+ COD return rates wiping out margins',
    'Chaotic WhatsApp + spreadsheet workflows',
    'Fragmented courier tracking (Pathao/Steadfast)',
    'NBR compliance fear',
  ],
  goals: [
    'Connect orders, payments, and logistics',
    'Stop losing money to manual matching errors',
    'Reduce COD return rate',
    'Automate dispatch processes',
  ],
  techComfortLevel: 'medium',
  primaryDevices: ['mobile'],
  
  entryPoints: [
    {
      type: 'peer_recommendation',
      channel: 'Merchant WhatsApp Groups',
      message: 'bKash matching e time nosto hoy, ei tool try koro',
      effectiveness: 10,
    },
    {
      type: 'ambassador',
      channel: 'Top F-commerce Seller Workshop',
      message: 'Live demo of automated reconciliation',
      effectiveness: 9,
    },
  ] as EntryPoint[],
  
  revenueTriggers: [
    {
      id: 'reconciliation_pain',
      scenario: 'End-of-day reconciliation taking 1-2 hours with frequent mismatches',
      urgency: 'critical',
      timeToDecision: 'immediate',
      suggestedOffer: 'Automated Reconciliation & COD Protection - 499 BDT/month',
      paymentMethod: 'bkash',
      pricePointBdt: 499,
    },
    {
      id: 'financial_loss',
      scenario: 'Visible financial loss from unmatched payment that tool would have caught',
      urgency: 'critical',
      timeToDecision: 'immediate',
      suggestedOffer: 'Emergency Recovery Plan + Tool Access - 299 BDT',
      paymentMethod: 'bkash',
      pricePointBdt: 299,
    },
  ] as RevenueTrigger[],
  
  usageFrequency: 'daily',
  priceSensitivity: 'medium',
  
  jtbd: {
    statement: 'Connect my orders, payments, and logistics so I stop losing money and time to manual matching.',
    context: 'Running F-commerce business via WhatsApp, using bKash/Nagad and Pathao/Steadfast daily',
    expectedOutcome: 'Zero manual matching errors, reduced COD returns, automated dispatch',
  },
  
  heDePreferences: {
    coordinationCueStyle: 'concise',
    teamGoalVisibility: 'always',
    supervisoryControlLevel: 'high',
    processTransparencyNeed: 'high',
  },
  
  shothikSolutions: [
    'Autonomous Escrow (negotiates micro-advance deposits)',
    'TrxID verification webhook → Steadfast dispatch automation',
    'NBR tax-ready ledger generation',
    'COD Return Rate Analytics',
    'Courier Integration (Pathao/Steadfast)',
  ],
  
  arpuPotential: 'high',
  ltvPotential: 'high',
  stickinessScore: 10, // HIGHEST - daily dependency
};

// ============================================================================
// PERSONA 8: THE FREELANCER / GIG WORKER
// ============================================================================

export const freelancerGigWorker: Persona = {
  id: 8,
  clusterId: 'freelancer_creator',
  
  archetype: 'Content/Design Freelancer',
  name: 'Tania/Shakib',
  ageRange: { min: 20, max: 35 },
  location: ['Dhaka', 'Chittagong', 'Remote Nationwide'],
  
  frustrations: [
    'Generic AI requires heavy editing',
    'No persistent memory of client style across projects',
    'Expensive international tools',
    'Juggling multiple clients simultaneously',
  ],
  goals: [
    'Increase billable output',
    'Preserve client style memory',
    'Deliver faster without quality loss',
    'Earn more without working more hours',
  ],
  techComfortLevel: 'high',
  primaryDevices: ['desktop', 'mobile'],
  
  entryPoints: [
    {
      type: 'peer_recommendation',
      channel: 'Freelancer Facebook Groups',
      message: 'Peer delivers client proposal faster using GenOffice',
      effectiveness: 8,
    },
  ] as EntryPoint[],
  
  revenueTriggers: [
    {
      id: 'client_deadline',
      scenario: 'Client deadline + need for polished deliverable beyond free limits',
      urgency: 'high',
      timeToDecision: '<24h',
      suggestedOffer: 'Rush Credit Pack - 300 BDT',
      paymentMethod: 'bkash',
      pricePointBdt: 300,
    },
    {
      id: 'volume_exhaustion',
      scenario: 'Volume of proposals exhausting free credits in a few days',
      urgency: 'medium',
      timeToDecision: '<72h',
      suggestedOffer: 'Monthly Pro Plan - 799 BDT',
      paymentMethod: 'bkash',
      pricePointBdt: 799,
    },
  ] as RevenueTrigger[],
  
  usageFrequency: 'weekly',
  priceSensitivity: 'medium',
  
  jtbd: {
    statement: 'Increase the quality and speed of my client deliverables so I can earn more without working more hours.',
    context: 'Juggling multiple Upwork/Fiverr/local clients, needs style consistency',
    expectedOutcome: 'Client-ready deliverables with consistent style, delivered faster',
  },
  
  heDePreferences: {
    coordinationCueStyle: 'concise',
    teamGoalVisibility: 'on-request',
    supervisoryControlLevel: 'medium',
    processTransparencyNeed: 'medium',
  },
  
  shothikSolutions: [
    'Writing Suite (Humanize + Paraphrase)',
    'Personal Twin with persistent style memory',
    'Client Profile Management',
    'Template Library',
  ],
  
  arpuPotential: 'medium',
  ltvPotential: 'medium',
  stickinessScore: 7,
};

// ============================================================================
// HE-DE COLLABORATION CUES FOR TOP 5 PERSONAS
// ============================================================================

export const heDeCuesForTopPersonas: Record<number, HeDeCue[]> = {
  // Academic Climber (Persona 1)
  1: [
    {
      type: 'team_goal',
      context: 'Starting thesis chapter work',
      messageTemplate: 'Our joint goal is to ensure this chapter meets academic integrity standards while preserving your original voice.',
      displayDuration: 'persistent',
    },
    {
      type: 'coordination',
      context: 'After parsing uploaded PDFs',
      messageTemplate: 'I have cross-referenced your citations with the uploaded PDFs using LiteParse. I am now generating the formatted bibliography.',
      displayDuration: 'transient',
    },
    {
      type: 'supervisory',
      context: 'Before final submission',
      messageTemplate: 'Draft generated with AI-detection optimization. Awaiting your final review before export.',
      actionRequired: true,
      displayDuration: 'until_acknowledged',
    },
  ],
  
  // Thesis Researcher (Persona 2)
  2: [
    {
      type: 'coordination',
      context: 'After uploading multi-column paper',
      messageTemplate: 'I have parsed the 50-page PDF using LiteParse, preserving all spatial bounding boxes. I am now extracting the financial tables.',
      displayDuration: 'transient',
    },
    {
      type: 'team_goal',
      context: 'Starting literature review',
      messageTemplate: 'Our joint goal is to build a comprehensive, accurately cited literature review without any hallucinated references.',
      displayDuration: 'persistent',
    },
  ],
  
  // Side-Hustle Founder (Persona 4)
  4: [
    {
      type: 'coordination',
      context: 'After market research completion',
      messageTemplate: 'I have populated the GenOffice Sheet with local competitor pricing data. I am now drafting the investor one-pager based on this model.',
      displayDuration: 'transient',
    },
    {
      type: 'supervisory',
      context: 'Before sending to investors',
      messageTemplate: 'You are the final approver. Review the generated scenarios, and I will adjust the assumptions based on your feedback.',
      actionRequired: true,
      displayDuration: 'until_acknowledged',
    },
  ],
  
  // Digital/COD Merchant (Persona 6) - MOST CRITICAL
  6: [
    {
      type: 'coordination',
      context: 'After receiving bKash TrxID',
      messageTemplate: 'I have verified the 10-digit bKash TrxID in your merchant ledger. I am now triggering the Steadfast Courier API to dispatch the order.',
      displayDuration: 'transient',
    },
    {
      type: 'team_goal',
      context: 'Daily operations start',
      messageTemplate: 'Our joint goal today is to reduce your 22% COD return rate by securing micro-advance deposits before dispatch.',
      displayDuration: 'persistent',
    },
    {
      type: 'process_transparency',
      context: 'End of day summary',
      messageTemplate: 'Today I verified {trxCount} TrxIDs, dispatched {parcelCount} Steadfast parcels, and saved you an estimated {hoursSaved} hours.',
      variables: {
        trxCount: '45',
        parcelCount: '40',
        hoursSaved: '2.5',
      },
      displayDuration: 'persistent',
    },
  ],
  
  // Freelancer (Persona 8)
  8: [
    {
      type: 'coordination',
      context: 'Starting client work',
      messageTemplate: 'I have applied \'Client X\'s preferred tone and formatting rules from your Twin memory to this draft. Ready for your final review.',
      displayDuration: 'transient',
    },
  ],
};

// Export all top personas
export const TOP_5_PERSONAS: Persona[] = [
  academicClimber,
  thesisResearcher,
  sideHustleFounder,
  digitalCodMerchant,
  freelancerGigWorker,
];

// Helper functions
export function getTopPersonaById(id: number): Persona | undefined {
  return TOP_5_PERSONAS.find(p => p.id === id);
}

export function getTopPersonaIds(): number[] {
  return TOP_5_PERSONAS.map(p => p.id);
}

export default TOP_5_PERSONAS;
