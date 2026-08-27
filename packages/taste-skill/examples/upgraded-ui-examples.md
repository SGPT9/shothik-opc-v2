# Taste Skill: Upgraded UI Examples

This document demonstrates the difference between generic AI "Slop" and the premium output generated when using Taste Skill templates.

---

## Example 1: The Feature Card

### ❌ Generic "Slop" Output
```html
<!-- Generic tailwind box with standard margins and padding -->
<div class="p-4 border border-gray-200 rounded-lg shadow-sm">
  <div class="text-3xl mb-2">🚀</div>
  <h3 class="text-lg font-bold text-gray-900">Fast Performance</h3>
  <p class="text-sm text-gray-500 mt-1">Our platform is optimized for speed.</p>
</div>
```

### ✅ Taste Skill Output (Soft Calm Profile)
```html
<!-- Generous padding, intentional typography, and soft elevation -->
<div class="relative p-8 md:p-10 rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-zinc-100 transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] overflow-hidden group">
  <!-- Subtle decorative ambient gradient -->
  <div class="absolute inset-0 bg-gradient-to-br from-zinc-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
  
  <div class="relative z-10">
    <div class="flex items-center justify-center w-12 h-12 rounded-full bg-zinc-50 ring-1 ring-zinc-200/50 mb-6 text-xl">
      🚀
    </div>
    <h3 class="text-xl font-medium tracking-tight text-zinc-900">Fast Performance</h3>
    <p class="mt-3 text-base leading-relaxed text-zinc-500">
      Our platform is architected for speed, ensuring zero-latency execution.
    </p>
  </div>
</div>
```

---

## Example 2: The Action Button

### ❌ Generic "Slop" Output
```html
<button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
  Get Started
</button>
```

### ✅ Taste Skill Output (Editorial Profile)
```html
<button class="group flex items-center gap-4 px-6 py-3 bg-black text-white rounded-none hover:bg-zinc-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black">
  <span class="text-xs font-bold uppercase tracking-widest">Get Started</span>
  <span class="block w-4 h-[1px] bg-white group-hover:w-8 transition-all duration-300"></span>
</button>
```

---

## Example 3: Telemetry / Metric KPI Card

### ❌ Generic "Slop" Output
```html
<div class="bg-white p-4 rounded shadow border">
  <p class="text-gray-500">Total Users</p>
  <h2 class="text-2xl font-bold">124,592</h2>
  <span class="text-green-500">+12%</span>
</div>
```

### ✅ Taste Skill Output (Cyber Dark Profile)
```html
<div class="relative p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-md overflow-hidden group hover:border-cyan-500/40 transition-colors duration-300">
  <!-- Top glow accent line -->
  <div class="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

  <div class="flex items-center justify-between text-xs text-zinc-400 font-mono tracking-wider uppercase">
    <span>Active Inferences</span>
    <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-[11px]">
      <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
      LIVE
    </span>
  </div>

  <div class="mt-4 flex items-baseline gap-3">
    <span class="text-3xl font-mono font-semibold tracking-tight text-zinc-100">124,592</span>
    <span class="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-1.5 py-0.5 rounded">
      +14.8%
    </span>
  </div>

  <p class="mt-2 text-xs text-zinc-500">
    Telemetry updated <span class="font-mono text-zinc-400">12ms ago</span> via edge relay.
  </p>
</div>
```

---

## Example 4: Tactile Callout Banner

### ❌ Generic "Slop" Output
```html
<div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
  <p class="font-bold">Warning</p>
  <p>Please backup your data before proceeding.</p>
</div>
```

### ✅ Taste Skill Output (Neo-Brutalist Profile)
```html
<div class="p-6 bg-[#FFE600] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl flex items-start gap-4">
  <div class="w-10 h-10 rounded-lg bg-black text-[#FFE600] flex items-center justify-center font-bold text-xl shrink-0 -rotate-3">
    !
  </div>
  <div class="space-y-1">
    <h4 class="font-black text-black tracking-tight text-lg uppercase">System Checkpoint</h4>
    <p class="text-sm font-medium text-black/90 leading-snug">
      Make sure your snapshot state is verified before initiating validator cutover.
    </p>
  </div>
</div>
```
