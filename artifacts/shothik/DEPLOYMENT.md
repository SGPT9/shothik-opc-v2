# Shothik Frontend V2 — Production Deployment Guide

This repository contains the standalone, high-performance React 19 + Vite 6 web client for **Shothik**.

---

## 🚀 Option 1: 1-Click Vercel Deployment (Recommended)

1. Navigate to [Vercel Dashboard](https://vercel.com/new).
2. Click **Import Repository** and select `ahsanhab919-ux/shothik-frontend-v2`.
3. Configure the Project Settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `pnpm build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `pnpm install`
4. Add Environment Variables:
   - `VITE_API_URL`: Your backend URL (e.g. `https://api.yourdomain.com` or `http://YOUR_VPS_IP:5001`)
5. Click **Deploy**. Your site will be live on a global HTTPS CDN in ~45 seconds!

---

## ⚡ Option 2: Cloudflare Pages Deployment

1. Go to **Cloudflare Dashboard** > **Compute (Workers & Pages)** > **Create application** > **Pages** > **Connect to Git**.
2. Select `ahsanhab919-ux/shothik-frontend-v2`.
3. Set build settings:
   - **Build command**: `pnpm build`
   - **Build output directory**: `dist/public`
4. Click **Save and Deploy**.

---

## 🧪 Local Production Preview

To test the optimized production build locally:

```bash
pnpm install
pnpm build
pnpm preview
```
