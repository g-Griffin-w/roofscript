# RoofScript — AI Sales Scripts for Roofers

A Next.js app that generates custom roofing sales scripts using Claude AI.

---

## Deploy in 10 minutes (no coding experience needed)

### Step 1 — Get your Anthropic API key
1. Go to https://console.anthropic.com
2. Sign up / log in
3. Click "API Keys" → "Create Key"
4. Copy the key — you'll need it in Step 3

### Step 2 — Upload this project to GitHub
1. Go to https://github.com and create a free account if you don't have one
2. Click "New repository" → name it "roofscript" → Create
3. Upload all these files to the repo (drag and drop in the GitHub UI)

### Step 3 — Deploy to Vercel (free)
1. Go to https://vercel.com and sign up with your GitHub account
2. Click "Add New Project" → Import your roofscript repo
3. Before deploying, click "Environment Variables" and add:
   - Name: ANTHROPIC_API_KEY
   - Value: (paste your key from Step 1)
4. Click Deploy

That's it. Vercel gives you a live URL like roofscript.vercel.app in about 2 minutes.

---

## Add paid subscriptions (Stripe)

When you're ready to charge money:
1. Create a Stripe account at https://stripe.com
2. Ask Claude to help you add Stripe subscription logic to this app
3. Set a free tier (3 scripts/month) and a Pro tier ($19-29/month)

---

## Run locally (optional)

```bash
npm install
cp .env.example .env.local
# Add your API key to .env.local
npm run dev
```

Open http://localhost:3000
