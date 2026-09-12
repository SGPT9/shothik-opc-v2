/**
 * Shothik Voice Engine - Persona-Specific Voice Profiles
 * 
 * Defines distinct voice characteristics for each of the 4 core personas.
 * Ensures the AI "sounds" different depending on who is using it.
 * 
 * Personas:
 * - Rina (F-commerce): Fast, transactional, energetic
 * - Dr. Rahman (Academic): Formal, precise, citation-aware
 * - Karim (Creator): Trendy, enthusiastic, casual
 * - Ahmed (SME): Professional, compliance-focused, authoritative
 */

import { ToneAdjustment } from './EmotionAnalyzer';

export enum PersonaId {
  F_COMMERCE = 'f-commerce',
  ACADEMIC = 'academic',
  CREATOR = 'creator',
  SME = 'sme',
}

export interface VoiceProfile {
  personaId: PersonaId;
  name: string;
  description: string;
  
  // Voice characteristics
  baseSpeed: number; // 0.8 - 1.5
  basePitch: number; // 0.8 - 1.2
  baseVolume: number; // 0.7 - 1.0
  warmth: number; // 0.3 - 1.0
  
  // Language preferences
  languageMix: {
    bangla: number;
    english: number;
    banglish: number;
  };
  
  // Communication style
  formality: 'casual' | 'professional' | 'empathetic' | 'authoritative';
  verbosity: 'concise' | 'balanced' | 'detailed';
  useTechnicalJargon: boolean;
  useEmojis: boolean;
  
  // Domain-specific behaviors
  priorityKeywords: string[];
  avoidTopics: string[];
  defaultGreeting: string;
  defaultClosing: string;
  
  // Emotional calibration
  empathyLevel: number; // 0.3 - 1.0
  urgencySensitivity: number; // 0.5 - 1.0
  frustrationTolerance: number; // 0.3 - 1.0
  
  // Sample phrases (Bangla/Banglish)
  samplePhrases: {
    greeting: string[];
    confirmation: string[];
    apology: string[];
    success: string[];
    error: string[];
  };
}

export const PERSONA_VOICE_PROFILES: Record<PersonaId, VoiceProfile> = {
  [PersonaId.F_COMMERCE]: {
    personaId: PersonaId.F_COMMERCE,
    name: 'Rina (F-commerce Operator)',
    description: 'Fast-paced, transactional voice optimized for quick order processing and customer service',
    
    baseSpeed: 1.2,
    basePitch: 1.05,
    baseVolume: 0.9,
    warmth: 0.7,
    
    languageMix: {
      bangla: 40,
      english: 30,
      banglish: 30,
    },
    
    formality: 'casual',
    verbosity: 'concise',
    useTechnicalJargon: false,
    useEmojis: true,
    
    priorityKeywords: [
      'order', 'বিক্রি', 'bikri', 'payment', 'bKash', 'TrxID', 'courier',
      'Pathao', 'Steadfast', 'COD', 'return', 'customer', 'WhatsApp'
    ],
    avoidTopics: ['complex theory', 'academic citations', 'coding'],
    
    defaultGreeting: 'আসসালামু আলাইকুম! How can I help with your orders today?',
    defaultClosing: 'ধন্যবাদ! Your business is growing! 🚀',
    
    empathyLevel: 0.6,
    urgencySensitivity: 0.9, // Very sensitive to urgent orders
    frustrationTolerance: 0.5,
    
    samplePhrases: {
      greeting: [
        'আসসালামু আলাইকুম! How can I help with your orders today?',
        'Hi! Ready to process some sales? 💰',
        'Hello! Let\'s check your bKash ledger!'
      ],
      confirmation: [
        'ঠিক আছে! Order confirmed.',
        'Done! TrxID verified ✅',
        'Perfect! Courier booked via Pathao.'
      ],
      apology: [
        'দুঃখিত! Let me fix this quickly.',
        'Sorry for the delay! Checking now...',
        'ভুল হয়ে গেছে! Correcting immediately.'
      ],
      success: [
        'চমৎকার! Order dispatched successfully! 📦',
        'Great! Payment received in bKash!',
        'Perfect! Customer happy, business growing! 🎉'
      ],
      error: [
        'সমস্যা! TrxID not found. Please recheck.',
        'Error! Courier API failed. Retrying...',
        'ভুল! COD return rate increasing. Need action.'
      ]
    }
  },
  
  [PersonaId.ACADEMIC]: {
    personaId: PersonaId.ACADEMIC,
    name: 'Dr. Rahman (Academic Researcher)',
    description: 'Formal, precise voice optimized for research, citations, and academic writing',
    
    baseSpeed: 0.9,
    basePitch: 0.95,
    baseVolume: 0.8,
    warmth: 0.5,
    
    languageMix: {
      bangla: 30,
      english: 60,
      banglish: 10,
    },
    
    formality: 'professional',
    verbosity: 'detailed',
    useTechnicalJargon: true,
    useEmojis: false,
    
    priorityKeywords: [
      'research', 'citation', 'plagiarism', 'thesis', 'journal',
      'PDF', 'reference', 'abstract', 'methodology', 'LaTeX'
    ],
    avoidTopics: ['casual gossip', 'business promotions', 'trends'],
    
    defaultGreeting: 'Assalamu Alaikum, Dr. Rahman. How may I assist with your research today?',
    defaultClosing: 'Thank you. Your work contributes to global knowledge.',
    
    empathyLevel: 0.4,
    urgencySensitivity: 0.6,
    frustrationTolerance: 0.8, // High tolerance for complex problems
    
    samplePhrases: {
      greeting: [
        'Assalamu Alaikum, Dr. Rahman. How may I assist with your research today?',
        'Good morning. Ready to analyze your PDF documents?',
        'Hello. Shall we work on your thesis formatting?'
      ],
      confirmation: [
        'Understood. Citation format adjusted to APA 7th edition.',
        'Confirmed. Plagiarism check completed with 98% originality.',
        'Acknowledged. References exported to BibTeX.'
      ],
      apology: [
        'I apologize for the confusion. Let me clarify the citation.',
        'My apologies. The PDF parsing encountered an edge case.',
        'Regrettably, there was an error in the bibliography.'
      ],
      success: [
        'Excellent. Your paper meets all journal requirements.',
        'Success. All citations verified and cross-referenced.',
        'Complete. Thesis formatted according to university guidelines.'
      ],
      error: [
        'Warning: Potential plagiarism detected in section 3.2.',
        'Error: Unable to parse multi-column layout in PDF.',
        'Issue: Citation missing publication year.'
      ]
    }
  },
  
  [PersonaId.CREATOR]: {
    personaId: PersonaId.CREATOR,
    name: 'Karim (Zero-Capital Creator)',
    description: 'Energetic, trendy voice optimized for content creation and viral engagement',
    
    baseSpeed: 1.3,
    basePitch: 1.1,
    baseVolume: 0.95,
    warmth: 0.9,
    
    languageMix: {
      bangla: 35,
      english: 35,
      banglish: 30,
    },
    
    formality: 'casual',
    verbosity: 'concise',
    useTechnicalJargon: false,
    useEmojis: true,
    
    priorityKeywords: [
      'content', 'viral', 'trend', 'YouTube', 'Facebook', 'TikTok',
      'views', 'followers', 'engagement', 'storytelling', 'review'
    ],
    avoidTopics: ['tax compliance', 'formal documentation', 'academic rigor'],
    
    defaultGreeting: 'Hey Karim! 🔥 What\'s trending today?',
    defaultClosing: 'Keep creating! You\'re gonna blow up! 🚀✨',
    
    empathyLevel: 0.8,
    urgencySensitivity: 0.7,
    frustrationTolerance: 0.6,
    
    samplePhrases: {
      greeting: [
        'Hey Karim! 🔥 What\'s trending today?',
        'Yo! Ready to create viral content? 📱',
        'What\'s up! Let\'s make something amazing! ✨'
      ],
      confirmation: [
        'Got it! Content scheduled for peak hours! ⏰',
        'Done! Posted across all platforms! 🚀',
        'Perfect! Your story is live! 👀'
      ],
      apology: [
        'Oops! My bad! Let me fix that real quick! 😅',
        'Sorry yaar! Technical glitch! Retrying now!',
        'ভাই sorry! Wrong caption! Updating...'
      ],
      success: [
        'বাহ! 10K views in 1 hour! Viral hoiche! 🎉',
        'Amazing! Engagement rate through the roof! 📈',
        'Fantastic! Followers growing fast! Keep it up! 💪'
      ],
      error: [
        'অ্যাই! Upload failed! Network issue!',
        'Problem! Copyright strike detected! ⚠️',
        'Error! Hashtag banned! Need new strategy!'
      ]
    }
  },
  
  [PersonaId.SME]: {
    personaId: PersonaId.SME,
    name: 'Ahmed (Established SME Operator)',
    description: 'Professional, authoritative voice optimized for compliance and business scaling',
    
    baseSpeed: 1.0,
    basePitch: 0.95,
    baseVolume: 0.85,
    warmth: 0.5,
    
    languageMix: {
      bangla: 40,
      english: 50,
      banglish: 10,
    },
    
    formality: 'authoritative',
    verbosity: 'balanced',
    useTechnicalJargon: true,
    useEmojis: false,
    
    priorityKeywords: [
      'compliance', 'NBR', 'tax', 'VAT', 'TIN', 'trade license',
      'audit', 'cash flow', 'inventory', 'employees', 'scaling'
    ],
    avoidTopics: ['viral trends', 'casual content', 'gaming'],
    
    defaultGreeting: 'Good morning, Mr. Ahmed. Your business dashboard is ready.',
    defaultClosing: 'Thank you. Your enterprise continues to thrive.',
    
    empathyLevel: 0.4,
    urgencySensitivity: 0.8,
    frustrationTolerance: 0.7,
    
    samplePhrases: {
      greeting: [
        'Good morning, Mr. Ahmed. Your business dashboard is ready.',
        'Assalamu Alaikum. Quarterly tax report prepared for review.',
        'Hello. Compliance audit completed successfully.'
      ],
      confirmation: [
        'Confirmed. VAT return filed with NBR portal.',
        'Acknowledged. Trade license renewal submitted.',
        'Verified. Financial statements comply with BFRS standards.'
      ],
      apology: [
        'I apologize for the discrepancy in the ledger. Investigating.',
        'Regretfully, there was a delay in tax filing. Rectifying now.',
        'My apologies. The API connection to NBR was temporarily down.'
      ],
      success: [
        'Excellent. All compliance requirements met for Q3.',
        'Success. Tax optimization saved ৳45,000 this quarter.',
        'Complete. Business registration updated with RJSC.'
      ],
      error: [
        'Alert: TIN mismatch detected. Immediate action required.',
        'Warning: Cash flow projection shows deficit next month.',
        'Critical: Employee payroll tax calculation error found.'
      ]
    }
  }
};

/**
 * Get voice profile for a specific persona
 */
export function getVoiceProfile(personaId: PersonaId): VoiceProfile {
  return PERSONA_VOICE_PROFILES[personaId];
}

/**
 * Merge base profile with emotion-based adjustments
 */
export function applyEmotionalAdjustments(
  profile: VoiceProfile,
  adjustment: ToneAdjustment
): VoiceProfile {
  return {
    ...profile,
    baseSpeed: profile.baseSpeed * adjustment.speed,
    basePitch: profile.basePitch * adjustment.pitch,
    baseVolume: profile.baseVolume * adjustment.volume,
    warmth: Math.min(profile.warmth + adjustment.warmth, 1.0),
    formality: adjustment.formality,
  };
}
