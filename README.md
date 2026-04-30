# RoofScript v2 — Full Setup Guide

## Step 1 — Create Supabase Table

In your Supabase dashboard, go to **SQL Editor** and run this:

```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  plan TEXT DEFAULT 'free',
  scripts_used INTEGER DEFAULT 0,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Step 2 — Create Stripe Products

1. Go to stripe.com → Products → Add Product
2. Create **"RoofScript Pro"** — $19/month recurring
3. Copy the **Price ID** (starts with `price_`)  → this is STRIPE_PRO_PRICE_ID
4. Create **"RoofScript Team"** — $49/month recurring
5. Copy the **Price ID** → this is STRIPE_TEAM_PRICE_ID

## Step 3 — Upload to GitHub

Upload all these files to your roofscript GitHub repo (replace all existing files)

## Step 4 — Add Environment Variables in Vercel

Add ALL of these in Vercel → Settings → Environment Variables:

```
ANTHROPIC_API_KEY=your_key
NEXTAUTH_SECRET=your_generated_secret
NEXTAUTH_URL=https://your-app.vercel.app
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_TEAM_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_... (add after deploy)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Step 5 — Deploy on Vercel

Push to GitHub → Vercel auto-deploys

## Step 6 — Set Up Stripe Webhook (after deploy)

1. Go to stripe.com → Developers → Webhooks
2. Click "Add endpoint"
3. URL: https://your-app.vercel.app/api/webhook
4. Select events: checkout.session.completed, customer.subscription.deleted
5. Copy the Webhook Secret → add as STRIPE_WEBHOOK_SECRET in Vercel
6. Redeploy
