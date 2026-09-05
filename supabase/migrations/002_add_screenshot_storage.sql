-- ============================================================
--  Migration 002 — Support screenshot uploads + NOT_INTERESTED
--  Run in Supabase SQL Editor after 001_initial_schema.sql
-- ============================================================

-- Allow NOT_INTERESTED as a contribution status
ALTER TABLE public.contributions
  DROP CONSTRAINT IF EXISTS contributions_payment_status_check;

ALTER TABLE public.contributions
  ADD CONSTRAINT contributions_payment_status_check
  CHECK (payment_status IN ('SUBMITTED','VERIFIED','REJECTED','NOT_INTERESTED'));

-- Allow contribution_amount to be 0 (for NOT_INTERESTED records)
ALTER TABLE public.contributions
  ALTER COLUMN contribution_amount SET DEFAULT 0;

-- ── Storage bucket for payment screenshots ───────────────────
-- Run this in Supabase Dashboard → Storage → New Bucket:
--   Name: payment-screenshots
--   Public: true
-- Or uncomment and run via CLI:
-- insert into storage.buckets (id, name, public)
--   values ('payment-screenshots', 'payment-screenshots', true)
--   on conflict do nothing;
