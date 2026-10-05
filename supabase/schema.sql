-- ==============================================================================
-- MARKETLENS PAPER TRADING SCHEMA & MIGRATIONS
-- Database: PostgreSQL (Supabase)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Paper Accounts Table
CREATE TABLE IF NOT EXISTS public.paper_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    starting_cash NUMERIC(15, 2) NOT NULL DEFAULT 1000000.00,
    cash_balance NUMERIC(15, 2) NOT NULL DEFAULT 1000000.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_paper_accounts_user UNIQUE (user_id),
    CONSTRAINT chk_paper_accounts_cash CHECK (cash_balance >= 0)
);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_paper_accounts_user_id ON public.paper_accounts(user_id);

-- 3. Paper Orders Table
CREATE TABLE IF NOT EXISTS public.paper_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES public.paper_accounts(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    exchange TEXT NOT NULL DEFAULT 'NSE',
    side TEXT NOT NULL CHECK (side IN ('BUY', 'SELL')),
    order_type TEXT NOT NULL CHECK (order_type IN ('MARKET', 'LIMIT', 'SL', 'SL_M')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    requested_price NUMERIC(15, 2),
    executed_price NUMERIC(15, 2),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'EXECUTED', 'CANCELLED', 'REJECTED')),
    estimated_charges NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    realized_pnl NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    executed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_paper_orders_account_id ON public.paper_orders(account_id);
CREATE INDEX IF NOT EXISTS idx_paper_orders_status ON public.paper_orders(status);
CREATE INDEX IF NOT EXISTS idx_paper_orders_symbol ON public.paper_orders(symbol);
CREATE INDEX IF NOT EXISTS idx_paper_orders_created_at ON public.paper_orders(created_at DESC);

-- 4. Paper Trades Table (Execution Audit Trail)
CREATE TABLE IF NOT EXISTS public.paper_trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES public.paper_accounts(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.paper_orders(id) ON DELETE SET NULL,
    symbol TEXT NOT NULL,
    exchange TEXT NOT NULL DEFAULT 'NSE',
    side TEXT NOT NULL CHECK (side IN ('BUY', 'SELL')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(15, 2) NOT NULL CHECK (price >= 0),
    total_value NUMERIC(15, 2) NOT NULL CHECK (total_value >= 0),
    charges NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_paper_trades_account_id ON public.paper_trades(account_id);
CREATE INDEX IF NOT EXISTS idx_paper_trades_symbol ON public.paper_trades(symbol);
CREATE INDEX IF NOT EXISTS idx_paper_trades_executed_at ON public.paper_trades(executed_at DESC);

-- 5. Paper Positions Table (Open Portfolio Holdings)
CREATE TABLE IF NOT EXISTS public.paper_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES public.paper_accounts(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    exchange TEXT NOT NULL DEFAULT 'NSE',
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    average_price NUMERIC(15, 2) NOT NULL CHECK (average_price >= 0),
    invested_value NUMERIC(15, 2) NOT NULL CHECK (invested_value >= 0),
    realized_pnl NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_paper_positions_account_symbol UNIQUE (account_id, symbol, exchange)
);

CREATE INDEX IF NOT EXISTS idx_paper_positions_account_id ON public.paper_positions(account_id);
CREATE INDEX IF NOT EXISTS idx_paper_positions_symbol ON public.paper_positions(symbol);

-- 6. Paper Portfolio Snapshots Table (Time Series Performance)
CREATE TABLE IF NOT EXISTS public.paper_portfolio_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES public.paper_accounts(id) ON DELETE CASCADE,
    total_value NUMERIC(15, 2) NOT NULL,
    cash_balance NUMERIC(15, 2) NOT NULL,
    invested_value NUMERIC(15, 2) NOT NULL,
    unrealized_pnl NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    realized_pnl NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    return_percent NUMERIC(8, 4) NOT NULL DEFAULT 0.00,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_paper_snapshots_account_time ON public.paper_portfolio_snapshots(account_id, recorded_at ASC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Isolation: Users can ONLY access their own paper trading records
-- ==============================================================================

ALTER TABLE public.paper_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paper_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paper_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paper_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paper_portfolio_snapshots ENABLE ROW LEVEL SECURITY;

-- Policies for paper_accounts
DROP POLICY IF EXISTS "Users can view their own paper account" ON public.paper_accounts;
CREATE POLICY "Users can view their own paper account"
    ON public.paper_accounts FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own paper account" ON public.paper_accounts;
CREATE POLICY "Users can create their own paper account"
    ON public.paper_accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own paper account" ON public.paper_accounts;
CREATE POLICY "Users can update their own paper account"
    ON public.paper_accounts FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own paper account" ON public.paper_accounts;
CREATE POLICY "Users can delete their own paper account"
    ON public.paper_accounts FOR DELETE
    USING (auth.uid() = user_id);

-- Helper expression for child tables: account belongs to authenticated user
-- auth.uid() IN (SELECT user_id FROM public.paper_accounts WHERE id = account_id)

-- Policies for paper_orders
DROP POLICY IF EXISTS "Users can manage their own paper orders" ON public.paper_orders;
CREATE POLICY "Users can manage their own paper orders"
    ON public.paper_orders FOR ALL
    USING (
        account_id IN (SELECT id FROM public.paper_accounts WHERE user_id = auth.uid())
    )
    WITH CHECK (
        account_id IN (SELECT id FROM public.paper_accounts WHERE user_id = auth.uid())
    );

-- Policies for paper_trades
DROP POLICY IF EXISTS "Users can manage their own paper trades" ON public.paper_trades;
CREATE POLICY "Users can manage their own paper trades"
    ON public.paper_trades FOR ALL
    USING (
        account_id IN (SELECT id FROM public.paper_accounts WHERE user_id = auth.uid())
    )
    WITH CHECK (
        account_id IN (SELECT id FROM public.paper_accounts WHERE user_id = auth.uid())
    );

-- Policies for paper_positions
DROP POLICY IF EXISTS "Users can manage their own paper positions" ON public.paper_positions;
CREATE POLICY "Users can manage their own paper positions"
    ON public.paper_positions FOR ALL
    USING (
        account_id IN (SELECT id FROM public.paper_accounts WHERE user_id = auth.uid())
    )
    WITH CHECK (
        account_id IN (SELECT id FROM public.paper_accounts WHERE user_id = auth.uid())
    );

-- Policies for paper_portfolio_snapshots
DROP POLICY IF EXISTS "Users can manage their own paper portfolio snapshots" ON public.paper_portfolio_snapshots;
CREATE POLICY "Users can manage their own paper portfolio snapshots"
    ON public.paper_portfolio_snapshots FOR ALL
    USING (
        account_id IN (SELECT id FROM public.paper_accounts WHERE user_id = auth.uid())
    )
    WITH CHECK (
        account_id IN (SELECT id FROM public.paper_accounts WHERE user_id = auth.uid())
    );

-- ==============================================================================
-- ATOMIC TRANSACTION FUNCTION: Reset Paper Account
-- Safely clears orders, trades, positions, snapshots and resets cash to 10,00,000
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.reset_paper_account(p_account_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_result JSONB;
BEGIN
    -- Verify ownership
    SELECT user_id INTO v_user_id
    FROM public.paper_accounts
    WHERE id = p_account_id;

    IF v_user_id IS NULL OR v_user_id != auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized: Account does not belong to the current authenticated user.';
    END IF;

    -- Delete all child records
    DELETE FROM public.paper_trades WHERE account_id = p_account_id;
    DELETE FROM public.paper_orders WHERE account_id = p_account_id;
    DELETE FROM public.paper_positions WHERE account_id = p_account_id;
    DELETE FROM public.paper_portfolio_snapshots WHERE account_id = p_account_id;

    -- Reset account cash balance
    UPDATE public.paper_accounts
    SET cash_balance = 1000000.00,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_account_id;

    -- Create initial snapshot
    INSERT INTO public.paper_portfolio_snapshots (
        account_id,
        total_value,
        cash_balance,
        invested_value,
        unrealized_pnl,
        realized_pnl,
        return_percent
    ) VALUES (
        p_account_id,
        1000000.00,
        1000000.00,
        0.00,
        0.00,
        0.00,
        0.00
    );

    v_result := jsonb_build_object(
        'success', true,
        'message', 'Paper account successfully reset with ₹10,00,000 virtual capital.',
        'cash_balance', 1000000.00
    );

    RETURN v_result;
END;
$$;
