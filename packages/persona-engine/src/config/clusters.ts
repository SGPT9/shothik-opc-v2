/**
 * ShothikGPT Persona Engine - Cluster Configurations
 * 
 * Defines the 7 Strategic Persona Clusters from the 50-Persona Demographic Library
 * Classification: Strictly Confidential | Internal Use Only
 */

import type { PersonaCluster } from '../types';

export const PERSONA_CLUSTERS: Record<string, PersonaCluster> = {
  academic_student: {
    id: 'academic_student',
    name: 'Academic & Student',
    description: 'Students and researchers focused on academic integrity, speed, and AI-detection safety',
    personaIds: [1, 2, 3, 12, 15, 30, 31, 32, 33, 48],
    primaryValueProp: 'Academic integrity, speed, AI-detection safety',
    monetizationCharacter: 'High Volume, Low ARPU, Seasonal Spikes',
    priority: 'P0', // High volume, advocacy potential
  },
  
  founder_opc: {
    id: 'founder_opc',
    name: 'Founder & OPC',
    description: 'Side-hustle founders and one-person company operators compressing idea-to-execution time',
    personaIds: [4, 5, 14, 33, 49],
    primaryValueProp: 'Compressing idea-to-execution time, professional artifacts',
    monetizationCharacter: 'High LTV, Clear ROI, Subscription/Credit Packs',
    priority: 'P0', // High LTV, clear ROI
  },
  
  digital_cod_merchant: {
    id: 'digital_cod_merchant',
    name: 'Digital & COD Merchant',
    description: 'F-commerce and hybrid merchants automating reconciliation and reducing COD return leakage',
    personaIds: [6, 7, 13, 18, 36, 46],
    primaryValueProp: 'Automating reconciliation, reducing COD return leakage',
    monetizationCharacter: 'High Stickiness, Daily Frequency, Ops Plans',
    priority: 'P0', // Highest stickiness feature (Merchant Escrow Loop)
  },
  
  freelancer_creator: {
    id: 'freelancer_creator',
    name: 'Freelancer & Creator',
    description: 'Content creators and freelancers increasing billable output with persistent style memory',
    personaIds: [8, 9, 21, 34, 35],
    primaryValueProp: 'Increasing billable output, preserving client style memory',
    monetizationCharacter: 'Project-Based, Credit Packs tied to client cycles',
    priority: 'P1',
  },
  
  professional_institutional: {
    id: 'professional_institutional',
    name: 'Professional & Institutional',
    description: 'Professionals and institutions requiring high-stakes report/proposal generation under deadline',
    personaIds: [10, 11, 16, 19, 27, 28, 38, 39],
    primaryValueProp: 'High-stakes report/proposal generation under deadline',
    monetizationCharacter: 'Higher ARPU, Potential for Team/Institutional Seats',
    priority: 'P1',
  },
  
  service_sme_field: {
    id: 'service_sme_field',
    name: 'Service SME & Field',
    description: 'Field-based SMEs requiring mobile-first professional client communication and proposals',
    personaIds: [22, 23, 24, 25, 26, 29, 37, 40, 41, 44, 45, 50],
    primaryValueProp: 'Mobile-first professional client communication & proposals',
    monetizationCharacter: 'Moderate ARPU, Mobile-first, Vertical-specific packs',
    priority: 'P2',
  },
  
  special_emerging: {
    id: 'special_emerging',
    name: 'Special / Emerging',
    description: 'Financial inclusion, community documentation, and diaspora bridging initiatives',
    personaIds: [17, 42, 43, 47],
    primaryValueProp: 'Financial inclusion, community documentation, diaspora bridging',
    monetizationCharacter: 'Low Near-Term ARPU, Strategic for Narrative & Inclusion',
    priority: 'P2',
  },
};

/**
 * Get cluster by ID
 */
export function getCluster(clusterId: string): PersonaCluster | undefined {
  return PERSONA_CLUSTERS[clusterId];
}

/**
 * Get all P0 priority clusters (highest leverage)
 */
export function getP0Clusters(): PersonaCluster[] {
  return Object.values(PERSONA_CLUSTERS).filter(cluster => cluster.priority === 'P0');
}

/**
 * Get cluster for a specific persona ID
 */
export function getClusterByPersonaId(personaId: number): PersonaCluster | undefined {
  return Object.values(PERSONA_CLUSTERS).find(cluster => 
    cluster.personaIds.includes(personaId)
  );
}

/**
 * Get all cluster IDs
 */
export function getAllClusterIds(): string[] {
  return Object.keys(PERSONA_CLUSTERS);
}

/**
 * Get total persona count across all clusters
 */
export function getTotalPersonaCount(): number {
  return Object.values(PERSONA_CLUSTERS).reduce(
    (total, cluster) => total + cluster.personaIds.length, 
    0
  );
}

export default PERSONA_CLUSTERS;
