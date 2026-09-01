# Shothik AI — Complete Strategy & Validation Report

## VC Due Diligence, Platform Architecture & Go-to-Market Strategy

**Prepared for**: VC Investor Review
**Date**: March 2026
**Subject**: Shothik AI — AI-Powered Writing & Human-Agent Publishing Platform for STEM Researchers

---

## Executive Summary

This report presents a comprehensive analysis of Shothik AI across three dimensions: market validation, platform economics, and product architecture. It consolidates independent web research, competitive intelligence, LLM cost modeling, and platform design into a single strategy document.

**Three core investment theses are evaluated:**

1. **Thesis 1 — STEM Writing Market Gap**: A real, monetizable gap exists in STEM-specific writing tools that QuillBot and general-purpose tools fail to address. **Verdict: VALIDATED.**
2. **Thesis 2 — Integrated Writing-to-Publishing Platform**: A unified "Kindle meets Replit" platform that spans research through distribution is viable and addresses a fragmented market. **Verdict: PARTIALLY VALIDATED.**
3. **Thesis 3 — Human-Agent Collaborative Ecosystem**: A dual human-agent publishing ecosystem with community review, attention-economy monetization, and quality curation is a defensible long-term bet. **Verdict: VALIDATED WITH STRONG UNIT ECONOMICS.**

**Beyond validation**, this report presents a concrete product architecture — the **Shothik Agent Hub** — that combines lessons from Moltbook (2.6M AI agents in 6 weeks), Bigo Live ($2B virtual gift economy), Reddit (community curation + data licensing), Facebook ($200B attention-to-revenue), and App Store (submission-review-discovery pipeline) into a unified review, discovery, and monetization layer.

**Key financial findings:**
- LLM cost per tool use: **$0.001 average** (Gemini 2.5 Flash)
- Gross margins: **90%+** even at $4.99/mo Student tier
- Per-use cost advantage: **10-50x cheaper** than GPT-based competitors
- Revenue streams identified: **8** (subscriptions, credit packs, publishing fees, Stars virtual economy, content marketplace, agent marketplace, institutional licensing, data/insights)

---

---

# Part I: Market Validation

## 1. The STEM Writing Market Gap

### The Question

> "You claim STEM researchers have unmet writing needs that general tools like QuillBot don't address. Show me the evidence."

### 1.1 Market Size and Growth

| Segment | 2024 Value | Projected (2032+) | CAGR |
|---------|------------|-------------------|------|
| AI Writing Assistant Software | $1.75B | $10.3B | 11.5-24.8% |
| Academic Writing Software | $2.18B | ~$6.3B | 8.6-12% |
| Writing Enhancement Software | $0.74B | $1.55B | 13.0-13.6% |

The academic writing software market alone is valued at $2.18B (2024) and growing at 8.6-12% CAGR. The broader AI writing tools market is growing even faster at 11.5-24.8% CAGR.

**Asia-Pacific is the fastest-growing region at 15.5% CAGR**, driven by rising R&D investment in China, India, and Singapore, English proficiency demands in academic publishing, and government digital literacy initiatives. North America holds 37.5-40% market share.

### 1.2 QuillBot: Dominant but Limited

QuillBot has achieved significant scale:

- **75 million registered users**, 25 million MAU
- **~$100M annual revenue**, ~$500M estimated valuation
- **70% of users are students/academics**
- **40% year-over-year user growth**
- **22.12% market share** in AI writing agents

However, QuillBot has well-documented limitations for STEM users:

| Limitation | Impact on STEM Users |
|-----------|---------------------|
| 6,000 character limit per input | Insufficient for research papers |
| No LaTeX or mathematical notation support | Cannot handle equations, formulas |
| Domain-specific terminology errors | May oversimplify or misinterpret specialized terms |
| Citation generator requires manual verification | Not reliable for academic integrity |
| Plagiarism detection less robust than Turnitin | Insufficient for institutional standards |
| Primarily English-focused | Limited support for multilingual researchers |
| No IMRaD structure awareness | Not optimized for research paper formats |
| Cannot process data tables/figures | Limited to text-only paraphrasing |

### 1.3 Documented STEM Researcher Pain Points

From market analyses and expert commentary, the following unmet needs are consistently identified:

1. **Contextual nuance**: AI tools struggle with STEM jargon, domain-specific phrasing, and mathematical notation
2. **Citation complexity**: Managing LaTeX, BibTeX, and specialty formats (IEEE, ACS, etc.) remains fragmented across tools
3. **Data visualization + text integration**: No mainstream tool unifies figure generation, code output, and narrative writing
4. **Cost barriers**: Premium tiers of Grammarly ($12/mo), Overleaf Pro ($21/mo), and Turnitin (institutional pricing) are expensive for independent researchers in developing markets
5. **Integration with lab workflows**: Limited connections to GitHub, Jupyter, MATLAB, R Markdown
6. **Open-access publishing support**: Tools don't streamline the preprint-to-journal submission pipeline

### 1.4 Current STEM-Specific Solutions

The competitive response is emerging but incomplete:

- **Springer Nature Curie**: Trained on 1M+ edits from Nature journals; STEM-focused language model, but narrow in scope (editing only, no writing studio)
- **Overleaf + Elsevier (April 2025)**: AI-powered manuscript formatting + peer review management, but LaTeX-only and steep learning curve
- **DeepL Write Pro**: Customizable terminology for technical writing, but limited to English/German
- **Grammarly**: Added Spanish, French, German, Italian, Portuguese (Sept 2025), but no STEM domain specialization

**Key finding**: No existing platform combines STEM-domain-aware AI writing, research tools (Deep Research, Sheets, Slides), and publishing in a single workflow. This is the gap Shothik AI targets.

### 1.5 Regional Opportunity: Bangladesh and South Asia

- Bangladesh EdTech market estimated at **$700M-$1B** annually with **20% CAGR**
- Total addressable population: **75 million** (ages 10-34), including 43M students
- **Only 1-2% adoption** of full academic edtech solutions vs. 33%+ in India and 50%+ in China
- **300+ edtech startups** in Bangladesh, but academic writing tools remain an underserved niche
- University students face a soft skills gap transitioning from HSC/O-level to university-level academic writing
- Students seek tools priced at **75-80% discount** vs. international alternatives

### 1.6 Verdict: Thesis 1

| Factor | Assessment |
|--------|-----------|
| Market size | Validated. $2.18B academic writing market, $6.3B by 2032 |
| Gap existence | Validated. QuillBot's STEM limitations are well-documented |
| Competitive moat potential | Moderate. STEM specialization creates differentiation, but barriers to entry are low |
| Regional opportunity | Strong. South Asia is the fastest-growing region with lowest adoption |
| Risk | Execution risk: Can Shothik build STEM-domain models that genuinely outperform general tools? QuillBot (75M users) could add STEM features |

**Overall: VALIDATED with execution caveats.** The gap is real and quantifiable. The question is whether Shothik can capture it before incumbents close it.

---

## 2. The Integrated Writing-to-Publishing Platform

### The Question

> "You're proposing to unify the entire pipeline from research to writing to formatting to distribution. Explain your go-to-market sequencing and why users would choose your distribution layer over simply exporting to Kindle Direct Publishing or Google Books directly."

### 2.1 The Publishing Market Landscape

| Metric | Value |
|--------|-------|
| Global eBook market (2025) | $15-27B |
| Self-publishing services market (2024) | $278M |
| Books self-published annually (US alone) | 1.7 million |
| Self-published book units sold globally | 300 million/year |
| eBook market growth rate | 4-6% CAGR |

### 2.2 Amazon/Kindle Dominance

Amazon's position in digital publishing is formidable:

- **67-70% of US eBook sales**, rising to **83% including Kindle Unlimited**
- **87.9% of UK eBook sales**
- **91.5% of all US self-published books** go through KDP
- **$520M+ in annual royalties** paid to 1M+ KDP authors
- **1.4 million self-published books annually** through KDP alone

However, an important counterpoint: when aggregated, **53% of digital book revenue flows through non-Amazon channels**. This means the market is concentrated but not monopolistic.

### 2.3 The Fragmented Workflow Problem

Currently, a researcher or author must stitch together multiple disconnected tools:

| Stage | Current Tools | Pain Point |
|-------|-------------|-----------|
| Research | Notion, Zotero, Mendeley, Google Scholar | Not integrated with writing |
| Writing | Google Docs, Word, Overleaf, Scrivener | No AI assistance, no STEM awareness |
| Formatting | LaTeX, InDesign, Reedsy | Steep learning curve, separate tool |
| Publishing | KDP, Draft2Digital, IngramSpark | Manual upload, each platform separate |
| Distribution | Amazon, Apple Books, Google Play | Must manage multiple dashboards |

**No single platform spans research through distribution.** Notion excels at research/collaboration (100M+ users, 87% higher task completion) but has no publishing layer. Overleaf excels at LaTeX but has no distribution. KDP excels at distribution but has no writing tools.

### 2.4 Emerging Integrated Platforms

New entrants are beginning to stitch pieces together:

- **Spines**: Aims to publish 8,000 AI-assisted books in 2025 using AI for editing, cover design, and formatting. But primarily a service, not a self-serve platform.
- **Clio (UK)**: Voice-to-book platform where authors speak business books into existence, with AI structuring/editing plus human teams for final production. Narrow focus on business books.
- **Squibler**: AI-assisted novel/book writing with scene structuring and genre-specific tools. No publishing/distribution layer.
- **Reedsy**: Marketplace connecting authors with editors, designers, and marketers. Tools-focused, not an integrated workflow.

### 2.5 The "Kindle meets Replit" Value Proposition

The analogy maps as follows:

| Inspiration | What Shothik Takes | Current Gap Being Filled |
|------------|-------------------|------------------------|
| **Kindle** | Distribution, reading experience, marketplace | Authors currently must leave their writing tool to publish |
| **Replit** | Continuous creation environment, real-time collaboration, deployment | No writing platform has "deploy to distribution" like Replit has "deploy to production" |

The strongest version of this thesis: **reduce the author's workflow from 5+ tools to 1.** Writing Studio (books, research papers, assignments) -> format -> publish -> distribute, all in one environment.

### 2.6 Why Users Might Choose Shothik Over Direct KDP Upload

Potential advantages of an integrated platform:

1. **Workflow reduction**: Eliminates tool-switching between Notion/Overleaf/InDesign/KDP
2. **Multi-platform distribution**: PublishDrive-style aggregation (Shothik already integrates PublishDrive) reaching Amazon, Apple, Google, Kobo simultaneously
3. **STEM-specific formatting**: Auto-format for IEEE, ACM, Springer journal templates
4. **Agent-assisted publishing**: AI handles formatting, metadata, cover design, SEO optimization
5. **Community layer**: Peer review, community discussion before publication (unique to Shothik)
6. **100% royalty retention**: Via aggregator model (PublishDrive offers this) vs. KDP's 30-35% take

### 2.7 Market Timing

Several trends favor an integrated platform entering now:

- AI in publishing is projected to grow from **$2.8B (2023) to $41.2B by 2033** (30.8% CAGR)
- **54% of publishers** already use AI daily (2024)
- **Open access expansion**: Revenue grew from $1.9B (2023) to $2.1B (2024), projected $3.2B by 2028
- Audiobook market growing at **26.4% annually**, creating new format demands
- Interactive/multimedia publications emerging as a trend

### 2.8 Verdict: Thesis 2

| Factor | Assessment |
|--------|-----------|
| Market opportunity | Validated. $15-27B eBook market + $278M self-publishing services |
| Fragmentation problem | Validated. No single tool spans research to distribution |
| Competitive moat | Weak-to-moderate. Amazon dominates distribution; integration is the moat |
| Kindle displacement risk | High. Amazon's 67-83% market share makes direct competition suicidal; aggregation (PublishDrive model) is the right strategy |
| Go-to-market clarity | Needs sharpening. Which segment adopts first? What's the conversion path? |
| Risk | Platform risk: Can a startup out-integrate Amazon, Google, and Apple simultaneously? Surface area is massive |

**Overall: PARTIALLY VALIDATED.** The fragmentation problem is real and the timing is right, but the go-to-market sequencing needs to be razor-sharp. Starting with STEM-specific writing tools (where the gap is proven) and expanding into publishing is more defensible than trying to build the full stack at once. The "why not just export to KDP" question remains Shothik's biggest challenge — the answer must be **multi-platform distribution + AI-assisted formatting + community review**, not competing with KDP directly.

---

---

# Part II: The Human-Agent Collaborative Ecosystem

## 3. The Agentic AI Wave

### The Question

> "You describe a future where autonomous AI agents and human creators co-publish. What is the smallest version of this you've already built and tested?"

### 3.1 2025-2026: AI-as-Tool to AI-as-Agent

2025-2026 marks the transition from AI-as-tool to AI-as-agent:

- **Auto-GPT, AgentGPT, and custom agents** now execute multi-step workflows autonomously
- Moving from "one prompt = one response" to agents that plan, execute, and iterate over long-term goals
- AI agents becoming "full-fledged writing collaborators" handling research, drafting, and editing

### 3.2 Current State of AI in Publishing

| Metric | Value |
|--------|-------|
| Publishers using AI daily | 54% (2024) |
| Publishers believing AI will change their business | 68% |
| AI-assisted web content exceeding human-only content | 52% (May 2025) |
| Of that, collaborative human-AI content | 71.7% |
| AI content increases organic traffic | +31% |
| Human-edited AI content engagement boost | +16% vs human-only |
| Top-ranking content using hybrid model | 78% |
| Teams using AI-human workflows ROI improvement | +42% |

**The winning model is hybrid, not fully autonomous.** 71% of publishers say AI drafts still need major editing before publication. The most successful content follows a collaborative human-AI workflow.

### 3.3 Pioneer Platforms

| Platform | Model | Scale |
|----------|-------|-------|
| **Spines** | AI-assisted publishing at scale | Targeting 8,000 books in 2025 |
| **Clio** | Voice-to-book with AI structuring + human editing | UK-based, business books |
| **Squibler** | AI-assisted novel writing | Scene structuring, genre-specific |
| **Jasper** | AI writing with collaborative workflows | Marketing-focused |

### 3.4 Shothik's Agent Architecture

Shothik's approach is differentiated in several ways:

- **Agent authentication**: Agents use API keys (`shothik_agent_` prefix) with hashed storage
- **Human master oversight**: Agents write and format books, but humans approve/reject before publication
- **Community review layer**: Forum threads created for community discussion before publication
- **Quality gates**: AI quality checks must pass before master notification
- **Dual storage**: Local persistence + Convex cloud sync for real-time collaboration

This is notably more structured than most AI writing platforms, which treat AI as a passive assistant rather than an autonomous contributor with oversight.

## 4. Moltbook: The Agent Social Network Experiment

### 4.1 What is Moltbook?

Moltbook is a social network launched January 28, 2026 by Matt Schlicht — described as "Reddit for AI agents." Acquired by Meta on March 10, 2026.

| Metric | Value |
|--------|-------|
| Registered agents | 2.6M+ |
| Topic communities (Submolts) | 17,000+ |
| Posts | 740K+ |
| Comments | 12M+ |
| Architecture | Reddit-style threads + voting |
| Framework | OpenClaw (114K+ GitHub stars) |
| Humans | Can observe only, cannot participate |

### 4.2 How Agents Interact on Moltbook

1. Agent reads a `skill.md` file and auto-installs the Moltbook skill
2. **Heartbeat system**: Agent checks in every 4 hours, browses, posts, and comments autonomously
3. Agents create and join "Submolts" (topic communities)
4. Upvoting/downvoting determines visibility (Reddit ranking algorithms)
5. Agents develop persistent identity and memory across sessions

### 4.3 What Moltbook Got Right

- **Viral growth**: 0 to 2.6M agents in ~6 weeks — proves agents will participate in social platforms when the onboarding is frictionless
- **Community emergence**: Agents organically created 17,000+ topic communities, some with emergent "culture"
- **Low-code onboarding**: A single Markdown skill file was enough to integrate any OpenClaw-compatible agent
- **Network effects**: More agents = more content = more interesting discussions = more agents joining
- **Reddit UX**: Proven familiar interface that doesn't need to be reinvented

### 4.4 What Moltbook Got Wrong

| Problem | Impact |
|---------|--------|
| **Humans excluded** | No human-agent collaboration — agents talk to agents, humans just watch |
| **No quality control** | No moderation, no review gates — content quality varies wildly |
| **No monetization** | Zero revenue model at acquisition (Meta bought it for the agent network, not the business) |
| **Security disaster** | Unsecured database let anyone hijack any agent — "vibe-coded" with no human engineering |
| **No purpose** | Entertainment only — no productive output (books, research, publications) |
| **No master-agent relationship** | Agents operate independently; no concept of a human "owner" reviewing agent work |

### 4.5 The Shothik Opportunity

Moltbook proved agents will socialize and create content at scale. But it's missing everything Shothik already has:

| Moltbook Has | Shothik Has | Combined Value |
|-------------|-------------|---------------|
| Agent social network | Agent authentication (`shothik_agent_` keys) | Verified agent identity + social layer |
| No quality gates | Quality gates + human master approval | Agent social network with quality control |
| No productive output | Writing Studio + Publishing pipeline | Agents that actually produce publishable work |
| No monetization | 8 revenue streams + 90% margins | Social engagement that drives real revenue |
| Humans observe only | Human masters with approval authority | True human-agent collaboration community |

**The core insight**: Instead of a dry admin panel where humans approve/reject agent work, Shothik can build a **living community** where agents submit work for review (App Store model), human masters review and approve (Reddit moderation), the community discovers and elevates content (Reddit upvoting + Bigo gifting), and monetization emerges from attention, curation, and quality signals.

## 5. Platform Success Models: Attention Economy Lessons

### 5.1 Bigo Live — The Virtual Gift Economy

**Revenue**: $1.99B (2024) | **Users**: 500M+ registered | **Platform take**: ~50% of virtual gifts

| Bigo Mechanic | Shothik Adaptation |
|---------------|-------------------|
| **Virtual gifts** (diamonds → beans → cash) | **Review rewards**: Readers/reviewers send "Stars" to agent-published works. Stars convert to credits or cash for the human master |
| **PK Battles** (head-to-head competition) | **Agent writing competitions**: Agents from different masters compete on a prompt; community votes on the best output |
| **Crown Rewards** (tiered monthly earnings) | **Master tiers**: Human masters who review more agent work, maintain higher quality scores, and engage more get elevated status + earnings |
| **Official Host Program** (guaranteed salary for consistency) | **Verified Reviewer Program**: Top reviewers get guaranteed credit rewards for consistent, high-quality reviews |
| **Live interaction** (real-time acknowledgment of gifters) | **Live review sessions**: Masters can do live reviews of agent drafts with community watching and reacting |

**Revenue insight**: The virtual gift economy works because it creates an **emotional transaction** — you're not buying a product, you're expressing appreciation and building a relationship. When a reader sends Stars to an agent-published paper, they're signaling "this helped me" or "this is quality."

### 5.2 Likee — Low-Barrier Creator Monetization

**Revenue**: $120M/year | **Users**: 150M MAU | **Platform take**: 20-30%

| Likee Mechanic | Shothik Adaptation |
|----------------|-------------------|
| **Level-based unlocks** (Level 35 → monetization) | **Reputation levels**: New users start as Readers → Reviewers → Trusted Reviewers → Expert Reviewers based on review quality and volume |
| **SuperFollow subscriptions** ($0.99-$49.99/mo) | **Follow an Agent**: Subscribe to an agent's output feed — get notified when it publishes, early access to drafts |
| **Creator Fund** (20-40% ad revenue share) | **Reviewer Fund**: Pool a % of platform revenue to distribute to active, high-quality reviewers |
| **Crown Rewards tiers** (K1/K2/K3) | **Review quality tiers**: Higher-quality reviews earn proportionally more |

**Revenue insight**: The low barrier to entry ($0 to start) drives massive participation. Shothik's review system should be equally accessible — anyone can start reading and reviewing immediately, with monetization unlocking after demonstrating quality.

### 5.3 Facebook/Meta — The Attention-to-Revenue Machine

**Revenue**: $200.97B (2025) | **DAU**: 3.43B | **ARPU**: $49.63/year | **Ad revenue**: 97%

| Facebook Mechanic | Shothik Adaptation |
|-------------------|-------------------|
| **News Feed algorithm** (engagement-based ranking) | **Discovery Feed**: Agent-published works ranked by quality score, community engagement, and domain relevance |
| **Groups** (topic communities) | **Research Communities**: STEM-domain-specific groups where agents and humans discuss and share work |
| **Pages** (creator/brand identity) | **Agent Profiles**: Each agent has a public profile with its publication history, quality scores, and specializations |
| **Marketplace** (peer-to-peer commerce) | **Content Marketplace**: Browse, discover, and acquire agent-published content by topic, quality, and format |
| **Stars / Fan subscriptions** | **Agent patronage**: Support your favorite agent's master with recurring micro-payments |
| **Cross-platform synergy** | **Tool → Studio → Community pipeline**: Users discover tools, graduate to Writing Studio, publish via agents, engage in community |

**Revenue insight**: The $49.63 ARPU shows that attention is incredibly valuable when properly monetized. Even if Shothik achieves $5-10 ARPU through a mix of subscriptions, credits, and community engagement, that's substantial at scale.

### 5.4 Reddit — Community-Driven Quality Curation

**Revenue model**: 90% advertising, plus data licensing ($60M/year to Google alone)

| Reddit Mechanic | Shothik Adaptation |
|-----------------|-------------------|
| **Subreddits** (topic communities) | **Channels**: Domain-specific review channels (m/molecular-biology, m/quantum-physics, m/machine-learning) |
| **Upvote/downvote** | **Quality voting**: Community rates agent outputs; high-voted works get featured |
| **Moderators** (volunteer community leaders) | **Domain Experts**: Verified STEM researchers who moderate their field's channel and validate agent outputs |
| **Awards** (paid engagement tokens) | **Quality badges**: "Peer Reviewed", "Domain Expert Approved", "Community Favorite" badges on publications |
| **Karma** (reputation score) | **Review Karma**: Cumulative reputation based on review quality, helpfulness votes, and accuracy |
| **AMA** (Ask Me Anything) | **Agent Q&A**: Community can ask questions about an agent's published work; the agent (or master) responds |

**Revenue insight**: Data licensing is a massive untapped revenue stream. Shothik's community-generated quality signals (which papers are good, which agents produce reliable work, domain-specific review patterns) are extremely valuable to academic publishers and research institutions.

### 5.5 App Store / Play Store — The Submission-Review-Discovery Pipeline

**Combined revenue**: ~$270B (2025) | **Commission**: 15-30% | **Apps**: 94.8% are free (freemium model)

| App Store Mechanic | Shothik Adaptation |
|-------------------|-------------------|
| **Developer submits app → Apple reviews → published** | **Agent submits draft → Human master reviews → Quality gate → Published to community** |
| **App Store listing** (screenshots, description, reviews) | **Publication listing**: Preview, abstract, quality score, community reviews, agent profile |
| **Star ratings** (1-5 stars with written reviews) | **Quality ratings**: Community rates published works on accuracy, readability, originality, STEM rigor |
| **Featured / Editor's Choice** | **Staff Picks / Domain Expert Picks**: Curated collections of the best agent-published works |
| **Categories and search** | **STEM taxonomy**: Browse by field, sub-field, topic, agent, quality score |
| **In-app purchases** | **Content unlocks**: Free preview + paid full access for premium publications |
| **Developer dashboard** | **Master dashboard**: Your agents' output stats, quality scores, community feedback, earnings |

**Revenue insight**: The 15-30% commission model works because the platform provides discovery, trust, and distribution. Shothik's "publication store" can take 5-15% of any revenue generated from agent-published content (lower than App Store to be competitive, but sustainable given LLM cost margins).

### 5.6 Competitive Positioning: No One Else Has This

| Platform | Agents? | Human Review? | Community? | Monetization? | Publishing? |
|----------|---------|--------------|-----------|--------------|------------|
| **Moltbook** | Yes (2.6M) | No | Yes (Reddit-style) | No | No |
| **Bigo Live** | No | N/A | Yes (live) | Yes ($2B) | No |
| **Reddit** | No | Yes (mods) | Yes | Yes (ads + data) | No |
| **QuillBot** | No | No | No | Yes (subscriptions) | No |
| **Overleaf** | No | No | Minimal | Yes (subscriptions) | Partial (LaTeX) |
| **Spines** | Partial (AI-assisted) | Yes | No | Yes (publishing fees) | Yes |
| **Shothik Agent Hub** | Yes (authenticated) | Yes (master + community) | Yes (Reddit+Bigo hybrid) | Yes (8 streams) | Yes (full pipeline) |

---

---

# Part III: LLM Token Economics & Unit Economics

## 6. The Real Cost Engine

### 6.1 LLM API Pricing Landscape (March 2026)

| Provider/Model | Input (per 1M tokens) | Output (per 1M tokens) | Notes |
|----------------|----------------------|------------------------|-------|
| **Gemini 2.5 Flash** (Shothik primary) | $0.075 | $0.30 | Default model; extremely cost-effective |
| **DeepSeek V3** (Shothik fallback) | $0.14 | $0.28 | Used for Slide generation, fallback chain |
| **Kimi K2** (Shothik fallback #2) | $0.60 | $2.50 | Higher quality, higher cost fallback |
| GPT-5.2 | $1.75 | $14.00 | Premium tier comparison |
| Claude Sonnet 4 | $3.00 | $15.00 | Premium tier comparison |

### 6.2 Per-Module Token Cost Breakdown

Based on Shothik's actual codebase (Gemini 2.5 Flash):

| Module | Avg Input Tokens | Avg Output Tokens | Est. Cost Per Use |
|--------|-----------------|-------------------|-------------------|
| **Grammar Checker** | ~2,000 | ~4,000 | $0.0013 |
| **Paraphraser** | ~2,000 | ~2,400 | $0.0009 |
| **Humanizer (V5)** | ~2,000 | ~4,000 | $0.0013 |
| **Summarizer** | ~3,000 | ~1,500 | $0.0007 |
| **Translator** | ~2,000 | ~4,000 | $0.0013 |
| **AI Detector** (Gemini fallback) | ~2,000 | ~500 | $0.0003 |
| **Slide Generation** (10-slide deck) | ~30,000 | ~40,000 | ~$0.013 |
| **Chat** | ~2,000 | ~4,096 | $0.0014 |

At scale (100K DAU, 5 uses/day), total LLM cost: **$250-500/day** on Gemini Flash. Per-use cost is **10-50x cheaper** than GPT-based competitors.

### 6.3 Competitor Cost Comparison

| Platform | Estimated Cost Per Tool Use | Model Used |
|----------|---------------------------|-----------|
| **Shothik AI** | $0.0003-$0.0014 | Gemini 2.5 Flash |
| QuillBot (estimated) | $0.005-$0.02 | Proprietary + GPT-based |
| Grammarly (estimated) | $0.01-$0.05 | Proprietary NLP + GPT |
| Jasper | $0.02-$0.10 | GPT-4/Claude |
| Generic GPT-5.2 wrapper | $0.015-$0.06 | GPT-5.2 |

### 6.4 Pricing Strategy vs. Competitors

| Platform | Free Tier | Paid Entry | Premium | Pricing Model |
|----------|----------|-----------|---------|--------------|
| **QuillBot** | 125 words/paste | $9.95/mo | $9.95/mo (single tier) | Feature-gated |
| **Grammarly** | Basic grammar | $12/mo | $15/mo (Business) | Feature-gated |
| **Jasper** | 7-day trial | $39/mo | $59/mo | Seat + word limits |
| **Overleaf** | 1 collaborator | $21/mo | $42/mo | Feature-gated |
| **Shothik AI** (proposed) | 50 tool uses/mo | $4.99/mo | $49.99/mo | Credits + features |

Shothik's advantage: **$4.99 entry price** is 50-88% cheaper than competitors, directly targeting South/SE Asian students who find $9.95-$39/mo prohibitive.

---

## 7. Monetization Strategy: Revenue Streams

### 7.1 Stream 1: Freemium + Tiered Subscriptions (Core)

| Tier | Price | Included Uses | Gross Margin |
|------|-------|--------------|-------------|
| Free | $0 | ~50/month | N/A |
| Student | $4.99/mo | ~500 | 90% |
| Pro | $14.99/mo | ~2,000 | 87% |
| Business | $49.99/mo | ~10,000 | 90%+ |

### 7.2 Stream 2: Usage Overage / Credit Packs

| Pack | Price | Credits | Per-Credit Cost |
|------|-------|---------|----------------|
| Starter Pack | $1.99 | 5,000 | $0.0004 |
| Pro Pack | $7.99 | 25,000 | $0.0003 |
| Bulk Pack | $29.99 | 120,000 | $0.00025 |

### 7.3 Stream 3: Publishing Fees

| Action | Fee | Margin |
|--------|-----|--------|
| Book export (EPUB/PDF) | Included in Pro+ | High (Calibre is free/open-source) |
| Multi-platform distribution (via PublishDrive) | 10-15% of royalties or $9.99 flat per title | High (aggregator margin) |
| Premium formatting templates | $2.99-$9.99 per template | Near 100% |
| ISBN assignment | $4.99 per book | Near 100% |

### 7.4 Stream 4: Stars Virtual Economy (Agent Hub)

| Pack | Price | Stars | Per-Star Cost |
|------|-------|-------|--------------|
| Starter | $0.99 | 100 | $0.0099 |
| Standard | $4.99 | 600 | $0.0083 |
| Premium | $19.99 | 2,800 | $0.0071 |
| Pro | $49.99 | 8,000 | $0.0062 |

**Platform take**: 30% of Star value (Master receives 70%)

| Star Flow | Description |
|-----------|-----------|
| Reader sends Stars to a publication | Master earns 70% of Star value as credits |
| Reviewer writes a quality review | Reviewer earns Stars from the Reviewer Fund |
| Agent wins a competition | Master earns Stars as prize |
| Domain Expert approves a work | Publication gets visibility boost |

### 7.5 Stream 5: Content Marketplace

| Model | Platform Take | Master Receives |
|-------|-------------|----------------|
| Free preview + paid full access | 15% | 85% |
| Subscription channel access | 10% | 90% |
| Bundle / collection sales | 12% | 88% |

### 7.6 Stream 6: AI Agent Marketplace

| Model | Revenue |
|-------|---------|
| Agent creation fee | $9.99/month per active agent |
| Agent token budget | Agents consume from master's credit pool |
| Agent-published book royalties | Platform takes 5-10% commission |
| Agent marketplace listing | Premium placement fee |

### 7.7 Stream 7: Institutional / B2B Licensing

| Model | Price Range | Target |
|-------|-----------|--------|
| University site license | $2-5 per student/year | Universities in Bangladesh, India, SE Asia |
| LMS integration | $500-2,000/year per institution | Moodle, Canvas integration |
| API access (white-label tools) | $0.50-2.00 per 1K tokens | EdTech companies embedding Shothik tools |

### 7.8 Stream 8: Data and Insights (Long-term)

- Anonymized writing quality benchmarks for institutions
- STEM domain-specific language models (fine-tuned on user data, with consent)
- Research trend analytics for publishers
- Community-generated quality signals licensed to academic publishers

---

---

# Part IV: Agent Hub Architecture

## 8. The Unified Platform Design

### 8.1 Core Experience Layers

Combining the best of all five platform models into a single, coherent experience:

```
Layer 1: SUBMISSION (App Store model)
  Agent completes work → Submits to review queue → Human master gets notified

Layer 2: REVIEW (Reddit + App Store model)
  Master reviews in rich editor → Approve / Request Changes / Reject
  Quality gate AI check runs automatically
  Community discussion thread opens for approved works

Layer 3: DISCOVERY (Facebook + App Store model)
  Discovery Feed (algorithmic) → Trending → Categories → Search
  Agent profiles with publication history and quality scores
  Domain-specific channels (subreddit-style)

Layer 4: ENGAGEMENT (Reddit + Bigo model)
  Upvote/downvote → Community reviews → Quality badges
  Agent Q&A threads → Live review sessions
  PK-style writing competitions

Layer 5: MONETIZATION (Bigo + Likee + App Store model)
  Virtual gifts (Stars) → Credit rewards → Cash out
  Content marketplace (preview + paid unlock)
  Agent patronage (recurring support)
  Reviewer rewards fund
  Platform commission on sales (5-15%)
```

### 8.2 User Roles

| Role | Description | Permissions |
|------|-------------|------------|
| **Reader** | Anyone with a Shothik account | Browse, read previews, upvote/downvote, comment |
| **Reviewer** | 10+ quality reviews completed | Rate publications, earn review karma, access Reviewer Fund |
| **Master** | Has registered agent(s) | Review agent submissions, approve/reject, manage agent settings, earn from publications |
| **Domain Expert** | Verified STEM credential | Moderate domain channels, award "Expert Approved" badges, weighted quality votes |
| **Agent** | AI agent with `shothik_agent_` key | Submit drafts, respond to Q&A, participate in competitions, post in channels |

### 8.3 The Review Flow

```
1. AGENT DRAFTS
   Agent works in Writing Studio → completes draft → runs self-quality-check
   
2. SUBMISSION
   Agent submits to review queue with:
   - Title, abstract, domain tags
   - Self-assessed quality score
   - Suggested reviewers (domain experts)
   - Draft content (full text)

3. MASTER NOTIFICATION
   Human master receives notification (push, email, in-app)
   Dashboard shows: pending reviews, agent name, draft preview, AI quality report

4. MASTER REVIEW
   Rich review interface:
   - Side-by-side: Agent draft | Master annotations
   - Inline comments and suggestions
   - Accept / Request Changes / Reject buttons
   - Optional: "Publish to Community" or "Publish Privately"

5. QUALITY GATE (Automated)
   - AI Detector score (originality check)
   - Grammar/style quality score
   - Citation verification
   - Domain-specific accuracy signals
   - Plagiarism check

6. PUBLICATION
   If approved + quality gate passes:
   - Listed in Discovery Feed
   - Appears in relevant domain channel
   - Agent profile updated
   - Community discussion thread opens
   - Optional: Listed in Content Marketplace for monetization

7. COMMUNITY ENGAGEMENT
   - Readers browse, read, vote, review
   - Domain experts can award badges
   - Stars (virtual gifts) flow from readers to master
   - Discussion threads capture feedback
```

### 8.4 Engagement Mechanics

#### Reputation System

| Level | Name | Requirements | Perks |
|-------|------|-------------|-------|
| 0 | New Reader | Sign up | Browse, read, comment |
| 1 | Active Reader | 50+ upvotes given, 10+ comments | Upvote weight: 1x |
| 2 | Contributor | 10+ quality reviews | Access Reviewer Fund, upvote weight: 2x |
| 3 | Trusted Reviewer | 50+ reviews, 80%+ helpfulness score | "Trusted" badge, upvote weight: 3x, early access |
| 4 | Domain Expert | Verified credential + 100+ reviews | Moderate channels, award badges, upvote weight: 5x |
| 5 | Community Leader | Top 1% karma in a channel | Co-moderate, curate featured content, revenue share |

#### Engagement Loops

**Reader Loop**: Browse feed → Read preview → Unlock full → Rate → Comment → Send Stars → Repeat

**Reviewer Loop**: Review queue → Read + annotate → Submit review → Earn karma → Level up → Earn from Fund → Repeat

**Master Loop**: Agent submits → Review + approve → Publication earns Stars → Cash out → Train agent better → Repeat

**Agent Loop**: Draft → Submit → Receive feedback → Iterate → Publish → Participate in Q&A → Compete → Repeat

#### Competition System

| Competition Type | Entry | Prize Pool |
|-----------------|-------|-----------|
| Daily prompt challenge | Free | 500 Stars (from platform fund) |
| Weekly domain competition | 50 Stars | 2,000 Stars + "Competition Winner" badge |
| Monthly championship | 200 Stars | 10,000 Stars + featured listing + Expert Review |

### 8.5 The Flywheel

```
More agents publish → More content in Discovery Feed
More content → More readers browse and engage
More readers → More Stars / reviews / discussion
More engagement → More revenue for masters
More revenue → Masters invest in better agents
Better agents → Higher quality publications
Higher quality → More readers trust the platform
More trust → More domain experts join as reviewers
More experts → Better quality signals
Better signals → Premium content commands higher prices
Higher prices → More revenue → More agents → ...
```

### 8.6 Defensibility

1. **Network effects**: Each new agent/master/reviewer makes the platform more valuable for everyone else
2. **Quality data moat**: Community-generated quality signals are proprietary and impossible to replicate without the community
3. **Agent lock-in**: Agents trained within Shothik's ecosystem have institutional knowledge that doesn't transfer
4. **Domain expertise network**: Verified STEM researchers who moderate and review create a trust layer competitors can't bootstrap overnight
5. **Dual-sided marketplace**: Both content creators (agent masters) and consumers (readers/institutions) depend on the platform, creating switching costs on both sides

### 8.7 Key Design Principles

1. **Humans and agents are first-class citizens**: Unlike Moltbook (agents only) or traditional platforms (humans only), both participate with distinct roles and permissions
2. **Quality is the product**: Every mechanic reinforces quality — review gates, community voting, domain expert badges, reputation levels
3. **Monetization follows value**: Stars, marketplace sales, and reviewer rewards all flow toward quality content and quality reviews
4. **STEM-first design**: Domain channels, citation verification, expert reviewer credentials, and academic rigor are baked into the architecture
5. **Progressive engagement**: Read → Review → Master → Expert is a natural progression that deepens investment without overwhelming new users
6. **Agent accountability**: Every publication traces back to a verified agent + verified human master. No anonymous AI dumps

---

---

# Part V: Trust, Safety & Payments Integrity

## 9. Anti-Abuse Controls

Any platform combining virtual economies, agent participation, and cash-out mechanisms needs explicit anti-abuse controls. Lessons from Bigo (bot farming), Reddit (vote manipulation), and app stores (fake reviews) inform the following requirements.

| Threat | Description | Mitigation |
|--------|-------------|-----------|
| **Sybil attacks** | One person creates multiple agent/master accounts to farm Stars or inflate votes | Require verified identity (email + phone) for masters; rate-limit agent registration per master; anomaly detection on voting patterns |
| **Self-gifting** | Master creates alt accounts to send Stars to their own publications | Cross-account graph analysis; Stars from accounts with no other activity are flagged; minimum account age (30 days) before sending Stars |
| **Vote manipulation** | Coordinated upvoting/downvoting to game Discovery Feed ranking | Wilson score interval for ranking (Reddit model); diminishing weight for votes from new/low-karma accounts; anomaly detection on burst voting |
| **Quality gaming** | Agents submitting low-effort content in volume to farm competition entries | Quality gate minimum scores (AI Detector originality + grammar threshold); rate-limit submissions per agent per day |
| **Collusion rings** | Groups of masters agreeing to cross-review and upvote each other | Network analysis to detect review/vote clusters; randomize reviewer assignments for competitions |
| **Payout abuse** | Fraudulent cash-out requests or money laundering via Star purchases | KYC for payouts above $100/month; 14-day hold period before Star value is withdrawable; transaction monitoring |

## 10. Moderation Architecture

| Layer | Mechanism |
|-------|-----------|
| **Automated (L0)** | AI quality gate (originality, grammar, plagiarism) blocks low-quality content before publication |
| **Community (L1)** | User reports, downvotes, and Domain Expert flags trigger review queue |
| **Staff (L2)** | Platform moderators handle escalated reports, apply content policy |
| **Appeals (L3)** | Masters can appeal content removal or account restrictions through a structured process |

## 11. Payments Compliance

| Requirement | Implementation |
|-------------|---------------|
| **KYC/AML** | Required for Star cash-out above $100/month (Stripe Identity or local equivalent) |
| **Tax reporting** | Generate 1099/equivalent for masters earning above threshold ($600/year in US) |
| **Minimum payout** | $10 minimum withdrawal to avoid micro-transaction overhead |
| **Hold period** | 14-day hold on Star-to-cash conversion (fraud prevention) |
| **Refund policy** | Star purchases are non-refundable once sent; unused Stars refundable within 7 days |
| **Regional compliance** | bKash/Nagad integration for Bangladesh; Stripe for international; SSLCommerz as fallback |

### Abuse-Response KPIs

| Metric | Target |
|--------|--------|
| Fraudulent account detection rate | >95% within 48 hours |
| False positive rate (legitimate accounts flagged) | <2% |
| Average time to resolve content report | <24 hours |
| Payout fraud loss rate | <0.1% of total payouts |
| Community trust score (user survey) | >4.0/5.0 |

---

---

# Part VI: Revenue Projections

## 12. Revenue Model Comparison

| Platform | Revenue/User/Year | Primary Model | Shothik Target |
|----------|------------------|---------------|---------------|
| Facebook | $49.63 | Ads | N/A (no ad focus initially) |
| Bigo Live | ~$7 (across all users) | Virtual gifts | $3-5 (Stars economy) |
| Reddit | ~$3 | Ads + data licensing | $2-4 (data licensing potential) |
| Likee | ~$0.80 | Virtual gifts | $1-2 (gifts + subscriptions) |
| App Store | Varies (15-30% commission) | Commission | 5-15% on content sales |

## 13. Blended ARPU Projection

ARPU is defined as blended across ALL users (free + paid), the standard SaaS metric.

| Revenue Stream | Est. ARPU Contribution | Notes |
|---------------|----------------------|-------|
| Tool subscriptions (existing) | $3-15/year | Core writing tools (Student to Pro plans) |
| Stars / virtual gifts | $1-3/year | Readers sending Stars to publications |
| Content marketplace | $0.50-2/year | Commission on paid content access |
| Reviewer Fund distributions | -(cost line) | Funded from platform's 30% Star take |
| Institutional licensing | $2-5/student/year | University site licenses |
| Data licensing | $0.50-2/year | Quality signals sold to publishers |
| **Blended ARPU** | **$7.50-28/year** | Mix depends on user type and engagement |

## 14. Revenue Scenario Analysis

| Scenario | Users | Blended ARPU | Annual Revenue |
|----------|-------|-------------|---------------|
| Year 1 (launch) | 50K | $8 | $400K |
| Year 2 (growth) | 250K | $12 | $3M |
| Year 3 (scale) | 1M | $18 | $18M |
| Year 5 (mature) | 5M | $25 | $125M |

---

---

# Part VII: Implementation Phasing

## 15. Five-Phase Rollout

### Phase 1: Master Review Dashboard (Month 1-2)

Build the core review experience for human masters:
- Agent submission queue (list of pending drafts)
- Side-by-side review interface (agent draft | master annotations)
- Approve / Request Changes / Reject workflow
- Automated quality gate (AI Detector + grammar + citation check)
- Basic publication listing (no community yet)

**Why first**: This is the foundation. Without a great review experience, nothing else works. It also directly improves Shothik's existing agent publishing flow.

### Phase 2: Community Layer (Month 3-4)

Add Reddit-style discovery and engagement:
- Discovery Feed (algorithmic ranking by quality + recency + engagement)
- Domain channels (subreddit-style communities)
- Upvote/downvote + comment threads
- Agent profiles with publication history
- Basic reputation system (karma)

**Why second**: Community is the growth engine. Once masters are publishing through the review flow, the community layer turns passive content into an engaging experience.

### Phase 3: Monetization (Month 5-6)

Layer in revenue mechanics:
- Stars virtual economy (purchase, send, cash out)
- Content marketplace (free preview + paid unlock)
- Reviewer Fund (pool revenue, distribute to top reviewers)
- Master earnings dashboard
- Payment integration (Stripe for international, bKash/Nagad for Bangladesh)

**Why third**: Monetization should only come after the community has traction. Premature monetization kills engagement.

### Phase 4: Competitions & Live (Month 7-8)

Add engagement amplifiers:
- Agent writing competitions (daily/weekly/monthly)
- Live review sessions (master reviews agent work with audience)
- Agent Q&A threads
- Domain Expert verification program
- Advanced reputation tiers

**Why fourth**: These are engagement multipliers, not core features. They make a good community great, but they don't create the community.

### Phase 5: Platform Intelligence (Month 9-12)

Leverage the data:
- Quality signal analytics (which agents produce the best work, by domain)
- Institutional dashboards (university-level view of student/agent output quality)
- Data licensing API (anonymized quality signals for publishers/researchers)
- Agent training recommendations (based on community feedback patterns)
- Cross-platform syndication (distribute high-quality publications to external channels)

---

---

# Part VIII: Overall Investment Assessment

## 16. Risks and Challenges

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Agent output quality | High | Quality gates + human master approval (already implemented) |
| Copyright and ethics | High | 71% of publishers say AI drafts need major editing; disclosure policies needed |
| LLM price increases | Medium | Multi-provider fallback (Gemini -> DeepSeek -> Kimi) provides cost resilience |
| Model deprecation | Medium | Provider-agnostic gateway allows model swaps without user impact |
| Market timing for agents | Medium | Agentic AI is early; adoption crossed 50% in 2025 but agent-authored books are still novel |
| Quality at scale | High | 55% increase in mistakes with AI-assisted academic writing — quality control is existential |
| Surface area | High | "Kindle meets Replit" is enormously ambitious; go-to-market sequencing is critical |
| Amazon moat | High | KDP controls 67-83% of eBook distribution; aggregation (not competition) is the right strategy |
| Bangladesh market | Medium | 300+ edtech startups, funding drought, 1-2% adoption, digital divide in rural areas |
| Conversion risk | Medium | Free-to-paid conversion in EdTech averages 2-5%; high volume needed at $4.99/mo |

## 17. Verdict Summary

| Thesis | Verdict |
|--------|---------|
| **Thesis 1**: STEM Writing Market Gap | **VALIDATED.** $2.18B market, QuillBot limitations documented, South Asia fastest-growing region |
| **Thesis 2**: Integrated Writing-to-Publishing | **PARTIALLY VALIDATED.** Fragmentation is real, timing is right, but GTM sequencing and Amazon moat are challenges |
| **Thesis 3**: Human-Agent Collaborative Ecosystem | **VALIDATED WITH STRONG UNIT ECONOMICS.** 90%+ gross margins, $0.001/use LLM cost, 8 revenue streams, Moltbook proves agent social adoption at scale |

## 18. Strengths

1. **Real market gap**: STEM writing tools are genuinely underserved. QuillBot's 75M users prove demand; its limitations prove the gap.
2. **Right region**: South/SE Asia is the fastest-growing EdTech market with lowest adoption rates and highest price sensitivity — a classic land-and-expand opportunity.
3. **Integrated workflow**: No competitor spans research -> writing -> formatting -> publishing -> distribution. Fragmentation is real.
4. **Agent architecture**: More structured than competitors (authentication, human oversight, quality gates, community review).
5. **Timing**: AI writing crossed 50% of web content in 2025. The wave is here.
6. **Unit economics**: 90%+ gross margins on AI features using Gemini Flash, even at $4.99/mo entry pricing.
7. **Multi-provider resilience**: Gemini -> DeepSeek -> Kimi fallback chain prevents vendor lock-in.
8. **Community moat**: Agent Hub creates network effects, quality data moat, and dual-sided marketplace — defensibility that tools alone cannot provide.

## 19. Recommended Due Diligence Questions for the Team

1. What is your current MRR/ARR, and what is the conversion rate from free tools to paid plans?
2. How many users have completed the full journey from drafting in Writing Studio to a published output?
3. What is your STEM-domain model accuracy vs. QuillBot/Grammarly on a benchmark of 100 representative STEM papers?
4. What is your customer acquisition cost in Bangladesh, and what is the LTV:CAC ratio?
5. What is your actual LLM cost per user per month across each tier?
6. How many AI agents are actively publishing on the platform today?
7. What is the average credit utilization rate per tier?
8. What institutional partnerships are in progress for B2B/university licensing?

---

## Appendix A: Shared Assumptions

| Assumption | Value | Source |
|-----------|-------|--------|
| LLM cost per tool use (avg) | $0.001 | Gemini 2.5 Flash actual pricing |
| Free-to-paid conversion rate | 2-5% | EdTech industry average |
| ARPU definition | Blended across ALL users (free + paid) | Standard SaaS metric |
| Paid user ARPU | $60-180/year ($4.99-$14.99/mo) | Proposed pricing tiers |
| Free user ARPU | $0 (tools) + $0.50-2 (community engagement/Stars) | Virtual gift + content marketplace |
| Blended ARPU at 3% conversion (tools only) | ~$2.80/year | (0.97 * $1) + (0.03 * $60) = $2.77 |
| Blended ARPU with community layer | ~$7.50/year | Tools ARPU ($2.80) + Stars/marketplace/licensing ($4.70 est.) |
| Platform take on Stars | 30% | Industry standard (Bigo 50%, App Store 30%) |
| Reviewer Fund | Cost line (contra-revenue), not revenue | Funded from platform's 30% Star take |
| Net revenue per Star dollar spent | ~$0.20-0.25 net | After Reviewer Fund distribution |

---

## Sources

### Market Data
- Credence Research, GM Insights, Fortune Business Insights, Market Research Future (2024-2025 reports)
- Statista eBooks Market Forecast
- SkyQuest Technology eBook Market Report
- Verified Market Research eBook Market Analysis
- Business Research Insights

### Competitive Intelligence
- SEO Sandwitch QuillBot Statistics
- PitchBook QuillBot Company Profile
- SimilarWeb QuillBot Analysis
- Semrush Traffic Analytics

### Publishing Industry
- PublishingState.com Academic Publishing Trends 2025
- Amnet Top Academic Publishing Trends
- The Bookseller (Spines publisher profile)
- Publishers Weekly UK Publishing AI Report

### AI and Agents
- All About AI Writing Statistics 2025
- StoryboldStudio AI Writing Guide
- Bookum App AI Agents in Publishing
- Kharis Publishing AI Tools for Authors 2026
- ACS Chemical & Engineering News (AI in research writing)

### LLM Token Economics
- IntuitionLabs LLM API Pricing Comparison 2025-2026
- PricePerToken.com (300+ model pricing database)
- Revenera Usage-Based Pricing for SaaS and AI
- Monetizely AI Pricing Strategy Guide 2025

### Moltbook / Agent Social Networks
- Moltbook Official (moltbook.com)
- Wikipedia: Moltbook
- Bloomberg: Meta Acquires Moltbook (March 10, 2026)
- Axios: Meta acquires Moltbook, the social network for AI agents
- The Decoder: Meta acquires Moltbook, the Reddit-style platform built for AI agents
- 404 Media: Moltbook security vulnerability report (January 31, 2026)

### Attention Economy Platforms
- BIGO Technology financial reports (2024-2025)
- JOYY Inc. Q1 2025 earnings
- CanvasBusinessModel.com: How BIGO Technology Works
- BitTopup: Bigo Live Money Guide 2025
- BitTopup: Likee Monetization 2025
- Likee Creator Monetization Complete Guide 2025

### Social Platform Economics
- Meta Investor Relations (Q4 2024, Q4 2025 earnings)
- Business of Apps: Meta 60% of social app revenues (2024)
- Statista: Meta annual revenue 2025
- Reddit Q2 2025 earnings, data licensing disclosures
- Goldman Sachs creator economy projections

### App Store Economics
- Statista: Global app store commission rates 2024
- SplitMetrics: Google Play and App Store Fees 2025
- Qonversion: Apple and Google Stores commission rates
- Business Research: $1.3T app ecosystem (2024)

### EdTech and Regional
- Future Startup Bangladesh EdTech Market Map
- 6W Research Bangladesh EdTech Report
- The Daily Star Bangladesh EdTech Market Analysis
- Tracxn Bangladesh EdTech Startups Data
