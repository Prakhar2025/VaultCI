# VaultCI — Complete Deployment Cheat Sheet
> Do this top to bottom. ~25 minutes total. All free.

---

## BEFORE YOU START — Have These Ready

Open your `.env` file and keep these values handy:
```
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
GITHUB_WEBHOOK_SECRET=prakhar123
GROQ_API_KEY=gsk_xxxxxxxxxxxx
```

---

## STEP 1 — Neon (Free PostgreSQL) · ~5 min
> URL: https://neon.tech

1. Click **Sign Up** → use GitHub login
2. Click **New Project**
3. Name: `vaultci` · Region: pick closest to you · Click **Create Project**
4. You'll see a **Connection string** box — click **Copy**
   - It looks like: `postgresql://prakhar:abc123@ep-cool-fog.us-east-2.aws.neon.tech/neondb?sslmode=require`
5. **IMPORTANT:** Change `postgresql://` to `postgresql+asyncpg://` at the start
6. Final string looks like: `postgresql+asyncpg://prakhar:abc123@ep-cool-fog.us-east-2.aws.neon.tech/neondb?sslmode=require`
7. ✅ Save this — called **DATABASE_URL** from now on

---

## STEP 2 — Qdrant Cloud (Free Vector DB) · ~5 min
> URL: https://cloud.qdrant.io

1. Click **Sign Up** → use GitHub login
2. Click **Create Cluster**
3. Name: `vaultci` · Plan: **Free** · Region: pick any · Click **Create**
4. Wait ~2 minutes for cluster to start (status turns green)
5. Click on your cluster → go to **API Keys** tab
6. Click **Create API Key** → name it `vaultci` → click **Create**
7. Copy the API key immediately (shown only once)
8. Also copy the **Cluster URL** from the Overview tab
   - Looks like: `https://abc123xyz.eu-central-1.aws.cloud.qdrant.io`
9. ✅ Save both:
   - **QDRANT_HOST** = the cluster URL (without `https://`)
   - **QDRANT_API_KEY** = the API key you just created

---

## STEP 3 — Render (Deploy Backend) · ~10 min
> URL: https://render.com

1. Click **Sign Up** → use GitHub login
2. Click **New +** → select **Web Service**
3. Click **Connect a repository** → connect GitHub → select `Prakhar2025/VaultCI`
4. Fill in settings:
   - **Name:** `vaultci-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Docker`
   - **Dockerfile Path:** `./Dockerfile`
   - **Branch:** `main`
   - **Plan:** `Free`
5. Scroll down to **Environment Variables** → click **Add Environment Variable** for each:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your Neon string from Step 1 |
| `QDRANT_HOST` | Cluster URL from Step 2 (no https://) |
| `QDRANT_PORT` | `6333` |
| `QDRANT_API_KEY` | API key from Step 2 |
| `GITHUB_WEBHOOK_SECRET` | `prakhar123` |
| `GITHUB_TOKEN` | Your token from .env |
| `GROQ_API_KEY` | Your Groq key from .env |
| `DEBUG` | `false` |

6. Click **Deploy Web Service**
7. Wait 5–8 minutes — you'll see logs streaming
8. Once it says **"Your service is live"**, copy your URL:
   - Looks like: `https://vaultci-backend.onrender.com`
9. Test it — open in browser: `https://vaultci-backend.onrender.com/health`
   - Should show: `{"status":"ok","service":"vaultci-backend"}`
10. ✅ Backend is live — save this URL as **BACKEND_URL**

### Initialize the Database (do this once)
1. In Render dashboard → your service → click **Shell** tab
2. Type and press Enter:
   ```bash
   python scripts/init_db.py
   ```
3. Should print: `PostgreSQL tables created` and `Qdrant collection created`

---

## STEP 4 — Vercel (Deploy Frontend) · ~5 min
> URL: https://vercel.com

1. Click **Sign Up** → use GitHub login
2. Click **Add New** → **Project**
3. Click **Import** next to `Prakhar2025/VaultCI`
4. Configure:
   - **Root Directory:** click **Edit** → type `frontend` → click **Continue**
   - **Framework Preset:** Next.js (auto-detected)
5. Expand **Environment Variables** section → add one variable:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://vaultci-backend.onrender.com` |

6. Click **Deploy**
7. Wait 2 minutes
8. Your frontend URL: `https://vaultci-YOURNAME.vercel.app`
9. Open it in browser — you should see the VaultCI landing page ✅

---

## STEP 5 — Connect GitHub Webhook (The Real Demo) · ~3 min

> Do this for **any public GitHub repo** you own (can be VaultCI itself or any other project)

1. Go to that repo on GitHub → **Settings** tab → **Webhooks** (left sidebar)
2. Click **Add webhook**
3. Fill in:
   - **Payload URL:** `https://vaultci-backend.onrender.com/webhook/github`
   - **Content type:** `application/json`
   - **Secret:** `prakhar123`
   - **SSL verification:** Enable
   - **Which events:** Select individual events → check ✅ **Pull requests** only
4. Click **Add webhook**
5. GitHub will send a ping — in Render logs you should see a 200 response ✅

---

## STEP 6 — Register Repo in VaultCI Dashboard

1. Go to `https://vaultci-YOURNAME.vercel.app/setup`
2. Step 1: Enter your repo (e.g. `Prakhar2025/vaultci`)
3. Step 2: Webhook Secret → type `prakhar123`
   - Payload URL shown is already correct (points to Render)
4. Step 3: Keep default thresholds → click **Register Repository**
5. ✅ Repo registered in Postgres

---

## STEP 7 — Test the Full Flow

1. Go to your GitHub repo → create a new branch → make any small change → open a Pull Request
2. Watch Render logs — you'll see the webhook fire
3. Within 5 seconds: VaultCI posts an **automatic bot comment** on the PR with:
   - Trust Score (0.0 – 1.0)
   - Gate Decision (TRUSTED / REVIEW / CAUTION / BLOCK)
   - File risk map
   - Architectural contradiction details
4. Go to your Vercel dashboard → the PR now shows up with the real trust score ✅

---

## QUICK REFERENCE — All Your URLs

| Thing | URL |
|-------|-----|
| Frontend | `https://vaultci-YOURNAME.vercel.app` |
| Backend | `https://vaultci-backend.onrender.com` |
| Backend Health | `https://vaultci-backend.onrender.com/health` |
| Backend API Docs | `https://vaultci-backend.onrender.com/docs` |
| Webhook URL | `https://vaultci-backend.onrender.com/webhook/github` |
| Dashboard | `https://vaultci-YOURNAME.vercel.app/dashboard` |
| Memory Search | `https://vaultci-YOURNAME.vercel.app/memory` |
| Analytics | `https://vaultci-YOURNAME.vercel.app/analytics` |
| Setup | `https://vaultci-YOURNAME.vercel.app/setup` |

---

## IF SOMETHING BREAKS

| Problem | Fix |
|---------|-----|
| Render deploy fails | Check logs — usually missing env variable |
| `/health` returns error | Check DATABASE_URL format — must start with `postgresql+asyncpg://` |
| Webhook not firing | Check GitHub → Webhooks → Recent Deliveries — see the error |
| Qdrant connection fails | Make sure QDRANT_HOST has no `https://` prefix |
| Frontend shows "API Offline" | Your Render backend might be sleeping (free tier sleeps after 15 min inactivity — just wait 30s for it to wake) |
| Vercel build fails | Check Root Directory is set to `frontend` |
