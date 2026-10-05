# MarketLens Paper Trading Engine: Supabase Setup & Architecture Guide

This document details the configuration, database migrations, security policies, and deployment steps for MarketLens's persistent **Paper Trading Simulator**.

---

## 1. Supabase Project Setup

- **Project URL:** `https://krqybjdmtmmdyztbpmui.supabase.co`
- **Publishable Key:** `sb_publishable_0eaDyt8AL46yeqDxBNikWw_RQHdFMjE`
- **Project Reference:** `krqybjdmtmmdyztbpmui`

### Steps to Initialize
1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open the project `krqybjdmtmmdyztbpmui`.
3. Go to the **SQL Editor** in the left sidebar.
4. Click **New Query**, paste the contents of [`supabase/schema.sql`](../supabase/schema.sql), and click **Run**.

---

## 2. Environment Variables

MarketLens reads Supabase configuration strictly from environment variables. Do not hard-code keys into source files.

In `.env.local` (local development) and in **Vercel Project Settings > Environment Variables** (production):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://krqybjdmtmmdyztbpmui.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_0eaDyt8AL46yeqDxBNikWw_RQHdFMjE
```

*(Template is provided in [`.env.example`](../.env.example)).*

---

## 3. Auth Configuration (Passwordless Magic Link)

MarketLens uses passwordless email authentication with Supabase Auth OTP / Magic Links. No passwords are stored or required.

### Supabase Dashboard Auth Settings
1. Go to **Authentication > Providers > Email**.
2. Ensure **Email provider** is **Enabled**.
3. Under **Authentication > URL Configuration**:
   - **Site URL**: `https://your-domain.vercel.app` (or `http://localhost:3000` for development).
   - **Redirect URLs**: Add:
     - `http://localhost:3000/paper-trading`
     - `https://*.vercel.app/paper-trading`
     - `https://your-custom-domain.com/paper-trading`

When a user requests a magic link, Supabase sends an email containing an authenticated session token that redirects directly back to `/paper-trading`.

---

## 4. Database Schema

All financial values utilize exact decimal types (`NUMERIC(15, 2)` or `NUMERIC(8, 4)`). Primary keys use standard UUIDs with `gen_random_uuid()`.

### Tables Overview
1. **`paper_accounts`**:
   - `id UUID PRIMARY KEY`: Unique account identifier.
   - `user_id UUID NOT NULL REFERENCES auth.users(id)`: Owning authenticated user.
   - `starting_cash NUMERIC(15,2)`: Default ₹10,00,000.
   - `cash_balance NUMERIC(15,2)`: Uninvested liquid cash balance.
   - `created_at`, `updated_at`: Timestamps.

2. **`paper_orders`**:
   - `id UUID PRIMARY KEY`: Order identifier.
   - `account_id UUID REFERENCES paper_accounts(id)`.
   - `symbol TEXT`, `exchange TEXT`: Stock identifier (e.g. `RELIANCE.NS`, `NSE`).
   - `side TEXT`: `'BUY'` | `'SELL'`.
   - `order_type TEXT`: `'MARKET'` | `'LIMIT'` | `'SL'` | `'SL_M'`.
   - `quantity INTEGER CHECK (quantity > 0)`.
   - `requested_price NUMERIC(15,2)`, `executed_price NUMERIC(15,2)`.
   - `status TEXT`: `'PENDING'` | `'EXECUTED'` | `'CANCELLED'` | `'REJECTED'`.
   - `estimated_charges NUMERIC(15,2)`: Simulated regulatory and broker fees.
   - `realized_pnl NUMERIC(15,2)`: Realized P&L on sell orders.

3. **`paper_trades`**:
   - Audit trail of filled transactions with executed price, total volume, and fees.

4. **`paper_positions`**:
   - Open holdings: `quantity`, `average_price`, `invested_value`, `realized_pnl`.

5. **`paper_portfolio_snapshots`**:
   - Periodic snapshots of `total_value`, `cash_balance`, `invested_value`, and `return_percent` for the performance trajectory chart.

---

## 5. Row Level Security (RLS) Policies

Row Level Security is enabled on **every** table:

```sql
ALTER TABLE public.paper_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paper_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paper_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paper_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paper_portfolio_snapshots ENABLE ROW LEVEL SECURITY;
```

### Isolation Rules:
- **`paper_accounts`**:
  ```sql
  CREATE POLICY "Users can manage their own paper account"
  ON public.paper_accounts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
  ```
- **Child Tables (`orders`, `trades`, `positions`, `snapshots`)**:
  ```sql
  CREATE POLICY "Users can manage their own paper orders"
  ON public.paper_orders FOR ALL
  USING (account_id IN (SELECT id FROM public.paper_accounts WHERE user_id = auth.uid()))
  WITH CHECK (account_id IN (SELECT id FROM public.paper_accounts WHERE user_id = auth.uid()));
  ```

No authenticated user can ever read, update, or delete another trader's virtual portfolio.

---

## 6. How the Paper Account Works

1. **Initial Visit**: Unauthenticated users see an intro card with a magic-link input.
2. **First Sign-In**: Supabase triggers `getOrCreateAccount()`. If no account exists, an account is created with **₹10,00,000** starting virtual cash.
3. **Subsequent Visits**: The existing account and records are retrieved intact. The cash balance is never reset on login or page refresh.
4. **Order Execution**:
   - **Market Orders**: Fill at the latest real-time 0xramm LTP (+/- optional slippage).
   - **Limit Orders**: Remain `PENDING` until live quotes satisfy the limit threshold (`marketPrice <= limitPrice` for Buy, `>=` for Sell).
   - **Simulated Charges**: Deducts simulated STT (0.1%), exchange charges (0.00297%), GST (18%), and stamp duty (0.015% on buys).
   - **FIFO Accounting**: On selling positions, shares are matched against the average acquisition cost, and net realized P&L is recorded.
5. **Reset Account**: Destructive confirmation modal triggers `reset_paper_account` RPC to wipe child records and restore the starting ₹10,00,000 balance.

---

## 7. How to Deploy to Vercel

1. Commit and push your changes to GitHub:
   ```bash
   git add .
   git commit -m "feat(paper-trading): add complete paper trading engine with Supabase integration"
   git push origin main
   ```
2. In your **Vercel Project Dashboard**:
   - Go to **Settings > Environment Variables**.
   - Add:
     - `NEXT_PUBLIC_SUPABASE_URL` = `https://krqybjdmtmmdyztbpmui.supabase.co`
     - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = `sb_publishable_0eaDyt8AL46yeqDxBNikWw_RQHdFMjE`
3. Trigger a redeployment or wait for automatic Git CI/CD.
4. Verify by visiting `/paper-trading` on your production URL.
