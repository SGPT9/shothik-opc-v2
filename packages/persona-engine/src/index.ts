/**
 * ShothikGPT Persona Engine - Main Entry Point
 * 
 * Central export hub for all persona engine functionality
 * Classification: Strictly Confidential | Internal Use Only
 */

// Types
export * from './types';

// Configurations
export { PERSONA_CLUSTERS, getCluster, getP0Clusters, getClusterByPersonaId, getAllClusterIds, getTotalPersonaCount } from './config/clusters';
export { TOP_5_PERSONAS, getTopPersonaById, getTopPersonaIds, heDeCuesForTopPersonas } from './config/personas-top5';
export { academicClimber, thesisResearcher, sideHustleFounder, digitalCodMerchant, freelancerGigWorker } from './config/personas-top5';

// Default exports
export { default as clusters } from './config/clusters';
export { default as topPersonas } from './config/personas-top5';
