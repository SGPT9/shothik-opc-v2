# Taste Skill: Upgraded UI Examples

This document demonstrates the difference between generic AI "Slop" and the premium output generated when using Taste Skill templates.

---

## Example 1: The Generic Feature Card

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
  <!-- Subtle decorative element -->
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
