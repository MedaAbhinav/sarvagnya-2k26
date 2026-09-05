-- ============================================================
--  SARVAGNYA 2K26 — Database Schema
--  Run this entire script in Supabase SQL Editor:
--  Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================

create extension if not exists "uuid-ossp";

-- ── REGISTRATIONS ────────────────────────────────────────────
create table if not exists public.registrations (
  id                     uuid primary key default uuid_generate_v4(),
  registration_id        text unique not null,
  full_name              text not null,
  phone                  text not null,
  batch                  text default '2006',
  gender                 text,
  attendance_status      text not null
                           check (attendance_status in ('Yes','No')),
  family_members         integer default 0,
  arrival_date           date,
  arrival_time           time,
  departure_date         date,
  departure_time         time,
  food_preference        text
                           check (food_preference in ('Vegetarian','Non-Vegetarian')),
  accommodation_required boolean default false,
  -- reserved columns (not collected in form, kept for compatibility)
  email                  text,
  current_city           text,
  special_message        text,
  created_at             timestamptz default now()
);

-- ── CONTRIBUTIONS ────────────────────────────────────────────
-- Simplified: only stores what is collected.
-- Organizer reconciles actual payments via bank/UPI app.
create table if not exists public.contributions (
  id                   uuid primary key default uuid_generate_v4(),
  registration_id      text
                         references public.registrations(registration_id)
                         on delete set null,
  alumni_name          text not null,
  phone                text,
  attendance           text,
  contribution_amount  numeric(10,2) not null,
  payment_status       text not null default 'SUBMITTED'
                         check (payment_status in ('SUBMITTED','VERIFIED','REJECTED')),
  admin_notes          text,
  -- reserved columns kept for compatibility
  email                text,
  payment_method       text default 'UPI',
  transaction_id       text,
  screenshot_url       text,
  created_at           timestamptz default now()
);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────
alter table public.registrations enable row level security;
alter table public.contributions  enable row level security;

-- Anonymous users can INSERT (registration + contribution forms)
create policy "anon_insert_registrations"
  on public.registrations for insert
  to anon with check (true);

create policy "anon_insert_contributions"
  on public.contributions for insert
  to anon with check (true);

-- Service role (Edge Functions) has full access
create policy "service_all_registrations"
  on public.registrations for all
  to service_role using (true) with check (true);

create policy "service_all_contributions"
  on public.contributions for all
  to service_role using (true) with check (true);

-- Authenticated users (admin dashboard) can read + update
create policy "auth_select_registrations"
  on public.registrations for select
  to authenticated using (true);

create policy "auth_select_contributions"
  on public.contributions for select
  to authenticated using (true);

create policy "auth_update_contributions"
  on public.contributions for update
  to authenticated using (true);

-- ── INDEXES ──────────────────────────────────────────────────
create index if not exists idx_reg_phone   on public.registrations(phone);
create index if not exists idx_reg_created on public.registrations(created_at desc);
create index if not exists idx_con_reg_id  on public.contributions(registration_id);
create index if not exists idx_con_status  on public.contributions(payment_status);
create index if not exists idx_con_created on public.contributions(created_at desc);
