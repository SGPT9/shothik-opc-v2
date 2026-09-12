import { describe, it, expect } from 'vitest';
import { 
  PERSONA_CLUSTERS, 
  getP0Clusters, 
  getClusterByPersonaId,
  getTotalPersonaCount 
} from '../src/config/clusters';
import { 
  TOP_5_PERSONAS, 
  getTopPersonaById,
  heDeCuesForTopPersonas 
} from '../src/config/personas-top5';

describe('Persona Engine - Cluster Configurations', () => {
  it('should have 7 strategic clusters', () => {
    expect(Object.keys(PERSONA_CLUSTERS).length).toBe(7);
  });

  it('should have P0 clusters defined', () => {
    const p0Clusters = getP0Clusters();
    expect(p0Clusters.length).toBe(3); // academic_student, founder_opc, digital_cod_merchant
    expect(p0Clusters.map(c => c.id)).toEqual([
      'academic_student',
      'founder_opc',
      'digital_cod_merchant'
    ]);
  });

  it('should find cluster by persona ID', () => {
    const cluster = getClusterByPersonaId(1);
    expect(cluster?.id).toBe('academic_student');
  });

  it('should have correct total persona count', () => {
    const total = getTotalPersonaCount();
    expect(total).toBe(50); // All 50 personas across clusters
  });

  it('should have all required fields in each cluster', () => {
    Object.values(PERSONA_CLUSTERS).forEach(cluster => {
      expect(cluster).toHaveProperty('id');
      expect(cluster).toHaveProperty('name');
      expect(cluster).toHaveProperty('description');
      expect(cluster).toHaveProperty('personaIds');
      expect(cluster).toHaveProperty('primaryValueProp');
      expect(cluster).toHaveProperty('monetizationCharacter');
      expect(cluster).toHaveProperty('priority');
    });
  });
});

describe('Persona Engine - Top 5 Personas', () => {
  it('should have exactly 5 top personas', () => {
    expect(TOP_5_PERSONAS.length).toBe(5);
  });

  it('should have correct persona IDs (1, 2, 4, 6, 8)', () => {
    const ids = TOP_5_PERSONAS.map(p => p.id);
    expect(ids).toEqual([1, 2, 4, 6, 8]);
  });

  it('should find persona by ID', () => {
    const persona = getTopPersonaById(6);
    expect(persona?.archetype).toBe('F-commerce Hustler');
    expect(persona?.clusterId).toBe('digital_cod_merchant');
  });

  it('should have HE-DE cues for all top personas', () => {
    const personaIds = [1, 2, 4, 6, 8];
    personaIds.forEach(id => {
      expect(heDeCuesForTopPersonas[id]).toBeDefined();
      expect(heDeCuesForTopPersonas[id].length).toBeGreaterThan(0);
    });
  });

  it('should have Digital/COD Merchant with highest stickiness score', () => {
    const merchant = getTopPersonaById(6);
    expect(merchant?.stickinessScore).toBe(10);
  });

  it('should have all required fields in each persona', () => {
    TOP_5_PERSONAS.forEach(persona => {
      expect(persona).toHaveProperty('id');
      expect(persona).toHaveProperty('clusterId');
      expect(persona).toHaveProperty('archetype');
      expect(persona).toHaveProperty('name');
      expect(persona).toHaveProperty('ageRange');
      expect(persona).toHaveProperty('frustrations');
      expect(persona).toHaveProperty('goals');
      expect(persona).toHaveProperty('jtbd');
      expect(persona).toHaveProperty('heDePreferences');
      expect(persona).toHaveProperty('revenueTriggers');
      expect(persona).toHaveProperty('shothikSolutions');
    });
  });

  it('should have Bangla/Banglish entry point messages', () => {
    const academicPersona = getTopPersonaById(1);
    const banglaMessage = academicPersona?.entryPoints.find(
      ep => ep.message.includes('Bhai') || ep.message.includes('ei tool')
    );
    expect(banglaMessage).toBeDefined();
  });

  it('should have bKash payment methods for revenue triggers', () => {
    const merchant = getTopPersonaById(6);
    const allBkash = merchant?.revenueTriggers.every(
      trigger => trigger.paymentMethod === 'bkash'
    );
    expect(allBkash).toBe(true);
  });
});

describe('HE-DE Collaboration Cues', () => {
  it('should have coordination cues for Digital/COD Merchant', () => {
    const cues = heDeCuesForTopPersonas[6];
    const coordinationCue = cues.find(cue => cue.type === 'coordination');
    
    expect(coordinationCue).toBeDefined();
    expect(coordinationCue?.messageTemplate).toContain('bKash TrxID');
    expect(coordinationCue?.messageTemplate).toContain('Steadfast Courier API');
  });

  it('should have team goal cues with joint goal language', () => {
    const cues = heDeCuesForTopPersonas[6];
    const teamGoalCue = cues.find(cue => cue.type === 'team_goal');
    
    expect(teamGoalCue).toBeDefined();
    expect(teamGoalCue?.messageTemplate).toContain('Our joint goal');
  });

  it('should have process transparency cue with variables', () => {
    const cues = heDeCuesForTopPersonas[6];
    const transparencyCue = cues.find(cue => cue.type === 'process_transparency');
    
    expect(transparencyCue).toBeDefined();
    expect(transparencyCue?.messageTemplate).toContain('{trxCount}');
    expect(transparencyCue?.messageTemplate).toContain('{parcelCount}');
    expect(transparencyCue?.messageTemplate).toContain('{hoursSaved}');
    expect(transparencyCue?.variables).toBeDefined();
  });
});

describe('Revenue Trigger Validation', () => {
  it('should have immediate time-to-decision for critical triggers', () => {
    const merchant = getTopPersonaById(6);
    const criticalTriggers = merchant?.revenueTriggers.filter(
      t => t.urgency === 'critical'
    );
    
    criticalTriggers?.forEach(trigger => {
      expect(trigger.timeToDecision).toBe('immediate');
    });
  });

  it('should have appropriate BDT price points', () => {
    const academic = getTopPersonaById(1);
    const triggers = academic?.revenueTriggers || [];
    
    triggers.forEach(trigger => {
      expect(trigger.pricePointBdt).toBeGreaterThan(0);
      expect(trigger.pricePointBdt).toBeLessThan(1000); // Student-friendly pricing
    });
  });
});
