export type InkOsPillarId =
  | 'narrative'
  | 'co-author'
  | 'audio-visual'
  | 'world-lore'
  | 'print-publish';

export type InkOsToolId =
  | 'story-bible'
  | 'deslop'
  | 'forecast'
  | 'story-graph'
  | 'tabletop'
  | 'short-fiction'
  | 'chekhov'
  | 'style-dna'
  | 'multiverse'
  | 'autopilot'
  | 'voice-casting'
  | 'phoneme-tuner'
  | 'soundscape'
  | 'booktok'
  | 'room-blocking'
  | 'storyboard'
  | 'retention-radar'
  | 'tension-ekg'
  | 'relations'
  | 'dialect-transpiler'
  | 'showrunners'
  | 'char-messenger'
  | 'beta-readers'
  | 'character-duet'
  | 'block-catalyzer'
  | 'sensory-palette'
  | 'mfa-workshop'
  | 'streamer-mode'
  | 'cognitive-friction'
  | 'dreamscape'
  | 'lore-wiki'
  | 'chrono-braider'
  | 'plot-divergence'
  | 'spatial-gps'
  | 'item-ledger'
  | 'living-epilogue'
  | 'folk-scorer'
  | 'print-preflight'
  | 'book-jacket'
  | 'cip-barcode'
  | 'webnovel-paywall'
  | 'polyglot-matrix'
  | 'reading-scaler'
  | 'royalty-split'
  | 'legal-shield'
  | 'bilingual-split'
  | 'branches'
  | 'copyright'
  | 'podcast'
  | 'share'
  | 'upload'
  | 'import-manuscript';

export interface InkOsToolItem {
  id: InkOsToolId;
  capabilityNumber?: number;
  title: string;
  titleBn: string;
  shortLabel: string;
  description: string;
  pillar: InkOsPillarId;
  credits: 0 | 1 | 2 | 3;
  slashCommand: string;
  emoji: string;
  keywords: string[];
  pinnedInModes?: Array<'write' | 'format' | 'publish'>;
}

export interface InkOsToolRecommendation {
  tool: InkOsToolItem;
  reason: string;
}

export const INKOS_PILLARS: Array<{
  id: InkOsPillarId | 'all';
  label: string;
  emoji: string;
  description: string;
}> = [
  { id: 'all', label: 'All 45+ Tools', emoji: '✨', description: 'Every InkOS literary, audio, and publishing engine' },
  { id: 'narrative', label: 'Plot & Narrative', emoji: '📐', description: 'Outlining, Story Bible, De-Slop, and Plot Simulation' },
  { id: 'co-author', label: 'Co-Author & Critique', emoji: '🎭', description: 'Duet Tennis, Dialects, Sensory Palette, and MFA Workshop' },
  { id: 'audio-visual', label: 'Audio & Visual', emoji: '🎙️', description: '24kHz Bangla Voice Cast, Soundscapes, and Storyboards' },
  { id: 'world-lore', label: 'World & Continuity', emoji: '🌍', description: '1971 Chrono-Braider, Lore Wiki, Spatial GPS, and Item Ledger' },
  { id: 'print-publish', label: 'Boi Mela Print & Legal', emoji: '📚', description: 'Nilkhet 6×9 Preflight, 3D Jacket, ISBN CIP, and Legal Shield' },
];

export const INKOS_TOOLS: InkOsToolItem[] = [
  // ── Pillar 1: Plot & Narrative (#1–#10) ──
  {
    id: 'story-bible',
    capabilityNumber: 10,
    title: 'Story Bible HUD',
    titleBn: 'স্টোরি বাইবেল ও ক্যানন',
    shortLabel: 'Story Bible',
    description: 'Track character invariants, canon facts, and world rules (Ctrl+Shift+B)',
    pillar: 'narrative',
    credits: 0,
    slashCommand: '/bible',
    emoji: '📖',
    keywords: ['character', 'bible', 'canon', 'outline', 'bio', 'name', 'চরিত্র', 'কাহিনী'],
    pinnedInModes: ['write'],
  },
  {
    id: 'deslop',
    capabilityNumber: 3,
    title: 'Anti-Slop Cliché Linter',
    titleBn: 'অ্যান্টি-স্লপ সাহিত্যিক লিন্টার',
    shortLabel: 'De-Slop',
    description: 'Strip robotic AI phrasing, purple prose, and overused Bengali/English clichés',
    pillar: 'narrative',
    credits: 1,
    slashCommand: '/deslop',
    emoji: '🧹',
    keywords: ['rewrite', 'polish', 'cliche', 'slop', 'clear', 'improve', 'humanize', 'edit', 'সংশোধন', 'মার্জিত'],
    pinnedInModes: ['write'],
  },
  {
    id: 'forecast',
    capabilityNumber: 1,
    title: '3-Branch Plot Simulator',
    titleBn: 'প্লট সিমুলেটর ও পূর্বাভাস',
    shortLabel: 'Plot Forecast',
    description: 'Simulate 3 possible narrative trajectories and pacing outcomes before writing',
    pillar: 'narrative',
    credits: 1,
    slashCommand: '/forecast',
    emoji: '🧭',
    keywords: ['next', 'plot', 'future', 'ending', 'outline', 'chapter', 'trajectory', 'প্লট', 'পরবর্তী'],
  },
  {
    id: 'story-graph',
    capabilityNumber: 2,
    title: 'Continuity Lock & Story Graph',
    titleBn: 'কন্টিনিউটি লক ও গ্রাফ',
    shortLabel: 'Continuity Lock',
    description: 'Detect timeline contradictions and causal plot holes across chapters',
    pillar: 'narrative',
    credits: 1,
    slashCommand: '/continuity',
    emoji: '🕸️',
    keywords: ['continuity', 'contradiction', 'plot hole', 'graph', 'consistency', 'ধারাবাহিকতা'],
  },
  {
    id: 'tabletop',
    capabilityNumber: 4,
    title: "Director's Tabletop Sandbox",
    titleBn: 'ডিরেক্টরস টেবিলটপ রোলপ্লে',
    shortLabel: 'Tabletop Play',
    description: 'Drop characters into a high-stakes scenario and watch them improvise',
    pillar: 'narrative',
    credits: 2,
    slashCommand: '/tabletop',
    emoji: '🎬',
    keywords: ['improvise', 'sandbox', 'director', 'scenario', 'scene', 'দৃশ্য'],
  },
  {
    id: 'short-fiction',
    capabilityNumber: 5,
    title: 'Short Fiction & Magazine Packager',
    titleBn: 'ছোটগল্প ও ঈদ সংখ্যা প্যাকেজার',
    shortLabel: 'Short Fiction',
    description: 'Format and tighten manuscripts for Eid supplements and literary magazines',
    pillar: 'narrative',
    credits: 1,
    slashCommand: '/shortstory',
    emoji: '📑',
    keywords: ['short story', 'magazine', 'eid', 'anthology', 'ছোটগল্প', 'ঈদ সংখ্যা'],
  },
  {
    id: 'chekhov',
    capabilityNumber: 6,
    title: "Chekhov's Gun Foreshadow Tracker",
    titleBn: 'চেখভস গান ফোরশ্যাডো ট্র্যাকার',
    shortLabel: "Chekhov's Gun",
    description: 'Track planted clues and unfulfilled promises across your manuscript',
    pillar: 'narrative',
    credits: 1,
    slashCommand: '/chekhov',
    emoji: '🎯',
    keywords: ['clue', 'foreshadow', 'mystery', 'thriller', 'payoff', 'রহস্য', 'সূত্র'],
  },
  {
    id: 'style-dna',
    capabilityNumber: 7,
    title: 'Literary Style DNA Synthesizer',
    titleBn: 'সাহিত্যিক স্টাইল ডিএনএ',
    shortLabel: 'Style DNA',
    description: 'Blend sentence cadence inspired by Humayun Ahmed, Tagore, or modern thriller prose',
    pillar: 'narrative',
    credits: 1,
    slashCommand: '/styledna',
    emoji: '🧬',
    keywords: ['style', 'tone', 'voice', 'humayun', 'tagore', 'literary', 'ভাষা', 'শৈলী'],
  },
  {
    id: 'multiverse',
    capabilityNumber: 8,
    title: 'Multi-Verse Branching Tree',
    titleBn: 'মাল্টিভার্স শাখা গল্প',
    shortLabel: 'Multi-Verse',
    description: 'Create interactive reader-choice branches and alternate endings',
    pillar: 'narrative',
    credits: 1,
    slashCommand: '/multiverse',
    emoji: '🌌',
    keywords: ['branch', 'interactive', 'alternate', 'choice', 'ending'],
  },
  {
    id: 'autopilot',
    capabilityNumber: 9,
    title: 'Overnight Autopilot Co-Author',
    titleBn: 'অটোপাইলট ড্রাফট ইঞ্জিন',
    shortLabel: 'Autopilot',
    description: 'Queue multi-beat scene expansions with canon safety guardrails',
    pillar: 'narrative',
    credits: 3,
    slashCommand: '/autopilot',
    emoji: '🌙',
    keywords: ['expand', 'draft', 'auto', 'long', 'chapter', 'write more'],
  },

  // ── Pillar 2: Co-Author & Critique (#15–#26, #37) ──
  {
    id: 'character-duet',
    capabilityNumber: 22,
    title: 'Duet Scene Tennis',
    titleBn: 'ডুয়েট সিন টেনিস (সংলাপ)',
    shortLabel: 'Duet Tennis',
    description: 'Play turn-by-turn live dialogue with your protagonist or antagonist',
    pillar: 'co-author',
    credits: 1,
    slashCommand: '/duet',
    emoji: '🎭',
    keywords: ['dialogue', 'conversation', 'talk', 'character', 'scene', 'confrontation', 'সংলাপ', 'কথোপকথন'],
    pinnedInModes: ['write'],
  },
  {
    id: 'dialect-transpiler',
    capabilityNumber: 18,
    title: 'Regional Bangla Dialect Transpiler',
    titleBn: 'আঞ্চলিক ভাষা রূপান্তর (ঢাকাইয়া/সিলেটি/চাটগাঁইয়া)',
    shortLabel: 'Dialects',
    description: 'Convert dialogue into authentic Dhakaiya Kutti, Sylheti, Chittagonian, or Shadhu Bhasha',
    pillar: 'co-author',
    credits: 1,
    slashCommand: '/dialect',
    emoji: '🗣️',
    keywords: ['dialect', 'bangla', 'sylheti', 'chittagonian', 'dhakaiya', 'kutti', 'shadhu', 'আঞ্চলিক', 'ঢাকাইয়া', 'সিলেটি'],
    pinnedInModes: ['write'],
  },
  {
    id: 'block-catalyzer',
    capabilityNumber: 23,
    title: "Writer's Block Catalyzer",
    titleBn: 'রাইটার্স ব্লক ক্যাটালিস্ট',
    shortLabel: 'Catalyzer',
    description: 'Break through creative stalls with 3 unexpected narrative sparks or micro-conflicts',
    pillar: 'co-author',
    credits: 1,
    slashCommand: '/spark',
    emoji: '🔥',
    keywords: ['stuck', 'block', 'idea', 'help', 'start', 'opening', 'inspire', 'শুরু', 'আইডিয়া'],
  },
  {
    id: 'sensory-palette',
    capabilityNumber: 24,
    title: '5-Sense Immersion Palette',
    titleBn: 'পঞ্চইন্দ্রিয় বর্ণনা প্যালেট',
    shortLabel: '5 Senses',
    description: 'Layer monsoon petrichor, Old Dhaka street sounds, textures, and sensory depth',
    pillar: 'co-author',
    credits: 1,
    slashCommand: '/sensory',
    emoji: '🎨',
    keywords: ['describe', 'sensory', 'smell', 'sound', 'setting', 'atmosphere', 'vivid', 'বর্ণনা', 'পরিবেশ'],
  },
  {
    id: 'mfa-workshop',
    capabilityNumber: 37,
    title: 'MFA 4-Persona Critique Workshop',
    titleBn: 'এমএফএ সাহিত্য সমালোচনা প্যানেল',
    shortLabel: 'MFA Workshop',
    description: 'Roundtable critique from Structural Editor, Line Stylist, Cultural Critic, and Pacing Coach',
    pillar: 'co-author',
    credits: 2,
    slashCommand: '/critique',
    emoji: '🏛️',
    keywords: ['critique', 'review', 'feedback', 'argument', 'analyze', 'workshop', 'সমালোচনা', 'মতামত'],
  },
  {
    id: 'tension-ekg',
    capabilityNumber: 16,
    title: 'Emotional Arc & Tension EKG',
    titleBn: 'টেনশন ইসিজি ও পেসিং',
    shortLabel: 'Tension EKG',
    description: 'Map emotional beats, suspense spikes, and flat zones across your chapter',
    pillar: 'co-author',
    credits: 1,
    slashCommand: '/tension',
    emoji: '📈',
    keywords: ['pacing', 'tension', 'suspense', 'slow', 'boring', 'emotion', 'উত্তেজনা'],
  },
  {
    id: 'retention-radar',
    capabilityNumber: 15,
    title: 'Reader Drop-Off Retention Radar',
    titleBn: 'পাঠক ধরে রাখার রাডার',
    shortLabel: 'Retention Radar',
    description: 'Predict where readers might skim or put the book down and inject hooks',
    pillar: 'co-author',
    credits: 1,
    slashCommand: '/retention',
    emoji: '📡',
    keywords: ['hook', 'retention', 'drop', 'attention', 'reader', 'পাঠক'],
  },
  {
    id: 'relations',
    capabilityNumber: 17,
    title: 'Dynamic Character Relationship Web',
    titleBn: 'চরিত্রের সম্পর্ক জাল',
    shortLabel: 'Relations',
    description: 'Visualize shifting alliances, betrayals, and power dynamics between characters',
    pillar: 'co-author',
    credits: 1,
    slashCommand: '/relations',
    emoji: '🤝',
    keywords: ['relationship', 'family', 'enemy', 'love', 'alliance', 'সম্পর্ক'],
  },
  {
    id: 'showrunners',
    capabilityNumber: 19,
    title: 'Fact & Myth Research Anchor',
    titleBn: 'তথ্য ও মিথ গবেষণা অ্যাঙ্কর',
    shortLabel: 'Fact Anchor',
    description: 'Verify historical, scientific, or mythological accuracy inline',
    pillar: 'co-author',
    credits: 1,
    slashCommand: '/factcheck',
    emoji: '🔬',
    keywords: ['fact', 'research', 'citation', 'verify', 'history', 'source', 'তথ্য', 'গবেষণা'],
  },
  {
    id: 'char-messenger',
    capabilityNumber: 20,
    title: 'Direct Character DM Messenger',
    titleBn: 'চরিত্রের সাথে সরাসরি চ্যাট',
    shortLabel: 'Char Chat',
    description: 'Interview your characters in a 1-on-1 chat to uncover hidden motivations',
    pillar: 'co-author',
    credits: 1,
    slashCommand: '/charchat',
    emoji: '💬',
    keywords: ['interview', 'character voice', 'motivation', 'backstory'],
  },
  {
    id: 'beta-readers',
    capabilityNumber: 21,
    title: 'Synthetic Beta Reader Swarm',
    titleBn: 'বেটা রিডার প্যানেল',
    shortLabel: 'Beta Readers',
    description: 'Simulate reactions from 5 target reader personas (Thriller fan, Dhaka student, BookTokker)',
    pillar: 'co-author',
    credits: 2,
    slashCommand: '/betareaders',
    emoji: '👥',
    keywords: ['beta', 'audience', 'reaction', 'test reader'],
  },
  {
    id: 'streamer-mode',
    capabilityNumber: 26,
    title: 'Live Co-Writing Streamer Overlay',
    titleBn: 'লাইভ রাইটিং স্ট্রিমার মোড',
    shortLabel: 'Streamer',
    description: 'Broadcast writing sprints with live audience polls and spoiler blurs',
    pillar: 'co-author',
    credits: 0,
    slashCommand: '/streamer',
    emoji: '📺',
    keywords: ['stream', 'live', 'poll', 'sprint'],
  },

  // ── Pillar 3: Audio, Voice & Visual (#11–#14, #27, #36) ──
  {
    id: 'voice-casting',
    capabilityNumber: 11,
    title: '24kHz Multi-Character Bangla Voice Cast',
    titleBn: '২৪ কিলোহার্টজ মাল্টি-ভয়েস অডিওবুক',
    shortLabel: 'Voice Cast',
    description: 'Assign distinct neural Bangla voices to narrator and characters for studio audiobook synthesis',
    pillar: 'audio-visual',
    credits: 2,
    slashCommand: '/audio',
    emoji: '🎙️',
    keywords: ['audio', 'voice', 'tts', 'audiobook', 'listen', 'narrate', 'অডিও', 'কণ্ঠ'],
  },
  {
    id: 'phoneme-tuner',
    capabilityNumber: 12,
    title: 'Bangla IPA & Phoneme Pronunciation Tuner',
    titleBn: 'বাংলা উচ্চারণ ও ফোনিম টিউনার',
    shortLabel: 'Phoneme Tuner',
    description: 'Fine-tuneuktakshar (যুক্তাক্ষর), poetic meter, and emotional pauses for TTS',
    pillar: 'audio-visual',
    credits: 1,
    slashCommand: '/phoneme',
    emoji: '🔤',
    keywords: ['pronunciation', 'ipa', 'phoneme', 'accent', 'উচ্চারণ'],
  },
  {
    id: 'soundscape',
    capabilityNumber: 13,
    title: '3D Binaural Literary Soundscape',
    titleBn: 'থ্রিডি আবহসংগীত ও সাউন্ডস্কেপ',
    shortLabel: '3D Soundscape',
    description: 'Mix rain on tin roofs, Baul ektara, or noir ambience behind your audiobook',
    pillar: 'audio-visual',
    credits: 2,
    slashCommand: '/soundscape',
    emoji: '🎧',
    keywords: ['music', 'ambient', 'rain', 'sound', 'binaural', 'আবহ'],
  },
  {
    id: 'booktok',
    capabilityNumber: 14,
    title: 'BookTok & Reels Viral Teaser Studio',
    titleBn: 'বুকটক ও রিলস ভিডিও টিজার',
    shortLabel: 'BookTok Reels',
    description: 'Generate 9:16 kinetic typography teasers with Bangla voiceover for social launch',
    pillar: 'audio-visual',
    credits: 2,
    slashCommand: '/booktok',
    emoji: '📱',
    keywords: ['tiktok', 'reel', 'video', 'promo', 'marketing', 'trailer', 'প্রচার'],
    pinnedInModes: ['publish'],
  },
  {
    id: 'room-blocking',
    capabilityNumber: 27,
    title: '3D Spatial Scene & Room Blocking',
    titleBn: 'দৃশ্যপট ও রুম ব্লকিং',
    shortLabel: 'Room Blocking',
    description: 'Map character positions, sightlines, and props inside a crime scene or room',
    pillar: 'audio-visual',
    credits: 1,
    slashCommand: '/blocking',
    emoji: '📐',
    keywords: ['room', 'position', 'blocking', 'camera', 'choreography'],
  },
  {
    id: 'storyboard',
    capabilityNumber: 36,
    title: 'Screenplay & Graphic Novel Storyboard',
    titleBn: 'চিত্রনাট্য ও কমিক স্টোরিবোর্ড',
    shortLabel: 'Script / Comic',
    description: 'Convert prose scenes into industry-standard screenplay beats and comic panels',
    pillar: 'audio-visual',
    credits: 2,
    slashCommand: '/storyboard',
    emoji: '🎞️',
    keywords: ['script', 'screenplay', 'comic', 'storyboard', 'panel', 'film', 'চিত্রনাট্য'],
  },

  // ── Pillar 4: Worldbuilding & Continuity (#28–#35) ──
  {
    id: 'chrono-braider',
    capabilityNumber: 34,
    title: 'Non-Linear Chrono-Braider (1952 / 1971 / 2026)',
    titleBn: 'ক্রোনো-ব্রেইডার (১৯৭১ ও সমান্তরাল কালরেখা)',
    shortLabel: 'Chrono-Braider',
    description: 'Weave dual timelines (e.g., 1971 Liberation War & modern Dhaka) without anachronisms',
    pillar: 'world-lore',
    credits: 1,
    slashCommand: '/chrono',
    emoji: '⏳',
    keywords: ['1971', 'timeline', 'flashback', 'history', 'year', 'date', 'কালরেখা', 'মুক্তিযুদ্ধ', 'ইতিহাস'],
  },
  {
    id: 'lore-wiki',
    capabilityNumber: 30,
    title: 'Auto-Generated World Lore Wiki',
    titleBn: 'ওয়ার্ল্ড লোর উইকি',
    shortLabel: 'Lore Wiki',
    description: 'Compile locations, dynasties, factions, and glossary entries automatically',
    pillar: 'world-lore',
    credits: 1,
    slashCommand: '/lore',
    emoji: '🏛️',
    keywords: ['world', 'lore', 'wiki', 'encyclopedia', 'faction', 'place'],
  },
  {
    id: 'spatial-gps',
    capabilityNumber: 33,
    title: 'Real-World Dhaka & Bengal Spatial GPS',
    titleBn: 'ভৌগোলিক জিপিএস ও দূরত্ব যাচাই',
    shortLabel: 'Spatial GPS',
    description: 'Validate travel times, rivers, and landmarks across Old Dhaka, Sundarbans, and Bengal',
    pillar: 'world-lore',
    credits: 1,
    slashCommand: '/gps',
    emoji: '🗺️',
    keywords: ['map', 'dhaka', 'travel', 'location', 'geography', 'street', 'ঢাকা', 'মানচিত্র'],
  },
  {
    id: 'cognitive-friction',
    capabilityNumber: 28,
    title: 'Cognitive Friction & Readability Heatmap',
    titleBn: 'পঠন স্বাচ্ছন্দ্য ও ফ্রিকশন ম্যাপ',
    shortLabel: 'Friction Map',
    description: 'Highlight dense clauses, tongue-twisters, and eye-fatigue zones',
    pillar: 'world-lore',
    credits: 1,
    slashCommand: '/friction',
    emoji: '🧠',
    keywords: ['readability', 'complex', 'hard to read', 'clarity', 'friction', 'সহজবোধ্য'],
    pinnedInModes: ['format'],
  },
  {
    id: 'dreamscape',
    capabilityNumber: 29,
    title: 'Surrealist & Magical Realism Weaver',
    titleBn: 'জাদুবাস্তবতা ও স্বপ্নবুনন',
    shortLabel: 'Dreamscape',
    description: 'Infuse Jibanananda-style imagery, mythic motifs, and dream logic',
    pillar: 'world-lore',
    credits: 1,
    slashCommand: '/dream',
    emoji: '🌙',
    keywords: ['dream', 'surreal', 'poetry', 'metaphor', 'magical realism', 'কবিতা', 'স্বপ্ন'],
  },
  {
    id: 'plot-divergence',
    capabilityNumber: 35,
    title: '"What-If" Butterfly Effect Simulator',
    titleBn: 'হোয়াট-ইফ বাটারফ্লাই সিমুলেটর',
    shortLabel: 'Divergence',
    description: 'Test how changing one event in Chapter 2 ripples through Chapter 12',
    pillar: 'world-lore',
    credits: 1,
    slashCommand: '/whatif',
    emoji: '🦋',
    keywords: ['what if', 'alternate', 'change', 'ripple', 'divergence'],
  },
  {
    id: 'item-ledger',
    capabilityNumber: 31,
    title: 'Inventory & Relic Continuity Ledger',
    titleBn: 'বস্তু ও নিদর্শন খতিয়ান',
    shortLabel: 'Item Ledger',
    description: 'Track who holds key letters, weapons, keys, or heirlooms in every scene',
    pillar: 'world-lore',
    credits: 1,
    slashCommand: '/items',
    emoji: '🗝️',
    keywords: ['item', 'object', 'weapon', 'letter', 'inventory', 'prop'],
  },
  {
    id: 'living-epilogue',
    capabilityNumber: 32,
    title: 'Post-Book Living Epilogue Generator',
    titleBn: 'লিভিং এপিলোগ ও পরবর্তী অধ্যায়',
    shortLabel: 'Living Epilogue',
    description: 'Generate canonical letters, newspaper clippings, and sequel hooks after the finale',
    pillar: 'world-lore',
    credits: 1,
    slashCommand: '/epilogue',
    emoji: '📜',
    keywords: ['epilogue', 'sequel', 'afterword', 'bonus', 'সমাপ্তি'],
  },
  {
    id: 'folk-scorer',
    capabilityNumber: 25,
    title: 'Bengal Folk & Cultural Authenticity Scorer',
    titleBn: 'বাংলার লোকজ ও সাংস্কৃতিক প্রামাণ্যতা',
    shortLabel: 'Folk Scorer',
    description: 'Enrich manuscripts with authentic proverbs (প্রবাদ), seasonal rhythms, and cultural idioms',
    pillar: 'world-lore',
    credits: 1,
    slashCommand: '/folk',
    emoji: '🪷',
    keywords: ['proverb', 'culture', 'folk', 'bengali', 'tradition', 'প্রবাদ', 'সংস্কৃতি'],
  },

  // ── Pillar 5: Boi Mela Print, Typesetting & Legal (#38–#45 + Studio Utils) ──
  {
    id: 'print-preflight',
    capabilityNumber: 38,
    title: 'Nilkhet 6×9 Print Preflight & Forma Calculator',
    titleBn: 'প্রিন্ট প্রিফ্লাইট (নীলক্ষেত ফর্মা ও ব্লিড)',
    shortLabel: 'প্রিন্ট প্রিফ্লাইট',
    description: 'Verify 16-page forma signatures, 3mm bleed, 300 DPI CMYK, and SolaimanLipi/Kalpurush embedding',
    pillar: 'print-publish',
    credits: 2,
    slashCommand: '/preflight',
    emoji: '🖨️',
    keywords: ['print', 'nilkhet', 'pdf', 'boimela', 'forma', 'margin', 'bleed', 'প্রিন্ট', 'নীলক্ষেত', 'বইমেলা'],
    pinnedInModes: ['format'],
  },
  {
    id: 'book-jacket',
    capabilityNumber: 39,
    title: '3D Book Jacket & Spine Caliper Designer',
    titleBn: 'বুক জ্যাকেট ও স্পাইন ক্যালিপার',
    shortLabel: 'বুক জ্যাকেট',
    description: 'Calculate exact spine width in mm for 70/80/100 GSM paper and generate print-ready cover flaps',
    pillar: 'print-publish',
    credits: 2,
    slashCommand: '/jacket',
    emoji: '📕',
    keywords: ['cover', 'jacket', 'spine', 'design', 'hardcover', 'প্রচ্ছদ', 'বুক জ্যাকেট'],
    pinnedInModes: ['format'],
  },
  {
    id: 'cip-barcode',
    capabilityNumber: 40,
    title: 'NLB CIP Block & EAN-13 ISBN Barcode Generator',
    titleBn: 'CIP ও ISBN বারকোড জেনারেটর',
    shortLabel: 'CIP ও বারকোড',
    description: 'Generate National Library of Bangladesh copyright page blocks and vector ISBN-13 barcodes',
    pillar: 'print-publish',
    credits: 1,
    slashCommand: '/isbn',
    emoji: '🏛️',
    keywords: ['isbn', 'barcode', 'copyright', 'cip', 'national library', 'বারকোড'],
    pinnedInModes: ['publish'],
  },
  {
    id: 'legal-shield',
    capabilityNumber: 45,
    title: 'Defamation & Copyright Legal Shield',
    titleBn: 'লিগ্যাল শিল্ড ও মানহানি অডিট',
    shortLabel: 'লিগ্যাল শিল্ড',
    description: 'Scan manuscript for real-person defamation risk, sensitive trademarks, and legal disclaimers',
    pillar: 'print-publish',
    credits: 2,
    slashCommand: '/legal',
    emoji: '🛡️',
    keywords: ['legal', 'defamation', 'law', 'disclaimer', 'safe', 'আইনি'],
    pinnedInModes: ['publish'],
  },
  {
    id: 'royalty-split',
    capabilityNumber: 44,
    title: 'Co-Author Royalty Split & First-Edition Ledger',
    titleBn: 'রয়্যালটি স্প্লিট ও ফার্স্ট এডিশন',
    shortLabel: 'রয়্যালটি স্প্লিট',
    description: 'Configure transparent BDT/USD revenue splits across authors, illustrators, and translators',
    pillar: 'print-publish',
    credits: 1,
    slashCommand: '/royalty',
    emoji: '💰',
    keywords: ['royalty', 'money', 'split', 'sales', 'earnings', 'রয়্যালটি'],
    pinnedInModes: ['publish'],
  },
  {
    id: 'polyglot-matrix',
    capabilityNumber: 42,
    title: 'Polyglot Literary Translation Matrix',
    titleBn: 'পলিগ্লট অনুবাদ ম্যাট্রিক্স',
    shortLabel: 'পলিগ্লট অনুবাদ',
    description: 'Translate chapters across Bengali, English, Hindi, and Arabic while preserving idioms',
    pillar: 'print-publish',
    credits: 2,
    slashCommand: '/translate',
    emoji: '🌐',
    keywords: ['translate', 'english', 'bengali', 'bilingual', 'অনুবাদ'],
  },
  {
    id: 'bilingual-split',
    title: 'Side-by-Side Bilingual Split Editor',
    titleBn: 'দ্বিভাষিক স্প্লিট ভিউ',
    shortLabel: 'Bilingual Split',
    description: 'Compare and align Bengali original and English translation paragraph-by-paragraph',
    pillar: 'print-publish',
    credits: 0,
    slashCommand: '/bilingual',
    emoji: '⚖️',
    keywords: ['bilingual', 'parallel', 'side by side', 'দ্বিভাষিক'],
    pinnedInModes: ['format'],
  },
  {
    id: 'webnovel-paywall',
    capabilityNumber: 41,
    title: 'Serialized Webnovel Cliffhanger & Paywall Slicer',
    titleBn: 'ওয়েবনভেল পেওয়াল স্লাইসার',
    shortLabel: 'পেওয়াল স্লাইসার',
    description: 'Slice long manuscripts into high-converting 1,500-word serialized episodes',
    pillar: 'print-publish',
    credits: 1,
    slashCommand: '/paywall',
    emoji: '🔓',
    keywords: ['serialize', 'episode', 'webnovel', 'cliffhanger', 'পর্ব'],
  },
  {
    id: 'reading-scaler',
    capabilityNumber: 43,
    title: 'Age-Group & Reading Level Scaler',
    titleBn: 'রিডিং লেভেল স্কেলার (শিশু/কিশোর/প্রাপ্তবয়স্ক)',
    shortLabel: 'রিডিং স্কেলার',
    description: 'Adapt vocabulary for Young Adult (কিশোর উপন্যাস), Children, or Academic readers',
    pillar: 'print-publish',
    credits: 1,
    slashCommand: '/scaler',
    emoji: '📏',
    keywords: ['children', 'kids', 'teen', 'simplify', 'academic', 'কিশোর'],
  },
  {
    id: 'branches',
    title: 'Git-Style Manuscript Branches',
    titleBn: 'ম্যানুস্ক্রিপ্ট ভার্সন ও ব্রাঞ্চ',
    shortLabel: 'Branches',
    description: 'Create non-destructive draft branches and compare alternative chapter revisions',
    pillar: 'narrative',
    credits: 0,
    slashCommand: '/branches',
    emoji: '🌿',
    keywords: ['version', 'git', 'branch', 'backup', 'history'],
  },
  {
    id: 'copyright',
    title: 'Cryptographic Proof of Authorship Certificate',
    titleBn: 'স্বত্বাধিকার সনদ (SHA-256)',
    shortLabel: 'Copyright Cert',
    description: 'Generate a timestamped SHA-256 authorship certificate for your manuscript',
    pillar: 'print-publish',
    credits: 0,
    slashCommand: '/certificate',
    emoji: '🏅',
    keywords: ['certificate', 'proof', 'authorship', 'hash'],
  },
  {
    id: 'podcast',
    title: 'Audiobook & Author Podcast RSS Studio',
    titleBn: 'পডকাস্ট ও অডিও আরএসএস',
    shortLabel: 'Podcast RSS',
    description: 'Package narrated chapters into a distributable podcast feed',
    pillar: 'audio-visual',
    credits: 1,
    slashCommand: '/podcast',
    emoji: '📻',
    keywords: ['podcast', 'rss', 'episode', 'spotify'],
  },
];

export const INKOS_TOOL_MAP: Record<InkOsToolId, InkOsToolItem> = Object.fromEntries(
  INKOS_TOOLS.map((t) => [t.id, t])
) as Record<InkOsToolId, InkOsToolItem>;

/**
 * Recommends 3 high-value InkOS tools directly inside an AI Chat response
 * based on user prompt, AI reply, and current manuscript content.
 */
export function recommendInkOsToolsForChat(
  userPrompt: string,
  aiResponse: string,
  manuscriptContent: string
): InkOsToolRecommendation[] {
  const combined = `${userPrompt} ${aiResponse}`.toLowerCase();
  const recommendations: InkOsToolRecommendation[] = [];
  const usedIds = new Set<InkOsToolId>();

  const pushTool = (id: InkOsToolId, reason: string) => {
    if (usedIds.has(id) || recommendations.length >= 3) return;
    const tool = INKOS_TOOL_MAP[id];
    if (tool) {
      usedIds.add(id);
      recommendations.push({ tool, reason });
    }
  };

  // 1. Check explicit slash command first
  const trimmedPrompt = userPrompt.trim().toLowerCase();
  if (trimmedPrompt.startsWith('/')) {
    const matched = INKOS_TOOLS.find((t) => trimmedPrompt.startsWith(t.slashCommand));
    if (matched) {
      pushTool(matched.id, `Launch ${matched.title} (#${matched.capabilityNumber || 'Studio'})`);
    }
  }

  // 2. Dialogue / Character / Conversation intent
  if (/dialogue|conversation|talk|said|asked|character|সংলাপ|কথা|চরিত্র|হিমু|রফিক/.test(combined)) {
    pushTool('character-duet', 'Roleplay the next 4 turns live in Duet Scene Tennis (#22)');
    pushTool('dialect-transpiler', 'Convert dialogue to Dhakaiya Kutti, Sylheti, or Chittagonian (#18)');
    pushTool('voice-casting', 'Preview this scene with 24kHz Neural Bangla Voice Cast (#11)');
  }

  // 3. Historical / 1971 / Timeline / Setting intent
  if (/1971|1952|history|war|flashback|dhaka|timeline|মুক্তিযুদ্ধ|ইতিহাস|ঢাকা|কালরেখা/.test(combined)) {
    pushTool('chrono-braider', 'Verify 1971 / multi-era timeline accuracy in Chrono-Braider (#34)');
    pushTool('spatial-gps', 'Check Old Dhaka & Bengal landmarks in Spatial GPS (#33)');
    pushTool('showrunners', 'Anchor historical facts & citations (#19)');
  }

  // 4. Writer's block / Starting / Plotting / Next chapter intent
  if (/start|opening|stuck|next|plot|outline|idea|chapter|শুরু|প্লট|আইডিয়া/.test(combined)) {
    pushTool('block-catalyzer', 'Break writer’s block with 3 unexpected scene sparks (#23)');
    pushTool('forecast', 'Simulate 3 branching plot trajectories (#1)');
    pushTool('story-bible', 'Lock new character & plot rules into Story Bible (#10)');
  }

  // 5. Polishing / Rewriting / Clarity / Critique intent
  if (/clear|rewrite|improve|polish|argument|critique|review|style|সংশোধন|মার্জিত|সমালোচনা/.test(combined)) {
    pushTool('deslop', 'Strip AI clichés and tighten prose with De-Slop (#3)');
    pushTool('sensory-palette', 'Infuse 5-sense atmospheric details (#24)');
    pushTool('mfa-workshop', 'Run a 4-seat MFA Workshop critique (#37)');
  }

  // 6. Publishing / Print / Boi Mela / Cover intent
  if (/print|publish|boimela|nilkhet|cover|isbn|pdf|প্রিন্ট|বইমেলা|প্রচ্ছদ|নীলক্ষেত/.test(combined)) {
    pushTool('print-preflight', 'Run Nilkhet 6×9 Print & Forma Preflight (#38)');
    pushTool('book-jacket', 'Calculate exact spine mm & 3D Book Jacket (#39)');
    pushTool('legal-shield', 'Run Pre-Press Defamation & Copyright Shield (#45)');
  }

  // Fallback high-comfort defaults so every chat response has 3 actionable Studio chips
  const plainManuscript = manuscriptContent.replace(/<[^>]+>/g, ' ').trim();
  if (plainManuscript.length > 600) {
    pushTool('tension-ekg', 'Check chapter pacing & emotional arc in Tension EKG (#16)');
  }
  pushTool('deslop', 'Polish & remove AI clichés with Anti-Slop Linter (#3)');
  pushTool('sensory-palette', 'Add 5-sense literary immersion to this section (#24)');
  pushTool('story-bible', 'Open Story Bible HUD to pin characters & lore (#10)');

  return recommendations.slice(0, 3);
}

/**
 * Ambient, non-intrusive Co-Pilot whisper based on live manuscript signals.
 */
export function detectAmbientCoPilotWhisper(manuscriptContent: string): {
  id: string;
  message: string;
  tools: InkOsToolItem[];
} | null {
  const plain = manuscriptContent.replace(/<[^>]+>/g, ' ').trim();
  const wordCount = plain ? plain.split(/\s+/).length : 0;

  if (wordCount < 45) {
    return {
      id: 'whisper-opening',
      message: 'Starting a new chapter? Spark 3 opening hooks or check your Story Bible.',
      tools: [INKOS_TOOL_MAP['block-catalyzer'], INKOS_TOOL_MAP['story-bible'], INKOS_TOOL_MAP['forecast']],
    };
  }

  const quoteMatches = plain.match(/[“"”'‘’—]/g);
  if (quoteMatches && quoteMatches.length >= 8) {
    return {
      id: 'whisper-dialogue',
      message: 'Dialogue-rich scene detected — try regional Bangla dialects or 24kHz voice preview.',
      tools: [INKOS_TOOL_MAP['dialect-transpiler'], INKOS_TOOL_MAP['character-duet'], INKOS_TOOL_MAP['voice-casting']],
    };
  }

  if (wordCount >= 300) {
    return {
      id: 'whisper-polish',
      message: `${wordCount.toLocaleString()} words drafted — ready to run De-Slop or Tension EKG?`,
      tools: [INKOS_TOOL_MAP['deslop'], INKOS_TOOL_MAP['tension-ekg'], INKOS_TOOL_MAP['mfa-workshop']],
    };
  }

  return {
    id: 'whisper-default',
    message: 'Tip: Type / in chat or press Ctrl+Shift+P to launch any of the 45 InkOS engines.',
    tools: [INKOS_TOOL_MAP['deslop'], INKOS_TOOL_MAP['sensory-palette'], INKOS_TOOL_MAP['print-preflight']],
  };
}
