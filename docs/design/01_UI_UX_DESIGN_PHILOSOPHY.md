# UI/UX Design Philosophy for ShothikGPT
**Confidential Internal Document** | **Version:** 2.0.0  
**Last Updated:** September 2026  
**Owner:** Product Design Team  
**Status:** Approved for Implementation

---

## Executive Summary

ShothikGPT's UI/UX is not merely an interface—it is a **cultural bridge** between advanced AI capabilities and the daily realities of South Asia's micro-entrepreneurs. This document establishes the foundational design philosophy that transforms Shothik from a "tool" into a **trusted digital partner** (Digital Employee / DE) for the One-Person Company (OPC).

Our design approach is grounded in **Interdependence Theory**, recognizing that trust is built not through automation alone, but through **visible collaboration** between Human Entrepreneur (HE) and Digital Employee (DE).

---

## 1. Foundational Design Principles

### 1.1 Conversational Primacy
**Principle:** The primary interface is conversation, not forms.

**Rationale:** Our target users (F-commerce operators, students, creators) are accustomed to WhatsApp-first workflows. Forms feel bureaucratic; conversations feel natural.

**Implementation Guidelines:**
- Default input: Chat interface with rich action suggestions
- Progressive disclosure: Complex configurations appear only when contextually relevant
- Voice-first optionality: All text actions must have voice equivalents
- Banglish support: Seamless code-switching between Bangla, English, and hybrid

**Example:**
```
❌ Traditional: Multi-step form for courier dispatch
✅ Shothik: "Pathao diye dhaka te pathabo?" → Twin confirms details → One-tap dispatch
```

### 1.2 Economic Visibility
**Principle:** Every action must show its economic impact in real-time.

**Rationale:** Micro-entrepreneurs operate on thin margins (5-15%). They need to see exactly how each decision affects their cash flow.

**Implementation Guidelines:**
- Real-time cost display before confirmation (e.g., "Pathao: ৳85 | Your margin: ৳42")
- Ledger updates visible immediately after transactions
- Cash flow projections shown alongside decisions
- Currency always in BDT (with optional USD reference)

**Visual Pattern:**
```
┌─────────────────────────────────────┐
│ Order Confirmation                  │
├─────────────────────────────────────┤
│ Product: Panjabi (L)                │
│ Customer: Rahim (Mirpur)            │
│ Price: ৳650                         │
│                                     │
│ Costs:                              │
│   • Pathao Courier: ৳85             │
│   • bKash Fee (0.85%): ৳5.53        │
│   • Packaging: ৳10                  │
│                                     │
│ Your Profit: ৳42.47                 │
│                                     │
│ [Confirm Dispatch] [Edit]           │
└─────────────────────────────────────┘
```

### 1.3 Low-Bandwidth Resilience
**Principle:** Design for 2G/3G networks and intermittent connectivity.

**Rationale:** 60% of our users experience daily network instability. The interface must remain functional and reassuring during outages.

**Implementation Guidelines:**
- Offline-first architecture: Queue actions locally, sync when connected
- Progressive image loading: Blur placeholders → compressed → full resolution
- Text-first fallbacks: All visual information must have text equivalents
- Connection status indicators: Clear visual feedback on sync state
- Action retry mechanisms: Automatic retry with exponential backoff

**Technical Requirements:**
- Initial load < 150KB (critical CSS + JS)
- Time to Interactive < 3s on 3G
- Offline queue capacity: 50+ pending actions
- Sync conflict resolution: Last-write-wins with audit trail

### 1.4 Cultural Localization
**Principle:** Design must reflect Bangladeshi cultural norms, not Western SaaS patterns.

**Rationale:** Trust is built through cultural familiarity. Western design patterns can feel alienating or untrustworthy.

**Implementation Guidelines:**
- **Color Semantics:** 
  - Green (success) = Islamic/BD flag association
  - Red (warning) = Avoid for positive actions (culturally negative)
  - Gold/Orange = Premium/aspirational
- **Typography:**
  - Primary: SolaimanLipi or Hind Siliguri (Bangla-optimized)
  - Secondary: Inter (English fallback)
  - Minimum font size: 16px (accessibility + low-vision prevalence)
- **Iconography:**
  - Use locally recognizable symbols (rickshaw, bKash logo style, Nilkhet book icon)
  - Avoid Western-centric metaphors (e.g., "mailbox" icons)
- **Numerical Formats:**
  - Bengali numerals option (১, ২, ৩ vs 1, 2, 3)
  - Lakh/Crore formatting (not Million/Billion)
  - Date: DD/MM/YYYY (BD standard)

**Example:**
```
❌ Western: "Your balance is $50.00"
✅ Shothik: "আপনার ব্যালেন্স: ৳৫,০০০ (প্রায় $50)"
```

### 1.5 Trust & Transparency (HE-DE Collaboration)
**Principle:** Make the Digital Employee's reasoning and actions visible at all times.

**Rationale:** Users distrust "black box" automation. Trust is built through **Coordination Cues** and **Team Goal Cues** (Interdependence Theory).

**Implementation Patterns:**

#### Coordination Cues (Task Connection)
Show the handover between HE and DE explicitly.

**States:**
1. **DE Working:** "Twin正在 verifying bKash TrxID..." (animated spinner + progress)
2. **DE Success:** "✓ TrxID verified: ৳500 received from Rahim"
3. **DE Handover:** "Ready to dispatch via Pathao. Confirm?" (human approval required)
4. **HE Decision:** User confirms → "Dispatching now..."

**Visual Example:**
```
┌─────────────────────────────────────┐
│ 🤖 Twin Activity                    │
├─────────────────────────────────────┤
│ Step 1/3: ✓ Verified bKash payment  │
│ Step 2/3: ⏳ Checking inventory...  │
│ Step 3/3: ⏸️ Waiting your approval  │
│                                     │
│ Recommendation:                     │
│ "Dispatch via Pathao (৳85, 24h)"    │
│ Alternative: Steadfast (৳95, 48h)   │
│                                     │
│ [Approve Pathao] [Choose Other]     │
└─────────────────────────────────────┘
```

#### Team Goal Cues (Entity Connection)
Explicitly align DE actions with shared objectives.

**Examples:**
- "Our goal this week: Reduce COD return rate from 22% → 15%"
- "This advance deposit protects us from fake orders (saving ৳2,400/month)"
- "Together we've processed 147 orders this month! 🎯"

**UI Placement:**
- Dashboard header: Current shared goal + progress bar
- Post-action feedback: "This action moves us 3% closer to our goal"
- Weekly recap: "You + Twin achieved: ৳42,000 revenue, 89% on-time delivery"
## 2. The "Shothik Native" Design System

### 2.1 Typography Scale

| Element | Bangla Font | English Font | Size | Weight | Line Height | Usage |
|---------|-------------|--------------|------|--------|-------------|-------|
| H1 (Page Title) | Hind Siliguri | Inter | 28px | 700 | 1.2 | Dashboard titles, major sections |
| H2 (Section) | Hind Siliguri | Inter | 22px | 600 | 1.3 | Card headers, modal titles |
| H3 (Card Title) | Hind Siliguri | Inter | 18px | 600 | 1.4 | Subsections, list headers |
| Body | Hind Siliguri | Inter | 16px | 400 | 1.6 | Chat messages, form content |
| Caption | Hind Siliguri | Inter | 14px | 400 | 1.5 | Timestamps, metadata |
| Button | Hind Siliguri | Inter | 16px | 600 | 1.0 | All button labels |
| Small | Hind Siliguri | Inter | 12px | 400 | 1.4 | Helper text, error messages |

**Font Loading Strategy:**
- Critical CSS inlines font subset (Latin + Basic Bangla glyphs)
- Full font loaded asynchronously with `font-display: swap`
- Fallback stack: `Hind Siliguri → Nirmala UI → Segoe UI → Arial`

**Accessibility Requirements:**
- Minimum touch target: 48x48px
- Minimum contrast ratio: 4.5:1 (WCAG AA)
- Scalable up to 200% without breaking layout

### 2.2 Color Palette

#### Primary Colors (Brand)
```css
:root {
  /* Shothik Green - BD Flag inspired */
  --shothik-green-50: #ecfdf5;
  --shothik-green-100: #d1fae5;
  --shothik-green-500: #10b981; /* Primary action buttons */
  --shothik-green-600: #059669; /* Hover states */
  --shothik-green-700: #047857; /* Active states */
  
  /* Trust Blue - Professional contexts */
  --shothik-blue-500: #3b82f6; /* Info badges, links */
  --shothik-blue-600: #2563eb; /* Link hover */
  
  /* Warning Orange - Culturally sensitive alternative to red */
  --shothik-orange-500: #f97316; /* Caution states */
  --shothik-orange-600: #ea580c; /* Warning hover */
  
  /* Premium Gold - Aspirational features */
  --shothik-gold-500: #f59e0b; /* Pro badges, achievements */
  --shothik-gold-600: #d97706; /* Gold hover */
}
```

#### Semantic Usage Matrix
| Color Token | Light Mode | Dark Mode | Usage Context | Example |
|-------------|------------|-----------|---------------|---------|
| `green-500` | #10b981 | #34d399 | Primary actions, success | "Confirm Order", "Payment Received" |
| `green-600` | #059669 | #10b981 | Primary hover | Button hover state |
| `blue-500` | #3b82f6 | #60a5fa | Informational, secondary | "Learn More", status indicators |
| `orange-500` | #f97316 | #fb923c | Warnings, pending | "Awaiting payment", "Low stock" |
| `red-500` | #ef4444 | #f87171 | Critical errors only | "Payment failed", "API error" |
| `gold-500` | #f59e0b | #fbbf24 | Premium, achievements | "Pro Feature", "Goal Achieved" |

**Cultural Color Notes:**
- ✅ **Green**: Strongly positive (Islamic heritage, Bangladesh flag)
- ⚠️ **Red**: Use sparingly, can signal danger/haram
- ✅ **Orange/Saffron**: Auspicious, celebratory
- ✅ **Gold**: Aspirational, premium quality

**Dark Mode Palette:**
```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: #121212;
    --surface: #1E1E1E;
    --surface-elevated: #2D2D2D;
    --text-primary: #FFFFFF;
    --text-secondary: #B0B0B0;
  }
}
```

### 2.3 Component Library

#### Button Hierarchy
```tsx
// Primary Action (Green) - For main conversion actions
<Button variant="primary" size="lg">
  Confirm Dispatch (৳85)
</Button>

// Secondary Action (Blue outline) - For exploratory actions
<Button variant="secondary" size="md">
  View Details
</Button>

// Tertiary Action (Text-only) - For low-commitment actions
<Button variant="ghost" size="sm">
  Cancel
</Button>

// Destructive (Red) - Use sparingly, requires confirmation
<Button variant="destructive" size="md">
  Delete Order
</Button>

// Premium (Gold gradient) - For Pro features
<Button variant="premium" size="lg">
  ✨ Upgrade to Pro
</Button>
```

**Button Sizes:**
| Size | Height | Padding | Font Size | Use Case |
|------|--------|---------|-----------|----------|
| SM | 36px | 12px 16px | 14px | Inline actions, dense layouts |
| MD | 44px | 16px 20px | 16px | Standard buttons, forms |
| LG | 52px | 20px 24px | 18px | Primary CTAs, mobile-first |

#### Card Patterns

**Transaction Card (F-commerce)**
```tsx
<Card variant="transaction" className="shadow-sm">
  <CardHeader className="flex items-center gap-3">
    <Avatar src={customer.image} size="md" />
    <div className="flex-1">
      <h3 className="font-semibold">Rahim Ahmed</h3>
      <p className="text-sm text-gray-500">Mirpur DOHS • 2:34 PM</p>
    </div>
    <Badge variant="success">✓ Paid</Badge>
  </CardHeader>
  
  <CardContent>
    <p className="text-sm">Panjabi (L) × 2</p>
    <div className="flex justify-between mt-2 pt-2 border-t">
      <span className="text-gray-600">Total:</span>
      <span className="font-bold text-lg">৳1,300</span>
    </div>
  </CardContent>
  
  <CardActions className="flex gap-2">
    <Button variant="secondary" className="flex-1">Message</Button>
    <Button variant="primary" className="flex-1">Dispatch</Button>
  </CardActions>
</Card>
```

**Research Paper Card (Academic)**
```tsx
<Card variant="research" className="border-l-4 border-l-blue-500">
  <CardHeader>
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-semibold line-clamp-2">
          Deep Learning for Bengali NLP: A Survey
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Rahman et al. • IEEE Access 2024
        </p>
      </div>
      <Badge variant="info">98% Relevance</Badge>
    </div>
  </CardHeader>
  
  <CardContent>
    <div className="flex gap-2 text-xs text-gray-500">
      <span>📊 247 citations</span>
      <span>🔗 Open Access</span>
      <span>📄 PDF Available</span>
    </div>
  </CardContent>
  
  <CardActions>
    <Button variant="ghost" size="sm">Cite</Button>
    <Button variant="ghost" size="sm">Save</Button>
    <Button variant="secondary" size="sm">Download PDF</Button>
  </CardActions>
</Card>
```

**Status Indicator Component**
```tsx
// Twin Activity Status
<StatusIndicator 
  status="working" // 'working' | 'success' | 'waiting' | 'error'
  message="Twin正在 verifying bKash TrxID..."
  progress={2/3}
  showProgress={true}
/>

// Connection Status Banner
<ConnectionBanner 
  state="offline" // 'online' | 'syncing' | 'offline'
  queuedActions={5}
  onReconnect={() => syncQueue()}
/>
```

### 2.4 Motion & Animation

**Animation Principles:**
1. **Purposeful**: Every animation must serve clarity, not decoration
2. **Fast**: 150-300ms duration (slower feels sluggish on low-end devices)
3. **Smooth**: Use GPU-accelerated properties only (transform, opacity)
4. **Respectful**: Honor `prefers-reduced-motion` setting

**Standard Easing Curves:**
```css
/* Standard ease-out for most animations */
--ease-out: cubic-bezier(0.4, 0, 0.2, 1);

/* Bounce for success states */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

/* Linear for loaders */
--linear: linear;
```

**Key Animations:**

| Animation | Duration | Easing | Use Case |
|-----------|----------|--------|----------|
| Fade In | 150ms | ease-out | Modal opens, card appears |
| Slide Up | 200ms | ease-out | Bottom sheets, action cards |
| Success Check | 300ms | ease-bounce | Task completion feedback |
| Twin Thinking | 1.5s loop | linear | AI processing state (pulse) |
| Skeleton Load | 1.5s loop | linear | Content loading placeholder |
| Error Shake | 400ms | ease-in-out | Form validation errors |

**Performance Budget:**
- Max 3 concurrent animations per screen
- 60 FPS maintained on mid-range Android (Snapdragon 660+)
- Total animation JS bundle < 10KB

---

## 3. Persona-Specific UX Patterns

### 3.1 F-Commerce Operator (Rina Akter)

**User Profile:**
- Age: 28, Mirpur, Dhaka
- Daily Orders: 20-50
- Device: Redmi Note 10 (Android)
- Network: 3G/4G fluctuating
- Primary App: WhatsApp (8hrs/day)

**UX Priorities:**
1. One-tap actions for repetitive tasks
2. WhatsApp integration visible at all times
3. COD risk indicators prominent
4. Quick ledger glance (today's profit/loss)

**Dashboard Layout (Mobile):**
```
┌─────────────────────────────────┐
│ Today's Overview         [☰]    │
│ ┌──────┬──────┬──────┬──────┐   │
│ │Orders│ Paid │Pending│Profit│   │
│ │  23  │  18  │   5  │ ৳৪২০│   │
│ └──────┴──────┴──────┴──────┘   │
├─────────────────────────────────┤
│ ⚠️ 3 High-Risk COD Orders       │
│ [Review Now →]                  │
├─────────────────────────────────┤
│ Recent Orders (WhatsApp Feed)   │
│ ┌───────────────────────────┐   │
│ │ 👤 Rahim: Panjabi (L)     │   │
│ │    ৳650 • Paid ✓          │   │
│ │    [Message] [Dispatch]   │   │
│ └───────────────────────────┘   │
│ ┌───────────────────────────┐   │
│ │ 👤 Karim: Scarf           │   │
│ │    ৳350 • Awaiting TrxID  │   │
│ │    [Verify Payment]       │   │
│ └───────────────────────────┘   │
│ ┌───────────────────────────┐   │
│ │ 👤 Sumi: Bag              │   │
│ │    ৳890 • Dispatched 🚚   │   │
│ │    [Track Order]          │   │
│ └───────────────────────────┘   │
├─────────────────────────────────┤
│ [New Order] [Scan TrxID] [Ledger]│
└─────────────────────────────────┘
```

**Key Interactions:**
| Gesture | Action | Context |
|---------|--------|---------|
| Swipe Right | Mark as paid | Order cards |
| Swipe Left | Flag as risky | Order cards |
| Long Press | Quick message template | Any order |
| Pull Down | Refresh + sync WhatsApp | Dashboard |
| Double Tap | Call customer | Order cards |

**Voice Commands:**
- "নতুন order যোগ করো" → Opens order form
- "আজকের profit কত?" → Shows today's ledger summary
- "Rahim কে message পাঠাও" → Opens WhatsApp with draft

**Notifications Strategy:**
- Payment received: Immediate push + sound
- High-risk order: Immediate push (requires action)
- Courier update: Silent push (badge only)
- Daily summary: 9 PM (configurable)

### 3.2 Academic Researcher (Dr. Abdul Rahman)

**User Profile:**
- Age: 42, Dhanmondi, Dhaka
- Role: Associate Professor, BUET
- Device: MacBook Pro + iPad
- Network: University WiFi (stable)
- Tools: LaTeX, Zotero, Overleaf, Python

**UX Priorities:**
1. Split-screen: Paper + AI assistant
2. Citation verification badges
3. Export options prominent (PDF, LaTeX, DOCX)
4. Version history visible

**Workspace Layout (Desktop):**
```
┌──────────────────────────────────────────────────────────────┐
│ Thesis Chapter 3: Methodology                    [Export ▼]  │
├───────────────────────────┬──────────────────────────────────┤
│                           │  🤖 Research Twin                │
│  [Document Editor]        │                                  │
│                           │  "I found 3 relevant papers from │
│  Chapter 3: Methodology   │   IEEE 2024. Add citations?"     │
│                           │                                  │
│  This study employs...    │  ☑ Paper A: "Deep Learning..."   │
│  [citation needed]        │     (98% relevance, 247 cites)   │
│                           │  ☑ Paper B: "Bengali NLP..."     │
│  ...quantitative analysis │     (95% relevance, 189 cites)   │
│  [citation needed]        │  ☐ Paper C: "Survey..."          │
│                           │     (87% relevance, 56 cites)    │
│                           │                                  │
│                           │  [Add Selected] [Search More]    │
│                           │                                  │
│                           │  ─────────────────────────────   │
│                           │  Citation Style: [IEEE ▼]        │
│                           │  Export: [PDF] [LaTeX] [DOCX]    │
│                           │                                  │
│                           │  💡 Tip: Use /explain for inline │
│                           │      definitions                 │
└───────────────────────────┴──────────────────────────────────┘
```

**Key Features:**
- Real-time plagiarism check toggle (Turnitin integration)
- Citation style switcher (APA, IEEE, Chicago, MLA)
- "Explain this paragraph" inline action
- Reference manager sidebar with Zotero sync
- Collaborative annotations (multi-author support)

**Keyboard Shortcuts:**
| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Quick command palette |
| `Ctrl+/` | Ask Twin about selection |
| `Ctrl+Shift+C` | Insert citation |
| `Ctrl+Shift+E` | Export current document |
| `Ctrl+H` | Version history |

### 3.3 Zero-Capital Creator (Karim Hassan)

**User Profile:**
- Age: 22, Agrabad, Chittagong
- Platforms: Facebook, TikTok, YouTube Shorts
- Device: Samsung Galaxy A52
- Income: ৳15k-40k/month (variable)
- Goal: Reach monetization threshold

**UX Priorities:**
1. One-content → Multi-platform adaptation
2. Trend alerts (what's viral now in BD)
3. Engagement analytics simple & visual
4. Monetization opportunities highlighted

**Content Studio (Mobile):**
```
┌─────────────────────────────────┐
│ Create New Content       [✕]    │
├─────────────────────────────────┤
│                                 │
│    [Upload Video/Image]         │
│         or                      │
│    [Record Now]                 │
│                                 │
├─────────────────────────────────┤
│ Auto-Adapt for:                 │
│ ☑ Facebook (9:16, <60s)         │
│ ☑ TikTok (9:16, <60s)           │
│ ☑ YouTube Shorts (9:16)         │
│ ☐ Instagram Reel (skip)         │
│                                 │
│ Suggested Caption (Bangla):     │
│ "এই ট্রেন্ডটা মিস করবেন না! 🔥"    │
│ [Regenerate] [Edit Manually]    │
│                                 │
│ Hashtags: #viral #bangla #trend │
│ [Add More]                      │
│                                 │
│ Best Time to Post: 8:30 PM      │
│ Predicted Reach: 2,000-5,000    │
│ Est. Earnings: ৳200-500         │
│                                 │
│ [Schedule for 8:30 PM]          │
│ [Post Now to All Platforms]     │
└─────────────────────────────────┘
```

**Key Features:**
- **Trend Radar**: Real-time viral topics in Bangladesh (updated hourly)
- **Cross-Post Scheduler**: Queue content for optimal times per platform
- **Comment Sentiment Analysis**: Positive/Negative/Neutral breakdown
- **Sponsorship Alerts**: Brand collaboration opportunities matching audience
- **Revenue Tracker**: Daily earnings from all platforms in one view

**Analytics Dashboard:**
```
┌─────────────────────────────────┐
│ This Week's Performance         │
├─────────────────────────────────┤
│ Total Views: 47,230 ▲ 23%       │
│ Engagement: 8.4% ▲ 1.2%         │
│ New Followers: 342              │
│ Est. Earnings: ৳2,840           │
├─────────────────────────────────┤
│ Top Performing Content:         │
│ 1. "Ranna Recipe" - 12K views   │
│ 2. "Comedy Skit" - 9K views     │
│ 3. "Tech Review" - 7K views     │
├─────────────────────────────────┤
│ Sponsorship Opportunities: 2    │
│ [View Details →]                │
└─────────────────────────────────┘
```

### 3.4 SME Operator (Mr. Rafiqul Ahmed)

**User Profile:**
- Age: 48, Gulshan, Dhaka
- Business: Textile trading (৳8-12 Cr/year)
- Team: 12 employees
- Devices: Laptop (office) + iPad (travel)
- Concerns: Compliance, cash flow, team productivity

**UX Priorities:**
1. Multi-user access controls (owner, manager, staff)
2. Compliance dashboard (NBR, VAT, tax deadlines)
3. Cash flow forecasting (30/60/90 days)
4. Team task delegation and tracking

**Command Center (Desktop/Tablet):**
```
┌─────────────────────────────────────────────────────────────┐
│ Ahmed Enterprises | October 2026               [Settings]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Cash Flow Forecast                                          │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ ৳৪৫০,০০0 ┤      ╭──╮                                │     │
│ │ ৳৩০০,০০0 ┤   ╭──╯  ╰──╮                             │     │
│ │ ৳১৫০,০০0 ┤───╯        ╰──╮                          │     │
│ │         └─────────────────────────────              │     │
│ │         Week1  Week2  Week3  Week4                  │     │
│ └─────────────────────────────────────────────────────┘     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Compliance Status                                           │
│ ✓ VAT Return (September) submitted on time                  │
│ ⚠️ Tax Payment due: 15 October (5 days left) - ৳145,000     │
│ ✓ Employee salary disbursed (October 1st)                   │
│ 📋 Annual audit preparation: 67% complete                   │
├─────────────────────────────────────────────────────────────┤
│ Team Tasks                                                  │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ 👤 Rina: Process 12 pending orders           Today   │     │
│ │    ████████░░ 80%                        [Remind]   │     │
│ ├─────────────────────────────────────────────────────┤     │
│ │ 👤 Karim: Post 3 reels this week             2/3 ✓   │     │
│ │    ██████░░░░ 67%                          [Boost]  │     │
│ ├─────────────────────────────────────────────────────┤     │
│ │ 👤 Accountant: Prepare Q4 report            20 Oct   │     │
│ │    ████░░░░░░ 40%                          [Assign] │     │
│ └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

**Key Features:**
- Role-based dashboards (Owner view, Manager view, Staff view)
- Approval workflows for expenses >৳10,000
- Automated NBR report generation (VAT, tax returns)
- Multi-location inventory tracking
- Bank reconciliation automation

**Approval Workflow Example:**
```
Expense Request: ৳25,000 (Office Equipment)
Requested by: Office Manager
Date: 12 Oct 2026

[View Invoice PDF] [Check Budget Impact]

Budget Status: Within monthly limit (৳185,000 remaining)

[Approve] [Request Changes] [Reject]
```

---

## 4. Interaction Models

### 4.1 Conversational Interface (Default Mode)

**Design Principles:**
- Chat-first for all personas
- Rich suggestion chips (context-aware actions)
- Voice input button (always visible, bottom-right)
- Attachment support (images, documents, voice notes)
- Message threading for complex topics

**Example Flow (F-commerce):**
```
User: "কালকের order গুলো কি অবস্থা?" (What's the status of yesterday's orders?)

Twin: "আপনার কালকের 23টি order এর মধ্যে:"
      ✓ 18টি delivered successfully
      ⏳ 3টি in transit (Pathao tracking active)
      ⚠️ 2টি pending (customer unavailable - needs follow-up)
      
      [See Pending Orders] [Message Customers] [View Full Report]

User: "pending গুলো দেখাও" (Show me the pending ones)

Twin: [Displays order cards with customer details]
      "Would you like me to call them automatically?"
      
      [Call Now] [Send Reminder] [Mark as Lost]
```

**Rich Suggestion Chips:**
- Appear below AI messages
- Context-aware based on conversation state
- Maximum 4 chips per message
- Scrollable horizontally if overflow

### 4.2 Voice Interactions

**Technical Requirements:**
- Wake word: "ওহে Shothik" (optional, can be disabled)
- Push-to-talk button (primary method, always visible)
- Real-time transcription (Bangla + Banglish support)
- Voice confirmations for critical actions
- Background noise cancellation

**Supported Voice Commands:**

| Command Pattern | Action | Persona |
|-----------------|--------|---------|
| "নতুন order যোগ করো" | Opens order creation form | F-commerce |
| "আজকের profit কত?" | Shows today's ledger summary | All |
| "{name} কে message পাঠাও" | Opens WhatsApp draft | F-commerce |
| "এই paper টা summarize করো" | Summarizes uploaded PDF | Academic |
| "citation add করো" | Inserts citation at cursor | Academic |
| "কি trending এখন?" | Shows trending topics | Creator |
| "post schedule করো" | Schedules content post | Creator |
| "cash flow দেখাও" | Displays cash flow forecast | SME |
| "tax deadline কবে?" | Shows upcoming tax deadlines | SME |

**Voice Feedback Options:**
- Male voice (default)
- Female voice (alternative)
- Speed control (0.8x, 1x, 1.2x)
- Language preference (Bangla-first, English-first, mixed)

### 4.3 Gesture-Based Actions (Mobile)

**Standard Gestures:**
| Gesture | Action | Context | Reversible |
|---------|--------|---------|------------|
| Swipe Right | Mark as complete/paid | Orders, tasks, invoices | ✓ Yes (5 min window) |
| Swipe Left | Flag for review/risky | Orders, comments | ✓ Yes |
| Long Press (1s) | Quick actions menu | Any list item, card | N/A |
| Pull Down | Refresh + sync | All feeds, dashboards | N/A |
| Pinch Out | Zoom in | Documents, maps, images | N/A |
| Pinch In | Zoom out | Documents, maps, images | N/A |
| Double Tap | Quick preview | Order cards, research papers | N/A |
| Three-Finger Tap | Undo last action | Anywhere | ✓ Yes |

**Haptic Feedback Patterns:**
| Event | Pattern | Intensity |
|-------|---------|-----------|
| Success (task complete) | Light single tap | Low |
| Error (action failed) | Double tap | Medium |
| Processing (AI working) | Subtle continuous vibration | Very Low |
| Warning (risk detected) | Triple tap | High |
| Notification (non-urgent) | Single soft tap | Very Low |

---

## 5. Accessibility & Inclusion

### 5.1 Visual Impairment Support

**Requirements:**
- Minimum font size: 16px (scalable to 24px via settings)
- High contrast mode: WCAG AAA compliant (7:1 ratio)
- Screen reader optimization: Full ARIA labels on all interactive elements
- Icon + text labels: Never icon-only for critical actions
- Focus indicators: 3px solid outline on keyboard focus

**Screen Reader Support:**
```html
<!-- Example: Order Card with full ARIA support -->
<article 
  role="article" 
  aria-label="Order from Rahim Ahmed, 650 Taka, paid status"
  aria-describedby="order-status-delivered"
>
  <h3 aria-label="Customer name: Rahim Ahmed">Rahim Ahmed</h3>
  <p id="order-status-delivered" aria-live="polite">
    Status: Delivered ✓
  </p>
  <button aria-label="Message Rahim Ahmed">Message</button>
  <button aria-label="Dispatch order to Pathao courier">Dispatch</button>
</article>
```

### 5.2 Literacy Considerations

**Low-Literacy Mode:**
- Icon-heavy navigation (recognizable symbols)
- Voice-first alternative for all text inputs
- Simple language toggle (basic Bangla vs technical terms)
- Video tutorials embedded in onboarding (<60s each)
- Progressive disclosure (show advanced features gradually)

**Icon Library (Culturally Recognizable):**
| Icon | Meaning | Cultural Context |
|------|---------|------------------|
| 📦 | Order/Package | Universal e-commerce |
| 💰 | Payment/Profit | Money bag (globally understood) |
| 🚚 | Courier/Delivery | Truck symbol |
| 📱 | WhatsApp/Mobile | Phone with chat bubble |
| 📚 | Research/Document | Book stack |
| 🎬 | Content/Video | Film clapper |
| 🏢 | Business/Office | Building silhouette |
| 📊 | Analytics/Report | Bar chart |

### 5.3 Motor Impairment Support

**Requirements:**
- Large touch targets: Minimum 48x48px (WCAG guideline)
- Voice control: Full app navigation via voice commands
- Switch control compatibility: iOS Switch Control, Android Switch Access
- Reduced motion option: Disable all non-essential animations
- Extended timeout: No session timeouts for users with motor impairments

**Voice Navigation Commands:**
- "Scroll down" / "Scroll up"
- "Tap [button name]"
- "Go back" / "Go home"
- "Open [feature name]"
- "Select first option" / "Select last option"

### 5.4 Cognitive Load Reduction

**Strategies:**
- Progressive disclosure: Show only essential info first
- Consistent navigation patterns: Same placement across screens
- Undo available: All destructive actions reversible (configurable window)
- Clear error messages: Plain language + recovery steps
- Confirmation dialogs: For high-risk actions only (financial, legal, deletion)

**Error Message Format:**
```
❌ Payment Verification Failed

What happened: The TrxID you entered (ABC123XYZ) was not found in bKash records.

Possible reasons:
• Typo in TrxID (please double-check)
• Payment not yet processed (wait 5 minutes)
• Wrong bKash account selected

What to do next:
1. Check your bKash SMS for correct TrxID
2. Try again with correct TrxID
3. Contact customer if issue persists

[Try Again] [Contact Support] [Cancel]
```

---

## 6. Onboarding & Education

### 6.1 First-Time User Experience (FTUE)

**Goal:** Activate user within 3 minutes with a "first win" moment.

**Flow:**

**Step 1: Welcome (30 seconds)**
```
┌─────────────────────────────────┐
│                                 │
│    আসসালামু আলাইকুম! 👋          │
│                                 │
│    I'm your Shothik Twin.       │
│    What do you do?              │
│                                 │
│    [🛍️ Sell Online]              │
│    [📚 Study/Research]          │
│    [🎬 Create Content]          │
│    [🏢 Run a Business]          │
│                                 │
│    (All options in Bangla too)  │
└─────────────────────────────────┘
```

**Step 2: Quick Setup (60 seconds)**
Based on selection:

*F-commerce path:*
```
"Great! Let's connect your selling tools."

1. WhatsApp number: [+880 ___] (pre-filled if possible)
2. bKash Merchant number: [+880 ___]
3. Primary courier: [Pathao ▼] (Pathao/Steadfast/Both)

[Continue] [Skip for Now]
```

*Academic path:*
```
"Perfect! Let's set up your research workspace."

1. Upload your first document (PDF/DOCX)
2. Select citation style: [IEEE ▼] (APA/IEEE/Chicago/MLA)
3. Connect Zotero/Overleaf (optional)

[Upload Document] [Skip for Now]
```

**Step 3: First Win (90 seconds)**
Guided first action:

*F-commerce:*
```
"Let's process your first order together!"

"I see you have a pending order from WhatsApp.
 Want me to create it automatically?"

[Yes, Create Order] [No, Manual Entry]

→ After creation:
"Order created! Ready to dispatch?"

[Dispatch via Pathao] [Hold for Later]
```

*Academic:*
```
"Let me help you summarize this paper."

[Summarize] [Extract Citations] [Find Related Papers]

→ After summarization:
"Summary ready! Want to add citations to your library?"

[Add to Library] [Export Summary]
```

**Step 4: Twin Introduction (30 seconds)**
```
┌─────────────────────────────────┐
│  🤖 Meet Your Digital Twin      │
│                                 │
│  I'll handle the admin work:    │
│  • Order entry & tracking       │
│  • Payment verification         │
│  • Courier booking              │
│                                 │
│  You focus on growing your      │
│  business. Together, we'll      │
│  save you 2+ hours daily! ⏰    │
│                                 │
│  [Got It, Let's Start!]         │
└─────────────────────────────────┘
```

### 6.2 Contextual Help

**Help Patterns:**
- **Tooltips:** First encounter with new feature (auto-dismiss after 2 views)
- **"How does this work?"** link on every complex screen (opens modal with video)
- **Embedded tutorials:** <60s videos in help modals (streaming, <2MB)
- **Community forum:** Accessible from help menu (peer-to-peer support)
- **Live chat:** Premium users only (9 AM - 9 PM BST)

**Help Modal Structure:**
```
┌─────────────────────────────────┐
│ How TrxID Verification Works    │
├─────────────────────────────────┤
│                                 │
│ [▶ Play Video (45s)]            │
│                                 │
│ Step-by-step:                   │
│ 1. Customer sends bKash payment │
│ 2. You receive SMS with TrxID   │
│ 3. Enter TrxID in Shothik       │
│ 4. Twin verifies with bKash API │
│ 5. ✓ Confirmed → Auto-dispatch  │
│                                 │
│ Common Issues:                  │
│ • TrxID not found → Wait 5 min  │
│ • Wrong number → Check SMS      │
│                                 │
│ [Still Need Help?]              │
│ [Contact Support] [Close]       │
└─────────────────────────────────┘
```

### 6.3 Progressive Learning Path

**Skill Levels:**

| Level | Name | Features Unlocked | Goal |
|-------|------|-------------------|------|
| 1 | Beginner | Basic actions only (create order, post content) | Complete 10 core actions |
| 2 | Intermediate | Automation rules, basic analytics | Set up 1 automation rule |
| 3 | Advanced | Custom workflows, team management, API access | Create custom workflow |
| 4 | Expert | Beta features, priority support, community leader | Mentor 2 new users |

**Gamification Elements:**

**Badges:**
- 🏆 "First 100 Orders" (F-commerce)
- 📝 "Published Paper" (Academic)
- 🔥 "Viral Hit" (>10K views, Creator)
- 💼 "Compliance Champion" (SME, filed all taxes on time)

**Weekly Challenges:**
- "Reduce COD returns by 5% this week" → Reward: ৳50 credit
- "Post 5 times this week" → Reward: Boost token
- "Complete research draft" → Reward: Extra export credits

**Leaderboard (Opt-in):**
- Community-level (not global)
- Categories: Top Seller, Top Creator, Most Helpful
- Weekly reset, prizes in platform credits

---

## 7. Measurement & Iteration

### 7.1 Key UX Metrics

| Metric | Target | Measurement Method | Frequency |
|--------|--------|-------------------|-----------|
| Time to First Value | <3 min | Analytics: signup → first action completion | Real-time |
| Task Success Rate | >90% | Usability testing + error log analysis | Weekly |
| HE-DE Trust Score | >4.2/5 | In-app survey (5 questions, weekly rotation) | Weekly |
| Feature Adoption | >60% for core features | Usage analytics (DAU/MAU per feature) | Daily |
| Net Promoter Score | >50 | Quarterly survey (email + in-app) | Quarterly |
| Data Usage per Session | <5MB | Client-side telemetry | Daily |
| Voice Accuracy (WER) | <5% | Transcription comparison (sampled) | Weekly |
| Offline Action Queue | <2% loss | Sync success rate tracking | Real-time |

**Trust Score Survey Questions (rotating weekly):**
1. "How much do you trust Shothik's recommendations?" (1-5)
2. "Did Shothik save you time this week?" (Yes/No + how much)
3. "How clear were the AI's explanations?" (1-5)
4. "Would you recommend Shothik to a friend?" (1-5)
5. "What's one thing Shothik should do better?" (open text)

### 7.2 Continuous Discovery Program

**Methods:**

| Method | Frequency | Participants | Output |
|--------|-----------|--------------|--------|
| User Interviews | Weekly (5 users) | Rotating personas | Insights report |
| Field Visits | Monthly (2 days) | 4-6 users per persona | Ethnographic findings |
| Usability Tests | Bi-weekly (remote + in-person) | 8 users per test | Task success metrics |
| Analytics Review | Daily | All users | Drop-off points, error rates |
| Support Ticket Analysis | Weekly | Users who contacted support | Pain point themes |

**Field Visit Protocol:**
1. Observe user in natural environment (home, shop, office)
2. No intervention unless critical failure
3. Record workflow, interruptions, workarounds
4. Post-visit interview (30 min)
5. Synthesis session with product team

### 7.3 Design Review Gate Checklist

Before any design enters development:

**Principles Alignment:**
- [ ] Meets all 5 foundational principles
- [ ] Includes HE-DE coordination cues where applicable
- [ ] Shows economic impact of actions (if financial)
- [ ] Works offline or degrades gracefully

**Technical Feasibility:**
- [ ] Tested on low-end Android device (Redmi Note 10 or equivalent)
- [ ] Performance budget met (<150KB initial load, <3s TTI on 3G)
- [ ] Animation performance verified (60 FPS on mid-range device)

**Localization:**
- [ ] Bangla + English copy reviewed by native speakers
- [ ] Cultural appropriateness verified (colors, icons, metaphors)
- [ ] Numerical formats correct (Lakh/Crore, DD/MM/YYYY)

**Accessibility:**
- [ ] WCAG AA contrast ratios met
- [ ] Screen reader tested (TalkBack, VoiceOver)
- [ ] Keyboard navigation works (desktop)
- [ ] Touch targets ≥48x48px (mobile)

**Security & Privacy:**
- [ ] No sensitive data exposed in UI (TrxIDs, phone numbers masked)
- [ ] Human approval required for high-risk actions
- [ ] Audit trail implemented for financial/legal actions

---

## Appendix A: Quick Reference Card

### Do's ✅
- Lead with conversation, not forms
- Show economic impact of every action (costs, profits, fees)
- Make Twin's reasoning and progress visible
- Design for 3G first, WiFi second
- Use culturally familiar colors (green = good, orange = caution)
- Provide voice alternatives for all text actions
- Celebrate small wins with users (badges, progress bars)
- Test with real users in Bangladesh before launch

### Don'ts ❌
- Hide costs or fees (even small ones)
- Use Western metaphors (mailbox, Thanksgiving sales, Black Friday)
- Require perfect connectivity for core features
- Force multi-step forms for simple tasks
- Use red for positive actions (culturally negative)
- Assume high literacy or tech fluency
- Automate without human approval for financial/legal/destructive actions
- Launch features without field testing in Bangladesh

---

## Appendix B: Competitive UX Analysis

| Feature | Shothik | ChatGPT | Zapier | Local Competitors |
|---------|---------|---------|--------|-------------------|
| Conversational UI | ✅ Native (Bangla-first) | ✅ Core (English) | ❌ Rules-based | ⚠️ Basic chatbots |
| Local Payment Integration | ✅ bKash/Nagad native | ❌ None | ❌ None | ⚠️ Manual entry only |
| Logistics Integration | ✅ Pathao/Steadfast APIs | ❌ None | ⚠️ Generic webhooks | ❌ Manual tracking |
| Offline Support | ✅ Full queue + sync | ❌ None | ❌ None | ❌ None |
| HE-DE Collaboration Cues | ✅ Explicit (coordination + goals) | ❌ Black box | ❌ Rules only | ❌ None |
| Bangla/Banglish Support | ✅ Native (code-switching) | ⚠️ Translation only | ❌ English only | ⚠️ Partial |
| Economic Visibility | ✅ Real-time ledger + margins | ❌ None | ❌ None | ❌ Spreadsheets only |
| Mobile-First | ✅ Primary design target | ⚠️ Responsive web | ❌ Desktop-first | ✅ Yes |
| Voice Interaction | ✅ Full parity with text | ⚠️ Limited | ❌ None | ❌ None |
| Cultural Localization | ✅ Deep (colors, formats, norms) | ❌ None | ❌ None | ⚠️ Surface level |

**Competitive Moat:** Shothik is the only platform combining:
1. Conversational AI with local language support
2. Execution layer with South Asia-native integrations
3. Economic transparency for micro-entrepreneurs
4. Cultural localization beyond translation

---

## Appendix C: Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)
- [ ] Build component library (@shothik/ui package)
- [ ] Implement conversational interface with rich suggestions
- [ ] Add voice input/output (Bangla + Banglish)
- [ ] Create offline queue system
- [ ] Design system documentation (this doc)

### Phase 2: Persona Dashboards (Weeks 5-8)
- [ ] F-commerce operator dashboard (mobile)
- [ ] Academic researcher workspace (desktop)
- [ ] Creator studio (mobile)
- [ ] SME command center (tablet/desktop)
- [ ] Usability testing with 10 users per persona

### Phase 3: Advanced Features (Weeks 9-12)
- [ ] HE-DE coordination cues implementation
- [ ] Team goal tracking system
- [ ] Gamification engine (badges, challenges)
- [ ] Accessibility audit + fixes
- [ ] Performance optimization (3G testing)

### Phase 4: Launch Preparation (Weeks 13-16)
- [ ] Beta testing with 100 users per persona
- [ ] Iterate based on feedback
- [ ] Final accessibility certification
- [ ] Documentation for customer support
- [ ] Marketing assets (screenshots, demo videos)

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-15 | Design Team | Initial draft |
| 2.0.0 | 2025-06-15 | AI Experience Team | Agentic OS alignment |
| 2.1.0 | September 2026 | Product Design Team | Deep Tech Giant standards, full persona patterns, HE-DE framework |

---

## Related Documents

- **Context Engineering:**
  - [Context Assembly Architecture](../context-engineering/01-CONTEXT_ASSEMBLY_ARCHITECTURE.md)
  - [Persona Context Profiles](../context-engineering/02-PERSONA_CONTEXT_PROFILES.md)
  - [Intent-to-Context Router Spec](../context-engineering/INTENT_TO_CONTEXT_ROUTER_SPEC.md)
  
- **Personas:**
  - [Persona Index](../personas/00_PERSONA_INDEX.md)
  - [F-Commerce Operator: Rina](../personas/01_FCOMMERCE_OPERATOR_RINA.md)
  - [Academic Researcher: Dr. Rahman](../personas/02_ACADEMIC_RESEARCHER_RAHMAN.md)
  - [Zero-Capital Creator: Karim](../personas/03_ZERO_CAPITAL_CREATOR_KARIM.md)
  - [SME Operator: Ahmed](../personas/04_SME_OPERATOR_AHMED.md)

- **Architecture:**
  - [System Architecture Overview](../architecture/README.md)
  - [HE-DE Collaboration Framework](../architecture/HE_DE_FRAMEWORK.md)

---

*This document is part of the ShothikGPT Design System. Unauthorized distribution prohibited.*

**© 2026 ShothikGPT. All rights reserved.**
