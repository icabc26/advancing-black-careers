-- =====================================================================
-- Seed data — run AFTER the migrations, edit to taste.
-- =====================================================================

-- 1. Allow your own email so you can test sign-in. Add the real committee +
--    member emails here (or via the Table Editor). Emails are lower-cased.
insert into public.allowed_members (email, role, added_by) values
  ('committee@ic.ac.uk', 'admin', 'seed')
on conflict (email) do nothing;

-- 2. A few example Live opportunities. Replace with real ABC-curated ones.
insert into public.opportunities (role_title, employer, location, season, closes_on, link) values
  ('Insight Programme — Markets', 'Investment Bank', 'London',        'Spring', date '2026-11-30', null),
  ('Summer Analyst — Technology',  'Big Tech',        'Hybrid, London','Summer', date '2026-12-12', null),
  ('Consulting Spring Week',        'Strategy Firm',   'London',        'Spring', date '2027-01-05', null)
on conflict do nothing;
