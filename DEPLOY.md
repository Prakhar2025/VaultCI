# VaultCI — Production Deployment Guide

## What You Need (All Free)
- [Render](https://render.com) account — hosts the backend
- [Vercel](https://vercel.com) account — hosts the frontend  
- [Qdrant Cloud](https://cloud.qdrant.io) account — managed vector DB
- [Neon](https://neon.tech) account — managed PostgreSQL (free tier)

---

## Step 1 — Managed PostgreSQL on Neon (5 min)

1. Go to [neon.tech](https://neon.tech) → Create account → New Project
2. Name it `vaultci`
3. Copy the **Connection string** — it looks like:
   ```
   postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Change the prefix from `postgresql://` to `postgresql+asyncpg://`
5. Save this — you'll need it for Render

---

## Step 2 — Managed Qdrant Cloud (5 min)

1. Go to [cloud.qdrant.io](https://cloud.qdrant.io) → Sign up → Create Cluster
2. Choose **Free tier** (1GB)
3. Once created, copy:
   - **Cluster URL** (e.g. `https://abc123.eu-central.aws.cloud.qdrant.io`)
   - **API Key** (from Access tab)
4. Save both

---

## Step 3 — Deploy Backend to Render (10 min)

1. Go to [render.com](https://render.com) → New → **Web Service**
2. Connect your GitHub repo: `Prakhar2025/VaultCI`
3. Settings:
   - **Root Directory:** `backend`
   - **Runtime:** Docker
   - **Dockerfile Path:** `./Dockerfile`
   - **Plan:** Free
4. Add these **Environment Variables** in Render dashboard:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your Neon connection string (postgresql+asyncpg://...) |
| `QDRANT_HOST` | Your Qdrant Cloud URL |
| `QDRANT_PORT` | `6333` |
| `GITHUB_WEBHOOK_SECRET` | `prakhar123` |
| `GITHUB_TOKEN` | Your GitHub token from .env |
| `GROQ_API_KEY` | Your Groq key from .env |
| `DEBUG` | `false` |

5. Click **Deploy** — wait ~5 minutes
6. Your backend URL will be: `https://vaultci-backend.onrender.com`
7. Test it: visit `https://vaultci-backend.onrender.com/health` — should return `{"status":"ok"}`

---

## Step 4 — Initialize DB on Render

Once the backend is deployed, open Render **Shell** tab and run:
```bash
python scripts/init_db.py
```
This creates the PostgreSQL tables and Qdrant collections.

---

## Step 5 — Deploy Frontend to Vercel (5 min)

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo: `Prakhar2025/VaultCI`
3. Settings:
   - **Root Directory:** `frontend`
   - **Framework:** Next.js (auto-detected)
4. Add **Environment Variable:**

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://vaultci-backend.onrender.com` |

5. Click **Deploy** — done in 2 minutes
6. Your frontend URL: `https://vaultci.vercel.app`

---

## Step 6 — Connect GitHub Webhook (the real deal)

1. Go to **any of your GitHub repos** → Settings → Webhooks → **Add webhook**
2. Fill in:
   - **Payload URL:** `https://vaultci-backend.onrender.com/webhook/github`
   - **Content type:** `application/json`
   - **Secret:** `prakhar123`
   - **Events:** Select individual → ✅ **Pull requests** only
3. Click **Add webhook**

Now open a Pull Request on that repo → VaultCI will:
- Receive the webhook
- Run all 5 analysis layers
- Post a trust score comment directly on the PR
- Save the result in Postgres
- Show up on your Vercel dashboard in real-time

---

## After Deployment — Full Flow

```
You open PR on GitHub
        ↓
GitHub sends webhook → https://vaultci-backend.onrender.com/webhook/github
        ↓
5-layer analysis runs (AST + Qdrant + NetworkX + Groq)
        ↓
Trust Score posted as PR comment on GitHub (automatic bot comment)
        ↓
Result saved to Neon PostgreSQL
        ↓
Vercel dashboard shows the PR with real Trust Score
```

---

## Hackathon Demo Flow

1. Open `https://vaultci.vercel.app` — show the premium UI
2. Open a PR on your test repo — show the bot comment appearing on GitHub
3. Dashboard auto-updates with real trust score
4. Search memory on `/memory` page
5. Show analytics charts

**That's the full end-to-end product.**
