import { describe, it, expect } from 'vitest';
import {
  extractWikiLinks,
  autoLinkEntities,
  buildBidirectionalGraph,
  type WikiLoreEntity
} from '../story-wiki-linker';

describe('story-wiki-linker (MateClaw-Inspired LLM Wiki Engine)', () => {
  const sampleLore: WikiLoreEntity[] = [
    {
      id: 'lore-elena',
      name: 'Dr. Elena Vance',
      aliases: ['Elena', 'Dr. Vance'],
      category: 'character',
      details: 'Lead quantum astrophysicist on Aethelgard Station.'
    },
    {
      id: 'lore-station',
      name: 'Aethelgard Station',
      aliases: ['The Station'],
      category: 'setting',
      details: 'Deep-space orbital lab built in 2042.'
    },
    {
      id: 'lore-leak',
      name: 'The Singularity Leak',
      aliases: ['The Leak'],
      category: 'plot_hook',
      details: 'Unexplained energy spike in Sector 7.'
    }
  ];

  it('extracts explicit [[wikilinks]] from markdown text', () => {
    const text = 'When [[Dr. Elena Vance]] arrived at [[Aethelgard Station|The Orbital Lab]], the alarm sounded.';
    const links = extractWikiLinks(text);

    expect(links).toHaveLength(2);
    expect(links[0]).toEqual({ target: 'Dr. Elena Vance', alias: 'Dr. Elena Vance' });
    expect(links[1]).toEqual({ target: 'Aethelgard Station', alias: 'The Orbital Lab' });
  });

  it('automatically detects lore entities in prose and injects interactive wiki links', () => {
    const prose = 'Dr. Elena Vance walked across the deck of Aethelgard Station while monitoring the anomaly.';
    const linkedHtml = autoLinkEntities(prose, sampleLore);

    expect(linkedHtml).toContain('data-wiki-target="lore-elena"');
    expect(linkedHtml).toContain('data-wiki-target="lore-station"');
    expect(linkedHtml).toContain('Dr. Elena Vance');
    expect(linkedHtml).toContain('Aethelgard Station');
  });

  it('does not corrupt existing HTML tags or attributes during autolinking', () => {
    const html = '<a href="/test" title="Dr. Elena Vance">Click Dr. Elena Vance here</a>';
    const linked = autoLinkEntities(html, sampleLore);

    expect(linked).toContain('title="Dr. Elena Vance"');
    expect(linked).toContain('href="/test"');
  });

  it('builds a bidirectional graph mapping entities to chapters and back', () => {
    const chapters = [
      {
        id: 'ch-1',
        title: 'Chapter 1: The Arrival',
        content: 'Dr. Elena Vance boarded Aethelgard Station.'
      },
      {
        id: 'ch-2',
        title: 'Chapter 2: The Singularity',
        content: 'Elena investigated The Singularity Leak on Aethelgard Station.'
      }
    ];

    const graph = buildBidirectionalGraph(sampleLore, chapters);

    // Entity -> Chapters backlink check
    const elenaRef = graph.entities['lore-elena'];
    expect(elenaRef).toBeDefined();
    expect(elenaRef.referencedInChapters).toEqual(['ch-1', 'ch-2']);

    const leakRef = graph.entities['lore-leak'];
    expect(leakRef).toBeDefined();
    expect(leakRef.referencedInChapters).toEqual(['ch-2']);

    // Chapter -> Entities forward link check
    const ch1Ref = graph.chapters['ch-1'];
    expect(ch1Ref.referencedEntityIds).toContain('lore-elena');
    expect(ch1Ref.referencedEntityIds).toContain('lore-station');
    expect(ch1Ref.referencedEntityIds).not.toContain('lore-leak');
  });
});
